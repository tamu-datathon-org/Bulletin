const express = require('express');
const path = require('path');
// const fileupload = require('express-fileupload');
const logger = require('./utils/logger');
const submissionController = require('./controllers/submission');
const bouncerController = require('./controllers/bouncer');
const pageRouter = require('./controllers/router');
const multerUtil = require('./utils/multer');

const PORT = 3000;

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

app.get('/', pageRouter.loginPage);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.post('/api/submission/add', bouncerController.isParticipant, submissionController.addSubmission);
app.post('/api/submission/delete', bouncerController.isParticipantOrOrganizer, submissionController.deleteSubmission);
app.post('/api/submission/uploadFile/:entryID', multerUtil.submissionFileOptions.single('file'), submissionController.fileUpload);
app.post('/api/submission/submissionsData', submissionController.getSubmissionsData);
app.post('/api/submission/updateSubmissionData', submissionController.updateSubmissionData);
app.get('/api/submission/availableParameters', submissionController.getSubmissionQueryParameters);

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
