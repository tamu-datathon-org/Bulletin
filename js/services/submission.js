const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const dbUtil = require('../utils/mongoDb');
const logger = require('../utils/logger');
const config = require('../utils/config');
const discord = require('./discordDriver');

const submissionModel = require('../models/submission');
const likesModel = require('../models/likes');
const commentsModel = require('../models/comments');
const userSubmissionLinksModel = require('../models/userSubmissionLinks');
const challengesModel = require('../models/challenges');

const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

// upload compressed file to firebase
exports.uploadSubmissionFile = async (buffer, submissionId, filename, type) => {
    if (!(await submissionModel.getSubmission(submissionId))) {
        throw new Error(`submission with submissionId ${submissionId} does not exist`);
    }
    await dbUtil.uploadFile(buffer, submissionId, filename, type);
    logger.info('📌uploaded to GridFS');
};

exports.downloadSubmissionFile = async (submissionId, type) => {
    if (!(await submissionModel.getSubmission(submissionId))) {
        throw new Error(`submission with submissionId ${submissionId} does not exist`);
    }
    const file = await dbUtil.downloadFileBuffer(submissionId, type);
    logger.info('📌downloaded from GridFS');
    const newFilePath = path.join(config.tmp_download_path, `${Date.now()}_${file.filename}`);
    await writeFile(newFilePath, file.buffer);
    return newFilePath;
};

// uploads submission to database
exports.addSubmission = async (requestBody) => {
    const challengeIds = await challengesModel.getChallengesByTitles(requestBody.challenges);
    const userObjArray = await discord.getUsernameFromAuthIds(requestBody.users);
    const userSubmissionLinkIds = await Promise.all(userObjArray.map(async (nameObj) => {
        try {
            const userSubmissionLinkObj = await userSubmissionLinksModel
                .createUserSubmissionLink(userObjArray.userAuthIds, '', nameObj.discordName);
            return userSubmissionLinksModel.addUserSubmissionLink(userSubmissionLinkObj);
        } catch (err) {
            throw new Error(`📌Error updating getting discord username of ${nameObj.userAuthIds}`);
        }
    }));
    const submissionObj = await submissionModel
        .createSubmission(requestBody.title, userSubmissionLinkIds, challengeIds, requestBody.links, requestBody.tags);
    const submissionId = await submissionModel.addSubmission(submissionObj);
    const setOptions = { userSubmissionLinks: userSubmissionLinkIds };
    await userSubmissionLinksModel.updateUserSubmissionLink(setOptions);
    logger.info(`📌submitted with id ${submissionId}`);
    return submissionId;
};

exports.removeTmpFile = async (filepath) => {
    try {
        if (!filepath) {
            throw new Error('📌Error deleting temp file:: no file path provided');
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
    return submissionModel.getSubmissionsDump();
};

exports.getSubmissionData = async (submissionId) => {
    return submissionModel.getSubmission(submissionId);
};

exports.deleteSubmission = async (submissionId) => {
    const doc = await submissionModel.deleteSubmission(submissionId);
    if (doc.userSubmissionLinkIds) await userSubmissionLinksModel.removeUserSubmissionLinks(doc.userSubmissionLinkIds);
    if (doc.sourceCodeId) await dbUtil.removeFile(doc.sourceCodeId);
    if (doc.iconId) await dbUtil.removeFile(doc.iconId);
    if (doc.photosId) await dbUtil.removeFile(doc.photosId);
    if (doc.markdownId) await dbUtil.removeFile(doc.markdownId);
    if (doc.likeIds) await likesModel.removeLikes(doc.likeIds);
    if (doc.commentIds) await commentsModel.removeComments(doc.commentIds);
};

exports.updateSubmission = async (submissionId, requestBody) => {
    const submissionSetOptions = {};
    const userAuthLinksSetOptions = {};
    if (requestBody.title) submissionSetOptions.title = requestBody.title;
    if (requestBody.userAuthIds) userAuthLinksSetOptions.userAuthIds = requestBody.userAuthIds;
    if (requestBody.links) submissionSetOptions.links = requestBody.links;
    if (requestBody.tags) submissionSetOptions.tags = requestBody.tags;
    if (requestBody.challenges) submissionSetOptions.challenges = requestBody.challenges;
    await submissionModel.updateSubmission(submissionId, submissionSetOptions);
    await userSubmissionLinksModel.updateUserSubmissionLink(submissionId, userAuthLinksSetOptions);
};

exports.addLike = async (userAuthId, submissionId) => {
    const likeObj = await likesModel.createLike(userAuthId, submissionId);
    const likeId = await likesModel.addLike(likeObj);
    return submissionModel.addLike(submissionId, likeId);
};

exports.addComment = async (userAuthId, submissionId, message) => {
    const commentObj = await commentsModel.createComment(userAuthId, submissionId, message);
    const commentId = await commentsModel.addComment(commentObj);
    return submissionModel.addComment(submissionId, commentId);
};

exports.removeLike = async (userAuthId, submissionId) => {
    const { _id } = await likesModel.getLikeBySubmissionIdAndUserAuthId(submissionId, userAuthId);
    await likesModel.removeLike(_id);
    return submissionModel.removeLike(submissionId, _id);
};

exports.removeComment = async (userAuthId, submissionId, commentTime) => {
    const { _id } = await commentsModel.getCommentBySubmissionIdAndUserAuthIdAndTime(submissionId, userAuthId, commentTime);
    await commentsModel.removeComment(_id);
    return submissionModel.removeComment(submissionId, _id);
};

exports.uploadSubmissionFile = async (buffer, submissionId, filename, type) => {
    if (!(await submissionModel.getSubmission(submissionId))) {
        throw new Error(`📌Error uploading file:: submission with submissionId ${submissionId} does not exist`);
    }
    await dbUtil.uploadFile(buffer, submissionId, filename, type);
    logger.info('📌uploaded to GridFS');
};

exports.downloadSubmissionFile = async (submissionId, type) => {
    if (!(await submissionModel.getSubmission(submissionId))) {
        throw new Error(`📌Error downloading file:: submission with submissionId ${submissionId} does not exist`);
    }
    const bufferObj = await dbUtil.downloadFileBuffer(submissionId, type);
    logger.info('📌downloaded from GridFS');
    const newFilePath = path.join(config.tmp_download_path, `${Date.now()}_${bufferObj.filename}`);
    await writeFile(newFilePath, bufferObj.buffer);
    return { filepath: newFilePath, filename: bufferObj.filename };
};
