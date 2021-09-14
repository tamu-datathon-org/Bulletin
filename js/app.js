const express = require('express');
const path = require('path');
// const proxy = require('express-http-proxy');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const logger = require('./utils/logger');
const submissionController = require('./controllers/submission');
const adminController = require('./controllers/admin');
const bouncerController = require('./controllers/bouncer');
const eventController = require('./controllers/event');
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

/**
 * basic useful endpoints
 */
// ==================== events ===========================
app.get('/bulletin/api/events', eventController.getAllEvents);
app.get('/bulletin/api/:eventId', eventController.getEvent);
// =================== accolades ==========================
app.get('/bulletin/api/:eventId/accolade/:accoladeId', eventController.getAccolade);
app.get('/bulletin/api/:eventId/accolade', eventController.getAccolades);
// =================== challenges =========================
app.get('/bulletin/api/:eventId/challenge/:challengeId', eventController.getChallenge);
app.get('/bulletin/api/:eventId/challenge', eventController.getChallenges);
// ============== download frontend images ================
app.get('/bulletin/api/:eventId/download/eventImage', eventController.getEventImage);
app.get('/bulletin/api/:eventId/download/challengeImage/:challengeId', eventController.getChallengeImage);
// ================== submissions =========================
app.get('/bulletin/api/:eventId/submission/:submissionId', eventController.getSubmission);
app.get('/bulletin/api/:eventId/submission', eventController.getSubmissions);
// ============ download submission files ================
app.get('/bulletin/api/:eventId/submission/:submissionId/download/photos', eventController.getSubmissionIcon);
app.get('/bulletin/api/:eventId/submission/:submissionId/download/icon', eventController.getSubmissionPhotos);
app.get('/bulletin/api/:eventId/submission/:submissionId/download/markdown', eventController.getSubmissionMarkdown);
app.get('/bulletin/api/:eventId/submission/:submissionId/download/sourcecode', eventController.getSubmissionSourceCode);

/**
 * submission endpoints
 * note: for the "add" endpoint, append /?submissionId=submissionId to upsert
 */
app.post('/bulletin/api/:event/submission/add', submissionController.addSubmission);
app.post('/bulletin/api/submission/update/:submissionId/delete', submissionController.removeSubmission);
app.post('/bulletin/api/submission/update/:submissionId/upload/:type', multerUtil.submissionFileOptions.single('file'), submissionController.submissionFileUpload);
app.post('/bulletin/api/submission/update/:submissionId/like/add', submissionController.addLike);
app.post('/bulletin/api/submission/update/:submissionId/comment/add', submissionController.addComment);
app.post('/bulletin/api/submission/update/:submissionId/like/remove', submissionController.removeLike);
app.post('/bulletin/api/submission/update/:submissionId/comment/remove', submissionController.removeComment);

/**
 * admin enpoints
 * note: for all the "add" endpoints, append /?<object>Id=<objectId> to upsert
 */
app.post('/bulletin/api/admin/add/event', adminController.addEvent);
app.post('/bulletin/api/:eventId/admin/add/accolade', adminController.addAccolade);
app.post('/bulletin/api/:eventId/admin/add/challenge', adminController.addChallenge);
app.post('/bulletin/api/:eventId/admin/remove/event', adminController.removeEvent);
app.post('/bulletin/api/:eventId/admin/remove/accolade/:accoladeId', adminController.removeAccolade);
app.post('/bulletin/api/:eventId/admin/remove/challenge/:challengeId', adminController.removeChallenge);
app.post('/bulletin/api/:eventId/admin/upload/eventImage', multerUtil.adminUploadOptions.single('file'), adminController.uploadEventImage);
app.post('/bulletin/api/:eventId/admin/upload/challengeImage/:challenge', multerUtil.adminUploadOptions.single('file'), adminController.uploadChallengeImage);

// initialize mongodb
mongoUtil.dbInit();

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
