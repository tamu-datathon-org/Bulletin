const dbUtil = require('../utils/mongoDb');
const logger = require('../utils/logger');

// uploads submission to database
exports.addSubmission = async (submissionObj) => {
    const id = await dbUtil.addSubmission(submissionObj);
    logger.info(`submitted with id ${id}`);
};

// upload compressed file to firebase
exports.uploadSubmission = async (file) => {

};
