const path = require('path');
const submissionService = require('../services/submission');
const config = require('../utils/config');
const logger = require('../utils/logger');

exports.addSubmission = async (req, res) => {
    // define a standard response
    const response = {
        entryID: null,
        submission_time: null,
    };
    try {
        Object.keys(req.body).forEach((field) => {
            if (!config.submission_constraints.submission_fields.includes(field)) {
                throw new Error(`${field} is not a valid submission field`);
            }
        });

        // mongodb document
        const submissionObj = {
            names: req.body.names || [],
            title: req.body.title,
            challenges: req.body.challenges || [],
            links: req.body.links || [],
            tags: req.body.tags || [],
            filename: req.body.filename || '',
            likes: 0,
            comments: [],
            submission_time: (new Date()).toISOString(),
        };

        // temporary date
        submissionObj.submission_time = (new Date('16 October 2021 13:00 UTC')).toISOString();

        logger.info(JSON.stringify(submissionObj));

        // validate submission time
        const submissionDate = (new Date(submissionObj.submission_time)).getTime();
        const st = (new Date(config.submission_constraints.start_time)).getTime();
        const et = (new Date(config.submission_constraints.end_time)).getTime();
        if (submissionDate <= st || submissionDate > et) {
            throw new Error('📌Submission error:: Submissions are not allowed at this time');
        }

        // validate title
        if (!submissionObj.title) {
            throw new Error('📌Submission error:: Submissions require a title');
        }
        if (submissionObj.title.length === 0) {
            throw new Error('📌Submission error:: Submissions require a title');
        }

        // validate compression file uploads
        if (submissionObj.filename && !config.submission_constraints.compression_formats.includes(path.extname(submissionObj.filename))) {
            throw new Error(`📌Submission file upload error:: valid compression formats are ${config.submission_constraints.compression_formats.toString()}`);
        }

        // validate names
        if ((submissionObj.names?.length ?? 0) === 0) {
            throw new Error('📌Submsision names error:: minimum number of names is 0');
        } 
        if (submissionObj.names.length > config.submission_constraints.max_participants) {
            throw new Error(`📌Submission names error:: maximum number of names is ${config.submission_constraints.max_participants}`);
        }

        // validate tags
        if ((submissionObj.tags?.length ?? 0) > config.submission_constraints.max_tags) {
            throw new Error(`📌Submission tags error:: maximum number of tags is ${config.submission_constraints.max_tags}`);
        }

        response.entryID = await submissionService.addSubmission(submissionObj);
        response.submission_time = submissionObj.submission_time;
        logger.info('📌Uploaded successful');
        res.status(200).json(response);
    } catch (err) {
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.deleteSubmission = async (req, res) => {
    const response = {};
    const { title } = req.body;
    const { submission_time } = req.body;
    try {
        if (!title || !submission_time) {
            throw new Error('title and submission_time fields are required');
        }
        if (title.length === 0) throw new Error('title and submission_time fields are required');
        const doc = await submissionService.deleteSubmission(title, submission_time);
        response.deletedSubmission = doc;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.fileUpload = async (req, res) => {
    const response = {};
    const { buffer } = req.file;
    const { entryID } = req.params;
    const { originalname } = req.file;
    try {
        if (!buffer) {
            throw new Error('no file provided');
        }
        if (!entryID) {
            throw new Error('no entryID parameter');
        }
        if ((originalname?.length ?? 0) === 0) {
            throw new Error('no filename provided');
        }
        await submissionService.uploadSubmissionFile(buffer, entryID, originalname);
        response.filename = originalname;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.getSubmissionsData = async (req, res) => {
    const response = {
        result: [],
    };
    try {
        if ((Object.keys(req.body)).length === 0) {
            response.result.push(...await submissionService.getAllSubmissionsData());
        } else {
            Object.keys(req.body).forEach((key) => {
                if (!config.submission_constraints.submission_queries.includes(key)) throw new Error(`${key} is not a valid query parameter`);
            });
            response.result.push(...await submissionService.getSubmissionsDataWithFilters(req.body));
        }
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.getSubmissionQueryParameters = async (req, res) => {
    const response = {};
    try {
        response.parameters = config.submission_constraints.submission_queries;
        if (!response.parameters) throw new Error('Query parameters not available');
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.updateSubmissionData = async (req, res) => {
    const response = {};
    try {
        if (Object.keys(req.body).length === 0) {
            throw new Error('No field(s) to update');
        }
        Object.keys(req.body).forEach((field) => {
            if (!config.submission_constraints.submission_fields.includes(field) && field !== 'submission_time' && field !== 'originalTitle') {
                throw new Error(`${field} is not a valid submission field`);
            }
        });
        const { names } = req.body;
        const { title } = req.body;
        const { links } = req.body;
        const { tags } = req.body;
        const { challenges } = req.body;
        const { submission_time } = req.body;
        const { originalTitle } = req.body;
        if (!submission_time || !originalTitle) {
            throw new Error('originalTitle and submission_time are required fields');
        }
        response.modifiedCount = await submissionService.updateSubmissionData(originalTitle, (new Date(submission_time)).toISOString(), title, names, links, tags, challenges);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.updateFileAndUpload = async (req, res) => {
    const response = {};
    const { buffer } = req.file;
    const { entryID } = req.params;
    const { originalname } = req.file;
    try {
        if (!buffer) {
            throw new Error('no file provided');
        }
        if (!entryID) {
            throw new Error('no entryID parameter');
        }
        if ((originalname?.length ?? 0) === 0) {
            throw new Error('no filename provided');
        }
        await submissionService.uploadSubmissionFile(buffer, entryID, originalname);
        response.filename = originalname;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};
