const config = require('../utils/config');

exports.splashPage = (req, res) => {
    res.render('login', { title: config.siteName });
};

exports.homePage = (req, res) => {
    res.render('index');
};
