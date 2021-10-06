/* eslint-env mocha */
const { assert, expect } = require('chai');
const sinon = require('sinon');
// const logger = require('../../../utils/logger');
const adminService = require('../../../services/admin');

describe('admin service', () => {
    /*
    const mockModelResponse = 'Success';
    const mockAccoladeModel = {
        createAccolade: () => mockModelResponse,
        addAccolade: () => mockModelResponse,
        removeAccolade: () => mockModelResponse,
        removeAccoladeByName: () => mockModelResponse,
        getAccolade: () => mockModelResponse,
        getAccoladeByName: () => mockModelResponse,
        getAccoladesByNames: () => mockModelResponse,
        updateAccolade: () => mockModelResponse,
    };
    const mockChallengeModel = {
        createChallenge: () => mockModelResponse,
        addChallenge: () => mockModelResponse,
        removeChallenge: () => mockModelResponse,
        removeChallengeByName: () => mockModelResponse,
        getChallenge: () => mockModelResponse,
        getChallengeByName: () => mockModelResponse,
        getChallengesByNames: () => mockModelResponse,
        updateChallenge: () => mockModelResponse,
        addChallengeAccoladeId: () => mockModelResponse,
        removeChallengeAccoladeId: () => mockModelResponse,
        addChallengeQuestionId: () => mockModelResponse,
        removeChallengeQuestionId: () => mockModelResponse,
        addChallengeSponsorId: () => mockModelResponse,
        removeChallengeSponsorId: () => mockModelResponse,
    };
    const eventModelSpy = sinon.spy();

    const mockEventModel = {
        createEvent: () => { eventModelSpy(); return mockModelResponse; },
        addEvent: () => { eventModelSpy(); return mockModelResponse; },
        removeEventById: () => { eventModelSpy(); return mockModelResponse; },
        removeEventByName: () => { eventModelSpy(); return mockModelResponse; },
        getEventById: () => { eventModelSpy(); return mockModelResponse; },
        getEventByName: () => { eventModelSpy(); return mockModelResponse; },
        getAllEvents: () => { eventModelSpy(); return mockModelResponse; },
        updateEvent: () => { eventModelSpy(); return mockModelResponse; },
        addEventAccoladeId: () => { eventModelSpy(); return mockModelResponse; },
        removeEventAccoladeId: () => { eventModelSpy(); return mockModelResponse; },
        addEventChallengeId: () => { eventModelSpy(); return mockModelResponse; },
        removeEventChallengeId: () => { eventModelSpy(); return mockModelResponse; },
        addEventSubmissionId: () => { eventModelSpy(); return mockModelResponse; },
        removeEventSubmissionId: () => { eventModelSpy(); return mockModelResponse; },
    };
    const mockQuestionModel = {
        createQuestion: () => mockModelResponse,
        addQuestion: () => mockModelResponse,
        removeQuestion: () => mockModelResponse,
        removeQuestionByText: () => mockModelResponse,
        updateQuestion: () => mockModelResponse,
        getQuestionByText: () => mockModelResponse,
        getQuestionsByTexts: () => mockModelResponse,
    };
    */
    // const currDate = new Date();

    it('is defined', async () => {
        assert.isDefined(adminService.addAccolade);
        assert.isDefined(adminService.removeAccolade);
        assert.isDefined(adminService.addEvent);
        assert.isDefined(adminService.removeEvent);
        assert.isDefined(adminService.addChallenge);
        assert.isDefined(adminService.removeChallenge);
        assert.isDefined(adminService.removeSubmission);
        assert.isDefined(adminService.uploadChallengeImage);
        assert.isDefined(adminService.uploadEventImage);
    });

    /*
    describe('event tests', () => {
        const mockRequestBody = {
            name: 'Test_Event',
            description: 'Test Description',
            start_time: 'start time',
            end_time: 'end time',
        };

        beforeEach(() => {
            mockRequestBody.name = 'Test_Event';
            mockRequestBody.description = 'Test Description';
            mockRequestBody.start_time = 'start time';
            mockRequestBody.end_time = 'end time';
            adminService.setEventModel(mockEventModel);
            adminService.setChallengeModel(mockChallengeModel);
            adminService.setAccoladeModel(mockAccoladeModel);
            adminService.setQuestionModel(mockQuestionModel);
        });

        afterEach(() => {
            sinon.reset(eventModelSpy);
        });

        it('add event - VALID', async () => {
            const mockEventModel2 = {
                getEventByName: () => { eventModelSpy(); return null; },
                createEvent: () => { eventModelSpy(); return mockModelResponse; },
                addEvent: () => { eventModelSpy(); return mockModelResponse; },
            };
            adminService.setEventModel(mockEventModel2);
            const result = await adminService.addEvent(
                mockRequestBody.name, 
                mockRequestBody.description,
                mockRequestBody.start_time,
                mockRequestBody.end_time,
            );
            expect(eventModelSpy.callCount).to.be.equal(3);
            expect(result).to.be.equal(mockModelResponse);
        });
        it('add event - INVALID', async () => {
            try {
                await adminService.addEvent(
                    mockRequestBody.name, 
                    mockRequestBody.description,
                    mockRequestBody.start_time,
                    mockRequestBody.end_time,
                );
            } catch (err) {
                expect(err.message).to.equal(`📌event ${mockRequestBody.name} already exists`);
            }
            expect(eventModelSpy.callCount).to.be.equal(1);
        });
        it('remove event - VALID', async () => {
            const result = await adminService.removeEvent(mockRequestBody.name);
            expect(eventModelSpy.callCount).to.be.equal(2);
            expect(result).to.be.equal(mockModelResponse);
        });
        it('remove event - INVALID', async () => {
            const mockEventModel2 = {
                getEventByName: () => { eventModelSpy(); return null; },
            };
            adminService.setEventModel(mockEventModel2);
            try {
                await adminService.removeEvent(mockRequestBody.name);
            } catch (err) {
                expect(err.message).to.equal(`📌event ${mockRequestBody.name} does not exist`);
            }
            expect(eventModelSpy.callCount).to.be.equal(1);
        });
        it('update event - VALID', async () => {
            const result = await adminService.updateEvent(
                mockRequestBody.name, 
                mockRequestBody.description,
                mockRequestBody.start_time,
                mockRequestBody.end_time,
            );
            expect(eventModelSpy.callCount).to.be.equal(2);
            expect(result).to.be.equal(mockModelResponse);
        });
        it('update event - INVALID', async () => {
            const mockEventModel2 = {
                getEventByName: () => { eventModelSpy(); return null; },
            };
            adminService.setEventModel(mockEventModel2);
            try {
                await adminService.updateEvent(
                    mockRequestBody.name, 
                    mockRequestBody.description,
                    mockRequestBody.start_time,
                    mockRequestBody.end_time,
                );
            } catch (err) {
                expect(err.message).to.equal(`📌event ${mockRequestBody.name} does not exist`);
            }
            expect(eventModelSpy.callCount).to.be.equal(1);
        });
    });
    */
});
