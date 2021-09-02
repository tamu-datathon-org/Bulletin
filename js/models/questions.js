const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const question = {
    text: null,
};

const createQuestion = async (text) => {
    const question = {
        text: text,
    };
    return question;
};

const addQuestion = async (questionObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.questions).insertOne(questionObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding question:: ${err.message}`);
    }
};

const removeQuestion = async (questionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const question = await client.db(config.database.name)
            .collection(config.database.collections.questions).findOneAndDelete({ _id: await mongoUtil.ObjectId(questionId) });
        await mongoUtil.closeClient(client);
        return question;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing question:: ${err.message}`);
    }
};

const removeQuestionByText = async (text) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const question = await client.db(config.database.name)
            .collection(config.database.collections.questions).findOneAndDelete({ text: text });
        await mongoUtil.closeClient(client);
        return question;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing question:: ${err.message}`);
    }
};

const updateQuestion = async (questionId, text) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.questions).updateOne(
            { _id: await mongoUtil.ObjectId(questionId) },
            { $set: { text: text } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating question:: ${err.message}`);
    }
};

const getQuestionByText = async (text) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const question = await client.db(config.database.name)
            .collection(config.database.collections.questions).findOne({ text: text });
        return question;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting question:: ${err.message}`);
    }
};

const getQuestionsByTexts = async (texts) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const questions = (await client.db(config.database.name)
            .collection(config.database.collections.questions).find({ text: { $in: texts } })).toArray();
        return questions;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting questions:: ${err.message}`);
    }
};

module.exports = {
    question,
    createQuestion,
    addQuestion,
    removeQuestion,
    removeQuestionByText,
    updateQuestion,
    getQuestionByText,
    getQuestionsByTexts,
};