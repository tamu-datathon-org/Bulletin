const path = require('path');
const submissionService = require('../services/submission');
const config = require('../utils/config');
const logger = require('../utils/logger');

exports.addSubmission = async (req, res) => {
    // define a standard response
    const response = {
        submissionId: null,
        submission_time: null,
    };
    try {
        logger.info(JSON.stringify(req.body));

        Object.keys(req.body).forEach((field) => {
            if (!config.submission_constraints.submission_fields.includes(field)) {
                throw new Error(`${field} is not a valid submission field`);
            }
        });

        // submission time
        const submission_time = (new Date('16 October 2021 13:00 UTC')).toISOString();

        // validate submission time
        const submissionDate = (new Date(submission_time)).getTime();
        const st = (new Date(config.submission_constraints.start_time)).getTime();
        const et = (new Date(config.submission_constraints.end_time)).getTime();
        if (submissionDate <= st || submissionDate > et) {
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

        response.entryID = await submissionService.addSubmission(req.body);
        response.submission_time = submission_time;

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

exports.getSingleSubmission = async (req, res) => {
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

exports.getMultipleSubmissions = async (req, res) => {
    const response = {
        result: [],
    };
    try {
        Object.keys(req.body).forEach((key) => {
            if (!config.submission_constraints.submission_queries.includes(key)) throw new Error(`${key} is not a valid query parameter`);
        });
        response.result.push(...await submissionService.getSubmissionsDataWithFilters(req.body));
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.getAllSubmissions = async (req, res) => {
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

exports.getSubmissionQueryFields = async (req, res) => {
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

exports.getSubmissionUploadFields = async (req, res) => {
    const response = {};
    try {
        response.parameters = config.submission_constraints.submission_fields;
        if (!response.parameters) throw new Error('Submission fields not available');
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.updateSubmission = async (req, res) => {
    const response = {};
    try {
        const { submissionId } = req.params;
        if (Object.keys(req.body).length === 0) {
            throw new Error('No field(s) to update');
        }
        Object.keys(req.body).forEach((field) => {
            if (!config.submission_constraints.submission_fields.includes(field)) {
                throw new Error(`${field} is not a valid submission field`);
            }
        });
        if (!submissionId) {
            throw new Error('entryID is a required parameter');
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
        response.modifiedCount = await submissionService.updateSubmission(submissionId, req.body);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.addLike = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    try {
        const { userAuthId } = 'test';
        if (!submissionId) {
            throw new Error('submissionId is a required parameter');
        }
        response.result = await submissionService.addLike(userAuthId, submissionId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.addComment = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    const { message } = req.body;
    try {
        const userAuthId = 'test';
        if (!submissionId) {
            throw new Error('submissionId is a required parameter');
        }
        if (!message) {
            throw new Error('message is a required field');
        }
        response.result = await submissionService.addComment(userAuthId, submissionId, message);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.removeLike = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    try {
        const userAuthId = 'test';
        if (!submissionId) {
            throw new Error('submissionId is a required parameter');
        }
        response.result = await submissionService.removeLike(userAuthId, submissionId);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.removeComment = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    const { time } = req.body;
    try {
        const userAuthId = 'test';
        if (!submissionId) {
            throw new Error('entryID is a required parameter');
        }
        if (!time) {
            throw new Error('time is a required field');
        }
        response.result = `removed ${await submissionService.removeComment(userAuthId, submissionId, time)} comment`;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.sourceCodeUpload = async (req, res) => {
    const response = {};
    const { buffer } = req.file;
    const { submissionId } = req.params;
    const { originalname } = req.file;
    try {
        if (!buffer) throw new Error('no file provided');
        if (!submissionId) throw new Error('submissionId is a required parameter');
        if ((originalname?.length ?? 0) === 0) {
            throw new Error('no filename provided');
        }
        await submissionService.uploadSubmissionFile(buffer, submissionId, originalname, config.submission_constraints.submission_upload_types.sourceCode);
        response.filename = originalname;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.sourceCodeDownload = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    try {
        if (!submissionId) throw new Error('submissionId is a required parameter');
        const fileObj = await submissionService.downloadSubmissionFile(submissionId, config.submission_constraints.submission_upload_types.sourceCode);
        res.status(200).download(fileObj.filepath, fileObj.filename, async (error) => {
            if (error) throw new Error('unable to send sourceCode');
            await submissionService.removeTmpFile(fileObj.filepath);
        });
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.iconUpload = async (req, res) => {
    const response = {};
    const { buffer } = req.file;
    const { submissionId } = req.params;
    const { originalname } = req.file;
    try {
        if (!buffer) throw new Error('no file provided');
        if (!submissionId) throw new Error('submissionId is a required parameter');
        if ((originalname?.length ?? 0) === 0) {
            throw new Error('no filename provided');
        }
        await submissionService.uploadSubmissionFile(buffer, submissionId, originalname, config.submission_constraints.submission_upload_types.icon);
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
    const { submissionId } = req.params;
    try {
        if (!submissionId) throw new Error('submissionId is a required parameter');
        const fileObj = await submissionService.downloadSubmissionFile(submissionId, config.submission_constraints.submission_upload_types.icon);
        res.status(200).download(fileObj.filepath, fileObj.filename, async (error) => {
            if (error) throw new Error('unable to send icon');
            await submissionService.removeTmpFile(fileObj.filepath);
        });
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.photosUpload = async (req, res) => {
    const response = {};
    const { buffer } = req.file;
    const { submissionId } = req.params;
    const { originalname } = req.file;
    try {
        if (!buffer) throw new Error('no file provided');
        if (!submissionId) throw new Error('submissionId is a required parameter');
        if ((originalname?.length ?? 0) === 0) {
            throw new Error('no filename provided');
        }
        await submissionService.uploadSubmissionFile(buffer, submissionId, originalname, config.submission_constraints.submission_upload_types.photos);
        response.filename = originalname;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.photosDownload = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    try {
        if (!submissionId) throw new Error('submissionId is a required parameter');
        const fileObj = await submissionService.downloadSubmissionFile(submissionId, config.submission_constraints.submission_upload_types.photos);
        res.status(200).download(fileObj.filepath, fileObj.filename, async (error) => {
            if (error) throw new Error('unable to send photos');
            await submissionService.removeTmpFile(fileObj.filepath);
        });
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.markdownUpload = async (req, res) => {
    const response = {};
    const { buffer } = req.file;
    const { submissionId } = req.params;
    const { originalname } = req.file;
    try {
        if (!buffer) throw new Error('no file provided');
        if (!submissionId) throw new Error('submissionId is a required parameter');
        if ((originalname?.length ?? 0) === 0) {
            throw new Error('no filename provided');
        }
        await submissionService.uploadSubmissionFile(buffer, submissionId, originalname, config.submission_constraints.submission_upload_types.markdown);
        response.filename = originalname;
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

exports.markdownDownload = async (req, res) => {
    const response = {};
    const { submissionId } = req.params;
    try {
        if (!submissionId) throw new Error('submissionId is a required parameter');
        const fileObj = await submissionService.downloadSubmissionFile(submissionId, config.submission_constraints.submission_upload_types.markdown);
        res.status(200).download(fileObj.filepath, fileObj.filename, async (error) => {
            if (error) throw new Error('unable to send markdown');
            await submissionService.removeTmpFile(fileObj.filepath);
        });
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};
