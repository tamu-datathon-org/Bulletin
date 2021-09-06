let accoladeModel = require('../models/accolades');
let challengeModel = require('../models/challenges');
let eventsModel = require('../models/events');
let questionsModel = require('../models/questions');
const logger = require('../utils/logger');
// const logger = require('../utils/logger');

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
const addAccolade = async (event, name, description, emoji, challenge) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌event ${event} does not exist`);
    const eventId = eventObj._id;
    const dupAccolade = await accoladeModel.getAccoladeByName(name);
    let challengeId = null;
    if (challenge) {
        logger.info('challenge provided');
        const challengeObj = await challengeModel.getChallengeByName(challenge);
        if (!challengeObj) throw new Error(`📌challenge ${challenge} does not exist`);
        if (dupAccolade && challengeObj) {
            throw new Error(`📌accolade ${name} already created for this challenge`);
        }
        challengeId = challengeObj._id;
    } else {
        logger.info('no challenge provided');
        logger.info(JSON.stringify(dupAccolade));
        if (dupAccolade) {
            throw new Error(`📌accolade ${name} already exists & is not associated to a challenge`);
        }
    }
    const accoladeObj = await accoladeModel.createAccolade(name, description, emoji, eventId, challengeId);
    const accoladeId = await accoladeModel.addAccolade(accoladeObj);
    if (challenge) {
        await challengeModel.addChallengeAccoladeId(challengeId, accoladeId);
    }
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
const updateAccolade = async (event, accolade, newName, description, emoji, challenge) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`📌${event} does not exist`);
    const accoladeObj = await accoladeModel.getAccoladeByName(accolade);
    const setOptions = {};
    if (newName) setOptions.name = newName;
    if (description) setOptions.description = description;
    if (emoji) setOptions.emoji = emoji;
    if (challenge === 'rm') {
        setOptions.challengeId = '';
    } else if (challenge) {
        const challengeObj = await challengeModel.getChallengeByName(challenge);
        if (!challengeObj) throw new Error(`📌challenge ${challenge} does not exist`);
        setOptions.challengeId = challengeObj._id;
    }
    return accoladeModel.updateAccolade(accoladeObj._id, setOptions);
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

const addChallenge = async (title, description, questions, accolades, event) => {
    const dupChallenge = await challengeModel.getChallengeByName(title);
    if (dupChallenge) throw new Error(`${title} already exists`);
    const questionIds = [];
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`${event} does not exist`);
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
    if (accolades && Array.isArray(accolades)) {
        await Promise.all(accolades.map(async (title) => {
            const accolade = await accoladeModel.getAccoladeByName(title);
            if (accolade?._id) accoladeIds.push(accolade._id);
        }));
    }
    const challengeObj = await challengeModel.createChallenge(title, description, accoladeIds, questionIds);
    const challengeId = await challengeModel.addChallenge(challengeObj);
    await eventsModel.addEventChallengeId(eventId, challengeId);
    return challengeId;
};

const removeChallenges = async (event, challengeNames) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`${event} does not exist`);
    const eventId = eventObj._id;
    const challengeIds = [];
    await Promise.all(challengeNames.map(async (title) => {
        const challenge = await challengeModel.removeChallengeByName(title);
        if (challenge) {
            challengeIds.push(challenge._id);
            await Promise.all(challenge.accoladeIds.map(async (challengeId) => {
                await challengeModel.removeChallengeAccoladeId(challengeId, challenge._id);
            }));
        }
    }));
    if (challengeIds.length === 0) throw new Error('no valid accolade titles provided');
    await Promise.all(challengeIds.map(async (id) => {
        await eventsModel.removeEventAccoladeId(eventId, id);
    }));
    return challengeIds;
};

const updateChallenges = async (challenges) => {
    await Promise.all(challenges.map(async (challenge) => {
        const challengeObj = await challengeModel.getChallengeByName(challenge.oldTtle);
        if (!challengeObj) throw new Error(`${challenge.oldName} does not exist`);
        const setOptions = {};
        if (challenge.title) setOptions.title = challenge.title;
        if (challenge.description) setOptions.description = challenge.description;
        await challengeModel.updateChallenge(challengeObj._id, setOptions);
        if (challenge.addAccolades) {
            await Promise.all(challenge.addAccolades.map(async (accolade) => {
                const accoladeObj = await accoladeModel.getEventByName(accolade);
                if (!accoladeObj) throw new Error(`${accolade} does not exist`);
                await challengeModel.addChallengeAccoladeId(challengeObj._id, accoladeObj._id);
            }));
        }
        if (challenge.removeAccolades) {
            await Promise.all(challenge.removeAccolades.map(async (accolade) => {
                const accoladeObj = await accoladeModel.getEventByName(accolade);
                if (!accoladeObj) throw new Error(`${accolade} does not exist`);
                await challengeModel.removeChallengeAccoladeId(challengeObj._id, accoladeObj._id);
            }));
        }
        if (challenge.addQuestion) {
            await Promise.all(challenge.addQuestion.map(async (text) => {
                const question = await questionsModel.getQuestionByText(text);
                if (question?._id) await challengeModel.addChallengeQuestionId(question._id);
                else {
                    // const questionObj = await questionsModel.createQuestion(text);
                    // questionIds.push(await questionsModel.addQuestion(questionObj));
                }
            }));
        }
    }));
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
    updateChallenges,
    // testing
    setEventModel,
    setChallengeModel,
    setAccoladeModel,
    setQuestionModel,
};
