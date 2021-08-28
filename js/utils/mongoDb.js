const { Readable } = require('stream');
const config = require('./config');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const logger = require('./logger');

const { url } = config.database;
const bulletinDb = config.database.name;
const { collections } = config.database;

exports.getClient = async () => (new MongoClient(url)).connect();

exports.closeClient = async (client) => {
    if (client) await client.close();
};

exports.addSubmission = async (submissionObj) => {
    let client = null;
    try {
        client = await exports.getClient();
        const { insertedId } = await client.db(bulletinDb).collection(collections.submissions).insertOne(submissionObj);
        await exports.closeClient(client);
        return insertedId;
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`Error inserting submission ${err.message}`);
        throw new Error('Error submitting');
    }
};

exports.removeSubmission = async (submissionId) => {
    let client = null;
    try {
        client = exports.getClient();
        const doc = await client.db(bulletinDb).collection(collections.submissions).findOneAndDelete({ _id: new ObjectId(submissionId) });
        await exports.closeClient(client);
        return doc.ObjectId;
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error removing submittion ${err.message}`);
        throw new Error('Error removing submission');
    }
};

exports.uploadFile = async (buffer, entryID, filename) => {
    let client = null;
    try {
        client = await exports.getClient();
        const db = client.db(bulletinDb);
        const bucket = new GridFSBucket(db, { bucketName: 'fs' });

        // delete any previous file
        try {
            const fileIds = await Promise.all((await db.collection(`${config.database.bucket_name}.files`)
                .find({ filename: entryID }).toArray()).map(async (file) => file._id));
            await Promise.all(fileIds.map(async (id) => {
                await bucket.delete(id);
            }));
        } catch (err) {
            logger.info('no previous files');
        }

        // upload the new file
        const upload = new Promise((resolve) => {
            const readable = Readable.from(buffer.toString());
            const bucketStream = bucket.openUploadStream(entryID, {
                chunkSizeBytes: 1048576,
                metadata: { field: 'name', value: filename },
            });
            readable.pipe(bucketStream);
            bucketStream.on('close', () => resolve());
        });
        await upload;
        await db.collection(bulletinDb).updateOne(
            { _id: new ObjectId(entryID) },
            { $set: { filename: filename } },
        );
        await exports.closeClient(client);
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error uploading files ${err.message}`);
        throw new Error('Error uploading files');
    }
};

exports.submissionExists = async (entryID) => {
    let client = null;
    try {
        client = await exports.getClient();
        const doc = await client.db(bulletinDb).collection(collections.submissions).findOne({ _id: new ObjectId(entryID) });
        if (doc) {
            return true;
        }
        return false;
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error checking if submission exists ${err.message}`);
        throw new Error('Error checking if submission exists');
    }
};

const arrayElementMatch = async (arr1, arr2) => {
    const query = new Promise((resolve) => {
        arr1.forEach((el1) => {
            arr2.forEach((el2) => {
                if (el1.toLowerCase() === el2.toLowerCase()) resolve(true);
            });
        });
        resolve(false);
    });
    return query;
};

exports.getSubmissionByEntryID = async (entryID) => {
    let client = null;
    try {
        client = await exports.getClient();
        const doc = await client.db(bulletinDb).collection(collections.submissions).findOne({ _id: new ObjectId(entryID) });
        await exports.closeClient(client);
        return [doc];
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error checking if submission exists ${err.message}`);
        throw new Error('Error checking if submission exists');
    }
};

// TO-DO remove case-sensitivity
exports.getSubmissionsByFilters = async (filters) => {
    let client = null;
    try {
        client = await exports.getClient();
        const matchingFilters = {};
        if (filters.titles) matchingFilters.title = { $in: filters.titles };
        if (filters.numLikes) matchingFilters.likes = { $gte: filters.numLikes };
        if (filters.numComments) matchingFilters.comments = { $size: { $gte: filters.numComments } };
        if (filters.submission_times) matchingFilters.submission_time = { $and: [{ $gte: filters.timespan[0]}, { $lte: filters.timespan[1] }] };
        logger.info(JSON.stringify(matchingFilters));
        const cursor = await client.db(bulletinDb).collection(collections.submissions).aggregate([
            { $match: matchingFilters },
        ]);
        const docsArray = await cursor.toArray();
        const finalDocsArray = [];
        if (!filters.names && !filters.links && !filters.challenges) return docsArray;
        await Promise.all(docsArray.map(async (doc) => {
            let pass = false;
            if (filters.names) pass = await arrayElementMatch(doc.names, filters.names);
            if (filters.links && !pass) pass = await arrayElementMatch(doc.links, filters.links);
            if (filters.challenges && !pass) pass = await arrayElementMatch(doc.challenges, filters.challenges);
            if (pass) finalDocsArray.push(doc);
        }));
        await exports.closeClient(client);
        return finalDocsArray;
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error getting submissions with filters ${err.message}`);
        throw new Error('Error getting submissions with filters');
    }
};

exports.getAllSubmissionsData = async () => {
    let client = null;
    try {
        client = await exports.getClient();
        const docs = await client.db(bulletinDb).collection(collections.submissions).find({}).toArray();
        await exports.closeClient(client);
        return docs;
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error getting all submissions data ${err.message}`);
        throw new Error('Error getting all submission data');
    }
};

exports.deleteSubmission = async (title, submission_time) => {
    let client = null;
    try {
        client = await exports.getClient();

        // delete the submission data
        const db = client.db(bulletinDb);
        const doc = await db.collection(collections.submissions).findOne({
            title: title, 
            submission_time: submission_time,
        });
        if (!doc) return { doc: null, deletedFiles: 0 };

        // delete the files & chunks
        const deletedFiles = await db.collection(`${config.database.bucket_name}.files`).find({ filename: (doc._id).toString() }).toArray();
        const bucket = new GridFSBucket(db, { bucketName: 'fs' });
        const fileIds = await Promise.all(deletedFiles.map(async (file) => {
            const id = new ObjectId(file._id);
            await bucket.delete(id);
            return id;
        }));

        const { deletedCount } = await db.collection(collections.submissions).deleteOne({ _id: doc._id });

        await exports.closeClient(client);
        return { doc: doc, deletedSubmissions: deletedCount, deletedFiles: fileIds.length };
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error deleting submission ${JSON.stringify(err.message)}`);
        throw new Error('Error deleting submission data');
    }
};

exports.updateSubmissionData = async (originalTitle, submission_time, setOptions) => {
    let client = null;
    try {
        client = await exports.getClient();
        const { modifiedCount } = await client.db(bulletinDb).collection(collections.submissions).updateOne(
            { title: originalTitle, submission_time: submission_time },
            { $set: setOptions },
        );
        await exports.closeClient(client);
        return modifiedCount;
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`📌Error getting all submissions data ${err.message}`);
        throw new Error('Error getting all submission data');
    }
};
