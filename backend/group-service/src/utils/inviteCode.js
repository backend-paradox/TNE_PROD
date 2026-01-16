/**
 * Generate a random invite code for groups
 * Format: 6-character alphanumeric code (e.g., "XYZ123")
 */
function generateInviteCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0, O, I, 1
  const length = 6;
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

/**
 * Validate invite code format
 */
function isValidInviteCodeFormat(code) {
  return /^[A-Z2-9]{6}$/.test(code);
}

module.exports = {
  generateInviteCode,
  isValidInviteCodeFormat,
};
