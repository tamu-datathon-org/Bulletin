const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const user_submission_link = {
    userAuthId: null,
    submissionId: null,
    discordTag: null,
};

const createUserSubmissionLink = async (userAuthId, submissionId, discordTag) => {
    if (!userAuthId) throw new Error('📌userSubmissionLink userAuthId is required');
    if (!discordTag) throw new Error('📌userSubmissionLink discordTag is required');
    const submission_link = {
        userAuthId: userAuthId,
        submissionId: submissionId || '',
        discordTag: discordTag || '',
    };
    return submission_link;
};

const addUserSubmissionLink = async (userSubmissionLinkObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).insertOne(userSubmissionLinkObj);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding userSubmissionLink:: ${err.message}`);
    }
};

const removeUserSubmissionLink = async (userSubmissionLinkId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const link = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).findOneAndDelete({ _id: await mongoUtil.ObjectId(userSubmissionLinkId) });
        return link;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing userSubmissionLink:: ${err.message}`);
    }
};

const removeUserSubmissionLinks = async (userSubmissionLinkIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const link = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).deleteMany({ _id: userSubmissionLinkIds });
        return link;
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
            .collection(config.database.collections.userSubmissionLinks).findOne({ _id: await mongoUtil.ObjectId(userSubmissionLinkId) });
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting userSubmissionLink:: ${err.message}`);
    }
};

const getUserSubmissionLinkBySubmissionIdAndUserAuthId = async (userAuthId, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).findOne({
                userAuthId: userAuthId,
                submissionId: submissionId,
            });
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting userSubmissionLink:: ${err.message}`);
    }
};

const updateUserSubmissionLinkIds = async (linkIds, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.userSubmissionLinks).updateMany(
                { _id: { $in: linkIds } },
                { $set: { submissionId: submissionId.toString() } },
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
    user_submission_link,
    createUserSubmissionLink,
    addUserSubmissionLink,
    removeUserSubmissionLink,
    removeUserSubmissionLinks,
    getUserSubmissionLink,
    getUserSubmissionLinkBySubmissionIdAndUserAuthId,
    updateUserSubmissionLink,
    updateUserSubmissionLinkIds,
};