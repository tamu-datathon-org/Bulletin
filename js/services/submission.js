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
const addSubmission = async (requestBody, eventId, submissionId = null) => {

    // get discord Objects from harmonia
    //const discordObjs = [{discordInfo:'dan#22', discordTag:'dan#22', userAuthId: "5efc0b99a37c4300032acbce"}];
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
    await Promise.all(requestBody.challengeIds.map(async (challengeId) => {
        const challengeObj = await challengesModel.getChallenge(eventId, challengeId);
        if (challengeObj) {
            challengeIds.push(challengeObj._id);
        } else {
            throw new Error(`📌challenge ${challengeId} does not exist`);
        }
    }));
    
    // get/create the user submission links
    const userSubmissionLinkIds = await Promise.all(discordObjs.map(async (discordObj) => {
        const userSubmissionLink = await userSubmissionLinksModel.getUserSubmissionLinkBySubmissionIdAndUserAuthId(
            discordObj.userAuthId,
            submissionId, 
        );
        const userSubmissionLinkObj = await userSubmissionLinksModel
            .createUserSubmissionLink(discordObj.userAuthId, submissionId, discordObj.discordTag); // no submissionId yet
        console.log('obj', userSubmissionLinkObj)
        console.log('id', userSubmissionLink?._id)
        return userSubmissionLinksModel.addUserSubmissionLink(userSubmissionLinkObj, userSubmissionLink?._id) || userSubmissionLink._id;
    }));

    // create the submission
    const discordTags = discordObjs.map((d) => d.discordInfo);
    const submissionObj = await submissionModel
        .createSubmission(eventId, requestBody.name, discordTags, userSubmissionLinkIds, challengeIds,
            requestBody.links, requestBody.tags, requestBody.videoLink, requestBody.answer1,
            requestBody.answer2, requestBody.answer3, requestBody.answer4, requestBody.answer5);
    const id = await submissionModel.addSubmission(submissionObj, submissionId) || submissionId;
    console.log('added id', id)
    await userSubmissionLinksModel.addSubmissionIdToLinks(userSubmissionLinkIds, id);
    await eventsModel.addEventSubmissionId(eventId, id);
    logger.info(`📌submitted with submissionId ${id}`);
    return id;
};

const removeSubmission = async (eventId, submissionId) => {
    const doc = await submissionModel.removeSubmission(eventId, submissionId);
    logger.info(JSON.stringify(doc));
    if (!doc) throw new Error(`📌no submission with submissionId ${submissionId}`);
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
    return doc._id;
};

// ======================================================== //
// =========== 📌📌📌 Likes Section 📌📌📌 ============= //
// ======================================================== //

const toggleLike = async (userAuthId, submissionId) => {
    const dupLikeObj = await likesModel.getLikeBySubmissionIdAndUserAuthId(submissionId, userAuthId);
    if (dupLikeObj) {
        const removedLikeObj = likesModel.removeLike(dupLikeObj._id);
        await submissionModel.removeLike(submissionId, dupLikeObj._id);
        return removedLikeObj;
    }
    const likeObj = await likesModel.createLike(userAuthId, submissionId);
    const likeId = await likesModel.addLike(likeObj);
    await submissionModel.addLike(submissionId, likeId);
    return likeId;
};

// ======================================================== //
// ========== 📌📌📌 Comments Section 📌📌📌 =========== //
// ======================================================== //

const addComment = async (userAuthId, submissionId, message) => {
    const commentObj = await commentsModel.createComment(userAuthId, submissionId, message);
    const commentId = await commentsModel.addComment(commentObj);
    await submissionModel.addComment(submissionId, commentId);
    return commentId;
};

const removeComment = async (userAuthId, submissionId, commentId) => {
    const comment = await commentsModel.removeComment(userAuthId, commentId);
    if (comment)
        await submissionModel.removeComment(submissionId, commentId);
    return comment._id;
};

// ======================================================== //
// === 📌📌📌 user submission links section 📌📌📌====== //
// ======================================================== //

const getUserSubmissionLinkBySubmissionIdAndUserAuthId = async (userAuthId, submissionId) => {
    return userSubmissionLinksModel.getUserSubmissionLinkBySubmissionIdAndUserAuthId(userAuthId, submissionId);
};

// ======================================================== //
// ====== 📌📌📌 Submission Files Section 📌📌📌 ======= //
// ======================================================== //

const uploadSubmissionFile = async (eventId, submissionId, filename, type, buffer) => {
    const submissionObj = await submissionModel.getSubmission(eventId, submissionId);
    if (!submissionObj) throw new Error(`📌submission ${submissionId} does not exist`);
    if (!config.submission_constraints.submission_upload_types[type]) {
        throw new Error(`📌upload type ${type} is invalid`);
    }
    if (submissionObj[`${type}Key`]) {
        await removeFileByKey(submissionObj[`${type}Key`]);
    }
    const data = await submissionS3.uploadFile(`${filename}${path.extname(filename)}`, buffer);
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
    throw new Error(`📌submissionId ${submissionId} does not have uploaded file(s) of ${type}`);
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
    toggleLike,
    addComment,
    removeComment,
    getSubmission,
    getSubmissions,
    getSubmissionsByUserAuthId,
    getSubmissionFile,
    uploadSubmissionFile,
    getUserSubmissionLinkBySubmissionIdAndUserAuthId,
};
