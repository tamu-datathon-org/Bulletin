const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const dbUtil = require('../utils/mongoDb');
const logger = require('../utils/logger');
const config = require('../utils/config');

const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

// upload compressed file to firebase
exports.uploadSubmissionFile = async (buffer, entryID, filename) => {
    if (!(await dbUtil.submissionExists(entryID))) {
        throw new Error(`submission with entyID ${entryID} does not exist`);
    }
    await dbUtil.uploadFile(buffer, entryID, filename);
    logger.info('📌uploaded to GridFS');
};

exports.downloadSubmissionFile = async (entryID, filename) => {
    const buffer = await dbUtil.getFileBuffer(entryID);
    logger.info('📌downloaded from GridFS');
    const newFilePath = path.join(config.tmp_download_path, `${Date.now()}_${filename}`);
    await writeFile(newFilePath, buffer);
    return newFilePath;
};

// uploads submission to database
exports.addSubmission = async (submissionObj) => {
    const id = await dbUtil.addSubmission(submissionObj);
    logger.info(`📌submitted with id ${id}`);
    return id;
};

exports.removeTmpFile = async (filepath) => {
    try {
        if (!filepath) {
            throw new Error('no file path provided');
        }
        if (path.dirname(filepath) === config.tmp_download_path) await unlink(filepath);
    } catch (err) {
        if (err.code !== 'ENOENT') logger.info(err.message);
    }
};

exports.getSubmissionsDataWithFilters = async (filters) => {
    const { entryID } = filters;
    const { names } = filters;
    const { titles } = filters;
    const { timespan } = filters;
    const { links } = filters;
    const { challenges } = filters;
    const { tags } = filters;
    const { numLikes } = filters;
    const { numComments } = filters;

    const finalFilters = {};
    if (entryID) {
        if ((entryID?.length ?? 0) !== config.database.entryID_length) throw new Error('Error invalid entryID');
        return dbUtil.getSubmissionByEntryID(entryID);
    }
    if (names) {
        if (!Array.isArray(names)) throw new Error('names must be a list');
        finalFilters.names = names;
    }
    if (titles) {
        if (!Array.isArray(titles)) throw new Error('titles must be a list');
        finalFilters.titles = titles;
    }
    if (timespan) {
        if (!Array.isArray(timespan)) throw new Error('timespan must be a list eg. [time1, time2]');
        if (timespan.length !== 2) throw new Error('timespan must have two elements eg. [time1, time2]');
        finalFilters.timespan = [(new Date(timespan[0])).toISOString(), (new Date(timespan[1])).toISOString()];
    }
    if (links) {
        if (!Array.isArray(links)) throw new Error('links must be a list eg. [link1, link2]');
        finalFilters.links = links;
    }
    if (challenges) {
        if (!Array.isArray(challenges)) throw new Error('challenges must be a list eg. [challenge1, challeng2]');
        finalFilters.challenges = challenges;
    }
    if (tags) {
        if (!Array.isArray(tags)) throw new Error('tags must be a list eg. [tag1, tag2]');
        finalFilters.tags = tags;
    }
    if (numLikes) {
        let likesNum = numLikes;
        if (typeof numLikes === 'string') likesNum = parseInt(numLikes);
        if (!Number.isInteger(likesNum)) throw new Error('likes must be an integer eg. 5 or "5"');
        finalFilters.numLikes = likesNum;
    }
    if (numComments) {
        let commentsNum = numComments;
        if (typeof numComments === 'string') commentsNum = parseInt(numComments);
        if (!Number.isInteger(commentsNum)) throw new Error('numComments must be an integer eg. 5 or "5"');
        finalFilters.numComments = commentsNum;
    }
    return dbUtil.getSubmissionsByFilters(finalFilters);
};

exports.getAllSubmissionsData = async () => {
    return dbUtil.getAllSubmissionsData();
};

exports.deleteSubmission = async (entryID) => {
    return dbUtil.deleteSubmission(entryID);
};

exports.updateSubmissionData = async (entryID, title, names, links, tags, challenges) => {
    const setOptions = {};
    if (title) setOptions.title = title;
    if (names) {
        if ((names?.length ?? 0) === 0) {
            throw new Error('📌Submsision update names error:: minimum number of names is 0');
        } 
        setOptions.names = names;
    }
    if (links) {
        if (!Array.isArray(links)) throw new Error('📌Submsision update names error:: links must be a list');
        setOptions.links = links;
    }
    if (tags) {
        if (!Array.isArray(tags)) throw new Error('📌Submsision update names error:: tags must be a list');
        setOptions.tags = tags;
    }
    if (challenges) {
        if (!Array.isArray(links)) throw new Error('📌Submsision update names error:: challenges must be a list');
        setOptions.challenges = challenges;
    }
    return dbUtil.updateSubmissionData(entryID, setOptions);
};

exports.addLike = async (username, entryID) => {
    return dbUtil.addLike(username, entryID);
};

exports.addComment = async (username, entryID, message, comment_time) => {
    return dbUtil.addComment(username, entryID, message, comment_time);
};

exports.removeLike = async (username, entryID) => {
    return dbUtil.removeLike(username, entryID);
};

exports.removeComment = async (username, entryID, comment_time) => {
    return dbUtil.removeComment(username, entryID, comment_time);
};

exports.uploadSubmissionPhotos = async (buffer, entryID, filename) => {
    if (!(await dbUtil.submissionExists(entryID))) {
        throw new Error(`submission with entyID ${entryID} does not exist`);
    }
    await dbUtil.uploadSubmissionPhotos(buffer, entryID, filename);
    logger.info('📌uploaded to GridFS');
};

exports.uploadSubmissionIcon = async (buffer, entryID, filename) => {
    if (!(await dbUtil.submissionExists(entryID))) {
        throw new Error(`submission with entyID ${entryID} does not exist`);
    }
    await dbUtil.uploadSubmissionIcon(buffer, entryID, filename);
    logger.info('📌uploaded to GridFS');
};
