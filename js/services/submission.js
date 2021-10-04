const path = require('path');
const logger = require('../utils/logger');
const config = require('../utils/config');

const submissionModel = require('../models/submission');
const likesModel = require('../models/likes');
const commentsModel = require('../models/comments');
const userSubmissionLinksModel = require('../models/userSubmissionLinks');
const challengesModel = require('../models/challenges');
const eventsModel = require('../models/events');
const submissionS3 = require('../utils/submissionsS3');
const bouncerController = require('../middleware/bouncer');

// ======================================================== //
// ========= 📌📌📌 Submission Getters 📌📌📌 ========== //
// ======================================================== //

/**
 * @function getSubmissions
 * @param {String} eventId 
 * @returns {Array<Object>} array of submission docs
 */
const getSubmissions = async (eventId) => {
    return submissionModel.getAllSubmissionsByEventId(eventId);
};

/**
 * @function getSubmission
 * @param {String} eventId 
 * @param {String} submissionId 
 * @returns {Object} submission object
 */
const getSubmission = async (eventId, submissionId) => {
    return submissionModel.getSubmission(eventId, submissionId);
};

const getSubmissionsByUserAuthId = async (eventId, userAuthId) => {
    logger.info(userAuthId);
    const res = await userSubmissionLinksModel.getUserSubmissionLinksByUserAuthId(userAuthId);
    const result = await Promise.all(res.map(async (link) => {
        logger.info(link.submissionId);
        return submissionModel.getSubmission(eventId, link.submissionId);
    }));
    return result;
};

// ======================================================== //
// ======== 📌📌📌 Submission Modifiers 📌📌📌 ========= //
// ======================================================== //

/**
 * @function addSubmission
 * @description wholistic adding or updating a submission
 * @param {Object} requestBody 
 * @param {String} eventId 
 * @param {String} userAuthId
 * @param {String} submissionId 
 * @returns {String} submission id
 */
const addSubmission = async (requestBody, eventId, userAuthId, submissionId = null) => {
    // check if allowed to edit
    const userSubmissionLinkId = await userSubmissionLinksModel.getUserSubmissionLinkBySubmissionIdAndUserAuthId(
        userAuthId,
        submissionId, 
    );
    if (submissionId && !userSubmissionLinkId) throw new Error('📌you are not authorized to edit this project');

    // get discord Objects from harmonia
    const discordObjs = [];
    await Promise.all(requestBody.discordTags.map(async (discordTag) => {
        const discordUser = await bouncerController.getDiscordUser(discordTag, null);
        if (discordUser) {
            discordObjs.push(discordUser);
            return;
        }
        throw new Error(`📌discordTag ${discordTag} does not exist`);
    }));

    // get valid challenge ids
    const challengeIds = [];
    await Promise.all(requestBody.challenges.map(async (challengeId) => {
        const challengeObj = await challengesModel.getChallenge(eventId, challengeId);
        if(challengeObj) challengeIds.push(challengeObj._id);
        throw new Error(`📌challenge ${challengeId} does not exist`);
    }));

    // get/create the user submission links
    const userSubmissionLinkIds = await Promise.all(discordObjs.map(async (discordObj) => {
        const userSubmissionLinkId = await userSubmissionLinksModel.getUserSubmissionLinkBySubmissionIdAndUserAuthId(
            discordObj.userAuthId,
            submissionId, 
        );
        const userSubmissionLinkObj = await userSubmissionLinksModel
            .createUserSubmissionLink(discordObj.userAuthId, null, discordObj.discordTag); // no submissionId yet
        return userSubmissionLinksModel.addUserSubmissionLink(userSubmissionLinkObj, userSubmissionLinkId) || userSubmissionLinkId;
    }));

    // create the submission
    const discordTags = discordObjs.map((d) => d.discordInfo);
    const submissionObj = await submissionModel
        .createSubmission(eventId, requestBody.name, discordTags, userSubmissionLinkIds, challengeIds,
            requestBody.links, requestBody.tags, requestBody.videoLink);
    const id = await submissionModel.addSubmission(submissionObj, submissionId) || submissionId;
    await userSubmissionLinksModel.addSubmissionIdToLinks(userSubmissionLinkIds, id);
    await eventsModel.addEventSubmissionId(eventId, id);
    logger.info(`📌submitted with submissionId ${id}`);
    return id;
};

const removeSubmission = async (eventId, submissionId) => {
    const doc = await submissionModel.removeSubmission(eventId, submissionId);
    logger.info(JSON.stringify(doc));
    await eventsModel.removeEventSubmissionId(eventId, submissionId);
    await commentsModel.removeAllCommentsOfSubmissionId(submissionId);
    await likesModel.removeAllLikesOfSubmissionId(submissionId);
    if (doc.userSubmissionLinkIds) await userSubmissionLinksModel.removeUserSubmissionLinks(doc.userSubmissionLinkIds);
    if (doc.likeIds) await likesModel.removeLikes(doc.likeIds);
    if (doc.commentIds) await commentsModel.removeComments(doc.commentIds);
    if (doc.iconKey) await removeFileByKey(doc.iconKey);
    if (doc.photosKey) await removeFileByKey(doc.photosKey);
    if (doc.markdownKey) await removeFileByKey(doc.markdownKey);
    if (doc.sourceCodeKey) await removeFileByKey(doc.sourceCodeKey);
    return doc;
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

// ======================================================== //
// =========== 📌📌📌 Likes Section 📌📌📌 ============= //
// ======================================================== //

const addLike = async (userAuthId, submissionId) => {
    const likeObj = await likesModel.createLike(userAuthId, submissionId);
    const likeId = await likesModel.addLike(likeObj);
    return submissionModel.addLike(submissionId, likeId);
};

// ======================================================== //
// ========== 📌📌📌 Comments Section 📌📌📌 =========== //
// ======================================================== //

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

// ======================================================== //
// ====== 📌📌📌 Submission Files Section 📌📌📌 ======= //
// ======================================================== //

const uploadSubmissionFile = async (eventId, submissionId, filename, type, buffer) => {
    const submissionObj = await submissionModel.getChallenge(eventId, submissionId);
    if (!submissionObj) throw new Error(`📌submission ${submissionId} does not exist`);
    if (!config.submission_constraints.submission_upload_types[type]) {
        throw new Error(`📌type ${type} is invalid`);
    }
    if (submissionObj[`${type}Key`]) {
        await removeFileByKey(submissionObj[`${type}Key`]);
    }
    const data = await submissionS3.uploadFile(`${submissionObj[`${type}Key`]}${path.extname(filename)}`, buffer);
    await submissionModel.editSubmissionFile(eventId, submissionId, type, data.Location, data.Key);
    return data.Location;
};

/**
 * @function getSubmissionFile
 * @param {String} eventId 
 * @param {String} submissionId 
 * @param {String} type [markdown, icon, photos, sourceCode]
 * @returns {Buffer} file buffer
 */
const getSubmissionFile = async (eventId, submissionId, type) => {
    const submissionObj = await submissionModel.getSubmission(eventId, submissionId);
    if (!submissionObj) throw new Error(`📌submission ${submissionId} does not exist`);
    if (!config.submission_constraints.submission_upload_types[type]) {
        throw new Error(`📌type ${type} is invalid`);
    }
    if (submissionObj[`${type}Key`]) return getFileByKey(submissionObj[`${type}Key`]);
    throw new Error(`📌submissionId ${submissionId} does not have an assigned ${type}`);
};

const getFileByKey = async (fileKey) => {
    return submissionS3.getFileStream(fileKey);
};

const removeFileByKey = async (fileKey) => {
    return submissionS3.removeFile(fileKey);
};

module.exports = {
    addSubmission,
    removeSubmission,
    updateSubmission,
    addLike,
    removeLike,
    addComment,
    removeComment,
    getSubmission,
    getSubmissions,
    getSubmissionsByUserAuthId,
    //getSubmissionByTags,
    getSubmissionFile,
    uploadSubmissionFile,
};
