/* eslint-env mocha */
const { assert } = require('chai');
// const logger = require('../../../utils/logger');
const eventsService = require('../../../services/events');

describe('events service', () => {
    it('is defined', async () => {
        assert.isDefined(eventsService.getAccolade);
        assert.isDefined(eventsService.getAccolades);
        assert.isDefined(eventsService.getChallenge);
        assert.isDefined(eventsService.getChallengeImage);
        assert.isDefined(eventsService.getChallenges);
        assert.isDefined(eventsService.getEventByName);
        assert.isDefined(eventsService.getEvent);
        assert.isDefined(eventsService.getEventImage);
        assert.isDefined(eventsService.getEvents);
    });
});