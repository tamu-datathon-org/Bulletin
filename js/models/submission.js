const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const sampleSubmission = {
    title: 'Hello World!',
    users: ['Woody', 'Buzz', 'Bo-Peep', 'Ham'],
    links: ['https://www.google.com/', 'https://github.com/'],
    tags: ['pixar', 'film making'],
    videoLink: 'https://www.youtube.com/watch?v=pcbNb9pPNLw',
};

const submissionInstructions = {
    URL: '[domain]/bulletin/api/submission/add',
    'Content-Type': 'application/json',
    body: sampleSubmission,
};

const submissionFileInstructions = {
    URL: '[domain]/bulletin/api/submission/:submissionId/upload/:type',
    params: {
        submissionId: `${config.database.entryID_length} character string corresponding to the submission`,
        type: `upload type string. one of the following: ${config.submission_constraints.submission_upload_types}`,
    },
    'Content-Type': 'multipart/form-data',
    body: {
        key: 'file',
        value: '<your-file-name>'
    },
};

const submission = {
    title: null,
    userSubmissionLinks: [],
    accoladeIds: [],
    challengeIds: [],
    links: [],
    tags: [],
    videoLink: null,
    likeIds: [],
    commentIds: [],
    sourceCodeId: null,
    iconId: null,
    photosId: null,
    markdownId: null,
    submission_time: null,
};

const createSubmission = async (title, userSubmissionLinkIds, challengeIds, links, tags, videoLink) => {
    if (!title) throw new Error('submission title is required');
    const submissionObj = {
        title: title,
        userSubmissionLinkids: [],
        accoladeIds: [],
        challengeIds: challengeIds || [],
        links: links || [],
        tags: tags || [],
        videoLink: videoLink || '',
        likeIds: [],
        commentIds: [],
        sourceCodeId: '',
        iconId: '',
        photosId: '',
        markdownId: '',
        submission_time: (new Date()).toISOString(),
    };
    return submissionObj;
};

const addSubmission = async (submissionObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.submissions).insertOne(submissionObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error inserting submission:: ${err.message}`);
    }
};

const removeSubmission = async (submissionId) => {
    let client = null;
    try {
        client = mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.submissions).findOneAndDelete({ _id: mongoUtil.ObjectId(submissionId) });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing submission:: ${err.message}`);
    }
};

const addLike = async (submissionId, likeId) => {
    let client = null;
    try {
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.collections.submissions).updateOne(
                { _id: mongoUtil.ObjectId(submissionId) },
                { $addToSet: { likeIds: likeId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding like to submission:: ${err.message}`);
    }
};

const removeLike = async (submissionId, likeId) => {
    let client = null;
    try {
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.collections.submissions).updateOne(
                { _id: mongoUtil.ObjectId(submissionId) },
                { $pull: { likeIds: likeId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing like from submission:: ${err.message}`);
    }
};

const addComment = async (submissionId, commentId) => {
    let client = null;
    try {
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.collections.comments).updateOne(
                { _id: mongoUtil.ObjectId(submissionId) },
                { $pull: { commentIds: commentId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding comment to submission:: ${err.message}`);
    }
};

const removeComment = async (submissionId, commentId) => {
    let client = null;
    try {
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.submissions).updateOne(
                { _id: mongoUtil.ObjectId(submissionId) },
                { $push: { commentIds: commentId } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing comment from submission:: ${err.message}`);
    }
};

const getSubmission = async (submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.submissions).findOne({ _id: mongoUtil.ObjectId(submissionId) });
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting submission:: ${err.message}`);
    }
};

const getSubmissionsDump = async () => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const docs = await client.db(config.database.name)
            .collection(config.database.collections.submissions).find({}).toArray();
        await mongoUtil.closeClient(client);
        return docs;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting all submission data ${err.message}`);
    }
};

const updateSubmissionData = async (submissionId, setOptions) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: mongoUtil.bjectId(submissionId) },
            { $set: setOptions },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting all submission data ${err.message}`);
    }
};

module.exports = {
    sampleSubmission,
    submissionFileInstructions,
    submissionInstructions,
    submission,
    createSubmission,
    addSubmission,
    removeSubmission,
    addLike,
    removeLike,
    addComment,
    removeComment,
    getSubmission,
    getSubmissionsDump,
    updateSubmissionData,
};
