const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const accolade = {
    title: null,
    description: null,
};

const createAccolade = async (title, description, challengeIds) => {
    if (!title) throw new Error('accolade title is required');
    const accoladeObj = {
        title: title,
        desciprtion: description || '',
        challengeIds: challengeIds || [],
    };
    return accoladeObj;
};

const addAccolade = async (accoladeObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.accolades).insertOne(accoladeObj);
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
            .collection(config.database.collections.accolades).findOneAndDelete({ _id: mongoUtil.ObjectId(accoladeId) });
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
            .collection(config.database.collections.accolades).findOne({ _id: mongoUtil.ObjectId(accoladeId) });
        return accolade;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting accolade:: ${err.message}`);
    }
};  

module.exports = {
    accolade,
    createAccolade,
    addAccolade,
    removeAccolade,
    getAccolade,
};
