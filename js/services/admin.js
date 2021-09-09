const path = require('path');
let accoladeModel = require('../models/accolades');
let challengeModel = require('../models/challenges');
let eventsModel = require('../models/events');
let questionsModel = require('../models/questions');
const logger = require('../utils/logger');
const config = require('../utils/config');
const frontendS3 = require('../utils/frontendS3');

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
 * @param {String} event name of the event
 * @param {String} name name of the accolade 
 *              (must be unique of not assigned to a challenge)
 * @param {String} description obvs desc of the accolade
 * @param {String} emoji maybe? its easy (optional)
 * @param {String} challenge name of the challenge to assign
 *              the accolade to (optional)
 * @returns {String} accolade id that was created
 */
const addAccolade = async (event, name, description, emoji) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌event ${event} does not exist`);
    const eventId = eventObj._id;
    const dupAccolade = await accoladeModel.getAccoladeByName(name);
    if (dupAccolade) throw new Error(`📌accolade ${name} already exists`);
    const accoladeObj = await accoladeModel.createAccolade(name, description, emoji, eventId);
    const accoladeId = await accoladeModel.addAccolade(accoladeObj);
    await eventsModel.addEventAccoladeId(eventId, accoladeId);
    return accoladeId;
};

/**
 * @function removeAccolades
 * @param {String} event name of the event
 * @param {List<String>} accolades names of the accolades to remove
 * @returns {List<String>} accolade ids of the removed
 */
const removeAccolades = async (event, accolades) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌${event} does not exist`);
    const eventId = eventObj._id;
    const accoladeIds = [];
    await Promise.all(accolades.map(async (name) => {
        const accolade = await accoladeModel.removeAccoladeByName(name);
        logger.info(JSON.stringify(accolade));
        if (accolade) accoladeIds.push(accolade._id);
        if (accolade.challengeId) await challengeModel
            .removeChallengeAccoladeId(accolade.challengeId, accolade._id);
        await eventsModel.removeEventAccoladeId(eventId, accolade._id);
    }));
    if (accoladeIds.length === 0) throw new Error('📌no valid accolade titles provided');
    return accoladeIds;
};

/**
 * @function updateAccolade
 * @param {String} event name
 * @param {String} accolade accolade name 
 *          (if changing the name this is the old name)
 * @param {String} newName new accolade name
 * @param {String} description 
 * @param {String} emoji 
 * @param {String} challenge challenge name
 *          (to remove a challenge make this 'rm')
 * @returns 
 */
const updateAccolade = async (event, accolade, name, description, emoji) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌${event} does not exist`);
    const accoladeObj = await accoladeModel.getAccoladeByName(accolade, eventObj._id);
    if (!accoladeObj) throw new Error(`📌${accolade} does not exist`);
    const setOptions = {};
    if (name) setOptions.name = name;
    if (description) setOptions.description = description;
    if (emoji) setOptions.emoji = emoji;
    return accoladeModel.updateAccolade(accoladeObj._id, eventObj._id, setOptions);
};

/**
 * @function addEvent
 * @param {String} name name of the event
 * @param {String} description 
 * @param {String} start_time Try to use ISO format
 * @param {String} end_time same
 * @returns {String} event id created
 */
const addEvent = async (name, description, start_time, end_time) => {
    const dupEvent = await eventsModel.getEventByName(name);
    if (dupEvent) throw new Error(`📌event ${name} already exists`);
    const eventObj = await eventsModel.createEvent(name, description, start_time, end_time);
    return eventsModel.addEvent(eventObj);
};

/**
 * @function removeEvent
 * @param {String} name name of the event
 * @returns {String} event id of the removed
 */
const removeEvent = async (name) => {
    const eventObj = await eventsModel.getEventByName(name);
    if (!eventObj) throw new Error(`📌event ${name} does not exist`);
    return eventsModel.removeEventById(eventObj._id);
};

/**
 * @function updateEvent
 * @param {String} event name (if newName must be the old name) of the event
 * @param {String} newName (optional)
 * @param {String} description (optional)
 * @param {String} start_time (optional)
 * @param {String} end_time (optional)
 * @returns {String} event id of the modified
 */
const updateEvent = async (event, newName, description, start_time, end_time) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌event ${event} does not exist`);
    const setOptions = {};
    if (newName) setOptions.name = newName;
    if (description) setOptions.description = description;
    if (start_time) setOptions.start_time = start_time;
    if (end_time) setOptions.end_time = end_time;
    return eventsModel.updateEvent(eventObj._id, setOptions);
};

/**
 * @function getEvent
 * @param {String} name name of the event
 * @returns {Object} JSON of the event data
 */
const getEvent = async (name) => {
    const eventObj = await eventsModel.getEventByName(name);
    if (!eventObj) throw new Error(`📌event ${name} does not exist`);
    return eventObj;
};

const addChallenge = async (event, name, questions, places) => {
    const dupChallenge = await challengeModel.getChallengeByName(name);
    if (dupChallenge) throw new Error(`📌challenge ${name} already exists`);
    const questionIds = [];
    const eventObj = await getEvent(event);
    const eventId = eventObj._id;
    if (questions && Array.isArray(questions)) {
        await Promise.all(questions.map(async (text) => {
            const question = await questionsModel.getQuestionByText(text);
            if (question?._id) questionIds.push(question._id);
            else {
                const questionObj = await questionsModel.createQuestion(text);
                questionIds.push(await questionsModel.addQuestion(questionObj));
            }
        }));
    }
    const accoladeIds = [];
    let currPlace = 1;
    while (currPlace <= places) {
        const emoji = config.challenges.place_emojis[currPlace] || config.challenges.place_emojis[1];
        accoladeIds.push(await addAccolade(event, `${ordinalSuffixOf(currPlace)} in ${name}`, null, emoji));
        currPlace += 1;
    }
    const challengeObj = await challengeModel.createChallenge(name, places, accoladeIds, questionIds);
    const challengeId = await challengeModel.addChallenge(challengeObj);
    await eventsModel.addEventChallengeId(eventId, challengeId);
    return challengeId;
};

const removeChallenges = async (event, challengeNames) => {
    const eventObj = await getEvent(event);
    const eventId = eventObj._id;
    const challengeIds = [];
    const accoladeIds = [];
    await Promise.all(challengeNames.map(async (name) => {
        const challenge = await challengeModel.getChallengeByName(name);
        if (challenge) {
            await challengeModel.removeChallenge(challenge._id);
            challengeIds.push(challenge._id);
            accoladeIds.push(...challenge.accoladeIds);
        }
    }));
    await eventsModel.removeEventChallengeIds(eventId, challengeIds);
    await eventsModel.removeEventAccoladeIds(eventId, accoladeIds);
    await accoladeModel.removeAccolades(accoladeIds);
    return challengeIds;
};

const uploadEventImage = async (event, filename, buffer) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌event ${event} does not exist`);
    const data = await frontendS3.uploadFile(`${config.event.imagePrefix}${path.extname(filename)}`, buffer);
    const setOptions = {
        image: data.Location,
        imageKey: data.Key,
    };
    await eventsModel.updateEvent(eventObj._id, setOptions);
    return data.Key;
};

const uploadChallengeImage = async (event, challenge, filename, buffer) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌event ${event} does not exist`);
    const challengeObj = await challengeModel.getChallengeByName(challenge);
    if (!challengeObj) throw new Error(`📌challenge ${challenge} does not exist`);
    const data = await frontendS3.uploadFile(`${config.challenges.imagePrefix}${path.extname(filename)}`, buffer);
    const setOptions = {
        image: data.Location,
        imageKey: data.Key,
    };
    await challengeModel.updateChallenge(challengeObj._id, setOptions);
    return data.Key;
};

const getEventImage = async (event) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌event ${event} does not exist`);
    if (eventObj.imageKey) return getImageByKey(eventObj.imageKey);
    throw new Error(`📌event ${event} does not have an assigned image`);
};

const getChallengeImage = async (challenge) => {
    const challengeObj = await challengeModel.getChallengeByName(challenge);
    if (!challengeObj) throw new Error(`📌challenge ${challenge} does not exist`);
    if (challengeObj.imageKey) return getImageByKey(challengeObj.imageKey);
    throw new Error(`📌challenge ${challenge} does not have an assigned image`);
};

const getImageByKey = async (fileKey) => {
    return frontendS3.getFileStream(fileKey);
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
const setQuestionModel = (testModel) => {
    questionsModel = testModel;
};

module.exports = {
    addAccolade,
    removeAccolades,
    updateAccolade,
    addEvent,
    removeEvent,
    updateEvent,
    getEvent,
    addChallenge,
    removeChallenges,
    uploadEventImage,
    uploadChallengeImage,
    getEventImage,
    getChallengeImage,
    // testing
    setEventModel,
    setChallengeModel,
    setAccoladeModel,
    setQuestionModel,
};
