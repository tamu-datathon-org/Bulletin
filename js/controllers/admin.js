const logger = require('../utils/logger');
// const config = require('../utils/config');
let adminService = require('../services/admin');

const validateAddEventInput = (requestBody) => {
    const { name } = requestBody;
    const { description } = requestBody;
    const { start_time } = requestBody;
    const { end_time } = requestBody;

    if ((name?.length ?? 0) === 0 || typeof name !== 'string') throw new Error('📌name is a required field');
    if ((description?.length ?? 0) === 0 || typeof description !== 'string') throw new Error('📌description is a required field');
    if ((start_time?.length ?? 0) === 0 || typeof start_time !== 'string') throw new Error('📌start_time is a required field');
    if ((end_time?.length ?? 0) === 0 || typeof end_time !== 'string') throw new Error('📌end_time is a required field');
    if ((new Date(start_time)).getTime() > (new Date(end_time)).getTime()) throw new Error('📌invalid start_time & end_time fields');
};

const validateUpdateEventInput = (requestBody) => {
    const { name } = requestBody;
    const { description } = requestBody;
    const { start_time } = requestBody;
    const { end_time } = requestBody;
    if (name && typeof name !== 'string') throw new Error('📌name is invalid');
    if (description && typeof description !== 'string') throw new Error('📌description is invalid');
    if (start_time && typeof start_time !== 'string') throw new Error('📌start_time is invalid');
    if (end_time && typeof end_time !== 'string') throw new Error('📌end_time is invalid');
    if (start_time && end_time && (new Date(start_time)).getTime() > (new Date(end_time)).getTime()) throw new Error('📌invalid start_time & end_time');
};

const validateAddAccolade = async (event, requestBody) => {
    const { name } = requestBody;
    const { description } = requestBody;
    const { challenge } = requestBody;
    const { emoji } = requestBody;

    if ((name?.length ?? 0) === 0 || typeof name !== 'string') throw new Error('📌name is a required field');
    if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
    if (description && typeof description !== 'string') throw new Error('📌description must be a string');
    if (challenge && typeof challenge !== 'string') throw new Error('📌challenge must be a string');
    if (emoji && typeof emoji !== 'string') throw new Error('📌emoji must be a string');
};

const validateUpdateAccolade = async (event, requestBody) => {
    const { accolade } = requestBody;
    const { newName } = requestBody;
    const { description } = requestBody;
    const { emoji } = requestBody;
    const { challenge } = requestBody;

    if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
    if ((accolade?.length ?? 0) === 0 || typeof accolade !== 'string') throw new Error('📌accolade is a required field');
    if (newName && typeof newName !== 'string') throw new Error('📌newName must be a string');
    if (description && typeof description !== 'string') throw new Error('📌description must be a string');
    if (challenge && typeof challenge !== 'string') throw new Error('📌challenge must be a string');
    if (emoji && typeof emoji !== 'string') throw new Error('📌emoji must be a string');
};

// ======================================================= //
// ======== 📌📌📌 Accolades Section 📌📌📌 =========== //
// ======================================================= //

const addAccolade = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        const { name } = req.body;
        const { description } = req.body;
        const { challenge } = req.body;
        const { emoji } = req.body;

        await validateAddAccolade(event, req.body);
        const _event = event.replace(' ', '_');
        response.accoladeId = await adminService.addAccolade(_event, name, description, emoji, challenge);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeAccolades = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        const { accolades } = req.body;

        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        if (!accolades || !Array.isArray(accolades)) throw new Error('📌accolades is a required field');
        const _event = event.replace(' ', '_');
        response.accoladeIds = await adminService.removeAccolades(_event, accolades);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const updateAccolade = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        const { accolade } = req.body;
        const { newName } = req.body;
        const { description } = req.body;
        const { emoji } = req.body;
        const { challenge } = req.body;

        await validateUpdateAccolade(event, req.body);
        const _event = event.replace(' ', '_');
        response.accoladeId = await adminService
            .updateAccolade(_event, accolade, newName, description, emoji, challenge);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ==================================================== //
// ======== 📌📌📌 Events Section 📌📌📌 =========== //
// ==================================================== //

const addEvent = async (req, res) => {
    const response = {};
    try {
        const { name } = req.body;
        const { description } = req.body;
        const { start_time } = req.body;
        const { end_time } = req.body;
        await validateAddEventInput(req.body);
        const _event = name.replace(' ', '_');
        response.eventId = await adminService.addEvent(_event, description, start_time, end_time);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeEvent = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        const _event = event.replace(' ', '_');
        response.eventId = await adminService.removeEvent(_event);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const updateEvent = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        await validateUpdateEventInput(req.body);
        const _event = event.replace(' ', '_');
        let _name = null;
        if (req.body.name) _name = req.body.name.replace(' ', '_');
        response.eventId = await adminService.updateEvent(_event, _name, req.body.description, req.body.start_time, req.body.end_time);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ======================================================== //
// ======== 📌📌📌 Challenges Section 📌📌📌 =========== //
// ======================================================== //

const addChallenge = async (req, res) => {
    const response = {};
    try {
        const { name } = req.body;
        const { description } = req.body;
        const { questions } = req.body;
        const { accolades } = req.body;
        const { event } = req.params;

        if ((name?.length ?? 0) === 0 || typeof name !== 'string') throw new Error('📌name is a required field');
        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        if (questions && !Array.isArray(questions)) throw new Error('📌questions must be an array');
        if (accolades && !Array.isArray(accolades)) throw new Error('📌accolades must be an array');
        if (description && typeof description !== 'string') throw new Error('📌description must be a string');
        const _event = event.replace(' ', '_');
        response.challengeId = await adminService.addChallenge(_event, name, description, questions, accolades, event);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeChallenges = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        const { challenges } = req.body;

        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        if (!challenges || !Array.isArray(challenges)) throw new Error('📌challenges is a required field');
        const _event = event.replace(' ', '_');
        response.challengeIds = await adminService.removeChallenges(_event, challenges);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const updateChallenge = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        const { challenges } = req.body;

        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        if (!challenges || !Array.isArray(challenges)) throw new Error('📌challenges is a required field');
        const _event = event.replace(' ', '_');
        response.challengeIds = await adminService.removeChallenges(_event, challenges);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/* for testing only */
const setAdminService = (testAdminService) => {
    adminService = testAdminService;
};

module.exports = {
    addAccolade,
    removeAccolades,
    updateAccolade,
    addEvent,
    removeEvent,
    updateEvent,
    addChallenge,
    removeChallenges,
    updateChallenge,
    // testing
    setAdminService,
};
