const pollService = require('../services/poll.service');
const ApiResponse = require('../utils/ApiResponse');

const getPolls = async (req, res, next) => {
  try {
    const { active } = req.query;
    const polls = await pollService.getGroupPolls(
      req.params.groupId,
      active === 'true'
    );
    return ApiResponse.success(res, polls);
  } catch (error) {
    next(error);
  }
};

const getPoll = async (req, res, next) => {
  try {
    const poll = await pollService.getPollById(
      req.params.pollId,
      req.user.id
    );
    return ApiResponse.success(res, poll);
  } catch (error) {
    next(error);
  }
};

const createPoll = async (req, res, next) => {
  try {
    const poll = await pollService.createPoll(
      req.params.groupId,
      req.user.id,
      req.body
    );
    return ApiResponse.created(res, poll);
  } catch (error) {
    next(error);
  }
};

const vote = async (req, res, next) => {
  try {
    const { optionIds } = req.body;
    const result = await pollService.vote(
      req.params.pollId,
      req.user.id,
      optionIds
    );
    return ApiResponse.success(res, result, 'Vote recorded');
  } catch (error) {
    next(error);
  }
};

const closePoll = async (req, res, next) => {
  try {
    const poll = await pollService.closePoll(req.params.pollId, req.user.id);
    return ApiResponse.success(res, poll, 'Poll closed');
  } catch (error) {
    next(error);
  }
};

const deletePoll = async (req, res, next) => {
  try {
    // Fix: Pass userId for authorization check
    await pollService.deletePoll(req.params.pollId, req.user.id);
    return ApiResponse.success(res, null, 'Poll deleted');
  } catch (error) {
    next(error);
  }
};

const addOption = async (req, res, next) => {
  try {
    const { text } = req.body;
    const poll = await pollService.addOption(req.params.pollId, req.user.id, text);
    return ApiResponse.success(res, poll, 'Option added');
  } catch (error) {
    next(error);
  }
};

const removeOption = async (req, res, next) => {
  try {
    const poll = await pollService.removeOption(
      req.params.pollId,
      req.params.optionId,
      req.user.id
    );
    return ApiResponse.success(res, poll, 'Option removed');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPolls,
  getPoll,
  createPoll,
  vote,
  closePoll,
  deletePoll,
  addOption,
  removeOption,
};
