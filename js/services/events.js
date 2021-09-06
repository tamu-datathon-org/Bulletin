const eventsModel = require('../models/events');
const submissionModel = require('../models/submission');
const accoladeModel = require('../models/accolades');
const challengeModel = require('../models/challenges');

const getEventFull = async (eventObj) => {
    const eventCopy = eventObj;
    eventCopy.accolades = await accoladeModel.getAccolades(eventObj.accoladeIds);
    eventCopy.challenges = await challengeModel.getChallenges(eventObj.challengeIds);
    eventCopy.submissions = await submissionModel.getSubmissions(eventObj.submissionIds);
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
 * @returns {List<Object>} list of events
 */
const getAllEvents = async (full = false) => {
    const eventObjs = await eventsModel.getAllEvents();
    if (full) return Promise.all(eventObjs.map(async (eventObj) => getEventFull(eventObj)));
    return eventObjs;
};

module.exports = {
    getEventByName,
    getAllEvents,
};
