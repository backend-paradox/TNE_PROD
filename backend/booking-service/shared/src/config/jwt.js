const jwt = require('jsonwebtoken');
const { TOKEN_TYPES } = require('../utils/constants');

const generateToken = (payload, type = TOKEN_TYPES.ACCESS) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const expiresIn = {
    [TOKEN_TYPES.ACCESS]: process.env.JWT_ACCESS_EXPIRATION || '15m',
    [TOKEN_TYPES.REFRESH]: process.env.JWT_REFRESH_EXPIRATION || '7d',
    [TOKEN_TYPES.RESET_PASSWORD]: process.env.JWT_RESET_PASSWORD_EXPIRATION || '10m',
    [TOKEN_TYPES.VERIFY_EMAIL]: process.env.JWT_VERIFY_EMAIL_EXPIRATION || '24h',
  }[type] || '15m';

  return jwt.sign(
    { ...payload, type },
    secret,
    { expiresIn }
  );
};

const verifyToken = (token, type = TOKEN_TYPES.ACCESS) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (decoded.type !== type) {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

const generateAuthTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(payload, TOKEN_TYPES.ACCESS);
  const refreshToken = generateToken(payload, TOKEN_TYPES.REFRESH);

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens,
};
