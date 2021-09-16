const path = require('path');
let accoladeModel = require('../models/accolades');
let challengeModel = require('../models/challenges');
let eventsModel = require('../models/events');
let submissionService = require('../services/submission');
const config = require('../utils/config');
const frontendS3 = require('../utils/frontendS3');
const logger = require('../utils/logger');

const ordinalSuffixOf = (i) => {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + 'st';
    }
    if (j == 2 && k != 12) {
        return i + 'nd';
    }
    if (j == 3 && k != 13) {
        return i + 'rd';
    }
    return i + 'th';
};

/**
 * @function addAccolade
 * @param {String} eventId id of the event
 * @param {String} name name of the accolade 
 *              (must be unique of not assigned to a challenge)
 * @param {String} description obvs desc of the accolade
 * @param {String} emoji maybe? its easy (optional)
 * @param {String} challengeId name of the challenge to assign
 *              the accolade to (optional)
 * @param {String} accoladeId id of the accolade (if upserting)
 * @returns {String} id of the accolade that was upserted or modified
 */
const addAccolade = async (eventId, name, description, emoji, challengeId, accoladeId = null) => {
    const eventObj = await eventsModel.getEventById(eventId);
    if (!eventObj) throw new Error(`📌event ${eventId} does not exist`);
    const accoladeObj = await accoladeModel.createAccolade(name, description, emoji, eventId, challengeId);
    const id = await accoladeModel.addAccolade(accoladeObj, accoladeId);
    await eventsModel.addEventAccoladeId(eventId, id || accoladeId);
    return id || accoladeId;
};

/**
 * @function removeAccolade
 * @param {String} event name of the event
 * @param {List<String>} accolades names of the accolades to remove
 * @returns {List<String>} accolade ids of the removed
 */
const removeAccolade = async (eventId, accoladeId) => {
    const accoladeObj = await accoladeModel.removeAccolade(eventId, accoladeId);
    if (accoladeObj.challengeId) {
        await challengeModel.removeChallengeAccoladeId(accoladeObj.challengeId, accoladeId);
    }
    await eventsModel.removeEventAccoladeId(eventId, accoladeId);
    return accoladeObj._id;
};

/**
 * @function addEvent
 * @param {String} name name of the event
 * @param {String} description 
 * @param {String} start_time Try to use ISO format
 * @param {String} end_time same
 * @param {Boolean} show show the event
 * @param {String} eventId event id if upserting
 * @returns {String} event id upserted or modified
 */
const addEvent = async (name, description, start_time, end_time, show, eventId = null) => {
    const eventObj = await eventsModel.createEvent(name, description, start_time, end_time, show);
    const id = eventsModel.addEvent(eventObj, eventId);
    return id || eventId;
};

/**
 * @function removeEvent
 * @param {String} eventId id of the event
 * @returns {String} eventId of the removed
 */
const removeEvent = async (eventId) => {
    const eventObj = await eventsModel.removeEventById(eventId);
    await Promise.all(eventObj.accoladeIds.map(async (accoladeId) => {
        try {
            await accoladeModel.removeAccolade(accoladeId);
        } catch (err) { 
            // do nothing
        }
    }));
    await Promise.all(eventObj.challengeIds.map(async (challengeId) => {
        try {
            await challengeModel.removeChallenge(challengeId);
        } catch (err) {
            // do nothing
        }
    }));
    await Promise.all(eventObj.submissionIds.map(async (submissionId) => {
        try {
            await submissionService.removeSubmission(submissionId);
        } catch (err) {
            // do nothing
        }
    }));
    return eventObj._id;
};

/**
 * @function addChallenge
 * @param {String} eventId
 * @param {String} name
 * @param {String} questions 
 * @param {Number} places 
 * @param {String} challengeId
 * @returns {String} challenge id
 */
const addChallenge = async (eventId, name, questions, places, challengeId = null) => {
    const accoladeIds = [];
    const existingChallengeObj = await challengeModel.getChallenge(eventId, challengeId);
    let startingPlace = 1;
    if (existingChallengeObj) startingPlace = (existingChallengeObj.places || 0) + 1;
    while (startingPlace <= places) {
        const emoji = config.challenges.place_emojis[startingPlace] || config.challenges.place_emojis[3];
        accoladeIds.push(await addAccolade(eventId, `${ordinalSuffixOf(startingPlace)} in ${name}`, null, emoji));
        startingPlace += 1;
    }
    const challengeObj = await challengeModel.createChallenge(name, places, accoladeIds, questions, eventId);
    const id = await challengeModel.addChallenge(challengeObj, challengeId);
    await Promise.all(accoladeIds.map(async (accoladeId) => {
        await accoladeModel.addAccoladeChallengeId(accoladeId, id || challengeId);
    }));
    await eventsModel.addEventChallengeId(eventId, id || challengeId);
    return id || challengeId;
};

/**
 * @function removeChallenge
 * @param {String} eventId
 * @param {String} challengeId
 * @returns {String} removed challenge id
 */
const removeChallenge = async (eventId, challengeId) => {
    const challengeObj = await challengeModel.removeChallenge(eventId, challengeId);
    logger.info(JSON.stringify(challengeObj));
    if (challengeObj) {
        await Promise.all(challengeObj.accoladeIds.map(async (accoladeId) => {
            await removeAccolade(eventId, accoladeId);
        }));
        await eventsModel.removeEventChallengeId(eventId, challengeId);
        return challengeId;
    }
    throw new Error(`📌challenge ${challengeId} does not exist`)
};

/**
 * @function uploadEventImage
 * @param {String} eventId
 * @param {String} filename 
 * @param {Buffer} buffer 
 * @returns {String} aws s3 object url
 */
const uploadEventImage = async (eventId, filename, buffer) => {
    const eventObj = await eventsModel.getEventById(eventId);
    if (!eventObj) throw new Error(`📌event ${eventId} does not exist`);
    if (eventObj.imageKey) {
        await removeImageByKey(eventObj.imageKey);
    }
    const data = await frontendS3.uploadFile(`${config.event.imagePrefix}${path.extname(filename)}`, buffer);
    eventObj.image = data.Location;
    eventObj.imageKey = data.Key;
    delete eventObj._id;
    await eventsModel.addEvent(eventObj._id, eventObj);
    return data.Location;
};

/**
 * @function uploadChallengeImage
 * @param {String} eventId 
 * @param {String} challengeId 
 * @param {String} filename 
 * @param {Buffer} buffer 
 * @returns {String} aws s3 object url
 */
const uploadChallengeImage = async (eventId, challengeId, filename, buffer) => {
    const challengeObj = await challengeModel.getChallenge(eventId, challengeId);
    if (!challengeObj) throw new Error(`📌challenge ${challengeId} does not exist`);
    if (challengeObj.imageKey) {
        await removeImageByKey(challengeObj.imageKey);
    }
    const data = await frontendS3.uploadFile(`${config.challenges.imagePrefix}${path.extname(filename)}`, buffer);
    challengeObj.image = data.Location;
    challengeObj.imageKey = data.Key;
    delete challengeObj._id;
    await challengeModel.addChallenge(challengeObj._id, challengeObj);
    return data.Location;
};

const removeImageByKey = async (fileKey) => {
    return frontendS3.removeFile(fileKey);
};

/* for testing only */
const setEventModel = (testModel) => {
    eventsModel = testModel;
};
const setChallengeModel = (testModel) => {
    challengeModel = testModel;
};
const setAccoladeModel = (testModel) => {
    accoladeModel = testModel;
};

module.exports = {
    addAccolade,
    removeAccolade,
    addEvent,
    removeEvent,
    addChallenge,
    removeChallenge,
    uploadEventImage,
    uploadChallengeImage,
    // testing
    setEventModel,
    setChallengeModel,
    setAccoladeModel,
};
