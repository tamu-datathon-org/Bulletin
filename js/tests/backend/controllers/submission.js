/* eslint-env mocha */
const { assert, expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../utils/logger');
const submissionController = require('../../../controllers/submission');
const config = require('../../../utils/config');

describe('submission controller', () => {
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
    const date = new Date();
    const starttime = date.toISOString();
    date.setDate(date.getDate() + 1);
    const endtime = date.toISOString();
    const mockEvent = {
        start_time: () => starttime,
        end_time: () => endtime,
    };

    const mockEventService = {
        getEventByName: () => mockEventResponse,
        getEvents: () => mockEventResponse,
        getEvent: () => mockEvent,
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
        getUserSubmissionLinkBySubmissionIdAndUserAuthId: () => mockSubsmissionResponse,
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

    describe('add submission', () => {
        const mockRequest = {
            cookies: {
                accessToken: 'test token',
            },
            params: {
                eventId: null,
            }, body: {
                _id: null,
                name: null,
                tags: null,
                links: null,
                discordTags: null,
                videoLink: null,
                answer1: null,
                answer2: null,
                answer3: null,
                answer4: null,
                answer5: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = mockuuid;
            mockRequest.body._id = null;
            mockRequest.body.name = 'Test Submission';
            mockRequest.body.tags = ['test tag'];
            mockRequest.body.links = ['test question'];
            mockRequest.body.discordTags = ['test tag'];
            mockRequest.body.videoLink = 'test video link';
            mockRequest.body.answer1 = 'test answer';
            mockRequest.body.answer2 = 'test answer';
            mockRequest.body.answer3 = 'test answer';
            mockRequest.body.answer4 = 'test answer';
            mockRequest.body.answer5 = 'test answer';
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('add submission - VALID', async () => {
            const expectedRes = {
                submissionId: mockSubsmissionResponse,
            };
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - VALID only required fields', async () => {
            const expectedRes = {
                submissionId: mockSubsmissionResponse,
            };
            mockRequest.body.tags = null;
            mockRequest.body.links = null;
            mockRequest.body.answer1 = null;
            mockRequest.body.answer2 = null;
            mockRequest.body.answer3 = null;
            mockRequest.body.answer4 = null;
            mockRequest.body.answer5 = null;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('upsert submission - VALID', async () => {
            const expectedRes = {
                submissionId: mockSubsmissionResponse,
            };
            mockRequest.body._id = mockuuid;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID tags not an array', async () => {
            const expectedRes = {
                error: '📌tags must be an array',
            };
            mockRequest.body.tags = 'not an array';
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID too many tags', async () => {
            const expectedRes = {
                error: `📌maximum number of tags is ${config.submission_constraints.max_tags}`,
            };
            mockRequest.body.tags = Array(config.submission_constraints.max_tags + 1).fill('.');
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID links not an array', async () => {
            const expectedRes = {
                error: '📌links must be an array',
            };
            mockRequest.body.links = 'not an array';
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID too many links', async () => {
            const expectedRes = {
                error: `📌maximum number of links is ${config.submission_constraints.max_links}`,
            };
            mockRequest.body.links = Array(config.submission_constraints.max_links + 1).fill('.');
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID null name', async () => {
            const expectedRes = {
                error: '📌name is a required field',
            };
            mockRequest.body.name = null;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID no name', async () => {
            const expectedRes = {
                error: '📌name is a required field',
            };
            mockRequest.body.name = '';
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID name not string', async () => {
            const expectedRes = {
                error: '📌name is a required field',
            };
            mockRequest.body.name = 45.6;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID null videoLink', async () => {
            const expectedRes = {
                error: '📌videoLink is a required field',
            };
            mockRequest.body.videoLink = null;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID no videoLink', async () => {
            const expectedRes = {
                error: '📌videoLink is a required field',
            };
            mockRequest.body.videoLink = '';
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID videoLink not string', async () => {
            const expectedRes = {
                error: '📌videoLink is a required field',
            };
            mockRequest.body.videoLink = 34.5;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID null discordTags', async () => {
            const expectedRes = {
                error: '📌discordTags is a required field',
            };
            mockRequest.body.discordTags = null;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID discordTags not an array', async () => {
            const expectedRes = {
                error: '📌discordTags is a required field',
            };
            mockRequest.body.discordTags = 45.6;
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID discordTags length 0', async () => {
            const expectedRes = {
                error: '📌minimum number of discordTags is 1',
            };
            mockRequest.body.discordTags = [];
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add submission - INVALID discordTags length to long', async () => {
            const expectedRes = {
                error: `📌maximum number of discordTags is ${config.submission_constraints.max_participants}`,
            };
            mockRequest.body.discordTags = Array(config.submission_constraints.max_participants + 1).fill('.');
            await submissionController.addSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('remove submission', () => {
        const mockRequest = {
            cookies: {
                accessToken: 'test token',
            },
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

        it('remove submission - VALID', async () => {
            const expectedRes = {
                submissionId: mockSubsmissionResponse,
            };
            await submissionController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove submission - INVALID null eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await submissionController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove submission - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await submissionController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove submission - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await submissionController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove submission - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await submissionController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('toggle like', () => {
        const mockRequest = {
            cookies: {
                accessToken: 'test token',
            },
            params: {
                submissionId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.submissionId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('toggle like - VALID', async () => {
            const expectedRes = {
                likeId: mockSubsmissionResponse,
            };
            await submissionController.toggleLike(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('toggle like - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await submissionController.toggleLike(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('toggle like - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await submissionController.toggleLike(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('add comment', () => {
        const mockRequest = {
            cookies: {
                accessToken: 'test token',
            },
            params: {
                submissionId: null,
            },
            body: {
                message: null,
            }
        };

        beforeEach(() => {
            mockRequest.params.submissionId = mockuuid;
            mockRequest.body.message = 'test message';
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('add comment - VALID', async () => {
            const expectedRes = {
                commentId: mockSubsmissionResponse,
            };
            await submissionController.addComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add comment - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await submissionController.addComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add comment - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await submissionController.addComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add comment - INVALID null message', async () => {
            const expectedRes = {
                error: '📌message is a required field',
            };
            mockRequest.body.message = null;
            await submissionController.addComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add comment - INVALID no message', async () => {
            const expectedRes = {
                error: '📌message is a required field',
            };
            mockRequest.body.message = '';
            await submissionController.addComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add comment - INVALID message not a string', async () => {
            const expectedRes = {
                error: '📌message is a required field',
            };
            mockRequest.body.message = 45.6;
            await submissionController.addComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('remove comment', () => {
        const mockRequest = {
            cookies: {
                accessToken: 'test token',
            },
            params: {
                submissionId: null,
                commentId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.submissionId = mockuuid;
            mockRequest.params.commentId = mockuuid;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('remove comment - VALID', async () => {
            const expectedRes = {
                commentId: mockSubsmissionResponse,
            };
            await submissionController.removeComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove comment - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await submissionController.removeComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove comment - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await submissionController.removeComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove comment - INVALID null commentId', async () => {
            const expectedRes = {
                error: '📌commentId is a required parameter',
            };
            mockRequest.params.commentId = null;
            await submissionController.removeComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove comment - INVALID no commentId', async () => {
            const expectedRes = {
                error: '📌commentId is a required parameter',
            };
            mockRequest.params.commentId = '';
            await submissionController.removeComment(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });
});
