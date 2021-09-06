const eventsService = require('../services/events');
const logger = require('../utils/logger');

const getEvent = async (req, res) => {
    const response = {};
    try {
        const { event } = req.params;
        let full = req.query.full || true;
        if (typeof full === 'string') full = full.toLowerCase() === 'false' ? false : true;
        if ((event?.length ?? 0) === 0) throw new Error('📌event is a required parameter');
        const _event = event.replace(' ', '_');
        response.result = await eventsService.getEventByName(_event, full);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

const getAllEvents = async (req, res) => {
    const response = {};
    try {
        let full = req.query.full || true;
        if (typeof full === 'string') full = full.toLowerCase() === 'false' ? false : true;
        response.result = await eventsService.getAllEvents(full);
        res.status(200).json(response);
    } catch (err) {
        logger.info(err);
        response.error = err.message;
        res.status(400).json(response);
    }
};

module.exports = {
    getEvent,
    getAllEvents,
};
