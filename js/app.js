const express = require('express');
const path = require('path');
const proxy = require('express-http-proxy');
require('dotenv').config();
const logger = require('./utils/logger');
const submissionController = require('./controllers/submission');
const bouncerController = require('./controllers/bouncer');
const pageRouter = require('./controllers/router');
const multerUtil = require('./utils/multer');
const config = require('./utils/config');

const PORT = process.env.PORT || 3000;

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

app.get('/', pageRouter.loginPage);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// add or alter submissions data
app.post('/bulletin/api/submission/add', bouncerController.checkIfLoggedIn, submissionController.addSubmission);
app.post('/bulletin/api/submission/:submissionId/delete', bouncerController.checkIfLoggedIn, submissionController.deleteSubmission);
app.post('/bulletin/api/submission/:submissionId/update', bouncerController.checkIfLoggedIn, submissionController.updateSubmission);
app.post('/bulletin/api/submission/:submissionId/upload/sourceCode', bouncerController.checkIfLoggedIn, multerUtil.submissionFileOptions.single('file'), submissionController.sourceCodeUpload);
app.post('/bulletin/api/submission/:submissionId/upload/icon', bouncerController.checkIfLoggedIn, multerUtil.submissionIconOptions.single('file'), submissionController.iconUpload);
app.post('/bulletin/api/submission/:submissionId/upload/photos', bouncerController.checkIfLoggedIn, multerUtil.submissionPhotosOptions.single('file'), submissionController.photosUpload);
app.post('/bulletin/api/submission/:submissionId/upload/markdown', bouncerController.checkIfLoggedIn, multerUtil.submissionMarkdownOptions.single('file'), submissionController.markdownUpload);
app.post('/bulletin/api/submission/:submissionId/like/add', bouncerController.checkIfLoggedIn, submissionController.addLike);
app.post('/bulletin/api/submission/:submissionId/comment/add', bouncerController.checkIfLoggedIn, submissionController.addComment);
app.post('/bulletin/api/submission/:submissionId/like/remove', bouncerController.checkIfLoggedIn, submissionController.removeLike);
app.post('/bulletin/api/submission/:submissionId/comment/remove', bouncerController.checkIfLoggedIn, submissionController.removeComment);

// get submission data
app.get('/bulletin/api/submission/:submissionId/download/sourceCode', submissionController.sourceCodeDownload);
app.get('/bulletin/api/submission/:submissionId/download/icon', submissionController.iconDownload);
app.get('/bulletin/api/submission/:submissionId/download/photos', submissionController.photosDownload);
app.get('/bulletin/api/submission/:submissionId/download/markdown', submissionController.markdownDownload);
app.get('/bulletin/api/submission/:submissionId', submissionController.getSingleSubmission);
app.get('/bulletin/api/submission/all', submissionController.getAllSubmissions);
app.post('/bulletin/api/submission/query', submissionController.getMultipleSubmissions);

// query api functionality
app.get('/bulletin/api/submission/help/uploadFields', submissionController.getSubmissionUploadFields);
app.get('/bulletin/api/submission/help/queryFields', submissionController.getSubmissionQueryFields);

app.use('/*', proxy(config.redirect_url));

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
