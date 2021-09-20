const config = require('../utils/config');
const logger = require('../utils/logger');
const mongoUtil = require('../utils/mongoDb');

const event = {
    name: null,
    description: null,
    start_time: null,
    end_time: null,
    show: null,
    challengeIds: [],
    accoladeIds: [],
    submissionIds: [],
};

/**
 * @function createEvent
 * @param {String} name 
 * @param {String} description 
 * @param {Date} start_time 
 * @param {Date} end_time 
 * @param {Boolean} show 
 * @returns {Object} event object
 */
const createEvent = async (name, description, start_time, end_time, show) => {
    if (!name) throw new Error('event name is required');
    if (!description) throw new Error('event description is required');
    if (!start_time) throw new Error('event start_time is required');
    if (!end_time) throw new Error('event end_time is required');
    const event = {
        name: name,
        description: description,
        start_time: (new Date(start_time)).toISOString(),
        end_time: (new Date(end_time)).toISOString(),
        show: show || true,
    };
    return event;
};

/**
 * @function addEvent
 * @param {Object} eventObj 
 * @param {String} eventId 
 * @returns {String} event id
 */
const addEvent = async (eventObj, eventId = null) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name)
            .collection(config.database.collections.events)
            .updateOne(
                { _id: await mongoUtil.ObjectId(eventId) },
                { $set: eventObj },
                { upsert: true },
            );
        await mongoUtil.closeClient(client);
        return upsertedId;
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
            .collection(config.database.collections.events)
            .findOne({ _id: await mongoUtil.ObjectId(eventId) });
        await client.db(config.database.name)
            .collection(config.database.collections.events)
            .deleteOne({ _id: await mongoUtil.ObjectId(eventId) });
        await mongoUtil.closeClient(client);
        return event;
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

/**
 * @function addEventAccoladeId
 * @param {String} eventId 
 * @param {String} accoladeId 
 * @returns {String} upserted id
 */
const addEventAccoladeId = async (eventId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $addToSet: { accoladeIds: await mongoUtil.ObjectId(accoladeId) } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

/**
 * @function addEventSubmissionId
 * @param {String} eventId 
 * @param {String} submissionId 
 * @returns {String} upserted id or null
 */
const addEventSubmissionId = async (eventId, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $addToSet: { submissionIds: await mongoUtil.ObjectId(submissionId) } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

/**
 * @function addEventChallengeId
 * @param {String} eventId 
 * @param {String} challengeId 
 * @returns {String} upserted id or null
 */
const addEventChallengeId = async (eventId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $addToSet: { challengeIds: await mongoUtil.ObjectId(challengeId) } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

/**
 * @function removeEventSubmissionId
 * @param {String} eventId 
 * @param {String} submissionId 
 * @returns {String} upserted id
 */
const removeEventSubmissionId = async (eventId, submissionId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $pull: { submissionIds: await mongoUtil.ObjectId(submissionId) } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

/**
 * @function removeEventChallengeId
 * @param {String} eventId 
 * @param {String} challengeId 
 * @returns {String} upserted id
 */
const removeEventChallengeId = async (eventId, challengeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $pull: { challengeIds: await mongoUtil.ObjectId(challengeId) } },
        );
        await mongoUtil.closeClient(client);
        return upsertedId;
    } catch (err) {
        await mongoUtil.closeClient(client);
        throw new Error(`📌Error updating events ${err.message}`);
    }
};

/**
 * @function removeEventAccoladeId
 * @param {String} eventId 
 * @param {String} accoladeId 
 * @returns {String} upserted id
 */
const removeEventAccoladeId = async (eventId, accoladeId) => {
    let client = null;
    try {
        client = await mongoUtil.getClient();
        const { upsertedId } = await client.db(config.database.name).collection(config.database.collections.events).updateOne(
            { _id: await mongoUtil.ObjectId(eventId) },
            { $pull: { accoladeIds: await mongoUtil.ObjectId(accoladeId) } },
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
    addEventAccoladeId,
    addEventChallengeId,
    addEventSubmissionId,
    removeEventChallengeId,
    removeEventSubmissionId,
    removeEventAccoladeId,
};
