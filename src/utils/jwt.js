import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRE_IN = '1d';

export const jwtToken = {
  sign(payload) {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRE_IN,
      });
    } catch (e) {
      logger.error('Failed to create auth token', e);
      throw new Error('Failed to create auth token');
    }
  },

  verify(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      logger.error('Failed to verify auth token', e);
      throw new Error('Failed to verify auth token');
    }
  },
};
