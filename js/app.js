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
// ================== all submissions by event =========================
app.get(`${BASE_PATH}/api/:eventId/submission`, eventController.getSubmissions);
// ================== user submissions by userAuth id ========================
app.get(`${BASE_PATH}/api/:eventId/submission/user/:userAuthId`, eventController.getSubmissionsByUserAuthId);
// ================== submission by submission id ======================
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId`, eventController.getSubmission);
// ============ download submission files ================
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId/download/photos`, eventController.getSubmissionIcon);
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId/download/icon`, eventController.getSubmissionPhotos);
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId/download/markdown`, eventController.getSubmissionMarkdown);
app.get(`${BASE_PATH}/api/:eventId/submission/:submissionId/download/sourcecode`, eventController.getSubmissionSourceCode);

/**
 * submission endpoints
 * note: for the "add" endpoint, append /?submissionId=submissionId to upsert
 */
app.post(`${BASE_PATH}/api/:eventId/submission/add/:userAuthId`, submissionController.addSubmission);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/remove/:userAuthId`, submissionController.removeSubmission);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/upload/:type/:userAuthId`, multerUtil.submissionFileOptions.single('file'), submissionController.submissionFileUpload);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/like/:userAuthId`, submissionController.toggleLike);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/comment/add/:userAuthId`, submissionController.addComment);
app.post(`${BASE_PATH}/api/:eventId/submission/:submissionId/comment/:commentId/remove/:userAuthId`, submissionController.removeComment);

/**
 * admin enpoints
 */
app.post(`${BASE_PATH}/api/admin/add/event`, adminController.addEvent);
app.post(`${BASE_PATH}/api/:eventId/admin/add/accolade`, adminController.addAccolade);
app.post(`${BASE_PATH}/api/:eventId/admin/add/challenge`, adminController.addChallenge);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/event`, adminController.removeEvent);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/accolade/:accoladeId`, adminController.removeAccolade);
app.post(`${BASE_PATH}/api/:eventId/admin/remove/challenge/:challengeId`, adminController.removeChallenge);
app.post(`${BASE_PATH}/api/:eventId/admin/upload/eventImage`, multerUtil.adminUploadOptions.single('file'), adminController.uploadEventImage);
app.post(`${BASE_PATH}/api/:eventId/admin/upload/challengeImage/:challenge`, multerUtil.adminUploadOptions.single('file'), adminController.uploadChallengeImage);
app.post(`${BASE_PATH}/api/:eventId/admin/submission/:submissionId/remove`, adminController.removeSubmission);

if (process.env.NODE_ENV !== 'production')
    app.use('/', createProxyMiddleware({ target: 'https://tamudatathon.com', changeOrigin: true, hostRewrite: true }));

// initialize mongodb
mongoUtil.dbInit();

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
