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
const addSubmission = async (requestBody, eventId, submissionId, token) => {

    // get discord Objects from harmonia
    // const discordObjs = [{discordInfo:'dan#22', discordTag:'dan#22', userAuthId: "5efc0b99a37c4300032acbce"}];
    const discordObjs = await Promise.all(requestBody.discordTags.map(async (discordTag) => {
        const discordUser = await bouncerController.getDiscordUser(discordTag, null, token);
        if (discordUser.userAuthId) {
            return discordUser;
        }
        throw new Error(`📌discordTag ${discordTag} does not exist`);
    }));
    if (discordObjs.length === 0)
        throw new Error('📌no provided discordTag are in our server');
    logger.info(JSON.stringify(discordObjs));

    // get valid challenge id
    if (requestBody.challengeId) {
        const challengeObj = await challengesModel.getChallenge(eventId, requestBody.challengeId);
        if (!challengeObj)
            throw new Error(`📌challenge ${requestBody.challengeId} does not exist`);
    }
    
    // get/create the user submission links
    const userSubmissionLinkIds = await Promise.all(discordObjs.map(async (discordObj) => {
        const userSubmissionLink = await userSubmissionLinksModel.getUserSubmissionLinkBySubmissionIdAndUserAuthId(
            discordObj.userAuthId,
            submissionId, 
        );
        const userSubmissionLinkObj = await userSubmissionLinksModel
            .createUserSubmissionLink(discordObj.userAuthId, submissionId, discordObj.discordInfo); // no submissionId yet
        logger.info(`user submission link obj ${JSON.stringify(userSubmissionLinkObj)}`);
        logger.info(`usere submission link id ${userSubmissionLink?._id}`);
        return userSubmissionLinksModel.addUserSubmissionLink(userSubmissionLinkObj, userSubmissionLink?._id) || userSubmissionLink._id;
    }));

    // create the submission
    const discordTags = discordObjs.map((d) => d.discordInfo);
    const submissionObj = await submissionModel
        .createSubmission(eventId, requestBody.name, discordTags, userSubmissionLinkIds, requestBody.challengeId,
            requestBody.links, requestBody.tags, requestBody.videoLink, requestBody.answer1,
            requestBody.answer2, requestBody.answer3, requestBody.answer4, requestBody.answer5);
    const id = await submissionModel.addSubmission(submissionObj, submissionId) || submissionId;
    logger.info(`submission id ${id}`);
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

const addAccoladeToSubmission = async (submissionId, accoladeId) => {
    return submissionModel.addSubmissionAccoladeId(submissionId, accoladeId);
};

const removeAccoladeToSubmission = async (submissionId, accoladeId) => {
    return submissionModel.removeSubmissionAccoladeId(submissionId, accoladeId);
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

const uploadSubmissionPhoto = async (eventId, submissionId, originalname, index, buffer) => {
    const submissionObj = await submissionModel.getSubmission(eventId, submissionId);
    if (!submissionObj) throw new Error(`📌submission ${submissionId} does not exist`);
    if (index >= config.submission_constraints.max_submission_photos)
        throw new Error(`📌cannot upload photo at that index, max photos is ${config.submission_constraints.max_submission_photos}`);
    if (submissionObj.photos) {
        if (submissionObj.photos[index]) {
            logger.info(`previous photo existed with index ${index} so we're deleting it...`);
            logger.info(submissionObj.photos[index][0]);
            await removeFileByKey(submissionObj.photos[index][0]);
        }
    }
    logger.info('uploading photo to s3...');
    const data = await submissionS3.uploadFile(`${originalname}`, buffer);
    logger.info('adding key and url to submission entry...');
    await submissionModel.editSubmissionPhoto(eventId, submissionId, index, data);
    logger.info('done');
    return data.Location;
};

const uploadSubmissionSourceCode = async (eventId, submissionId, originalname, buffer) => {
    const submissionObj = await submissionModel.getSubmission(eventId, submissionId);
    if (!submissionObj) throw new Error(`📌submission ${submissionId} does not exist`);
    if ((submissionObj?.sourceCode?.length ?? 0) !== 0) {
        logger.info('previous sourceCode existed so we\'re deleting it...');
        logger.info(submissionObj.sourceCode[0]);
        await removeFileByKey(submissionObj.sourceCode[0]);
    }
    logger.info('uploading sourceCode to s3...');
    const data = await submissionS3.uploadFile(`${originalname}`, buffer);
    logger.info('adding key and url to submission entry...');
    await submissionModel.editSubmissionSourceCode(eventId, submissionId, data);
    logger.info('done');
    return data.Location;
};

const uploadSubmissionIcon = async (eventId, submissionId, originalname, buffer) => {
    const submissionObj = await submissionModel.getSubmission(eventId, submissionId);
    if (!submissionObj) throw new Error(`📌submission ${submissionId} does not exist`);
    if ((submissionObj?.icon?.length ?? 0) !== 0) {
        logger.info('previous icon existed so we\'re deleting it...');
        logger.info(submissionObj.icon[0]);
        await removeFileByKey(submissionObj.icon[0]);
    }
    logger.info('uploading icon to s3...');
    const data = await submissionS3.uploadFile(`${originalname}`, buffer);
    logger.info('adding key and url to submission entry...');
    await submissionModel.editSubmissionIcon(eventId, submissionId, data);
    logger.info('done');
    return data.Location;
};

const uploadSubmissionMarkdown = async (eventId, submissionId, originalname, buffer) => {
    const submissionObj = await submissionModel.getSubmission(eventId, submissionId);
    if (!submissionObj) throw new Error(`📌submission ${submissionId} does not exist`);
    if ((submissionObj?.markdown?.length ?? 0) !== 0) {
        logger.info('previous markdown existed so we\'re deleting it...');
        logger.info(submissionObj.markdown[0]);
        await removeFileByKey(submissionObj.markdown[0]);
    }
    logger.info('uploading markdown to s3...');
    const data = await submissionS3.uploadFile(`${originalname}`, buffer);
    logger.info('adding key and url to submission entry...');
    await submissionModel.editSubmissionMarkdown(eventId, submissionId, data);
    logger.info('done');
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
    if (submissionObj[type]) return getFileByKey(submissionObj[type]);
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
    addAccoladeToSubmission,
    removeAccoladeToSubmission,
    toggleLike,
    addComment,
    removeComment,
    getSubmission,
    getSubmissions,
    getSubmissionsByUserAuthId,
    getSubmissionFile,
    uploadSubmissionPhoto,
    uploadSubmissionSourceCode,
    uploadSubmissionMarkdown,
    uploadSubmissionIcon,
    getUserSubmissionLinkBySubmissionIdAndUserAuthId,
};
