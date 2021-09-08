const express = require('express');
const path = require('path');
// const proxy = require('express-http-proxy');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const logger = require('./utils/logger');
const submissionController = require('./controllers/submission');
const adminController = require('./controllers/admin');
const bouncerController = require('./controllers/bouncer');
const eventsController = require('./controllers/events');
const pageRouter = require('./controllers/router');
const multerUtil = require('./utils/multer');
const mongoUtil = require('./utils/mongoDb');

const PORT = process.env.PORT || 3000;

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

app.get('/bulletin', bouncerController.checkIfLoggedIn, pageRouter.splashPage);

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// basic useful endpoints
app.get('/bulletin/api/events', eventsController.getAllEvents);
app.get('/bulletin/:event/api', eventsController.getEvent);

// add or update submission || add bouncerController.checkIfLoggedIn for production
app.post('/bulletin/api/:event/submission/add', submissionController.addSubmission);
app.post('/bulletin/api/submission/update/:submissionId/delete', submissionController.deleteSubmission);
app.post('/bulletin/api/submission/update/:submissionId/update', submissionController.updateSubmission);
app.post('/bulletin/api/submission/update/:submissionId/upload/:type', multerUtil.submissionFileOptions.single('file'), submissionController.submissionFileUpload);
app.post('/bulletin/api/submission/update/:submissionId/like/add', submissionController.addLike);
app.post('/bulletin/api/submission/update/:submissionId/comment/add', submissionController.addComment);
app.post('/bulletin/api/submission/update/:submissionId/like/remove', submissionController.removeLike);
app.post('/bulletin/api/submission/update/:submissionId/comment/remove', submissionController.removeComment);

// request submission data/files
app.get('/bulletin/api/submission/get/one/:submissionId/download/:type', submissionController.submissionFileDownload);
app.get('/bulletin/api/submission/get/one/:submissionId', submissionController.getSingleSubmission);
app.get('/bulletin/api/submission/get/all', submissionController.getAllSubmissions);
app.get('/bulletin/api/:event/submission/get/all', submissionController.getAllSubmissionsByEvent);
app.post('/bulletin/api/submission/get/query', submissionController.getMultipleSubmissions);

// get help
app.get('/bulletin/api/submission/help', submissionController.sendHelpLinks);
app.get('/bulletin/api/submission/help/submissionFields', submissionController.getSubmissionUploadFields);
app.get('/bulletin/api/submission/help/queryFields', submissionController.getSubmissionQueryFields);
app.get('/bulletin/api/submission/help/instructions', submissionController.getSubmissionInstructions);
app.get('/bulletin/api/submission/help/instructions/file', submissionController.getSubmissionFileInstructions);

// admin
app.post('/bulletin/api/admin/add/event', adminController.addEvent);
app.post('/bulletin/api/:event/admin/add/accolade', adminController.addAccolade);
app.post('/bulletin/api/:event/admin/add/challenge', adminController.addChallenge);
app.post('/bulletin/api/:event/admin/remove/event', adminController.removeEvent);
app.post('/bulletin/api/:event/admin/remove/accolades', adminController.removeAccolades);
app.post('/bulletin/api/:event/admin/remove/challenges', adminController.removeChallenges);
app.post('/bulletin/api/:event/admin/update/accolade', adminController.updateAccolade);
app.post('/bulletin/api/:event/admin/update/event', adminController.updateEvent);

// app.use('/*', (req, res) => res.redirect(`${process.env.REDIRECT_URL}`));

mongoUtil.dbInit();

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
