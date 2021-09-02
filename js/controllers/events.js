const eventsService = require('../services/events');
const logger = require('../utils/logger');

const getEvent = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        if ((event?.length ?? 0) === 0) throw new Error('📌event is a required parameter');
        response.result = await eventsService.getEventByName(event);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

module.exports = {
    getEvent,
};
