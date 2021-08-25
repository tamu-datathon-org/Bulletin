const express = require('express');
const path = require('path');
const logger = require('./utils/logger');
const submissionController = require('./controllers/submission');
const bouncerController = require('./controllers/bouncer');
const pageRouter = require('./controllers/router');

const PORT = 3000;

const app = express();

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'pug');

app.get('/', pageRouter.loginPage);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/submission/add', bouncerController.isParticipant, submissionController.addSubmission);

app.listen(PORT, () => {
    logger.info(`📌📌📌Listening on port ${PORT}📌📌📌`);
});
