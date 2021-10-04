const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const like = {
    userAuthId: null,
    submissionId: null,
};

const createLike = async (userAuthId, submissionId) => {
    if (!userAuthId) throw new Error('like userAuthId is required');
    if (!submissionId) throw new Error('like submissionId is required');
    const likeObj = {
        userAuthId: userAuthId,
        submissionId: submissionId,
    };
    return likeObj;
};

const addLike = async (likeObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.likes).insertOne(likeObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding like:: ${err.message}`);
    }
};

const removeLike = async (likeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const like = await client.db(config.database.name)
            .collection(config.database.collections.likes).findOneAndDelete({ _id: await mongoUtil.ObjectId(likeId) });
        await mongoUtil.closeClient(client);
        return like;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing like:: ${err.message}`);
    }
};

const removeLikes = async (likeIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        await client.db(config.database.name)
            .collection(config.database.collections.likes).deleteMany({ _id: likeIds });
        await mongoUtil.closeClient(client);
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing likes:: ${err.message}`);
    }
};

const getLike = async (likeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.likes).findOne({ _id: await mongoUtil.ObjectId(likeId) });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing like:: ${err.message}`);
    }
};

const getLikeBySubmissionIdAndUserAuthId = async (submissionId, userAuthId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.likes).findOne({ 
                submissionId: await mongoUtil.ObjectId(submissionId),
                userAuthId: userAuthId
            });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing like:: ${err.message}`);
    }
};

const removeAllLikesOfSubmissionId = async (submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        await client.db(config.database.name)
            .collection(config.database.collections.likes).deleteMany({ submissionId: await mongoUtil.ObjectId(submissionId) });
        await mongoUtil.closeClient(client);
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing likes:: ${err.message}`);
    }
};

module.exports = {
    like,
    createLike,
    addLike,
    removeLike,
    removeLikes,
    getLike,
    getLikeBySubmissionIdAndUserAuthId,
    removeAllLikesOfSubmissionId,
};
