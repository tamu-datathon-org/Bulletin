let eventsService = require('../services/events');
let submissionService = require('../services/submission');
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
        response.result = await eventsService.getEvents(full);
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
        response.result = await eventsService.getAccolades(eventId);
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

/**
 * @function getEventImage
 * @param {Object} req 
 * @param {Object} res 
 */
const getEventImage = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        const readable = await eventsService.getEventImage(eventId);
        readable.pipe(res);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getChallengeImage
 * @param {Object} req 
 * @param {Object} res 
 */
const getChallengeImage = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { challengeId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((challengeId?.length ?? 0) === 0) throw new Error('📌challengeId is a required parameter');
        const readable = await eventsService.getChallengeImage(eventId, challengeId);
        readable.pipe(res);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getSubmission
 * @param {Object} req 
 * @param {Object} res 
 */
const getSubmission = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { submissionId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((submissionId?.length ?? 0) === 0) throw new Error('📌submissionId is a required parameter');
        response.result = await submissionService.getSubmission(eventId, submissionId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getSubmissions
 * @param {Object} req 
 * @param {Object} res 
 */
const getSubmissions = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        response.result = await submissionService.getSubmissions(eventId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getSubmissionsByUserAuthId
 * @param {Object} req 
 * @param {Object} res 
 */
const getSubmissionsByUserAuthId = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { userAuthId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((userAuthId?.length ?? 0) === 0) throw new Error('📌userAuthId is a required parameter');
        response.result = await submissionService.getSubmissionsByUserAuthId(eventId, userAuthId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getSubmissionIcon
 * @param {Object} req 
 * @param {Object} res 
 */
const getSubmissionIcon = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { submissionId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((submissionId?.length ?? 0) === 0) throw new Error('📌submissionId is a required parameter');
        const readable = await submissionService.getSubmissionFile(eventId, submissionId, 'icon');
        readable.pipe(res);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getSubmissionPhotos
 * @param {Object} req 
 * @param {Object} res 
 */
const getSubmissionPhotos = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { submissionId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((submissionId?.length ?? 0) === 0) throw new Error('📌submissionId is a required parameter');
        const readable = await submissionService.getSubmissionFile(eventId, submissionId, 'photos');
        readable.pipe(res);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getSubmissionMarkdown
 * @param {Object} req 
 * @param {Object} res 
 */
const getSubmissionMarkdown = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { submissionId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((submissionId?.length ?? 0) === 0) throw new Error('📌submissionId is a required parameter');
        const readable = await submissionService.getSubmissionFile(eventId, submissionId, 'markdown');
        readable.pipe(res);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/**
 * @function getSubmissionSourceCode
 * @param {Object} req 
 * @param {Object} res 
 */
const getSubmissionSourceCode = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { submissionId } = req.params;
    try {
        if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
        if ((submissionId?.length ?? 0) === 0) throw new Error('📌submissionId is a required parameter');
        const readable = await submissionService.getSubmissionFile(eventId, submissionId, 'sourceCode');
        readable.pipe(res);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

/* testing */
const setSubmissionService = (mockSubmissionService) => {
    submissionService = mockSubmissionService;
};

const setEventService = (mockEventService) => {
    eventsService = mockEventService;
};

module.exports = {
    getEvent,
    getAllEvents,
    getAccolade,
    getAccolades,
    getChallenge,
    getChallenges,
    getEventImage,
    getChallengeImage,
    getSubmission,
    getSubmissions,
    getSubmissionsByUserAuthId,
    getSubmissionIcon,
    getSubmissionPhotos,
    getSubmissionMarkdown,
    getSubmissionSourceCode,
    // for testing
    setSubmissionService,
    setEventService,
};
