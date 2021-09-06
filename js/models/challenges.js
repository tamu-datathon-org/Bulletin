const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');
const logger = require('../utils/logger');

const challenge = {
    name: null,
    description: null,
    accoladeIds: [],
    questionsIds: [],
    sponsorsIds: [],
};

const createChallenge = async (name, description, accoladeIds, questionIds) => {
    const challengeObj = {
        name: name,
        description: description || '',
        accoladeIds: accoladeIds || [],
        questionIds: questionIds || [],
    };
    return challengeObj;
};

const addChallenge = async (challengeObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).insertOne(challengeObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding challenge:: ${err.message}`);
    }
};

const removeChallenge = async (challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges).findOneAndDelete({ _id: await mongoUtil.ObjectId(challengeId) });
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

const getChallenge = async (challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges).findOne({ _id: await mongoUtil.ObjectId(challengeId) });
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

const getChallengeByName = async (title) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenge = await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .findOne({ title: title });
        await mongoUtil.closeClient(client);
        return challenge;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenges by title:: ${err.message}`);
    }
};

const getChallengesByNames = async (titles) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const challenges = await client.db(config.database.name)
            .collection(config.database.collections.challenges)
            .find({ title: { $in: titles || [] } }).toArray();
        await mongoUtil.closeClient(client);
        return challenges;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting challenges by titles:: ${err.message}`);
    }
};

const updateChallenge = async (challengeId, setOptions) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).updateOne(
                { _id: await mongoUtil.ObjectId(challengeId) },
                { $set: setOptions },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating challenge ${err.message}`);
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

const addChallengeQuestionId = async (challengeId, questionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).updateOne(
                { _id: await mongoUtil.ObjectId(challengeId) },
                { $addToSet: { questionIds: questionId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating challenge ${err.message}`);
    }
};

const removeChallengeQuestionId = async (challengeId, questionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).updateOne(
                { _id: await mongoUtil.ObjectId(challengeId) },
                { $pull: { questionIds: questionId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating challenge ${err.message}`);
    }
};

const addChallengeSponsorId = async (challengeId, sponsorId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).updateOne(
                { _id: await mongoUtil.ObjectId(challengeId) },
                { $addToSet: { sponsorIds: sponsorId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating challenge ${err.message}`);
    }
};

const removeChallengeSponsorId = async (challengeId, sponsorId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.challenges).updateOne(
                { _id: await mongoUtil.ObjectId(challengeId) },
                { $pull: { sponsorIds: sponsorId } },
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
    updateChallenge,
    addChallengeAccoladeId,
    removeChallengeAccoladeId,
    addChallengeQuestionId,
    removeChallengeQuestionId,
    addChallengeSponsorId,
    removeChallengeSponsorId,
};
