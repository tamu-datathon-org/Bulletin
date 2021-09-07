const config = require('../utils/config');
const mongoUtil = require('../utils/mongoDb');

const event = {
    name: null,
    description: null,
    start_time: null,
    end_time: null,
    challengeIds: [],
    accoladeIds: [],
    submissionIds: [],
};

const createEvent = async (name, description, start_time, end_time) => {
    if (!name) throw new Error('event name is required');
    if (!description) throw new Error('event description is required');
    if (!start_time) throw new Error('event start_time is required');
    if (!end_time) throw new Error('event end_time is required');
    const event = {
        name: name,
        description: description,
        start_time: start_time,
        end_time: end_time,
        challengeIds: [],
        accoladeIds: [],
        submissionIds: [],
    };
    return event;
};

const addEvent = async (eventObj) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { insertedId } = await client.db(config.database.name)
            .collection(config.database.collections.events).insertOne(eventObj);
        await mongoUtil.closeClient(client);
        return insertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error adding event:: ${err.message}`);
    }
};

const removeEventById = async (eventId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const event = await client.db(config.database.name)
            .collection(config.database.collections.events).findOneAndDelete({ _id: await mongoUtil.ObjectId(eventId) });
        await mongoUtil.closeClient(client);
        return event._id;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing event:: ${err.message}`);
    }
};

const removeEventByName = async (name) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const event = await client.db(config.database.name)
            .collection(config.database.collections.events).findOneAndDelete({ name: name });
        await mongoUtil.closeClient(client);
        return event._id;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error removing event:: ${err.message}`);
    }
};

const getEventById = async (eventId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const event = await client.db(config.database.name)
            .collection(config.database.collections.events).findOne({ _id: await mongoUtil.ObjectId(eventId) });
        await mongoUtil.closeClient(client);
        return event;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting event:: ${err.message}`);
    }
};

const getEventByName = async (name) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const event = await client.db(config.database.name)
            .collection(config.database.collections.events).findOne({ name: name });
        await mongoUtil.closeClient(client);
        return event;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting event:: ${err.message}`);
    }
};

const getAllEvents = async () => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const events = await client.db(config.database.name)
            .collection(config.database.collections.events)
            .find({}).toArray();
        await mongoUtil.closeClient(client);
        return events;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error getting all events:: ${err.message}`);
    }
};

const updateEvent = async (eventId, setOptions) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { modifiedCount } = await client.db(config.database.name)
            .collection(config.database.collections.events)
            .updateOne(
                { _id: await mongoUtil.ObjectId(eventId) },
                { $set: setOptions },
            );
        await mongoUtil.closeClient(client);
        return modifiedCount;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events:: ${err.message}`);
    }
};

const addEventSubmissionId = async (eventId, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $addToSet: { submissionIds: submissionId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

const removeEventSubmissionId = async (eventId, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $pull: { submissionIds: submissionId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

const addEventChallengeId = async (eventId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await await mongoUtil.ObjectId(eventId) },
            { $push: { challengeIds: challengeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

const removeEventChallengeId = async (eventId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $pull: { challengeIds: challengeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

const removeEventChallengeIds = async (eventId, challengeIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.events)
            .updateOne(
                { _id: await mongoUtil.ObjectId(eventId) },
                { $pullAll: { challengeIds: challengeIds } },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

const addEventAccoladeId = async (eventId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $addToSet: { accoladeIds: accoladeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

const removeEventAccoladeId = async (eventId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $pull: { accoladeIds: accoladeId } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

const removeEventAccoladeIds = async (eventId, accoladeIds) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $pullAll: { accoladeIds: accoladeIds } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

module.exports = {
    event,
    createEvent,
    addEvent,
    removeEventById,
    removeEventByName,
    getEventById,
    getEventByName,
    getAllEvents,
    updateEvent,
    addEventAccoladeId,
    removeEventAccoladeId,
    removeEventAccoladeIds,
    addEventChallengeId,
    removeEventChallengeId,
    removeEventChallengeIds,
    addEventSubmissionId,
    removeEventSubmissionId,
};
