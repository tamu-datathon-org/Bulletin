const path = require('path');
const submissionService = require('../services/submission');
const config = require('../utils/config');
// const logger = require('../utils/logger');

exports.addSubmission = async (req, res) => {
    // define a standard response
    const response = {
        submission_time: null,
    };
    try {
        const submissionObj = {
            names: req.body.names,
            challenges: req.body.challenges,
            links: req.body.links,
            submission_time: null,
        };
        submissionObj.submission_time = (new Date('16 October 2021 13:00 UTC')).toISOString();

        const { filename } = req.body;

        // validate compression file uploads
        if (filename && !config.submission_constraints.compression_formats.includes(path.extname(filename))) {
            throw new Error('Invalid compression format');
        }

        // validate names
        if ((submissionObj.names?.length ?? 0) === 0) {
            throw new Error('At least one participant is required');
        } 
        if (submissionObj.names.length > config.submission_constraints.max_participants) {
            throw new Error('Four or less paritipcants allowed');
        }

        // validate submission time
        const submissionDate = (new Date(submissionObj.submission_time)).getTime();
        const st = (new Date(config.submission_constraints.start_time)).getTime();
        const et = (new Date(config.submission_constraints.end_time)).getTime();
        if (submissionDate <= st || submissionDate > et) {
            throw new Error('Submissions are not allowed at this time');
        }
        response.submission_time = submissionObj.submission_time;

        // call the service
        await submissionService.addSubmission(submissionObj);
        res.status(200).json(response);
    } catch (err) {
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.uploadSubmissionFiles = async (req, res) => {
    const response = {
        submission_id: null,
    };
    try {
        const { file } = req;
        await submissionService.uploadSubmission(file);
        res.status(200).json(response);
    } catch (err) {
        res.status(400).json(response);
    }
};
