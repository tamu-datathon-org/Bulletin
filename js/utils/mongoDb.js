const config = require('./config');
// const { Readable } = require('stream');
const { MongoClient, ObjectId } = require('mongodb');
const logger = require('./logger');

const url = process.env.MONGODB_URL;
const bulletinDb = config.database.name;
// const { collections } = config.database;

exports.getClient = async () => (new MongoClient(url)).connect();

exports.closeClient = async (client) => {
    if (client) await client.close();
};

exports.ObjectId = async (id) => id ? new ObjectId(id) : ObjectId();

exports.dbInit = async () => {
    let client = null;
    try {
        client = (await exports.getClient());
        await Promise.all(Object.values(config.database.collections).map(async (collectionName) => {
            try {
                await client.db(bulletinDb).createCollection(collectionName);
                logger.info(`📌${collectionName} created`);
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
