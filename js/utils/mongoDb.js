const config = require('./config');
const { MongoClient } = require('mongodb');
const logger = require('./logger');

const { url } = config.database;
const bulletinDb = config.database.database_name;
const collections = config.database.collection_names;

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
        logger.info(`Error inserting submission ${err}`);
        throw new Error('Error submitting');
    }
};

exports.removeSubmission = async (submissionId) => {
    let client = null;
    try {
        client = exports.getClient();
        const obj = await client.db(bulletinDb).collection(collections.submissions).findOneAndDelete({ Object_id: submissionId });
        await exports.closeClient(client);
        return obj.ObjectId;
    } catch (err) {
        await exports.closeClient(client);
        logger.info(`Error removing submittion ${err.message}`);
        throw new Error('Error removing submission');
    }
};