/**
 * Group Service Repositories
 *
 * Exports all repository instances for the group service.
 */

const groupRepository = require('./group.repository');
const {
  groupMemberRepository,
  joinRequestRepository,
} = require('./member.repository');

module.exports = {
  groupRepository,
  groupMemberRepository,
  joinRequestRepository,
};
