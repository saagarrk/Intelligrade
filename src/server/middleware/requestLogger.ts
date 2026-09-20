import { Request, Response, NextFunction } from 'express';
import { logger } from '../common/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // In development, ignore static asset requests served by Vite middleware to reduce noise
  const url = req.originalUrl || req.url;
  const isViteAsset = url.startsWith('/src/') || 
                      url.startsWith('/@') || 
                      url.startsWith('/node_modules/') ||
                      url.match(/\.(jsx?|tsx?|css|svg|png|jpg|jpeg|ico|woff2?|map)(\?.*)?$/);

  if (isViteAsset && process.env.NODE_ENV !== 'production') {
    return next();
  }

  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logMsg = `${method} ${originalUrl} ${statusCode} - ${duration}ms [${ip}]`;

    if (statusCode >= 500) {
      logger.error(logMsg);
    } else {
      logger.info(logMsg);
    }
  });

  next();
}
