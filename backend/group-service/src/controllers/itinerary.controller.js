const itineraryService = require('../services/itinerary.service');
const ApiResponse = require('../utils/ApiResponse');

const getItinerary = async (req, res, next) => {
  try {
    const { date } = req.query;
    const itinerary = await itineraryService.getGroupItinerary(
      req.params.groupId,
      date
    );
    return ApiResponse.success(res, itinerary);
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const item = await itineraryService.createItem(
      req.params.groupId,
      req.user.id,
      req.body
    );
    return ApiResponse.created(res, item);
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await itineraryService.updateItem(
      req.params.itemId,
      req.user.id,
      req.body
    );
    return ApiResponse.success(res, item, 'Itinerary item updated');
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await itineraryService.deleteItem(req.params.itemId);
    return ApiResponse.success(res, null, 'Itinerary item deleted');
  } catch (error) {
    next(error);
  }
};

const voteOnItem = async (req, res, next) => {
  try {
    const { vote } = req.body; // 'UP' or 'DOWN'
    const result = await itineraryService.voteOnItem(
      req.params.itemId,
      req.user.id,
      vote
    );
    return ApiResponse.success(res, result, 'Vote recorded');
  } catch (error) {
    next(error);
  }
};

const confirmItem = async (req, res, next) => {
  try {
    const item = await itineraryService.confirmItem(req.params.itemId);
    return ApiResponse.success(res, item, 'Itinerary item confirmed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItinerary,
  createItem,
  updateItem,
  deleteItem,
  voteOnItem,
  confirmItem,
};
