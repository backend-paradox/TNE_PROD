/**
 * Auth Service Repositories
 *
 * Exports all repository instances for the auth service.
 */

const userRepository = require('./user.repository');
const {
  refreshTokenRepository,
  oAuthProviderRepository,
  deviceSessionRepository,
  loginHistoryRepository,
  securityEventRepository,
} = require('./token.repository');

module.exports = {
  userRepository,
  refreshTokenRepository,
  oAuthProviderRepository,
  deviceSessionRepository,
  loginHistoryRepository,
  securityEventRepository,
};
