const eventsModel = require('../models/events');
const submissionModel = require('../models/submission');
const accoladeModel = require('../models/accolades');
const challengeModel = require('../models/challenges');
// const logger = require('../utils/logger');

const getEventFull = async (eventObj) => {
    const eventCopy = eventObj;
    eventCopy.accolades = await accoladeModel.getAccolades(eventObj.accoladeIds);
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
const getAllEvents = async (full = false) => {
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
const getAccoladesByEvent = async (eventId) => {
    return accoladeModel.getAccoladesByEvent(eventId);
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

module.exports = {
    getEventByName,
    getAllEvents,
    getEvent,
    getAccolade,
    getAccoladesByEvent,
    getChallenge,
    getChallenges,
};
