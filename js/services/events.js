const eventsModel = require('../models/events');
const submissionModel = require('../models/submission');
const accoladeModel = require('../models/accolades');
const challengeModel = require('../models/challenges');
const frontendS3 = require('../utils/frontendS3');

const getEventFull = async (eventObj) => {
    const eventCopy = eventObj;
    eventCopy.accolades = await accoladeModel.getAccolades(eventObj.eventId);
    eventCopy.challenges = await challengeModel.getChallenges(eventObj.challengeIds);
    eventCopy.submissions = await submissionModel.getSubmissions(eventObj.submissionIds);
    return eventObj;
};

/**
 * @function getEvent
 * @param {String} eventId 
 * @param {Boolean} full 
 * @returns {Object} event
 */
const getEvent = async (eventId, full) => {
    const eventObj = await eventsModel.getEventById(eventId);
    if (full) return getEventFull(eventObj);
    return eventObj;
};

/**
 * @function getEventByName
 * @param {String} eventName name of the event
 * @param {Boolean} full get everything
 *          ie. show accolades in full rather than
 *          just the accoladeId
 * @returns {Object} event
 */
const getEventByName = async (eventName, full = false) => {
    const eventObj = await eventsModel.getEventByName(eventName);
    if (full) return getEventFull(eventObj);
    return eventsModel.getEventByName(eventName);
};

/**
 * @function getAllEvents
 * @param {Boolean} full get everything
 *          ie. show accolades in full rather than
 *          just the accoladeId
 * @returns {List<Object>} events
 */
const getEvents = async (full = false) => {
    const eventObjs = await eventsModel.getAllEvents();
    if (full) return Promise.all(eventObjs.map(async (eventObj) => getEventFull(eventObj)));
    return eventObjs;
};

/**
 * @function getAccolade
 * @param {String} eventId 
 * @param {String} accoladeId 
 * @returns {Object} accolade
 */
const getAccolade = async (eventId, accoladeId) => {
    return accoladeModel.getAccolade(eventId, accoladeId);
};

/**
 * @function getAccoladesByEvent
 * @param {String} eventId 
 * @returns {List<Object>} accolades
 */
const getAccolades = async (eventId) => {
    return accoladeModel.getAccolades(eventId);
};

/**
 * @function getChallenge
 * @param {String} eventId 
 * @param {String} challengeId 
 * @returns {Object} challenge
 */
const getChallenge = async (eventId, challengeId) => {
    return challengeModel.getChallenge(eventId, challengeId);
};

/**
 * @function getChallenges
 * @param {String} eventId 
 * @returns {List<Object>} challenges
 */
const getChallenges = async (eventId) => {
    return challengeModel.getChallengesByEvent(eventId);
};

/**
 * @function getEventImage
 * @param {String} eventId 
 * @returns {Buffer} image buffer
 */
const getEventImage = async (eventId) => {
    const eventObj = await eventsModel.getEventById(eventId);
    if (!eventObj) throw new Error(`📌event ${eventId} does not exist`);
    if (eventObj.imageKey) return getImageByKey(eventObj.imageKey);
    throw new Error(`📌event ${eventId} does not have an assigned image`);
};

/**
 * @function getChallengeImage
 * @param {String} eventId 
 * @param {String} challengeId 
 * @returns {Buffer} image buffer
 */
const getChallengeImage = async (eventId, challengeId) => {
    const challengeObj = await challengeModel.getChallenge(eventId, challengeId);
    if (!challengeObj) throw new Error(`📌challenge ${challengeId} does not exist`);
    if (challengeObj.imageKey) return getImageByKey(challengeObj.imageKey);
    throw new Error(`📌challenge ${challengeId} does not have an assigned image`);
};

const getImageByKey = async (fileKey) => {
    return frontendS3.getFileStream(fileKey);
};

module.exports = {
    getEventByName,
    getEvents,
    getEvent,
    getAccolade,
    getAccolades,
    getChallenge,
    getChallenges,
    getEventImage,
    getChallengeImage,
};
