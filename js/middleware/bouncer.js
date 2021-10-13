const fetch = require('node-fetch');
const { StatusCodes } = require('http-status-codes');

const gatekeeperUrl = process.env.GATEKEEPER_URL || 'https://tamudatathon.com/auth';
const harmoniaUrl = process.env.HARMONIA_URL || 'https://tamudatathon.com/guild';

/**
 * Gatekeeper Authentication middleware generator
 * @param {boolean?} onlyAllowIfAdminstrator If true, middleware will only let request through if logged in user isAdmin
 */
const checkIfLoggedIn = (onlyAllowIfAdminstrator) => async (req, res, next) => {
    const token = req.cookies.accessToken || '';
    const redirectUrl = `${req.baseUrl}${req.path}`;
    const user = req.user;

    // check if the auth middleware has already happened in this request before
    // if the user exists and the request allows for non-admins, let the request through
    if (user && !onlyAllowIfAdminstrator) {
        return next();
    } else if (user && onlyAllowIfAdminstrator && user.isAdmin) {
        // if the user exists and is an admin and its an admin route, let them through
        return next();
    }

    // if there is no auth token cookie then they are definetely not logged in
    if (!token) 
        return res.status(StatusCodes.TEMPORARY_REDIRECT).send({error:`/auth/login?r=/bulletin`}); 

    // there is an auth token cookie, ask gatekeeper if it is valid
    const authRes = await fetch(`${gatekeeperUrl}/user`, {
        headers: {
            Cookie: `accessToken=${token}`,
            Accept: 'application/json',
        }
    });

    // if gatekeeper says user token is invalid send to login page
    if (authRes.status != StatusCodes.OK)
        return res.redirect(`/auth/login?r=${redirectUrl}`); 
    
    const json = await authRes.json();
    
    // if this is configured to only let admins through and user isn't admin, return unauthorized response
    if (onlyAllowIfAdminstrator && !json['isAdmin'])
        return res.status(StatusCodes.UNAUTHORIZED).send();
    
    req.user = json;
    return next();
};

const getAuthId = async (token) => {
    const { authId } = await (await fetch(`${gatekeeperUrl}/user`, {
        headers: {
            Cookie: `accessToken=${token}`,
            Accept: 'application/json',
        }
    })).json();
    if (!authId) throw new Error('📌you are not logged in!');
    return authId;
};

const getDiscordUser = async (discordTag, userAuthId, accessToken) => {
    try {
        let response = null;
        const options = {
            headers: {
                cookie: `accessToken=${accessToken};`,
            },
        };
        if (discordTag) {
            response = await fetch(`${harmoniaUrl}/api/user/?discordInfo=${discordTag}`, options);
        } else if (userAuthId) {
            response = await fetch(`${harmoniaUrl}/api/user/?userAuthId=${userAuthId}`, options);
        }
        return response.json();
    } catch (err) {
        throw new Error('📌getDiscordUser:: you are not logged in!');
    }
};

module.exports = {
    checkIfLoggedIn,
    getAuthId,
    getDiscordUser,
};
