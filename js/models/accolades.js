const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const accolade = {
    title: null,
    description: null,
    challengeIds: [],
    emoji: null,
};

const createAccolade = async (title, description, challengeIds, emoji) => {
    if (!title) throw new Error('accolade title is required');
    const accoladeObj = {
        title: title,
        desciprtion: description || '',
        challengeIds: challengeIds || [],
        emoji: emoji || '🥇',
    };
    return accoladeObj;
};

const addAccolade = async (accoladeObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.accolades).insertOne(accoladeObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding accolade ${err.message}`);
    }
};

const removeAccolade = async (accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolade = await client.db(config.database.name)
            .collection(config.database.collections.accolades).findOneAndDelete({ _id: await mongoUtil.ObjectId(accoladeId) });
        await mongoUtil.closeClient(client);
        return accolade;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing accolade:: ${err.message}`);
    }
};

const removeAccoladeByTitle = async (title) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolade = await client.db(config.database.name)
            .collection(config.database.collections.accolades).findOneAndDelete({ title: title });
        await mongoUtil.closeClient(client);
        return accolade;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing accolade:: ${err.message}`);
    }
};

const getAccolade = async (accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolade = await client.db(config.database.name)
            .collection(config.database.collections.accolades).findOne({ _id: await mongoUtil.ObjectId(accoladeId) });
        await mongoUtil.closeClient(client);
        return accolade;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting accolade:: ${err.message}`);
    }
};

const getAccoladeByTitle = async (title) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolade = await client.db(config.database.name)
            .collection(config.database.collections.accolades).findOne({ title: title });
        await mongoUtil.closeClient(client);
        return accolade;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting accolade:: ${err.message}`);
    }
};

const getAccoladesByTitles = async (titles) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolades = await client.db(config.database.name)
            .collection(config.database.collections.accolades).find({ title: { $in: titles } }).toArray();
        await mongoUtil.closeClient(client);
        return accolades;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting accolades:: ${err.message}`);
    }
};

const updateAccolade = async (accoladeId, setOptions, pushOptions, pullOptions) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.accolades).updateOne(
            { _id: await mongoUtil.ObjectId(accoladeId) },
            { $set: setOptions },
            { $addToSet: pushOptions },
            { $pull: pullOptions },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating accolade ${err.message}`);
    }
};

module.exports = {
    accolade,
    createAccolade,
    addAccolade,
    removeAccolade,
    removeAccoladeByTitle,
    getAccolade,
    getAccoladeByTitle,
    getAccoladesByTitles,
    updateAccolade,
};
