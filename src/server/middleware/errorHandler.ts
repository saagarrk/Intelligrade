import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors';
import { ApiResponse } from '../common/apiResponse';
import { logger } from '../common/logger';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err);
  }

  // Handle our domain AppError hierarchy
  if (err instanceof AppError) {
    if (err.statusCode < 500) {
      logger.info(`Client response [${err.errorCode}]: ${err.message}`, {
        path: req.originalUrl,
        method: req.method,
        statusCode: err.statusCode
      });
    } else {
      logger.error(`Operational server error [${err.errorCode}]: ${err.message}`, {
        path: req.originalUrl,
        method: req.method,
        statusCode: err.statusCode,
        details: err.details
      });
    }

    ApiResponse.error(res, err.statusCode, err.message, err.errorCode, err.details);
    return;
  }

  // Handle unexpected internal errors
  logger.error(`Unhandled Exception on ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction && statusCode >= 500
    ? 'An internal server error occurred'
    : (err.message || 'Internal Server Error');

  // Never leak internal stack traces or filesystem paths to clients
  ApiResponse.error(res, statusCode, message, 'INTERNAL_SERVER_ERROR');
}
