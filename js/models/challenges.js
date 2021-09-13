const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');
const logger = require('../utils/logger');

const challenge = {
    name: null,
    places: null,
    questions: [],
    accoladeIds: [],
    sponsorsIds: [],
    eventId: null,
};

/**
 * @function createChallenge
 * @param {String} name 
 * @param {Number} places 
 * @param {Array<String>} accoladeIds 
 * @param {Array<String>} questions 
 * @param {String} eventId
 * @returns {Object} challenge obj
 */
const createChallenge = async (name, places, accoladeIds, questions, eventId) => {
    const challengeObj = {
        name: name,
        places: places || 0,
        questions: questions || [],
        accoladeIds: accoladeIds || [],
        eventId: await mongoUtil.ObjectId(eventId),
    };
    return challengeObj;
};

/**
 * @function addChallenge
 * @param {Object} challengeObj 
 * @param {String} challengeId 
 * @returns {String} upserted id or null
 */
const addChallenge = async (challengeObj, challengeId = null) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).updateOne(
                { _id: await mongoUtil.ObjectId(challengeId) },
                { $set: challengeObj },
                { upsert: true },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding challenge:: ${err.message}`);
    }
};

/**
 * @function removeChallenge
 * @param {String} eventId 
 * @param {String} challengeId 
 * @returns {Object} removed challenge
 */
const removeChallenge = async (eventId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .findOne({
                _id: await mongoUtil.ObjectId(challengeId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .deleteOne({
                _id: await mongoUtil.ObjectId(challengeId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing challenge:: ${err.message}`);
    }
};

const removeChallengeByName = async (title) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges).findOneAndDelete({ title: title });
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing challenge:: ${err.message}`);
    }
};

const getChallenge = async (eventId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .findOne({
                _id: await mongoUtil.ObjectId(challengeId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenge:: ${err.message}`);
    }
};

const getChallenges = async (challengeIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .find({ _id: { $in: challengeIds } }).toArray();
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenges:: ${err.message}`);
    }
};

const getChallengesByEvent = async (eventId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .find({ eventId: await mongoUtil.ObjectId(eventId) }).toArray();
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenges:: ${err.message}`);
    }
};

const getChallengeByName = async (name) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .findOne({ name: name });
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenges by name:: ${err.message}`);
    }
};

const getChallengesByNames = async (names) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenges = await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .find({ names: { $in: names || [] } }).toArray();
        await mongoUtil.closeClient(client);
        return challenges;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenges by names:: ${err.message}`);
    }
};

const addChallengeAccoladeId = async (challengeId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).updateOne(
                { _id: await mongoUtil.ObjectId(challengeId) },
                { $addToSet: { accoladeIds: accoladeId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        logger.info(err);
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating challenge ${err.message}`);
    }
};

const removeChallengeAccoladeId = async (challengeId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).updateOne(
                { _id: await mongoUtil.ObjectId(challengeId) },
                { $pull: { accoladeIds: accoladeId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating challenge ${err.message}`);
    }
};

module.exports = {
    challenge,
    createChallenge,
    addChallenge,
    removeChallenge,
    removeChallengeByName,
    getChallenge,
    getChallenges,
    getChallengeByName,
    getChallengesByNames,
    getChallengesByEvent,
    addChallengeAccoladeId,
    removeChallengeAccoladeId,
};
