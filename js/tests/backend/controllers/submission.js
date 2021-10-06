/* eslint-env mocha */
const { assert, expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../utils/logger');
const submissionController = require('../../../controllers/submission');
const config = require('../../../utils/config');

describe('admin controller', () => {
    const mockResponse = {
        // eslint-disable-next-line no-unused-vars
        status: (code) => mockResponse,
        json: (data) => {
            logger.info(JSON.stringify(data));
            return data;
        },
        send: () => mockResponse,
        end: () => { },
        download: () => 'downloaded',
    };

    it('is defined', async () => {
        assert.isDefined(submissionController.addComment);
        assert.isDefined(submissionController.addSubmission);
        assert.isDefined(submissionController.removeComment);
        assert.isDefined(submissionController.removeSubmission);
        assert.isDefined(submissionController.submissionFileUpload);
        assert.isDefined(submissionController.toggleLike);
    });

    const mockEventResponse = 'event';
    const mockSubsmissionResponse = 'submimssion';
    const mockPipe = {
        pipe: () => { },
    };
    const mockBouncerResponse = 'bouncer';

    const mockEventService = {
        getEventByName: () => mockEventResponse,
        getEvents: () => mockEventResponse,
        getEvent: () => mockEventResponse,
        getAccolade: () => mockEventResponse,
        getAccolades: () => mockEventResponse,
        getChallenge: () => mockEventResponse,
        getChallenges: () => mockEventResponse,
        getEventImage: () => mockPipe,
        getChallengeImage: () => mockPipe,
    };

    const mockSubmissionService = {
        addSubmission: () => mockSubsmissionResponse,
        removeSubmission: () => mockSubsmissionResponse,
        toggleLike: () => mockSubsmissionResponse,
        addComment: () => mockSubsmissionResponse,
        removeComment: () => mockSubsmissionResponse,
        getSubmission: () => mockSubsmissionResponse,
        getSubmissions: () => mockSubsmissionResponse,
        getSubmissionsByUserAuthId: () => mockSubsmissionResponse,
        getSubmissionFile: () => mockPipe,
        uploadSubmissionFile: () => mockSubsmissionResponse,
    };

    const mockBouncer = {
        checkIfLoggedIn: () => mockBouncerResponse,
        getAuthId: () => mockBouncerResponse,
        getDiscordUser: () => mockBouncerResponse,
    };

    submissionController.setSubmissionService(mockSubmissionService);
    submissionController.setEventsService(mockEventService);
    submissionController.setBouncer(mockBouncer);

    const mockuuid = '100b039d-1877-49d6-8107-91d2cbcf7931';

    // spies
    sinon.spy(mockResponse, 'status');
    sinon.spy(mockResponse, 'send');
    sinon.spy(mockResponse, 'json');
    sinon.spy(mockResponse, 'download');

    describe('get event', () => {

    });
});
