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

const addAccolade = async (req, res) => {
    const response = {};
    try {
        const { title } = req.body;
        const { description } = req.body;
        const { challenges } = req.body;
        const { emoji } = req.body;
        const { event } = req.params;

        if ((title?.length ?? 0) === 0 || typeof title !== 'string') throw new Error('📌title is a required field');
        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        if (challenges && !Array.isArray(challenges)) throw new Error('📌challenges must be an array');
        if (emoji && typeof emoji !== 'string') throw new Error('📌emoji must be a string');
        response.accoladeId = await adminService.addAccolade(title, description, challenges, emoji, event);
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
        response.accoladeIds = await adminService.removeAccolades(event, accolades);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const addEvent = async (req, res) => {
    const response = {};
    try {
        const { name } = req.body;
        const { description } = req.body;
        const { start_time } = req.body;
        const { end_time } = req.body;
        await validateAddEventInput(req.body);
        const newName = name.replace(' ', '_');
        response.eventId = await adminService.addEvent(newName, description, start_time, end_time);
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
        const newEvent = event.replace(' ', '_');
        response.eventId = await adminService.removeEvent(newEvent);
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
        let newName = null;
        if (req.body.name) newName = req.body.name.replace(' ', '_');
        response.eventId = await adminService.updateEvent(event, newName, req.body.description, req.body.start_time, req.body.end_time);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const getEvent = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        const newName = event.replace(' ', '_');
        response.result = await adminService.getEvent(newName);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const addChallenge = async (req, res) => {
    const response = {};
    try {
        const { title } = req.body;
        const { description } = req.body;
        const { questions } = req.body;
        const { accolades } = req.body;
        const { event } = req.params;

        if ((title?.length ?? 0) === 0 || typeof title !== 'string') throw new Error('📌title is a required field');
        if ((event?.length ?? 0) === 0 || typeof event !== 'string') throw new Error('📌event is a required parameter');
        if (questions && !Array.isArray(questions)) throw new Error('📌questions must be an array');
        if (accolades && !Array.isArray(accolades)) throw new Error('📌accolades must be an array');
        if (description && typeof description !== 'string') throw new Error('📌description must be a string');
        response.challengeId = await adminService.addChallenge(title, description, questions, accolades, event);
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
        response.challengeIds = await adminService.removeChallenges(event, challenges);
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
    addEvent,
    removeEvent,
    updateEvent,
    getEvent,
    addChallenge,
    removeChallenges,
    // testing
    setAdminService,
};
