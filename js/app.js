const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
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
const BASE_PATH = process.env.BASE_PATH || '/bulletin';

const app = express();

app.use(cors());

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/bulletin', bouncerController.checkIfLoggedIn(false), pageRouter.splashPage);

/**
 * basic useful endpoints
 */
// ==================== events ===========================
app.get(`${BASE_PATH}/api/events`, eventController.getAllEvents);
app.get(`${BASE_PATH}/api/:eventId`, eventController.getEvent);
// =================== accolades ==========================
app.get(`${BASE_PATH}/api/:eventId/accolade/:accoladeId`, eventController.getAccolade);
app.get(`${BASE_PATH}/api/:eventId/accolade`, eventController.getAccolades);
// =================== challenges =========================
app.get(`${BASE_PATH}/api/:eventId/challenge/:challengeId`, eventController.getChallenge);
app.get(`${BASE_PATH}/api/:eventId/challenge`, eventController.getChallenges);
// ============== download frontend images ================
app.get(`${BASE_PATH}/api/:eventId/download/eventImage`, eventController.getEventImage);
app.get(`${BASE_PATH}/api/:eventId/download/challengeImage/:challengeId`, eventController.getChallengeImage);
// ================== submissions =========================
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId`, eventController.getSubmission);
app.get(`${BASE_PATH}/api/:eventId/submission`, eventController.getSubmissions);
// ============ download submission files ================
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId/download/photos`, eventController.getSubmissionIcon);
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId/download/icon`, eventController.getSubmissionPhotos);
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId/download/markdown`, eventController.getSubmissionMarkdown);
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId/download/sourcecode`, eventController.getSubmissionSourceCode);

/**
 * submission endpoints
 * note: for the "add" endpoint, append /?submissionId=submissionId to upsert
 */
app.post(`${BASE_PATH}/api/:eventId/submission/add`, bouncerController.checkIfLoggedIn(), submissionController.addSubmission);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/remove`, bouncerController.checkIfLoggedIn(), submissionController.removeSubmission);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/upload/:type`, bouncerController.checkIfLoggedIn(), multerUtil.submissionFileOptions.single('file'), submissionController.submissionFileUpload);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/like/add`, bouncerController.checkIfLoggedIn(), submissionController.addLike);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/comment/add`, bouncerController.checkIfLoggedIn(), submissionController.addComment);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/like/remove`, bouncerController.checkIfLoggedIn(), submissionController.removeLike);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/comment/remove`, bouncerController.checkIfLoggedIn(), submissionController.removeComment);

/**
 * admin enpoints
 */
app.post(`${BASE_PATH}/api/admin/add/event`, bouncerController.checkIfLoggedIn(true), adminController.addEvent);
app.post(`${BASE_PATH}/api/:eventId/admin/add/accolade`, bouncerController.checkIfLoggedIn(true), adminController.addAccolade);
app.post(`${BASE_PATH}/api/:eventId/admin/add/challenge`, bouncerController.checkIfLoggedIn(true), adminController.addChallenge);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/event`, bouncerController.checkIfLoggedIn(true), adminController.removeEvent);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/accolade/:accoladeId`, bouncerController.checkIfLoggedIn(true), adminController.removeAccolade);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/challenge/:challengeId`, bouncerController.checkIfLoggedIn(true), adminController.removeChallenge);
app.post(`${BASE_PATH}/api/:eventId/admin/upload/eventImage`, bouncerController.checkIfLoggedIn(true), multerUtil.adminUploadOptions.single('file'), adminController.uploadEventImage);
app.post(`${BASE_PATH}/api/:eventId/admin/upload/challengeImage/:challenge`, bouncerController.checkIfLoggedIn(true), multerUtil.adminUploadOptions.single('file'), adminController.uploadChallengeImage);

if (process.env.NODE_ENV !== 'production')
    app.use('/', createProxyMiddleware({ target: 'https://tamudatathon.com', changeOrigin: true, hostRewrite: true }));

// initialize mongodb
mongoUtil.dbInit();

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
