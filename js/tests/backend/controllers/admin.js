/* eslint-env mocha */
const { assert, expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../utils/logger');
const adminController = require('../../../controllers/admin');
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

    const currDate = new Date();

    it('is defined', async () => {
        assert.isDefined(adminController.addAccolade);
        assert.isDefined(adminController.addEvent);
        assert.isDefined(adminController.addChallenge);
        assert.isDefined(adminController.removeEvent);
        assert.isDefined(adminController.removeAccolade);
        assert.isDefined(adminController.removeChallenge);
        assert.isDefined(adminController.uploadChallengeImage);
        assert.isDefined(adminController.uploadEventImage);
        assert.isDefined(adminController.removeSubmission);
    });

    const mockServiceResponse = 'success';
    const mockAdminService = {
        addEvent: () => mockServiceResponse,
        removeEvent: () => mockServiceResponse,
        addChallenge: () => mockServiceResponse,
        removeChallenge: () => mockServiceResponse,
        addAccolade: () => mockServiceResponse,
        removeAccolade: () => mockServiceResponse,
        uploadEventImage: () => mockServiceResponse,
        uploadChallengeImage: () => mockServiceResponse,
        removeSubmission: () => mockServiceResponse,
    };

    // set the mock service
    adminController.setAdminService(mockAdminService);

    // spies
    sinon.spy(mockResponse, 'status');
    sinon.spy(mockResponse, 'send');
    sinon.spy(mockResponse, 'json');
    sinon.spy(mockResponse, 'download');

    describe('add event', () => {
        const mockRequest = {
            body: {
                _id: null,
                name: null,
                description: null,
                start_time: null,
                end_time: null,
                show: null,
            },
        };

        beforeEach(() => {
            mockRequest.body._id = null;
            mockRequest.body.name = 'Test Event';
            mockRequest.body.description = 'Test Event Description';
            mockRequest.body.start_time = currDate.toISOString();
            const nextDate = new Date();
            nextDate.setDate(currDate.getDate() + 1); 
            mockRequest.body.end_time = nextDate.toISOString();
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('add event - VALID', async () => {
            const expectedRes = {
                eventId: mockServiceResponse,
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('upsert event - VALID', async () => {
            mockRequest.body._id = '100b039d-1877-49d6-8107-91d2cbcf7931';
            const expectedRes = {
                eventId: mockServiceResponse,
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add event - INVALID start_time & end_time', async () => {
            const invalidDate = new Date(currDate.getDate() - 1);
            mockRequest.body.end_time = invalidDate.toISOString();
            const expectedRes = {
                error: '📌invalid start_time & end_time fields',
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add event - INVALID null name provided', async () => {
            mockRequest.body.name = null;
            const expectedRes = {
                error: '📌name is a required field',
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add event - INVALID no name provided', async () => {
            mockRequest.body.name = '';
            const expectedRes = {
                error: '📌name is a required field',
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add event - INVALID null description provided', async () => {
            mockRequest.body.description = null;
            const expectedRes = {
                error: '📌description is a required field',
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add event - INVALID no description provided', async () => {
            mockRequest.body.description = '';
            const expectedRes = {
                error: '📌description is a required field',
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add event - INVALID no dates provided', async () => {
            mockRequest.body.start_time = '';
            const expectedRes = {
                error: '📌start_time is a required field',
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
            mockRequest.body.start_time = currDate.toISOString();
            mockRequest.body.end_time = null;
            const expectedRes2 = {
                error: '📌end_time is a required field',
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes2)).to.equal(true);
        });
        it('add event - INVALID show is not a boolean', async () => {
            mockRequest.body.show = 'facts';
            const expectedRes = {
                error: '📌show must be a boolean',
            };
            await adminController.addEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('remove event tests', () => {
        const mockRequest = {
            params: {
                eventId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = '100b039d-1877-49d6-8107-91d2cbcf7931';
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('remove event - VALID', async () => {
            const expectedRes = {
                eventId: mockServiceResponse,
            };
            await adminController.removeEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove event - INVALID null eventId parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await adminController.removeEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove event - INVALID no event parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await adminController.removeEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('add accolade tests', () => {
        const mockRequest = {
            params: {
                eventId: null,
            },
            body: {
                _id: null,
                name: null,
                description: null,
                emoji: null,
                challengeId: null,
            },
        };

        beforeEach(() => {
            mockRequest.body._id = null;
            mockRequest.params.eventId = 'Test Event';
            mockRequest.body.name = 'Test Accolade';
            mockRequest.body.description = null;
            mockRequest.body.emoji = null;
            mockRequest.body.challengeId = null;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('add accolade - VALID event & name', async () => {
            const expectedRes = {
                accoladeId: mockServiceResponse,
            };
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('upsert accolade', async () => {
            mockRequest.body._id = '100b039d-1877-49d6-8107-91d2cbcf7931';
            const expectedRes = {
                accoladeId: mockServiceResponse,
            };
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - VALID event, name, description, emoji, & challenge', async () => {
            mockRequest.body.description = 'accolade description';
            mockRequest.body.emoji = '🍇';
            mockRequest.body.challengeId = '100b039d-1877-49d6-8107-91d2cbcf7931';
            const expectedRes = {
                accoladeId: mockServiceResponse,
            };
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - INVALID null event', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - INVALID no event', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - INVALID null name', async () => {
            const expectedRes = {
                error: '📌name is a required field',
            };
            mockRequest.body.name = '';
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - INVALID no name', async () => {
            const expectedRes = {
                error: '📌name is a required field',
            };
            mockRequest.body.name = '';
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - INVALID description', async () => {
            const expectedRes = {
                error: '📌description must be a string',
            };
            mockRequest.body.description = 34;
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - INVALID emoji', async () => {
            const expectedRes = {
                error: '📌emoji must be a string',
            };
            mockRequest.body.emoji = 0.03;
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('remove accolade', () => {
        const mockRequest = {
            params: {
                eventId: null,
                accoladeId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = '100b039d-1877-49d6-8107-91d2cbcf7931';
            mockRequest.params.accoladeId = '100b039d-1877-49d6-8107-91d2cbcf7931';
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('remove accolade - VALID', async () => {
            const expectedRes = {
                accoladeId: mockServiceResponse,
            };
            await adminController.removeAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove accolade - INVALID null eventId parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await adminController.removeAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove accolade - INVALID no eventId parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await adminController.removeAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove accolade - INVALID null accoladeId', async () => {
            const expectedRes = {
                error: '📌accoladeId is a required parameter',
            };
            mockRequest.params.accoladeId = null;
            await adminController.removeAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove accolade - INVALID null accoladeId', async () => {
            const expectedRes = {
                error: '📌accoladeId is a required parameter',
            };
            mockRequest.params.accoladeId = '';
            await adminController.removeAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('add challenge tests', () => {
        const mockRequest = {
            params: {
                eventId: null,
            },
            body: {
                _id: null,
                name: null,
                questions: null,
                places: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = '100b039d-1877-49d6-8107-91d2cbcf7931';
            mockRequest.body._id = null;
            mockRequest.body.name = 'Test Challenge';
            mockRequest.body.places = null;
            mockRequest.body.questions = null;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('add challenge - VALID', async () => {
            const expectedRes = {
                challengeId: mockServiceResponse,
            };
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add challenge - VALID all fields', async () => {
            const expectedRes = {
                challengeId: mockServiceResponse,
            };
            mockRequest.body.questions = ['first question', 'second question'];
            mockRequest.body.places = config.challenges.max_places;
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('upsert challenge - VALID all fields', async () => {
            const expectedRes = {
                challengeId: mockServiceResponse,
            };
            mockRequest.body._id = '100b039d-1877-49d6-8107-91d2cbcf7931';
            mockRequest.body.questions = ['first question', 'second question'];
            mockRequest.body.places = config.challenges.max_places;
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add challenge - INVALID no eventId', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add challenge - INVALID no event parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add challenge - INVALID no name', async () => {
            const expectedRes = {
                error: '📌name is a required field',
            };
            mockRequest.body.name = '';
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add challenge - INVALID places type', async () => {
            const expectedRes = {
                error: '📌places must be a number',
            };
            mockRequest.body.places = 'false';
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add challenge - INVALID places too large', async () => {
            const expectedRes = {
                error: `📌places must be <= ${config.challenges.max_places} and > 0`,
            };
            mockRequest.body.places = 10;
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add challenge - INVALID places too small', async () => {
            const expectedRes = {
                error: `📌places must be <= ${config.challenges.max_places} and > 0`,
            };
            mockRequest.body.places = -1;
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('add challenge - INVALID questions invalid type', async () => {
            const expectedRes = {
                error: '📌questions must be an array',
            };
            mockRequest.body.questions = 'howdy?';
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('remove challenge tests', () => {
        const mockRequest = {
            params: {
                eventId: null,
                challengeId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = '100b039d-1877-49d6-8107-91d2cbcf7931';
            mockRequest.params.challengeId = '100b039d-1877-49d6-8107-91d2cbcf7931';
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('remove challenges - VALID', async () => {
            const expectedRes = {
                challengeId: mockServiceResponse,
            };
            await adminController.removeChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove challenges - INVALID null event parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await adminController.removeChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove challenges - INVALID no event parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await adminController.removeChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove challenges - INVALID null challengeId', async () => {
            const expectedRes = {
                error: '📌challengeId is a required parameter',
            };
            mockRequest.params.challengeId = null;
            await adminController.removeChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove challenges - INVALID no challengeId', async () => {
            const expectedRes = {
                error: '📌challengeId is a required parameter',
            };
            mockRequest.params.challengeId = '';
            await adminController.removeChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('remove submission', () => {
        const mockRequest = {
            params: {
                eventId: null,
                submissionId: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.eventId = '100b039d-1877-49d6-8107-91d2cbcf7931';
            mockRequest.params.submissionId = '100b039d-1877-49d6-8107-91d2cbcf7931';
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('remove submission - VALID', async () => {
            const expectedRes = {
                submissionId: mockServiceResponse,
            };
            await adminController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove submission - INVALID null eventId parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = null;
            await adminController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove submission - INVALID no eventId parameter', async () => {
            const expectedRes = {
                error: '📌eventId is a required parameter',
            };
            mockRequest.params.eventId = '';
            await adminController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove submission - INVALID null submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = null;
            await adminController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });

        it('remove accolade - INVALID no submissionId', async () => {
            const expectedRes = {
                error: '📌submissionId is a required parameter',
            };
            mockRequest.params.submissionId = '';
            await adminController.removeSubmission(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });
});
