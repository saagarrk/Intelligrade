import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../common/apiResponse';
import { SecurityConfig } from '../common/securityConfig';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale rate limit records
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
  keyPrefix?: string;
}

/**
 * Creates an in-memory IP rate limiter middleware.
 */
export function rateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || SecurityConfig.RATE_LIMIT_WINDOW_MS;
  const maxRequests = options.maxRequests || SecurityConfig.RATE_LIMIT_GLOBAL_MAX;
  const message = options.message || 'Too many requests from this IP. Please try again later.';
  const prefix = options.keyPrefix || 'global';

  return (req: Request, res: Response, next: NextFunction): void => {
    // In test environment, allow tests to run without being blocked
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const key = `${prefix}:${clientIp}`;
    const now = Date.now();
    let record = rateLimitStore.get(key);

    if (!record || record.resetTime < now) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', retryAfterSec);
      ApiResponse.error(res, 429, message, 'RATE_LIMIT_EXCEEDED', {
        retryAfterSeconds: retryAfterSec
      });
      return;
    }

    next();
  };
}

export const authRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: SecurityConfig.RATE_LIMIT_AUTH_MAX,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please wait a minute before retrying.'
});
