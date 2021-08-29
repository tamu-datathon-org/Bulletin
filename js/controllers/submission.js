const path = require('path');
const submissionService = require('../services/submission');
const config = require('../utils/config');
const logger = require('../utils/logger');
const bouncer = require('./bouncer');

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
            likes: [],
            comments: [],
            iconId: '',
            photosId: '',
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
    const { entryID } = req.params;
    try {
        if (!entryID) {
            throw new Error('entryID is a required parameter');
        }
        response.result = await submissionService.deleteSubmission(entryID);
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

exports.fileDownload = async (req, res) => {
    const { entryID } = req.params;
    try {
        if (!entryID) throw new Error('entryID is a required parameter');
        const submission = (await submissionService.getSubmissionsDataWithFilters({ entryID }))[0];
        if (!submission) throw new Error(`submission with entyID ${entryID} does not exist`);
        const { filename } = submission;
        if (!filename) throw new Error(`submission with entyID ${entryID} does not have an associated file`);
        logger.info(filename);
        const filepath = await submissionService.downloadSubmissionFile(entryID, filename);
        res.status(200).download(filepath, filename, async (error) => {
            if (error) throw new Error('unable to send file');
            await submissionService.removeTmpFile(filepath);
        });
    } catch (err) {
        logger.info(err);
        const error = err.message;
        res.status(400).json({ error });
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
        const { entryID } = req.params;
        if (Object.keys(req.body).length === 0) {
            throw new Error('No field(s) to update');
        }
        Object.keys(req.body).forEach((field) => {
            if (!config.submission_constraints.submission_fields.includes(field) && field !== 'submission_time' && field !== 'originalTitle') {
                throw new Error(`${field} is not a valid submission field`);
            }
        });
        if (!entryID) {
            throw new Error('entryID is a required parameter');
        }
        const { names } = req.body;
        const { title } = req.body;
        const { links } = req.body;
        const { tags } = req.body;
        const { challenges } = req.body;
        response.modifiedCount = await submissionService.updateSubmissionData(entryID, title, names, links, tags, challenges);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.addLike = async (req, res) => {
    const response = {};
    const { entryID } = req.params;
    try {
        const username = bouncer.getUsername(req.headers.authorization);
        if (!entryID) {
            throw new Error('entryID is a required parameter');
        }
        response.result = `added ${await submissionService.addLike(username, entryID)} like`;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.addComment = async (req, res) => {
    const response = {};
    const { entryID } = req.params;
    const { message } = req.body; 
    try {
        const username = bouncer.getUsername(req.headers.authorization);
        if (!entryID) {
            throw new Error('entryID is a required parameter');
        }
        if (!message) {
            throw new Error('message is a required field');
        }
        const comment_time = (new Date()).toISOString();
        response.result = `added ${await submissionService.addComment(username, entryID, message, comment_time)} comment`;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.removeLike = async (req, res) => {
    const response = {};
    const { entryID } = req.params;
    try {
        const username = bouncer.getUsername(req.headers.authorization);
        if (!entryID) {
            throw new Error('entryID is a required parameter');
        }
        response.result = `removed ${await submissionService.removeLike(username, entryID)} like`;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.removeComment = async (req, res) => {
    const response = {};
    const { entryID } = req.params;
    const { time } = req.body;
    try {
        const username = bouncer.getUsername(req.headers.authorization);
        if (!entryID) {
            throw new Error('entryID is a required parameter');
        }
        if (!time) {
            throw new Error('time is a required field');
        }
        response.result = `removed ${await submissionService.removeComment(username, entryID, time)} comment`;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.iconUpload = async (req, res) => {
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
        await submissionService.uploadSubmissionIcon(buffer, entryID, originalname);
        response.filename = originalname;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.photosUpload = async (req, res) => {
    const response = {};
    const { buffer } = req.file;
    const { entryID } = req.params;
    const { originalname } = req.file;
    try {
        if (!buffer) throw new Error('no file provided');
        if (!entryID) throw new Error('entryID is a required parameter');
        if ((originalname?.length ?? 0) === 0) {
            throw new Error('no filename provided');
        }
        await submissionService.uploadSubmissionPhotos(buffer, entryID, originalname);
        response.filename = originalname;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.iconDownload = async (req, res) => {
    const response = {};
    const { entryID } = req.params;
    try {
        if (!entryID) throw new Error('entryID is a required parameter');
        const submission = (await submissionService.getSubmissionsDataWithFilters({ entryID }))[0];
        if (!submission) throw new Error(`submission with entyID ${entryID} does not exist`);
        const { iconId } = submission;
        if (!iconId) throw new Error(`submission with entyID ${entryID} does not have associated photos`);
        logger.info(iconId);
        const filepathAndName = await submissionService.downloadSubmissionIcon(entryID, iconId);
        res.status(200).download(filepathAndName[0], filepathAndName[1], async (error) => {
            if (error) throw new Error('unable to send icon');
            await submissionService.removeTmpFile(filepathAndName[0]);
        });
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.photosDownload = async (req, res) => {
    const response = {};
    const { entryID } = req.params;
    try {
        if (!entryID) throw new Error('entryID is a required parameter');
        const submission = (await submissionService.getSubmissionsDataWithFilters({ entryID }))[0];
        if (!submission) throw new Error(`submission with entyID ${entryID} does not exist`);
        const { photosId } = submission;
        if (!photosId) throw new Error(`submission with entyID ${entryID} does not have associated photos`);
        logger.info(photosId);
        const filepathAndName = await submissionService.downloadSubmissionPhotos(entryID, photosId);
        res.status(200).download(filepathAndName[0], filepathAndName[1], async (error) => {
            if (error) throw new Error('unable to send photos');
            await submissionService.removeTmpFile(filepathAndName[0]);
        });
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};
