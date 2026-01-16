// backend/auth-service/src/utils/jwt.js

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');

const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET || env.JWT_SECRET; // Fallback to JWT_SECRET if not set
const JWT_ACCESS_EXPIRATION = env.JWT_ACCESS_EXPIRATION;
const JWT_REFRESH_EXPIRATION_DAYS = env.JWT_REFRESH_EXPIRATION_DAYS;

// Warn if using same secret for both access and refresh tokens
if (JWT_REFRESH_SECRET === JWT_SECRET && env.NODE_ENV === 'production') {
  console.warn('WARNING: Using the same secret for access and refresh tokens. Consider using JWT_REFRESH_SECRET.');
}

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRATION,
    issuer: 'tne-auth-service',
    audience: 'tne-api',
    jwtid: crypto.randomBytes(16).toString('hex'), // Add unique JWT ID
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: `${JWT_REFRESH_EXPIRATION_DAYS}d`,
    issuer: 'tne-auth-service',
    audience: 'tne-api',
    jwtid: crypto.randomBytes(16).toString('hex'), // Add unique JWT ID
  });
};

const generateAuthTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_ACCESS_EXPIRATION,
  };
};

const verifyToken = (token, isRefreshToken = false) => {
  try {
    const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
    return jwt.verify(token, secret, {
      issuer: 'tne-auth-service',
      audience: 'tne-api',
    });
  } catch (error) {
    throw error;
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

// Legacy export for backward compatibility
exports.signToken = generateAccessToken;

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  verifyToken,
  decodeToken,
  signToken: generateAccessToken,
};
