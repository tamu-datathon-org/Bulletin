const accoladeModel = require('../models/accolades');
const challengeModel = require('../models/challenges');
const eventsModel = require('../models/events');
const questionsModel = require('../models/questions');
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
    if (dupEvent) throw new Error(`event ${name} already exists`);
    const eventObj = await eventsModel.createEvent(name, description, start_time, end_time);
    return eventsModel.addEvent(eventObj);
};

const removeEvent = async (name) => {
    const eventObj = await eventsModel.getEventByName(name);
    if (eventObj) throw new Error(`event ${name} does not exists`);
    return eventsModel.removeEventById(eventObj._id);
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

module.exports = {
    addAccolade,
    removeAccolades,
    addEvent,
    removeEvent,
    addChallenge,
    removeChallenges,
};
