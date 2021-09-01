const config = require('./config');
const { Readable } = require('stream');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const logger = require('./logger');

const url = process.env.MONGODB_URL;
const bulletinDb = config.database.name;
const { collections } = config.database;

exports.getClient = async () => (new MongoClient(url)).connect();

exports.closeClient = async (client) => {
    if (client) await client.close();
};

exports.ObjectId = async (id) => id ? new ObjectId(id) : '';

exports.dbInit = async () => {
    let client = null;
    try {
        client = (await exports.getClient());
        await Promise.all(Object.values(config.database.collections).map(async (collectionName) => {
            try {
                await client.db(bulletinDb).createCollection(collectionName);
            } catch (err) {
                logger.info(`📌${collectionName} exists`);
            }
        }));
        await exports.closeClient(client);
        logger.info(`📌📌📌Successfully initilized mongoDb/${bulletinDb}📌📌📌`);
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error initializing mongoDb:: ${err.message}`);
    }
};

exports.uploadFile = async (buffer, submissionId, filename, type) => {
    let client = null;
    try {
        if (!config.submission_constraints.submission_upload_types[type]) {
            throw new Error('invalid file upload type');
        }
        client = await exports.getClient();
        const db = client.db(bulletinDb);
        const bucket = new GridFSBucket(db, { bucketName: config.database.bucket_name });

        // delete any previous file
        try {
            const fileIds = await Promise.all((await db.collection(`${config.database.bucket_name}.files`)
                .find({ filename: `${submissionId}_${type}` }).toArray()).map(async (file) => file._id));
            await Promise.all(fileIds.map(async (id) => {
                await bucket.delete(id);
            }));
        } catch (err) {
            logger.info('no previous files of this type');
        }

        // upload the new file
        const upload = new Promise((resolve) => {
            const readable = Readable.from(buffer);
            const bucketStream = bucket.openUploadStream(`${submissionId}_${type}`, {
                chunkSizeBytes: 1048576,
                metadata: { 'name': filename },
            });
            readable.pipe(bucketStream);
            bucketStream.on('close', () => resolve());
        });
        await upload;

        const fileId = (await db.collection(`${config.database.bucket_name}.files`)
            .findOne({ filename: `${submissionId}_${type}` }))._id;

        let modifiedCount = 0;
        if (type === 'sourceCode') {
            modifiedCount = (await db.collection(collections.submissions).updateOne(
                { _id: new ObjectId(submissionId) },
                { $set: { sourceCodeId: fileId } },
            )).modifiedCount;
        } else if (type === 'markdown') {
            modifiedCount = (await db.collection(collections.submissions).updateOne(
                { _id: new ObjectId(submissionId) },
                { $set: { markdownId: fileId } },
            )).modifiedCount;
        } else if (type === 'photos') {
            modifiedCount = (await db.collection(collections.submissions).updateOne(
                { _id: new ObjectId(submissionId) },
                { $set: { photosId: fileId } },
            )).modifiedCount;
        } else if (type === 'icon') {
            modifiedCount = (await db.collection(collections.submissions).updateOne(
                { _id: new ObjectId(submissionId) },
                { $set: { iconId: fileId } },
            )).modifiedCount;
        }
        logger.info(`${modifiedCount} submissions updated`);
        await exports.closeClient(client);
        return fileId;
    } catch (err) {
        await exports.closeClient(client);
        throw new Error(`📌Error uploading file:: ${err.message}`);
    }
};

exports.downloadFileBuffer = async (submissionId, type) => {
    let client = null;
    try {
        client = await exports.getClient();
        const db = client.db(bulletinDb);
        const bucket = new GridFSBucket(db, { bucketName: config.database.bucket_name });

        const file = await db.collection(`${config.database.bucket_name}.files`)
            .findOne({ filename: `${submissionId}_${type}` });
        if (!file) throw new Error('no files found');

        const fileId = file._id;
        const filename = file.metadata.name;

        // download the new file
        const download = new Promise((resolve) => {
            const chunks = [];
            const bucketStream = bucket.openDownloadStream(fileId);
            bucketStream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            bucketStream.on('close', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });
        });
        const buffer = await download;
        await exports.closeClient(client);
        return { filename: filename, buffer: buffer };
    } catch (err) {
        await exports.closeClient(client);
        throw new Error(`📌Error downloading file:: ${err.message}`);
    }
};

exports.removeFile = async (submissionId, type) => {
    let client = null;
    try {
        client = await exports.getClient();
        const db = client.db(bulletinDb);
        const bucket = new GridFSBucket(db, { bucketName: config.database.bucket_name });

        const file = await db.collection(`${config.database.bucket_name}.files`)
            .findOne({ filename: `${submissionId}_${type}` });
        if (!file) throw new Error('no files found');
        const fileId = file._id;
        await bucket.delete(fileId);
        await exports.closeClient(client);
        return fileId;
    } catch (err) {
        await exports.closeClient(client);
        throw new Error(`📌Error downloading file:: ${err.message}`);
    }
};
