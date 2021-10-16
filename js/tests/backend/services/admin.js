/* eslint-env mocha */
const { assert } = require('chai');
// const logger = require('../../../utils/logger');
const adminService = require('../../../services/admin');

describe('admin service', () => {
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
});
