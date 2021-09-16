const path = require('path');
// const mimetypes = require('mime-types');
const submissionService = require('../services/submission');
const config = require('../utils/config');
const logger = require('../utils/logger');
const bouncer = require('./bouncer');
const eventModel = require('../models/events');

let IS_TESTING = true;

const validateAddSubmission = async (requestBody) => {
    const { name } = requestBody;
    const { tags } = requestBody;
    const { links } = requestBody;
    const { discordTags } = requestBody;
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
    const { eventId } = req.params;
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

// ======================================================== //
// ========= 📌📌📌 Submission Section 📌📌📌 ====-===== //
// ======================================================== //

const addSubmission = async (req, res) => {
    const response = {
        submissionId: null,
        submission_time: null,
    };
    try {
        logger.info(JSON.stringify(req.body));
        const { eventId } = req.params;
        const { submissionId } = req.query;

        // check if the user is authorized to update this submission
        await submissionService.validateAddSubmission(req.cookies.accessToken, submissionId);

        // check submission time
        const submission_time = !IS_TESTING ? (new Date()).toISOString() : (new Date(eventObj.start_time)).toISOString();
        const submissionDate = (new Date(submission_time)).getTime();
        if (submissionDate < (new Date(eventObj.start_time).toISOString() || submissionDate > (new Date(eventObj.end_time).toISOString()))) {
            throw new Error('📌submissions are not allowed at this time');
        }
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
    const { submissionId } = req.params;
    try {
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }
        const token = req.cookies.accessToken || '';
        if (!token) throw new Error('📌you are not logged in!');
        if (!IS_TESTING) await submissionService.validateSubmitterForUpdate(token, submissionId);
        response.result = await submissionService.deleteSubmission(submissionId);
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

const addLike = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    try {
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }
        const token = req.cookies.accessToken || '';
        if (!token) throw new Error('📌you are not logged in!');
        const userAuthId = await bouncer.getAuthId(token);
        response.result = await submissionService.addLike(userAuthId, submissionId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const removeLike = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    try {
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }
        const token = req.cookies.accessToken || '';
        if (!token) throw new Error('📌you are not logged in!');
        const userAuthId = await bouncer.getAuthId(token);
        response.result = await submissionService.removeLike(userAuthId, submissionId);
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
        if (!token) throw new Error('📌you are not logged in!');
        const userAuthId = await bouncer.getAuthId(token);
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
    const { time } = req.body;
    try {
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }
        if (!time) {
            throw new Error('📌time is a required field');
        }
        const token = req.cookies.accessToken || '';
        if (!token) throw new Error('📌you are not logged in!');
        const userAuthId = await bouncer.getAuthId(token);
        response.result = `removed ${await submissionService.removeComment(userAuthId, submissionId, time)} comment`;
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
        response.location = await submissionService
            .uploadSubmissionFile(eventId, submissionId, originalname, config.submission_constraints.submission_upload_types[type], buffer);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

module.exports = {
    addSubmission,
    removeSubmission,
    submissionFileUpload,
    addLike,
    removeLike,
    addComment,
    removeComment,
};
