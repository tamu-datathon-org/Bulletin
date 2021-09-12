const eventsService = require('../services/events');
const logger = require('../utils/logger');

/**
 * @function getEvent
 * @param {Object} req 
 * @param {Object} res 
 * @description get event by event id
 */
const getEvent = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        let full = req.query.full || false;
        if (typeof full === 'string') full = full.toLowerCase() === 'true' ? true : false;
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        response.result = await eventsService.getEvent(eventId, full);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getAllEvents
 * @param {Object} req 
 * @param {Object} res 
 * @description get all bulletin events
 */
const getAllEvents = async (req, res) => {
    const response = {};
    try {
        let full = req.query.full || false;
        if (typeof full === 'string') full = full.toLowerCase() === 'true' ? true : false;
        response.result = await eventsService.getAllEvents(full);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getAccolade
 * @param {Object} req 
 * @param {Object} res 
 * @description get one accolade by id
 */
const getAccolade = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { accoladeId } = req.params;
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((accoladeId?.length ?? 0) === 0) throw new Error('📌accoladeId is a required parameter');
        response.result = await eventsService.getAccolade(eventId, accoladeId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getAccolades
 * @param {Object} req 
 * @param {Object} res
 * @description get all accolades by id
 */
const getAccolades = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        response.result = await eventsService.getAccoladesByEvent(eventId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getChallenge
 * @param {Object} req 
 * @param {Object} res 
 */
const getChallenge = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        const { challengeId } = req.params;
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((challengeId?.length ?? 0) === 0) throw new Error('📌challengeId is a required parameter');
        response.result = await eventsService.getChallenge(eventId, challengeId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getChallenges
 * @param {Object} req 
 * @param {Object} res 
 */
const getChallenges = async (req, res) => {
    const response = {};
    try {
        const { eventId } = req.params;
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        response.result = await eventsService.getChallenges(eventId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

module.exports = {
    getEvent,
    getAllEvents,
    getAccolade,
    getAccolades,
    getChallenge,
    getChallenges,
};
