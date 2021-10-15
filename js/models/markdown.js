const mongoUtil = require('../utils/mongoDb');
const config = require('../utils/config');

const markdown = {
    _id: null,
    submissionId: null,
    text: null,
};

const createMarkdown = async (submissionId, text) => {
    const markdownObj = {
        submissionId: await mongoUtil.ObjectId(submissionId),
        text: text,
    };
    return markdownObj;
};

const addMarkdown = async (markdownObj, markdownId = null) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.markdown)
            .updateOne(
                { _id: await mongoUtil.ObjectId(markdownId) },
                { $set: markdownObj },
                { upsert: true },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding markdown:: ${err.message}`);
    }
};

const removeMarkdown = async (markdownId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.markdown)
            .findOne({ _id: await mongoUtil.ObjectId(markdownId) });
        await client.db(config.database.name)
            .collection(config.database.collections.markdown)
            .deleteOne({ _id: await mongoUtil.ObjectId(markdownId) });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing markdown:: ${err.message}`);
    }
};

const getMarkdown = async (markdownId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.markdown)
            .findOne({ _id: await mongoUtil.ObjectId(markdownId) });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting markdown:: ${err.message}`);
    }
};

const getMarkdownBySubmissionId = async (submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const doc = await client.db(config.database.name)
            .collection(config.database.collections.markdown)
            .findOne({ submissionId: await mongoUtil.ObjectId(submissionId) });
        await mongoUtil.closeClient(client);
        return doc;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting markdown:: ${err.message}`);
    }
};

module.exports = {
    markdown,
    createMarkdown,
    addMarkdown,
    removeMarkdown,
    getMarkdown,
    getMarkdownBySubmissionId,
};