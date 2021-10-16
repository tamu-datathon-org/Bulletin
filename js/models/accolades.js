const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const accolade = {
    name: null,
    description: null,
    emoji: null,
    eventId: null,
    challengeId: null,
};

const createAccolade = async (name, description, emoji, eventId, challengeId) => {
    const accoladeObj = {
        name: name || '',
        description: description || '',
        emoji: emoji || '🥇',
        eventId: await mongoUtil.ObjectId(eventId),
        challengeId: await mongoUtil.ObjectId(challengeId) || '',
    };
    return accoladeObj;
};

/**
 * @function addAccolade
 * @param {Object} accoladeObj 
 * @param {String} accoladeId 
 * @returns {String} upserted accolade id
 */
const addAccolade = async (accoladeObj, accoladeId = null) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.accolades).updateOne(
                { _id: await mongoUtil.ObjectId(accoladeId)  },
                { $set: accoladeObj },
                { upsert: true },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding accolade ${err.message}`);
    }
};

const removeAccolade = async (eventId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolade = await client.db(config.database.name)
            .collection(config.database.collections.accolades)
            .findOne({
                _id: await mongoUtil.ObjectId(accoladeId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        if (!accolade) throw new Error('accolade does not exist');
        await client.db(config.database.name)
            .collection(config.database.collections.accolades)
            .deleteOne({
                _id: await mongoUtil.ObjectId(accoladeId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        await mongoUtil.closeClient(client);
        return accolade;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing accolade:: ${err.message}`);
    }
};

const removeAccolades = async (eventId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolade = await client.db(config.database.name)
            .collection(config.database.collections.accolades)
            .deleteMany({ _id: await mongoUtil.ObjectId(eventId) });
        await mongoUtil.closeClient(client);
        return accolade;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing accolades:: ${err.message}`);
    }
};

const getAccolade = async (eventId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolade = await client.db(config.database.name)
            .collection(config.database.collections.accolades)
            .findOne({
                _id: await mongoUtil.ObjectId(accoladeId),
                eventId: await mongoUtil.ObjectId(eventId),
            });
        await mongoUtil.closeClient(client);
        return accolade;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting accolade:: ${err.message}`);
    }
};

const getAccoladesByEventId = async (eventId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolades = await client.db(config.database.name)
            .collection(config.database.collections.accolades)
            .find({ eventId: await mongoUtil.ObjectId(eventId) }).toArray();
        await mongoUtil.closeClient(client);
        return accolades;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting accolades:: ${err.message}`);
    }
};

const getAccoladesByAccoladeIds = async (accoladeIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const accolades = await client.db(config.database.name)
            .collection(config.database.collections.accolades)
            .find({ _id: { $in: accoladeIds } }).toArray();
        await mongoUtil.closeClient(client);
        return accolades;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting accolades:: ${err.message}`);
    }
};

const addAccoladeChallengeId = async (accoladeId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        await client.db(config.database.name)
            .collection(config.database.collections.accolades)
            .updateOne(
                { _id: await mongoUtil.ObjectId(accoladeId) },
                { $set: { challengeId: challengeId } },
            );
        await mongoUtil.closeClient(client);
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating accolade:: ${err.message}`);
    }
};

module.exports = {
    accolade,
    createAccolade,
    addAccolade,
    removeAccolade,
    removeAccolades,
    getAccolade,
    getAccoladesByEventId,
    getAccoladesByAccoladeIds,
    addAccoladeChallengeId,
};
