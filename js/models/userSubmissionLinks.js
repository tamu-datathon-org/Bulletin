const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const userSubmissionLink = {
    userAuthId: null,
    submissionId: null,
    discordTag: null,
};

const createUserSubmissionLink = async (userAuthId, submissionId, discordTag) => {
    if (!userAuthId) throw new Error('📌userSubmissionLink userAuthId is required');
    if (!discordTag) throw new Error('📌userSubmissionLink discordTag is required');
    const submission_link = {
        userAuthId: await mongoUtil.ObjectId(userAuthId),
        submissionId: await mongoUtil.ObjectId(submissionId) || '',
        discordTag: discordTag || '',
    };
    return submission_link;
};

/**
 * @function addUserSubmissionLink
 * @param {Object} userSubmissionLinkObj 
 * @param {String} userSubmissionLinkId 
 * @returns {String} upserted id or null
 */
const addUserSubmissionLink = async (userSubmissionLinkObj, userSubmissionLinkId = null) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks)
            .updateOne(
                { _id: await mongoUtil.ObjectId(userSubmissionLinkId)  },
                { $set: userSubmissionLinkObj },
                { upsert: true },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding userSubmissionLink:: ${err.message}`);
    }
};

const removeUserSubmissionLink = async (userSubmissionLinkId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks)
            .findOne({ _id: await mongoUtil.ObjectId(userSubmissionLinkId) });
        await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks)
            .deleteOne({ _id: await mongoUtil.ObjectId(userSubmissionLinkId) });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing userSubmissionLink:: ${err.message}`);
    }
};

const removeUserSubmissionLinks = async (userSubmissionLinkIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).deleteMany({ _id: userSubmissionLinkIds });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing userSubmissionLink:: ${err.message}`);
    }
};

const getUserSubmissionLink = async (userSubmissionLinkId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks)
            .findOne({ _id: await mongoUtil.ObjectId(userSubmissionLinkId) });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting userSubmissionLink:: ${err.message}`);
    }
};

const getUserSubmissionLinksByUserAuthId = async (userAuthId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const docs = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).find({
                userAuthId: await mongoUtil.ObjectId(userAuthId),
            }).toArray();
        await mongoUtil.closeClient(client);
        return docs;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting userSubmissionLink:: ${err.message}`);
    }
};

/**
 * @function getUserSubmissionLinkBySubmissionIdAndUserAuthId
 * @param {String} userAuthId 
 * @param {String} submissionId 
 * @returns {Object}
 */
const getUserSubmissionLinkBySubmissionIdAndUserAuthId = async (userAuthId, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).findOne({
                userAuthId: await mongoUtil.ObjectId(userAuthId),
                submissionId: await mongoUtil.ObjectId(submissionId),
            });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting userSubmissionLink:: ${err.message}`);
    }
};

/**
 * @function addSubmissionIdToLinks
 * @description adds single submissionId to many submissionLinks
 *  great for adding or updating a submission
 * @param {String} linkIds 
 * @param {String} submissionId 
 * @returns {Object}
 */
const addSubmissionIdToLinks = async (linkIds, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).updateMany(
                { _id: { $in: linkIds } },
                { $set: { submissionId: await mongoUtil.ObjectId(submissionId) } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating userSubmissionLink:: ${err.message}`);
    }
};

const updateUserSubmissionLink = async (submissionId, setOptions) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.userSubmissionLinks).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $set: { setOptions } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating userSubmissionLink:: ${err.message}`);
    }
};

module.exports = {
    userSubmissionLink,
    createUserSubmissionLink,
    addUserSubmissionLink,
    removeUserSubmissionLink,
    removeUserSubmissionLinks,
    getUserSubmissionLink,
    getUserSubmissionLinkBySubmissionIdAndUserAuthId,
    getUserSubmissionLinksByUserAuthId,
    updateUserSubmissionLink,
    addSubmissionIdToLinks,
};