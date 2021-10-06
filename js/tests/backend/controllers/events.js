/* eslint-env mocha */
const { assert, expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../utils/logger');
const eventController = require('../../../controllers/event');
// const config = require('../../../utils/config');

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
        assert.isDefined(eventController.getAccolade);
        assert.isDefined(eventController.getAccolades);
        assert.isDefined(eventController.getAllEvents);
        assert.isDefined(eventController.getChallenge);
        assert.isDefined(eventController.getChallengeImage);
        assert.isDefined(eventController.getChallenges);
        assert.isDefined(eventController.getEvent);
        assert.isDefined(eventController.getEventImage);
        assert.isDefined(eventController.getSubmission);
        assert.isDefined(eventController.getSubmissionIcon);
        assert.isDefined(eventController.getSubmissionMarkdown);
        assert.isDefined(eventController.getSubmissionPhotos);
        assert.isDefined(eventController.getSubmissionSourceCode);
        assert.isDefined(eventController.getSubmissionsByUserAuthId);
    });

    const mockEventResponse = 'event';
    const mockSubsmissionResponse = 'submission';
    const mockPipe = {
        pipe: () => { },
    };

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

    eventController.setEventService(mockEventService);
    eventController.setSubmissionService(mockSubmissionService);

    const mockuuid = '100b039d-1877-49d6-8107-91d2cbcf7931';

    // spies
    sinon.spy(mockResponse, 'status');
    sinon.spy(mockResponse, 'send');
    sinon.spy(mockResponse, 'json');
    sinon.spy(mockResponse, 'download');

    describe('get event', () => {
        const mockRequest = {
            params: {
                eventId: null,
            },
            query: {
                full: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.query.full = null;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get event - VALID', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event - VALID with full query', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            mockRequest.query.full = true;
            await eventController.getEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event - VALID with full just a string', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            mockRequest.query.full = 'false';
            await eventController.getEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event - VALID with full defaults to false', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            mockRequest.query.full = 'facts baby';
            await eventController.getEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get all events', () => {
        const mockRequest = {
            query: {
                full: null,
            },
        };

        beforeEach(() => {
            mockRequest.query.full = null;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get event - VALID null full query', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getAllEvents(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event - VALID bool full query', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            mockRequest.query.full = true;
            await eventController.getAllEvents(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event - VALID string full query', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            mockRequest.query.full = 'false';
            await eventController.getAllEvents(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event - VALID full defaults to false', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            mockRequest.query.full = 'facts baby';
            await eventController.getAllEvents(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get accolade', () => {
        const mockRequest = {
            params: {
                eventId: null,
                accoladeId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.accoladeId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get accolade - VALID', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get accolade - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get accolade - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get accolade - INVALID null accoldeId', async () => {
            const expectedRes = {
                error: '📌accoladeId is a required parameter',
            };
            mockRequest.params.accoladeId = null;
            await eventController.getAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get accolade - INVALID no accoldeId', async () => {
            const expectedRes = {
                error: '📌accoladeId is a required parameter',
            };
            mockRequest.params.accoladeId = '';
            await eventController.getAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get accolades', () => {
        const mockRequest = {
            params: {
                eventId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get accolades - VALID', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getAccolades(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get accolades - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getAccolades(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get accolades - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getAccolades(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get challenge', () => {
        const mockRequest = {
            params: {
                eventId: null,
                challengeId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.challengeId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get challenge - VALID', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenge - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenge - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenge - INVALID null challengeId', async () => {
            const expectedRes = {
                error: '📌challengeId is a required parameter',
            };
            mockRequest.params.challengeId = null;
            await eventController.getChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenge - INVALID no challengeId', async () => {
            const expectedRes = {
                error: '📌challengeId is a required parameter',
            };
            mockRequest.params.challengeId = '';
            await eventController.getChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get challenges', () => {
        const mockRequest = {
            params: {
                eventId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get challenges - VALID', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getChallenges(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenges - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getChallenges(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenges - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getChallenges(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get event image', () => {
        const mockRequest = {
            params: {
                eventId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get event image - VALID', async () => {
            await eventController.getEventImage(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).not.to.equal(true);
        });

        it('get event image - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getEventImage(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get event image - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getEventImage(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get challenge image', () => {
        const mockRequest = {
            params: {
                eventId: null,
                challengeId: null
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.challengeId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get challenge image - VALID', async () => {
            await eventController.getChallengeImage(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).not.to.equal(true);
        });

        it('get challenge image - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getChallengeImage(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenge image - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getChallengeImage(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenge image - INVALID null challengeId', async () => {
            const expectedRes = {
                error: '📌challengeId is a required parameter',
            };
            mockRequest.params.challengeId = null;
            await eventController.getChallengeImage(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get challenge image - INVALID no challengeId', async () => {
            const expectedRes = {
                error: '📌challengeId is a required parameter',
            };
            mockRequest.params.challengeId = '';
            await eventController.getChallengeImage(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get submission', () => {
        const mockRequest = {
            params: {
                eventId: null,
                submissionId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.submissionId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get submission - VALID', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await eventController.getSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await eventController.getSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get submissions', () => {
        const mockRequest = {
            params: {
                eventId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get submissions - VALID', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getSubmissions(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getSubmissions(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getSubmissions(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get submissions by userAuthId', () => {
        const mockRequest = {
            params: {
                eventId: null,
                userAuthId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.userAuthId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get submissions by userAuthId - VALID', async () => {
            const expectedRes = {
                result: mockEventResponse,
            };
            await eventController.getSubmissionsByUserAuthId(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission by userAuthId - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getSubmissionsByUserAuthId(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getSubmissionsByUserAuthId(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission by userAuthId - INVALID null userAuthId', async () => {
            const expectedRes = {
                error: '📌userAuthId is a required parameter',
            };
            mockRequest.params.userAuthId = null;
            await eventController.getSubmissionsByUserAuthId(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission - INVALID no userAuthId', async () => {
            const expectedRes = {
                error: '📌userAuthId is a required parameter',
            };
            mockRequest.params.userAuthId = '';
            await eventController.getSubmissionsByUserAuthId(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get submission icon', () => {
        const mockRequest = {
            params: {
                eventId: null,
                submissionId: null
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.submissionId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get submission icon - VALID', async () => {
            await eventController.getSubmissionIcon(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).not.to.equal(true);
        });

        it('get submission icon - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getSubmissionIcon(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission icon - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getSubmissionIcon(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission icon - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await eventController.getSubmissionIcon(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission icon - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await eventController.getSubmissionIcon(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get submission photos', () => {
        const mockRequest = {
            params: {
                eventId: null,
                submissionId: null
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.submissionId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get submission photos - VALID', async () => {
            await eventController.getSubmissionPhotos(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).not.to.equal(true);
        });

        it('get submission phtotos - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getSubmissionPhotos(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission photos - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getSubmissionPhotos(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission photos - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await eventController.getSubmissionPhotos(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission photos - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await eventController.getSubmissionPhotos(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get submission markdown', () => {
        const mockRequest = {
            params: {
                eventId: null,
                submissionId: null
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.submissionId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get submission markdown - VALID', async () => {
            await eventController.getSubmissionMarkdown(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).not.to.equal(true);
        });

        it('get submission markdown - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getSubmissionMarkdown(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission markdown - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getSubmissionMarkdown(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission markdown - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await eventController.getSubmissionMarkdown(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission markdown - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await eventController.getSubmissionMarkdown(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('get submission source code', () => {
        const mockRequest = {
            params: {
                eventId: null,
                submissionId: null
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.params.submissionId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('get submission source code - VALID', async () => {
            await eventController.getSubmissionSourceCode(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).not.to.equal(true);
        });

        it('get submission source code - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await eventController.getSubmissionSourceCode(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission source code - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await eventController.getSubmissionSourceCode(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission source code - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await eventController.getSubmissionSourceCode(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('get submission source code - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await eventController.getSubmissionSourceCode(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });
});

