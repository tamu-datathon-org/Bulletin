const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const stream = require('stream');

const dbUtil = require('../utils/mongoDb');
const logger = require('../utils/logger');
const config = require('../utils/config');
const discord = require('./discordDriver');
const { getAuthId } = require('../controllers/bouncer');

const submissionModel = require('../models/submission');
const likesModel = require('../models/likes');
const commentsModel = require('../models/comments');
const userSubmissionLinksModel = require('../models/userSubmissionLinks');
const challengesModel = require('../models/challenges');

const unlink = promisify(fs.unlink);
// const writeFile = promisify(fs.writeFile);

// uploads submission to database
const addSubmission = async (requestBody, discordObjs) => {
    const challengeIds = await Promise.all((await challengesModel.getChallengesByTitles(requestBody.challenges))
        .map(c => c._id));
    const userSubmissionLinkIds = await Promise.all(discordObjs.map(async (discordObj) => {
        const userSubmissionLinkObj = await userSubmissionLinksModel
            .createUserSubmissionLink(discordObj.userAuthId, '', discordObj.discordTag); // no submissionId yet
        return userSubmissionLinksModel.addUserSubmissionLink(userSubmissionLinkObj);
    }));
    const submissionObj = await submissionModel
        .createSubmission(requestBody.title, userSubmissionLinkIds, challengeIds, requestBody.links, requestBody.tags, requestBody.videoLink);
    const submissionId = await submissionModel.addSubmission(submissionObj);
    await userSubmissionLinksModel.updateUserSubmissionLinkIds(userSubmissionLinkIds, submissionId);
    logger.info(`📌submitted with id ${submissionId}`);
    return submissionId;
};

const removeTmpFile = async (filepath) => {
    try {
        if (!filepath) {
            throw new Error('📌Error deleting temp file:: no file path provided');
        }
        if (path.dirname(filepath) === config.tmp_download_path) await unlink(filepath);
    } catch (err) {
        if (err.code !== 'ENOENT') logger.info(err.message);
    }
};

const getSubmissionsDataWithFilters = async (filters) => {
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

const getAllSubmissionsData = async () => {
    return submissionModel.getSubmissionsDump();
};

const getSubmission = async (submissionId) => {
    return submissionModel.getSubmission(submissionId);
};

const deleteSubmission = async (submissionId) => {
    const doc = await submissionModel.deleteSubmission(submissionId);
    if (doc.userSubmissionLinkIds) await userSubmissionLinksModel.removeUserSubmissionLinks(doc.userSubmissionLinkIds);
    if (doc.sourceCodeId) await dbUtil.removeFile(doc.sourceCodeId);
    if (doc.iconId) await dbUtil.removeFile(doc.iconId);
    if (doc.photosId) await dbUtil.removeFile(doc.photosId);
    if (doc.markdownId) await dbUtil.removeFile(doc.markdownId);
    if (doc.likeIds) await likesModel.removeLikes(doc.likeIds);
    if (doc.commentIds) await commentsModel.removeComments(doc.commentIds);
};

const updateSubmission = async (submissionId, requestBody) => {
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

const addLike = async (userAuthId, submissionId) => {
    const likeObj = await likesModel.createLike(userAuthId, submissionId);
    const likeId = await likesModel.addLike(likeObj);
    return submissionModel.addLike(submissionId, likeId);
};

const addComment = async (userAuthId, submissionId, message) => {
    const commentObj = await commentsModel.createComment(userAuthId, submissionId, message);
    const commentId = await commentsModel.addComment(commentObj);
    return submissionModel.addComment(submissionId, commentId);
};

const removeLike = async (userAuthId, submissionId) => {
    const { _id } = await likesModel.getLikeBySubmissionIdAndUserAuthId(submissionId, userAuthId);
    await likesModel.removeLike(_id);
    return submissionModel.removeLike(submissionId, _id);
};

const removeComment = async (userAuthId, submissionId, commentTime) => {
    const { _id } = await commentsModel.getCommentBySubmissionIdAndUserAuthIdAndTime(submissionId, userAuthId, commentTime);
    await commentsModel.removeComment(_id);
    return submissionModel.removeComment(submissionId, _id);
};

const uploadSubmissionFile = async (buffer, submissionId, filename, type) => {
    if (!(await submissionModel.getSubmission(submissionId))) {
        throw new Error(`📌Error uploading file:: submission with submissionId ${submissionId} does not exist`);
    }
    await dbUtil.uploadFile(buffer, submissionId, filename, type);
    logger.info('📌uploaded to GridFS');
};

const downloadSubmissionFile = async (submissionId, type) => {
    if (!(await submissionModel.getSubmission(submissionId))) {
        throw new Error(`📌Error downloading file:: submission with submissionId ${submissionId} does not exist`);
    }
    const bufferObj = await dbUtil.downloadFileBuffer(submissionId, type);
    logger.info('📌downloaded from GridFS');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(bufferObj.buffer);
    return { stream: bufferStream, filename: bufferObj.filename };
    // const newFilePath = path.join(config.tmp_download_path, `${Date.now()}_${bufferObj.filename}`);
    // await writeFile(newFilePath, bufferObj.buffer);
    // return { filepath: newFilePath, filename: bufferObj.filename };
};

const getSubmissionInstructions = async () => {
    return submissionModel.submissionInstructions || { error: 'instructions not available' };
};

const getSubmissionFileInstructions = async () => {
    return submissionModel.submissionFileInstructions || { error: 'instructions not available' };
};

const validateSubmitterAndGetDiscordTags = async (token, userTags) => {
    const submittedUserAuthId = await getAuthId(token);
    const discordObjs = await discord.getUserAuthIdsFromTags(userTags);
    let includesSubmitter = false;
    discordObjs.forEach((discordObj) => {
        if (discordObj.userAuthId === submittedUserAuthId) includesSubmitter = true;
    });
    if (includesSubmitter) return discordObjs;
    throw new Error('📌you cannot submit a project that does not include yourself');
};

const validateSubmitterForUpdate = async (token, submissionId) => {
    const submittedUserAuthId = await getAuthId(token);
    const doc = await userSubmissionLinksModel.getUserSubmissionLinkBySubmissionIdAndUserAuthId(
        submittedUserAuthId,
        submissionId,
    );
    if (!doc) throw new Error('you are not authorized to update this project');
    return doc.userAuthId;
};

module.exports = {
    addSubmission,
    deleteSubmission,
    updateSubmission,
    uploadSubmissionFile,
    downloadSubmissionFile,
    addLike,
    removeLike,
    addComment,
    removeComment,
    removeTmpFile,
    getAllSubmissionsData,
    getSubmission,
    getSubmissionsDataWithFilters,
    getSubmissionInstructions,
    getSubmissionFileInstructions,
    validateSubmitterAndGetDiscordTags,
    validateSubmitterForUpdate,
};
