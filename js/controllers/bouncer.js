// use api keys
exports.isAdmin = (req, res, next) => {
    next();
};

exports.isParticipant = (req, res, next) => {
    next();
};

exports.isParticipantOrOrganizer = (req, res, next) => {
    next();
};

// this is temporay, i think we use OAuth
exports.getUsername = (authorization) => {
    const base64Credentials = authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    if (!credentials) {
        throw new Error('no authorization provided');
    }
    const [username, password] = credentials.split(':');
    if (!username || !password) {
        throw new Error('no authorization provided');
    }
    return username;
};
