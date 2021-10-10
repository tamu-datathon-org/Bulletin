/* eslint-env mocha */
const { assert } = require('chai');
// const logger = require('../../../utils/logger');
const submissionService = require('../../../services/submission');

describe('submission service', () => {
    it('is defined', async () => {
        assert.isDefined(submissionService.addComment);
        assert.isDefined(submissionService.addSubmission);
        assert.isDefined(submissionService.getSubmission);
        assert.isDefined(submissionService.getSubmissionFile);
        assert.isDefined(submissionService.getSubmissions);
        assert.isDefined(submissionService.getSubmissionsByUserAuthId);
        assert.isDefined(submissionService.removeSubmission);
        assert.isDefined(submissionService.getUserSubmissionLinkBySubmissionIdAndUserAuthId);
        assert.isDefined(submissionService.toggleLike);
        assert.isDefined(submissionService.uploadSubmissionFile);
    });
});