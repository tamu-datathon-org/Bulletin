const path = require('path');
// const mimetypes = require('mime-types');
const submissionService = require('../services/submission');
const config = require('../utils/config');
const logger = require('../utils/logger');
const bouncer = require('./bouncer');
const eventModel = require('../models/events');

let IS_TESTING = process.env.IS_TESTING || false;

const validateSubmissionFileUploads = (request) => {
    const { buffer } = request.file;
    const { submissionId } = request.params;
    const { type } = request.params;
    const { originalname } = request.file;
    if (!buffer) throw new Error('📌no file provided');
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

const addSubmission = async (req, res) => {
    // define a standard response
    const response = {
        submissionId: null,
        submission_time: null,
    };
    try {
        logger.info(JSON.stringify(req.body));

        const { event } = req.params;
        if (!event) throw new Error('📌event is a required parameter');
        const eventId = await eventModel.getEventByName(event);
        if (!eventId) throw new Error(`event ${event} does not exist`);

        const requiredFields = [];
        const validFields = [];
        config.submission_constraints.submission_fields.forEach(f => {
            if (f.required) requiredFields.push(f.field);
            validFields.push(f.field);
        });
        const providedFields = Object.keys(req.body);
        if (!requiredFields.every(f => providedFields.includes(f))) throw new Error('📌missing required field');
        if (!providedFields.every(f => validFields.includes(f))) throw new Error('📌invalid field');

        // submission time
        const dateSpan = await submissionService.getEventTimeSpan(eventId);
        const submission_time = !IS_TESTING ? (new Date()).toISOString() : (new Date(dateSpan[0])).toISOString();

        // validate submission time
        const submissionDate = (new Date(submission_time)).getTime();
        if (submissionDate < (new Date(dateSpan[0]).toISOString() || submissionDate > (new Date(dateSpan[1]).toISOString()))) {
            throw new Error('📌Submission error:: Submissions are not allowed at this time');
        }

        // validate title
        if (!req.body.title) {
            throw new Error('📌Submission error:: Submissions require a title');
        }
        if (req.body.title.length === 0) {
            throw new Error('📌Submission error:: Submissions require a title');
        }

        // validate userAuthIds
        if ((req.body.users?.length ?? 0) === 0) {
            throw new Error('📌Submsision users error:: minimum number of users is 1');
        } 
        if (req.body.users.length > config.submission_constraints.max_participants) {
            throw new Error(`📌Submission users error:: maximum number of users is ${config.submission_constraints.max_participants}`);
        }

        const token = req.cookies.accessToken || '';
        if (!token) throw new Error('📌you are not logged in!');
        const discordTags = IS_TESTING ?
            [{ userAuthId: Date.now(), discordTag: 'greg' }] : 
            await submissionService.validateSubmitterAndGetDiscordTags(token, req.body.users);

        if (discordTags.length === 0) throw new Error('📌no users are in the discord');

        // validate compression file uploads
        if (req.body.sourceCodeFile && !config.submission_constraints.source_code_formats.includes(path.extname(req.body.sourceCodeFile))) {
            throw new Error(`📌${config.submission_constraints.submission_upload_types.sourceCode}File upload error:: valid formats are ${config.submission_constraints.source_code_formats.toString()}`);
        }
        if (req.body.photosFile && !config.submission_constraints.photo_formats.includes(path.extname(req.body.photosFile))) {
            throw new Error(`📌${config.submission_constraints.submission_upload_types.photos}File upload error:: valid formats are ${config.submission_constraints.photo_formats.toString()}`);
        }
        if (req.body.iconFile && !config.submission_constraints.icon_formats.includes(path.extname(req.body.iconFile))) {
            throw new Error(`📌${config.submission_constraints.submission_upload_types.icon}File upload error:: valid formats are ${config.submission_constraints.icon_formats.toString()}`);
        }
        if (req.body.markdownFile && !config.submission_constraints.markdown_formats.includes(path.extname(req.body.markdownFile))) {
            throw new Error(`📌${config.submission_constraints.submission_upload_types.markdown}File upload error:: valid formats are ${config.submission_constraints.markdown_formats.toString()}`);
        }

        // validate tags
        if ((req.body.tags?.length ?? 0) > config.submission_constraints.max_tags) {
            throw new Error(`📌Submission tags error:: maximum number of tags is ${config.submission_constraints.max_tags}`);
        }

        // validate links
        if ((req.body.links?.length ?? 0) > config.submission_constraints.max_links) {
            throw new Error(`📌Submission links error:: maximum number of tags is ${config.submission_constraints.max_links}`);
        }

        response.submissionId = await submissionService.addSubmission(req.body, eventId, discordTags);
        response.submission_time = submission_time;

        logger.info('📌Uploaded successful');
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const deleteSubmission = async (req, res) => {
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

const getSingleSubmission = async (req, res) => {
    const response = {
        result: null,
    };
    const { submissionId } = req.params;
    try {
        response.result = await submissionService.getSubmission(submissionId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const getMultipleSubmissions = async (req, res) => {
    const response = {
        result: [],
    };
    try {
        Object.keys(req.body).forEach((key) => {
            let hasKey = false;
            config.submission_constraints.submission_queries.forEach((field) => {
                if (field === key) hasKey = true;
            });
            if (!hasKey) throw new Error(`📌${key} is not a valid query field`);
        });
        response.result.push(...await submissionService.getSubmissionsDataWithFilters(req.body));
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const getAllSubmissions = async (req, res) => {
    const response = {
        result: [],
    };
    try {
        response.result.push(...await submissionService.getAllSubmissionsData());
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const getAllSubmissionsByEvent = async (req, res) => {
    const response = {};
    const { event } = req.params;
    try {
        if (!event) throw new Error('📌event is a required parameter');
        const eventId = await eventModel.getEventByName(event);
        if (!eventId) throw new Error(`📌event ${event} does not exist`);
        response.result = await submissionService.getAllSubmissionsByEventId(eventId);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const getSubmissionQueryFields = async (req, res) => {
    const response = {};
    try {
        response.fields = config.submission_constraints.submission_queries;
        if (!response.fields) throw new Error('📌Query parameters are not available');
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const getSubmissionUploadFields = async (req, res) => {
    const response = {};
    try {
        response.fields = config.submission_constraints.submission_fields;
        if (!response.fields) throw new Error('📌Submission fields are not available');
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const updateSubmission = async (req, res) => {
    const response = {};
    try {
        const { submissionId } = req.params;
        if (Object.keys(req.body).length === 0) {
            throw new Error('📌No field(s) to update');
        }
        Object.keys(req.body).forEach((field) => {
            if (!config.submission_constraints.submission_fields.includes(field)) {
                throw new Error(`📌${field} is not a valid submission field`);
            }
        });
        if (!submissionId) {
            throw new Error('📌submissionId is a required parameter');
        }
        if (req.body.userAuthIds) {
            if ((req.body.userAuthIds?.length ?? 0) === 0) {
                throw new Error('📌Submsision update names error:: minimum number of userAuthIds is 1');
            }
            if ((req.body.userAuthIds?.length ?? 0) > config.submission_constraints.max_participants) {
                throw new Error(`📌Submsision update names error:: maximum number of userAuthIds is ${config.submission_constraints.max_participants}`);
            }
        }
        if (req.body.links) {
            if (!Array.isArray(req.body.links)) throw new Error('📌Submsision update links error:: links must be a list');
        }
        if (req.body.tags) {
            if (!Array.isArray(req.body.tags)) throw new Error('📌Submsision update tags error:: tags must be a list');
        }
        if (req.body.challenges) {
            if (!Array.isArray(req.body.links)) throw new Error('📌Submsision update challenges error:: challenges must be a list');
        }
        const token = req.cookies.accessToken || '';
        if (!token) throw new Error('📌you are not logged in!');
        if (!IS_TESTING) await submissionService.validateSubmitterForUpdate(token, submissionId);
        response.modifiedCount = await submissionService.updateSubmission(submissionId, req.body);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

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

const submissionFileUpload = async (req, res) => {
    const response = {};
    const { buffer } = req.file;
    const { submissionId } = req.params;
    const { type } = req.params;
    const { originalname } = req.file;
    try {
        await validateSubmissionFileUploads(req);
        response.key = await submissionService.uploadSubmissionFile(buffer, submissionId, originalname, config.submission_constraints.submission_upload_types[type]);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const submissionFileDownload = async (req, res) => {
    const response = {};
    const { key } = req.params;
    try {
        if (!key) throw new Error('📌key is a required parameter');
        const readable = await submissionService.downloadSubmissionFile(key);
        readable.pipe(res);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const getSubmissionInstructions = async (req, res) => {
    res.status(200).json(await submissionService.getSubmissionInstructions());
};

const getSubmissionFileInstructions = async (req, res) => {
    res.status(200).json(await submissionService.getSubmissionFileInstructions());
};

const sendHelpLinks = async (req, res) => {
    res.status(200).json({ helpLinks: [
        '.. /help/submissionFields',
        '.. /help/queryFields',
        '.. /help/instructions',
        '.. /help/instructions/file',
    ]});
};

module.exports = {
    addSubmission,
    deleteSubmission,
    getAllSubmissions,
    getSingleSubmission,
    getMultipleSubmissions,
    addLike,
    removeLike,
    addComment,
    removeComment,
    updateSubmission,
    submissionFileUpload,
    submissionFileDownload,
    getSubmissionQueryFields,
    getSubmissionUploadFields,
    getSubmissionInstructions,
    getSubmissionFileInstructions,
    sendHelpLinks,
    getAllSubmissionsByEvent,
};
