const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const sampleSubmission = {
    event: 'TD2021',
    title: 'Hello World!',
    users: ['Woody', 'Buzz', 'Bo-Peep', 'Ham'],
    links: ['https://www.google.com/', 'https://github.com/'],
    tags: ['pixar', 'film making'],
    videoLink: 'https://www.youtube.com/watch?v=pcbNb9pPNLw',
};

const submissionInstructions = {
    URL: '[domain]/bulletin/[event]/api/submission/add',
    'Content-Type': 'application/json',
    params: {
        event: 'name of the event you are submitting to',
    },
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
    eventId: null,
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

const createSubmission = async (eventId, title, userSubmissionLinkIds, challengeIds, links, tags, videoLink) => {
    if (!eventId) throw new Error('submission eventId is required');
    if (!title) throw new Error('submission title is required');
    const submissionObj = {
        eventId: eventId,
        title: title,
        userSubmissionLinkids: userSubmissionLinkIds || [],
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
            .collection(config.database.collections.submissions).findOneAndDelete({ _id: await mongoUtil.ObjectId(submissionId) });
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
                { _id: await mongoUtil.ObjectId(submissionId) },
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
                { _id: await mongoUtil.ObjectId(submissionId) },
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
                { _id: await mongoUtil.ObjectId(submissionId) },
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
                { _id: await mongoUtil.ObjectId(submissionId) },
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
            .collection(config.database.collections.submissions).findOne({ _id: await mongoUtil.ObjectId(submissionId) });
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
        throw new Error(`📌Error getting submission data:: ${err.message}`);
    }
};

const updateSubmissionData = async (submissionId, setOptions) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $set: setOptions },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

const addSubmissionUserSubmissionLinkId = async (submissionId, userSubmissionLinkId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $addToSet: { userSubmissionLinkIds: userSubmissionLinkId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

const removeSubmissionUserSubmissionLinkId = async (submissionId, userSubmissionLinkId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $pull: { userSubmissionLinkIds: userSubmissionLinkId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};



const removeSubmissionUserAccoladeId = async (submissionId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $pull: { accoladeIds: accoladeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

const addSubmissionUserAccoladeId = async (submissionId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.submissions).updateOne(
            { _id: await mongoUtil.ObjectId(submissionId) },
            { $addToSet: { accoladeIds: accoladeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating submission:: ${err.message}`);
    }
};

const getAllSubmissionsByEventId = async (eventId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const docs = (await client.db(config.database.name)
            .collection(config.database.collections.submissions).find({ eventId: eventId })).toArray();
        await mongoUtil.closeClient(client);
        return docs;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting all event submissions ${err.message}`);
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
    getAllSubmissionsByEventId,
    addSubmissionUserAccoladeId,
    removeSubmissionUserAccoladeId,
    addSubmissionUserSubmissionLinkId,
    removeSubmissionUserSubmissionLinkId,
};
