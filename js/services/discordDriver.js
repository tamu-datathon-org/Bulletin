const tagRequest = async (tag) => {
    // get userAuthId from discord tag with harmonia
    const userAuthId = 'dfsdgsdgsdg';
    if (!userAuthId) throw new Error(`📌${tag} is not a member of the discord!`);
    const userObj = {
        userAuthId: userAuthId,
        discordTag: tag,
    };
    return userObj;
};

const getUserAuthIdsFromTags = async (tagArray) => {
    return Promise.all(tagArray.map(tag => tagRequest(tag)));
};

module.exports = {
    getUserAuthIdsFromTags,
};
