const path = require('path');
// const mimetypes = require('mime-types');
let submissionService = require('../services/submission');
let eventsService = require('../services/events');
let bouncer = require('../middleware/bouncer');
const config = require('../utils/config');
const logger = require('../utils/logger');

let IS_TESTING = true;

const validateAddSubmission = async (eventId, requestBody) => {
    const { name } = requestBody;
    const { tags } = requestBody;
    const { links } = requestBody;
    const { discordTags } = requestBody;
    if ((eventId?.length ?? 0) === 0) throw new Error('📌eventId is a required parameter');
    if ((name?.length ?? 0) === 0) throw new Error('📌name is a required field');
    if (tags && !Array.isArray(tags)) throw new Error('📌tags must be an array');
    if (!discordTags || !Array.isArray(discordTags)) throw new Error('📌discordTags is a required field');
    if ((tags?.length ?? 0) > config.submission_constraints.max_tags) {
        throw new Error(`📌maximum number of tags is ${config.submission_constraints.max_tags}`);
    }
    if ((links?.length ?? 0) > config.submission_constraints.max_links) {
        throw new Error(`📌maximum number of links is ${config.submission_constraints.max_links}`);
    }
    if (discordTags?.length === 0) {
        throw new Error('📌minimum number of discordTags is 1');
    } 
    if (discordTags.length > config.submission_constraints.max_participants) {
        throw new Error(`📌maximum number of discordTags is ${config.submission_constraints.max_participants}`);
    }
};

const validateSubmissionFileUploads = async (request) => {
    const { eventId } = request.params;
    const { buffer } = request.file;
    const { submissionId } = request.params;
    const { type } = request.params;
    const { originalname } = request.file;
    if (!buffer) throw new Error('📌no file provided');
    if (!eventId) throw new Error('📌eventId is a required parameter');
    if (!submissionId) throw new Error('📌submissionId is a required parameter');
    if (!type) throw new Error('📌type is a required parameter');
    if ((originalname?.length ?? 0) === 0) {
        throw new Error('📌no filename provided');
    }
    const _type = config.submission_constraints.submission_upload_types[type];
    if (!_type) {
        throw new Error(`📌invalid type parameter provided, valid types are ${config.submission_constraints.submission_upload_types.toString()}`);
    }
    if (!config.submission_constraints[`${_type}_formats`].includes(path.extname(originalname))) {
        throw new Error('📌invalid file type provided');
    }
};

const canAlterSubmission = async (token, submissionId) => {
    if (!submissionId) return true;
    const userAuthId = await bouncer.getAuthId(token);
    if (!userAuthId) return false;
    const userSubmissionLink = await submissionService.getUserSubmissionLinkBySubmissionIdAndUserAuthId(userAuthId, submissionId);
    if (!userSubmissionLink) return false;
    return true;
};

// ======================================================== //
// ========= 📌📌📌 Submission Section 📌📌📌 ====-===== //
// ======================================================== //

const addSubmission = async (req, res) => {
    const response = {};
    try {
        logger.info(JSON.stringify(req.body));
        const { eventId } = req.params;
        const { submissionId } = req.body;

        await validateAddSubmission(eventId, req.body);

        const eventObj = await eventsService.getEvent(eventId, false);
        if (!eventObj) throw new Error(`📌event ${eventId} does not exist`);

        // check submission time
        const submission_time = !IS_TESTING ? (new Date()).toISOString() : (new Date(eventObj.start_time)).toISOString();
        const submissionDate = (new Date(submission_time)).getTime();
        if (submissionDate < (new Date(eventObj.start_time).toISOString() || submissionDate > (new Date(eventObj.end_time).toISOString()))) {
            throw new Error('📌submissions are not allowed at this time');
        }

        // check if can update
        const token = req.cookies.accessToken || '';
        if (!(await canAlterSubmission(token, submissionId)))
            throw new Error('📌you are not allowed to update this submission');

        response.submissionId = await submissionService.addSubmission(req.body, eventId, submissionId);
        response.submission_time = submission_time;
        logger.info('📌submission successful');
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeSubmission = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { submissionId } = req.params;
    try {
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }

        // check if can update
        const token = req.cookies.accessToken || '';
        if (!(await canAlterSubmission(token, submissionId)))
            throw new Error('📌you are not allowed to update this submission');

        response.result = await submissionService.removeSubmission(eventId, submissionId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ======================================================== //
// ============= 📌📌📌 Like Section 📌📌📌 ============ //
// ======================================================== //

const toggleLike = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    try {
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }
        const token = req.cookies.accessToken || '';
        const userAuthId = await bouncer.getAuthId(token);
        if (!userAuthId) throw new Error('📌you are not logged in!');
        response.result = await submissionService.toggleLike(userAuthId, submissionId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ======================================================== //
// =========== 📌📌📌 Comment Section 📌📌📌 =========== //
// ======================================================== //

const addComment = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    const { message } = req.body;
    try {
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }
        if (!message) {
            throw new Error('📌message is a required field');
        }
        const token = req.cookies.accessToken || '';
        const userAuthId = await bouncer.getAuthId(token);
        if (!userAuthId) throw new Error('📌you are not logged in!');
        response.result = await submissionService.addComment(userAuthId, submissionId, message);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeComment = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    const { commentId } = req.params;
    try {
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }
        if (!commentId) {
            throw new Error('📌commentId is a required parameter');
        }
        const token = req.cookies.accessToken || '';
        const userAuthId = await bouncer.getAuthId(token);
        if (!userAuthId) throw new Error('📌you are not logged in!');
        response.result = await submissionService.removeComment(userAuthId, submissionId, commentId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

// ======================================================== //
// ====== 📌📌📌 Submission Files Section 📌📌📌 ======= //
// ======================================================== //

/**
 * @function submissionFileUpload
 * @param {Object} req 
 * @param {Object} res 
 */
const submissionFileUpload = async (req, res) => {
    const response = {};
    const { eventId } = req.params;
    const { buffer } = req.file;
    const { submissionId } = req.params;
    const { type } = req.params;
    const { originalname } = req.file;
    try {
        await validateSubmissionFileUploads(req);

        // check if can update
        const token = req.cookies.accessToken || '';
        if (!(await canAlterSubmission(token, submissionId)))
            throw new Error('📌you are not allowed to update this submission');

        response.location = await submissionService
            .uploadSubmissionFile(eventId, submissionId, originalname, config.submission_constraints.submission_upload_types[type], buffer);
        res.status(200).json(response);
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

const setEventsService = (mockEventsService) => {
    eventsService = mockEventsService;
};

const setBouncer = (mockBouncer) => {
    bouncer = mockBouncer;
};

module.exports = {
    addSubmission,
    removeSubmission,
    submissionFileUpload,
    toggleLike,
    addComment,
    removeComment,
    // testing
    setSubmissionService,
    setEventsService,
    setBouncer,
};
