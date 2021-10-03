const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

// controllers
const submissionController = require('./controllers/submission');
const adminController = require('./controllers/admin');
const eventController = require('./controllers/event');
const pageRouter = require('./controllers/router');

// middlewares
const bouncerMiddleware = require('./middleware/bouncer');
// const slugMiddleware = require('./middleware/slugs');

// utilities
const multerUtil = require('./utils/multer');
const mongoUtil = require('./utils/mongoDb');
const logger = require('./utils/logger');

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

app.get('/bulletin', bouncerMiddleware.checkIfLoggedIn(false), pageRouter.splashPage);

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
app.post(`${BASE_PATH}/api/:eventId/submission/add`, bouncerMiddleware.checkIfLoggedIn(), submissionController.addSubmission);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/remove`, bouncerMiddleware.checkIfLoggedIn(), submissionController.removeSubmission);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/upload/:type`, bouncerMiddleware.checkIfLoggedIn(), multerUtil.submissionFileOptions.single('file'), submissionController.submissionFileUpload);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/like/add`, bouncerMiddleware.checkIfLoggedIn(), submissionController.addLike);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/comment/add`, bouncerMiddleware.checkIfLoggedIn(), submissionController.addComment);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/like/remove`, bouncerMiddleware.checkIfLoggedIn(), submissionController.removeLike);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/comment/remove`, bouncerMiddleware.checkIfLoggedIn(), submissionController.removeComment);

/**
 * admin enpoints
 */
app.post(`${BASE_PATH}/api/admin/add/event`, bouncerMiddleware.checkIfLoggedIn(true), adminController.addEvent);
app.post(`${BASE_PATH}/api/:eventId/admin/add/accolade`, bouncerMiddleware.checkIfLoggedIn(true), adminController.addAccolade);
app.post(`${BASE_PATH}/api/:eventId/admin/add/challenge`, bouncerMiddleware.checkIfLoggedIn(true), adminController.addChallenge);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/event`, bouncerMiddleware.checkIfLoggedIn(true), adminController.removeEvent);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/accolade/:accoladeId`, bouncerMiddleware.checkIfLoggedIn(true), adminController.removeAccolade);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/challenge/:challengeId`, bouncerMiddleware.checkIfLoggedIn(true), adminController.removeChallenge);
app.post(`${BASE_PATH}/api/:eventId/admin/upload/eventImage`, bouncerMiddleware.checkIfLoggedIn(true), multerUtil.adminUploadOptions.single('file'), adminController.uploadEventImage);
app.post(`${BASE_PATH}/api/:eventId/admin/upload/challengeImage/:challenge`, bouncerMiddleware.checkIfLoggedIn(true), multerUtil.adminUploadOptions.single('file'), adminController.uploadChallengeImage);

if (process.env.NODE_ENV !== 'production')
    app.use('/', createProxyMiddleware({ target: 'https://tamudatathon.com', changeOrigin: true, hostRewrite: true }));

// initialize mongodb
mongoUtil.dbInit();

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
