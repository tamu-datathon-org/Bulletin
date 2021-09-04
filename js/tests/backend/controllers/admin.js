/* eslint-env mocha */
const { assert, expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../utils/logger');
const adminController = require('../../../controllers/admin');

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
    });

    const mockServiceResponse = 'success';
    const mockAdminService = {
        addEvent: () => mockServiceResponse,
        removeEvent: () => mockServiceResponse,
        updateEvent: () => mockServiceResponse,
        getEvent: () => mockServiceResponse,
        addChallenge: () => mockServiceResponse,
        removeChallenges: () => mockServiceResponse,
        addAccolade: () => mockServiceResponse,
        removeAccolade: () => mockServiceResponse,
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
                eventId: mockServiceResponse,
            };
            mockRequest.body.name = 'Test Edit Name',
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - VALID description', async () => {
            mockRequest.body.description = 'Test Event Description';
            const expectedRes = {
                eventId: mockServiceResponse,
            };
            await adminController.updateEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('update event - VALID start time', async () => {
            mockRequest.body.start_time = currDate.toISOString();
            const expectedRes = {
                eventId: mockServiceResponse,
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
                eventId: mockServiceResponse,
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
                eventId: mockServiceResponse,
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

    describe('get event tests', () => {
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

        it('get event - VALID', async () => {
            const expectedRes = {
                result: mockServiceResponse,
            };
            await adminController.getEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(200)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('get event - INVALID null event', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = null;
            await adminController.removeEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
        it('get event - INVALID no event', async () => {
            const expectedRes = {
                error: '📌event is a required parameter',
            };
            mockRequest.params.event = '';
            await adminController.removeEvent(mockRequest, mockResponse);
            expect(mockResponse.status.calledWith(400)).to.equal(true);
            expect(mockResponse.json.calledWith(expectedRes)).to.equal(true);
        });
    });

});
