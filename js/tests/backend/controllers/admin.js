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
        assert.isDefined(adminController.updateEvent);
        assert.isDefined(adminController.removeEvent);
        assert.isDefined(adminController.removeAccolades);
        assert.isDefined(adminController.removeChallenges);
        assert.isDefined(adminController.updateAccolade);
        assert.isDefined(adminController.uploadChallengeImage);
        assert.isDefined(adminController.uploadEventImage);
        assert.isDefined(adminController.getChallengeImage);
        assert.isDefined(adminController.getChallengeImage);
    });

    const mockServiceResponse = 'success';
    const mockAdminService = {
        addEvent: () => mockServiceResponse,
        removeEvent: () => mockServiceResponse,
        updateEvent: () => mockServiceResponse,
        addChallenge: () => mockServiceResponse,
        removeChallenges: () => mockServiceResponse,
        addAccolade: () => mockServiceResponse,
        removeAccolades: () => mockServiceResponse,
        updateAccolade: () => mockServiceResponse,
    };
    adminController.setAdminService(mockAdminService);

    // spies
    sinon.spy(mockResponse, 'status');
    sinon.spy(mockResponse, 'send');
    sinon.spy(mockResponse, 'json');
    sinon.spy(mockResponse, 'download');

    describe('add event tests', () => {
        const mockRequest = {
            body: {
                name: null,
                description: null,
                start_time: null,
                end_time: null,
            },
        };

        beforeEach(() => {
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
    });

    describe('remove event tests', () => {
        const mockRequest = {
            params: {
                event: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.event = 'Test Event';
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
        it('remove event - INVALID null event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = null;
            await adminController.removeEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove event - INVALID no event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = '';
            await adminController.removeEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('update event tests', () => {
        const mockRequest = {
            params: {
                event: null,
            },
            body: {},
        };

        beforeEach(() => {
            mockRequest.body = {};
            mockRequest.params.event = 'Test Event';
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('update event - VALID name', async () => {
            const expectedRes = {
                modifiedCount: mockServiceResponse,
            };
            mockRequest.body.name = 'Test Edit Name',
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - VALID description', async () => {
            mockRequest.body.description = 'Test Event Description';
            const expectedRes = {
                modifiedCount: mockServiceResponse,
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - VALID start time', async () => {
            mockRequest.body.start_time = currDate.toISOString();
            const expectedRes = {
                modifiedCount: mockServiceResponse,
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - VALID end time', async () => {
            const nextDate = new Date();
            nextDate.setDate(currDate.getDate() + 1); 
            mockRequest.body.end_time = nextDate.toISOString();
            const expectedRes = {
                modifiedCount: mockServiceResponse,
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - VALID both times', async () => {
            mockRequest.body.start_time = currDate.toISOString();
            const nextDate = new Date();
            nextDate.setDate(currDate.getDate() + 1); 
            mockRequest.body.end_time = nextDate.toISOString();
            const expectedRes = {
                modifiedCount: mockServiceResponse,
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - INVALID both times', async () => {
            mockRequest.body.start_time = currDate.toISOString();
            const nextDate = new Date();
            nextDate.setDate(currDate.getDate() - 1); 
            mockRequest.body.end_time = nextDate.toISOString();
            const expectedRes = {
                error: '📌invalid start_time & end_time',
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - INVALID start time', async () => {
            mockRequest.body.start_time = 34;
            const expectedRes = {
                error: '📌start_time is invalid',
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - INVALID end time', async () => {
            mockRequest.body.end_time = new Date();
            const expectedRes = {
                error: '📌end_time is invalid',
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - INVALID description', async () => {
            mockRequest.body.description = 0.4;
            const expectedRes = {
                error: '📌description is invalid',
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - INVALID name', async () => {
            mockRequest.body.name = 45;
            const expectedRes = {
                error: '📌name is invalid',
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('add accolade tests', () => {
        const mockRequest = {
            params: {
                event: null,
            },
            body: {
                name: null,
                description: null,
                emoji: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.event = 'Test Event';
            mockRequest.body.name = 'Test Accolade';
            mockRequest.body.description = null;
            mockRequest.body.emoji = null;
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
        it('add accolade - VALID event, name, description, emoji, & challenge', async () => {
            mockRequest.body.description = 'accolade description';
            mockRequest.body.emoji = '🍇';
            mockRequest.body.challenge = 'Test Challenge';
            const expectedRes = {
                accoladeId: mockServiceResponse,
            };
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - INVALID null event', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = null;
            await adminController.addAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add accolade - INVALID no event', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = '';
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

    describe('remove accolades tests', () => {
        const mockRequest = {
            params: {
                event: null,
            },
            body: {
                accolades: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.event = 'Test Event';
            mockRequest.body.accolades = [];
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('remove accolades - VALID', async () => {
            const expectedRes = {
                accoladeIds: mockServiceResponse,
            };
            await adminController.removeAccolades(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove accolades - INVALID null event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = null;
            await adminController.removeAccolades(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove accolades - INVALID no event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = '';
            await adminController.removeAccolades(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove accolades - INVALID accolades list', async () => {
            const expectedRes = {
                error: '📌accolades is a required field',
            };
            mockRequest.body.accolades = '';
            await adminController.removeAccolades(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

    describe('update accolade tests', () => {
        const mockRequest = {
            params: {
                event: null,
            },
            body: {
                accolade: null,
                name: null,
                description: null,
                emoji: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.event = 'Test Event';
            mockRequest.body.accolade = 'Test Accolade';
            mockRequest.body.name = null;
            mockRequest.body.description = null;
            mockRequest.body.emoji = null;
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('update accolade - VALID', async () => {
            const expectedRes = {
                modifiedCount: mockServiceResponse,
            };
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update accolade - VALID all fields', async () => {
            const expectedRes = {
                modifiedCount: mockServiceResponse,
            };
            mockRequest.body.name = 'New Name';
            mockRequest.body.description = 'test description';
            mockRequest.body.emoji = '🍇';
            mockRequest.body.challenge = 'Challenge change';
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update accolade - INVALID null event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = null;
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update accolade - INVALID no event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = '';
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update accolade - INVALID null accolade', async () => {
            const expectedRes = {
                error: '📌accolade is a required field',
            };
            mockRequest.body.accolade = null;
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update accolade - INVALID no accolade', async () => {
            const expectedRes = {
                error: '📌accolade is a required field',
            };
            mockRequest.body.accolade = null;
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update accolade - INVALID bad name', async () => {
            const expectedRes = {
                error: '📌name must be a string',
            };
            mockRequest.body.name = 45;
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update accolade - INVALID bad description', async () => {
            const expectedRes = {
                error: '📌description must be a string',
            };
            mockRequest.body.description = [];
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update accolade - INVALID bad emoji', async () => {
            const expectedRes = {
                error: '📌emoji must be a string',
            };
            mockRequest.body.emoji = 45;
            await adminController.updateAccolade(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });
    describe('add challenge tests', () => {
        const mockRequest = {
            params: {
                event: null,
            },
            body: {
                name: null,
                questions: null,
                places: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.event = 'Test Event';
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
        it('add challenge - INVALID no event', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = null;
            await adminController.addChallenge(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('add challenge - INVALID no event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = '';
            await adminController.updateAccolade(mockRequest, mockResponse);
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
    describe('remove challenges tests', () => {
        const mockRequest = {
            params: {
                event: null,
            },
            body: {
                challenges: null,
            },
        };

        beforeEach(() => {
            mockRequest.params.event = 'Test Event';
            mockRequest.body.challenges = [];
        });

        afterEach(() => {
            sinon.reset(mockResponse, 'status');
            sinon.reset(mockResponse, 'json');
            sinon.reset(mockResponse, 'send');
            sinon.reset(mockResponse, 'download');
        });

        it('remove challenges - VALID', async () => {
            const expectedRes = {
                challengeIds: mockServiceResponse,
            };
            await adminController.removeChallenges(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove challenges - INVALID null event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = null;
            await adminController.removeChallenges(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove challenges - INVALID no event parameter', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = '';
            await adminController.removeChallenges(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('remove challenges - INVALID challenges list', async () => {
            const expectedRes = {
                error: '📌challenges is a required field',
            };
            mockRequest.body.challenges = '';
            await adminController.removeChallenges(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });
});
