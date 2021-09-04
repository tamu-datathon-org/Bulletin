let accoladeModel = require('../models/accolades');
let challengeModel = require('../models/challenges');
let eventsModel = require('../models/events');
let questionsModel = require('../models/questions');
const logger = require('../utils/logger');

const addAccolade = async (title, description, challenges, emoji, event) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`${event} does not exist`);
    const eventId = eventObj._id;
    const dupAccolade = await accoladeModel.getAccoladeByTitle(title);
    if (dupAccolade) throw new Error(`accolade ${title} does not exist`);
    const challengeIds = (await challengeModel.getChallengesByTitles(challenges)).map(c => c._id);
    const accoladeObj = await accoladeModel.createAccolade(title, description, challengeIds, emoji);
    const accoladeId = await accoladeModel.addAccolade(accoladeObj);
    await Promise.all(challengeIds.map(async (id) => {
        await challengeModel.addChallengeAccoladeId(id, accoladeId);
    }));
    logger.info('challenge add accolade');
    await eventsModel.addEventAccoladeId(eventId, accoladeId);
    return accoladeId;
};

const removeAccolades = async (event, accoladeTitles) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`${event} does not exist`);
    const eventId = eventObj._id;
    const accoladeIds = [];
    await Promise.all(accoladeTitles.map(async (title) => {
        const accolade = await accoladeModel.removeAccoladeByTitle(title);
        if (accolade) {
            accoladeIds.push(accolade._id);
            await Promise.all(accolade.challengeIds.map(async (challengeId) => {
                await challengeModel.removeChallengeAccoladeId(challengeId, accolade._id);
            }));
        }
    }));
    if (accoladeIds.length === 0) throw new Error('no valid accolade titles provided');
    await Promise.all(accoladeIds.map(async (id) => {
        await eventsModel.removeEventAccoladeId(eventId, id);
    }));
    return accoladeIds;
};

const addEvent = async (name, description, start_time, end_time) => {
    const dupEvent = await eventsModel.getEventByName(name);
    if (dupEvent) throw new Error(`📌event ${name} already exists`);
    const eventObj = await eventsModel.createEvent(name, description, start_time, end_time);
    return eventsModel.addEvent(eventObj);
};

const removeEvent = async (name) => {
    const eventObj = await eventsModel.getEventByName(name);
    if (!eventObj) throw new Error(`📌event ${name} does not exist`);
    return eventsModel.removeEventById(eventObj._id);
};

const updateEvent = async (name, description, start_time, end_time) => {
    const eventObj = await eventsModel.getEventByName(name);
    if (!eventObj) throw new Error(`📌event ${name} does not exist`);
    const setOptions = {};
    if (name) setOptions.name = name;
    if (description) setOptions.description = description;
    if (start_time) setOptions.start_time = start_time;
    if (end_time) setOptions.end_time = end_time;
    return eventsModel.updateEvent(eventObj._id, setOptions);
};

const getEvent = async (name) => {
    const eventObj = await eventsModel.getEventByName(name);
    if (!eventObj) throw new Error(`📌event ${name} does not exist`);
    return eventObj;
};

const addChallenge = async (title, description, questions, accolades, event) => {
    const dupChallenge = await challengeModel.getChallengeByTitle(title);
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
            const accolade = await accoladeModel.getAccoladeByTitle(title);
            if (accolade?._id) accoladeIds.push(accolade._id);
        }));
    }
    const challengeObj = await challengeModel.createChallenge(title, description, accoladeIds, questionIds);
    const challengeId = await challengeModel.addChallenge(challengeObj);
    await eventsModel.addEventChallengeId(eventId, challengeId);
    return challengeId;
};

const removeChallenges = async (event, challengeTitles) => {
    const eventObj = await eventsModel.getEventByName(event);
    if (!eventObj) throw new Error(`${event} does not exist`);
    const eventId = eventObj._id;
    const challengeIds = [];
    await Promise.all(challengeTitles.map(async (title) => {
        const challenge = await challengeModel.removeChallengeByTitle(title);
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
        const challengeObj = await challengeModel.getChallengeByTitle(challenge.oldTtle);
        if (!challengeObj) throw new Error(`${challenge.oldTitle} does not exist`);
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
