// ==============================================================================
// Channel Providers Index
// ==============================================================================

const emailChannel = require('./emailChannel');
const smsChannel = require('./smsChannel');
const pushChannel = require('./pushChannel');

module.exports = {
  emailChannel,
  smsChannel,
  pushChannel,
};
