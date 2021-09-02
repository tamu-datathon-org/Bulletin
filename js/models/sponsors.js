const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const sponsor = {
    name: null,
    challengeIds: [],
    accoladeIds: [],
    logoId: null,
};

const createSponsor = async (name, challengeIds, accoladeIds) => {
    if (!name) throw new Error('sponsor name is required');
    const sponsorObj = {
        name: name,
        description: challengeIds || [],
        accoladeIds: accoladeIds || [],
        logoId: null,
    };
    return sponsorObj;
};

const addSponsor = async (sponsorObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.sponsors).insertOne(sponsorObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding sponsor:: ${err.message}`);
    }
};

const removeSponsorById = async (sponsorId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const sponsor = await client.db(config.database.name)
            .collection(config.database.collections.sponsors).findOneAndDelete({ _id: await mongoUtil.ObjectId(sponsorId) });
        await mongoUtil.closeClient(client);
        return sponsor;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing sponsor:: ${err.message}`);
    }
};

const removeSponsorByName = async (name) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const sponsor = await client.db(config.database.name)
            .collection(config.database.collections.sponsors).findOneAndDelete({ name: name });
        await mongoUtil.closeClient(client);
        return sponsor;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing sponsor:: ${err.message}`);
    }
};

const getSponsorById = async (sponsorId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const sponsor = await client.db(config.database.name)
            .collection(config.database.collections.sponsors).findOne({ _id: await mongoUtil.ObjectId(sponsorId) });
        await mongoUtil.closeClient(client);
        return sponsor;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting sponsor:: ${err.message}`);
    }
};

const getSponsorByName = async (name) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const sponsor = await client.db(config.database.name)
            .collection(config.database.collections.sponsors).findOne({ name: name });
        await mongoUtil.closeClient(client);
        return sponsor;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting sponsor:: ${err.message}`);
    }
};

const getSponsorsByIds = async (sponsorIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const sponsors = (await client.db(config.database.name)
            .collection(config.database.collections.sponsors).find({ _id: { $in: sponsorIds } })).toArray();
        await mongoUtil.closeClient(client);
        return sponsors;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting sponsors:: ${err.message}`);
    }
};

const getSponsorsByNames = async (names) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const sponsors = (await client.db(config.database.name)
            .collection(config.database.collections.sponsors).find({ name: { $in: names } })).toArray();
        await mongoUtil.closeClient(client);
        return sponsors;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting sponsors:: ${err.message}`);
    }
};

const updateSponsorName = async (sponsorId, name) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.sponsors).updateOne(
            { _id: await mongoUtil.ObjectId(sponsorId) },
            { $set: { name: name } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating sponsor name:: ${err.message}`);
    }
};

const addSponsorAccolade = async (sponsorId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.sponsors).updateOne(
            { _id: await mongoUtil.ObjectId(sponsorId) },
            { $addToSet: { accoladeIds: accoladeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating sponsor accolades:: ${err.message}`);
    }
};

const removeSponsorAccolade = async (sponsorId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.sponsors).updateOne(
            { _id: await mongoUtil.ObjectId(sponsorId) },
            { $pull: { accoladeIds: accoladeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating sponsor accolade:: ${err.message}`);
    }
};

const addSponsorChallenge = async (sponsorId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.sponsors).updateOne(
            { _id: await mongoUtil.ObjectId(sponsorId) },
            { $addToSet: { challengeIds: challengeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating sponsor challenge:: ${err.message}`);
    }
};

const removeSponsorChallenge = async (sponsorId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.sponsors).updateOne(
            { _id: await mongoUtil.ObjectId(sponsorId) },
            { $pull: { challengeIds: challengeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating sponsor challenge:: ${err.message}`);
    }
};

module.exports = {
    sponsor,
    createSponsor,
    addSponsor,
    removeSponsorById,
    removeSponsorByName,
    getSponsorById,
    getSponsorByName,
    getSponsorsByIds,
    getSponsorsByNames,
    updateSponsorName,
    addSponsorAccolade,
    removeSponsorAccolade,
    addSponsorChallenge,
    removeSponsorChallenge,
};
