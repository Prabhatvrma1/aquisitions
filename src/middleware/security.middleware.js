import aj from '../config/archjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '../config/logger.js';
import { jwtToken } from '#utils/jwt.js';

const securityMiddleware = async (req, res, next) => {
  try {
    let role = 'guest';
    const token = req.cookies?.token;

    if (token) {
      try {
        const decoded = jwtToken.verify(token);
        role = decoded.role || 'guest';
        req.user = decoded; // Attach decoded user to request for rate limiting and downstream auth
      } catch (e) {
        // Invalid token falls back to guest
      }
    }

    let limit = 5;
    let interval = '1m';
    let message = 'Guest request limit exceeded (5 per minute). Slow down.';
    let ruleName = 'guest-rate-limit';

    // Strict limits for public authentication endpoints to protect database
    if (req.path === '/api/auth/sign-up') {
      limit = 5;
      interval = '1h';
      message =
        'Too many sign-up attempts from this IP. Please try again in an hour.';
      ruleName = 'signup-rate-limit';
    } else if (req.path === '/api/auth/sign-in') {
      limit = 10;
      interval = '15m';
      message =
        'Too many sign-in attempts from this IP. Please try again in 15 minutes.';
      ruleName = 'signin-rate-limit';
    } else {
      switch (role) {
        case 'admin':
          limit = 20;
          message = 'Admin request limit exceeded (20 per minute). Slow down.';
          ruleName = 'admin-rate-limit';
          break;
        case 'user':
          limit = 10;
          message = 'User request limit exceeded (10 per minute). Slow down.';
          ruleName = 'user-rate-limit';
          break;
        case 'guest':
          limit = 5;
          message = 'Guest request limit exceeded (5 per minute). Slow down.';
          ruleName = 'guest-rate-limit';
          break;
      }
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval,
        max: limit,
        characteristics: ['ip.src'],
        name: ruleName,
      })
    );
    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests are not allowed',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield blocked request', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        role,
      });

      return res.status(429).json({
        error: 'Too Many Requests',
        message,
      });
    }

    next();
  } catch (e) {
    logger.error('Arcjet security middleware error:', e);
    next(e);
  }
};

export default securityMiddleware;
