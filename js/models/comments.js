const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const comment = {
    userAuthId: null,
    submissionId: null,
    message: null,
    time: null,
};

const createComment = async (userAuthId, submissionId, message) => {
    if (!userAuthId) throw new Error('comment userAuthId is required');
    if (!submissionId) throw new Error('comment submissionId is required');
    if ((message?.length ?? 0) === 0) throw new Error('comment message cannot be null or empty');
    const commentObj = {
        userAuthId: userAuthId,
        submissionId: submissionId,
        message: message,
        time: (new Date()).toISOString(),
    };
    return commentObj;
};

const addComment = async (commentObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.comments).insertOne(commentObj);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding comment:: ${err.message}`);
    }
};

const removeComment = async (commentId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const comment = await client.db(config.database.name)
            .collection(config.database.collections.comments).findOneAndDelete({ _id: mongoUtil.ObjectId(commentId) });
        return comment;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing comment:: ${err.message}`);
    }
};

const removeComments = async (commentIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        await client.db(config.database.name)
            .collection(config.database.collections.comments).deleteMany({ _id: commentIds });
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing comments:: ${err.message}`);
    }
};

const getComment = async (commentId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const comment = await client.db(config.database.name)
            .collection(config.database.collections.comments).findOne({ _id: mongoUtil.ObjectId(commentId) });
        return comment;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting comment:: ${err.message}`);
    }
};

const getCommentBySubmissionIdAndUserAuthIdAndTime = async (submissionId, userAuthId, commentTime) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const comment = await client.db(config.database.name)
            .collection(config.database.collections.comments).findOne({
                submissionId: submissionId,
                userAuthId: userAuthId,
                comment_time: commentTime,
            });
        return comment;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting comment:: ${err.message}`);
    }
};

module.exports = {
    comment,
    createComment,
    addComment,
    removeComment,
    removeComments,
    getComment,
    getCommentBySubmissionIdAndUserAuthIdAndTime,
};
