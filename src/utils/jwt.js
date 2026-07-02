import jwt from 'jsonwebtoken';
import logger from '../config/logger';
import { error } from 'winston';
import { token } from 'morgan';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRE_IN = '1d';

export const jwttoken = {
    sign: (payload) => {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE_IN });
        }
        catch (e) {
            logger.error("failed to auth", error);
            throw new error("failed to auth token");
        }
    },
    verify: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        }
        catch (e) {
            logger.error("failed to auth token", e);
            throw new error(" failed tp auth token");
        }
    }
}



