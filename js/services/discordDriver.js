const tagRequest = async (tag) => {
    // get userAuthId from discord tag with harmonia
    const userObj = {
        userAuthId: `test-user-${Date.now()}`,
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
