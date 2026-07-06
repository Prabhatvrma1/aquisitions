import logger from '../config/logger.js';
import { jwtToken } from '../utils/jwt.js';

/**
 * Middleware: verify the JWT from the request cookie and attach
 * the decoded payload to req.user.
 */
export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwtToken.verify(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (e) {
    logger.warn('Authentication failed', { error: e.message });
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware: allow only users whose role is in the allowed list.
 * Must be used AFTER authenticate.
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logger.warn('Authorisation denied', {
        userId: req.user?.id,
        role: req.user?.role,
        required: roles,
      });
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
}
