const express = require('express');
const path = require('path');
// const proxy = require('express-http-proxy');
require('dotenv').config();
const logger = require('./utils/logger');
const submissionController = require('./controllers/submission');
const bouncerController = require('./controllers/bouncer');
const pageRouter = require('./controllers/router');
const multerUtil = require('./utils/multer');
// const config = require('./utils/config');

const PORT = process.env.PORT || 3000;

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

app.get('/', pageRouter.loginPage);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// add or update submission
app.post('/bulletin/api/submission/add', bouncerController.checkIfLoggedIn, submissionController.addSubmission);
app.post('/bulletin/api/submission/update/:submissionId/delete', bouncerController.checkIfLoggedIn, submissionController.deleteSubmission);
app.post('/bulletin/api/submission/update/:submissionId/update', bouncerController.checkIfLoggedIn, submissionController.updateSubmission);
app.post('/bulletin/api/submission/update/:submissionId/upload/:type', bouncerController.checkIfLoggedIn, multerUtil.submissionFileOptions.single('file'), submissionController.submissionFileUpload);
app.post('/bulletin/api/submission/update/:submissionId/like/add', bouncerController.checkIfLoggedIn, submissionController.addLike);
app.post('/bulletin/api/submission/update/:submissionId/comment/add', bouncerController.checkIfLoggedIn, submissionController.addComment);
app.post('/bulletin/api/submission/update/:submissionId/like/remove', bouncerController.checkIfLoggedIn, submissionController.removeLike);
app.post('/bulletin/api/submission/update/:submissionId/comment/remove', bouncerController.checkIfLoggedIn, submissionController.removeComment);

// request submission data/files
app.get('/bulletin/api/submission/get/one/:submissionId/download/:type', submissionController.submissionFileDownload);
app.get('/bulletin/api/submission/get/one/:submissionId', submissionController.getSingleSubmission);
app.get('/bulletin/api/submission/get/all', submissionController.getAllSubmissions);
app.post('/bulletin/api/submission/get/query', submissionController.getMultipleSubmissions);

// get help
app.get('/bulletin/api/submission/help', submissionController.sendHelpLinks);
app.get('/bulletin/api/submission/help/submissionFields', submissionController.getSubmissionUploadFields);
app.get('/bulletin/api/submission/help/queryFields', submissionController.getSubmissionQueryFields);
app.get('/bulletin/api/submission/help/instructions', submissionController.getSubmissionInstructions);
app.get('/bulletin/api/submission/help/instructions/file', submissionController.getSubmissionFileInstructions);

// app.use('/*', proxy(config.redirect_url));

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
