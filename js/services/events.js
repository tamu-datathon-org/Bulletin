const eventsModel = require('../models/events');

const getEventByName = async (eventName) => {
    return eventsModel.getEventByName(eventName);
};

module.exports = {
    getEventByName,
};
