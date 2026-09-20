import { Request, Response, NextFunction } from 'express';
import { GatewayTimeoutError } from '../common/errors';

/**
 * Middleware that sets a hard request timeout limit.
 * If processing takes longer than the timeoutMs, the request is aborted and
 * returns HTTP 504 Gateway Timeout, protecting against hanging AI or database calls.
 */
export function requestTimeout(timeoutMs: number = 30000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    let timer: NodeJS.Timeout | null = null;

    const clear = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    timer = setTimeout(() => {
      if (!res.headersSent) {
        next(new GatewayTimeoutError(`Request timed out after ${timeoutMs / 1000}s. The service took too long to respond.`));
      }
    }, timeoutMs);

    res.on('finish', clear);
    res.on('close', clear);

    next();
  };
}
