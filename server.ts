import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import apiRouter from './src/server/routes/index';
import { requestLogger } from './src/server/middleware/requestLogger';
import { errorHandler } from './src/server/middleware/errorHandler';
import { securityHeaders, corsMiddleware } from './src/server/middleware/securityHeaders';
import { NotFoundError } from './src/server/common/errors';
import { ApiResponse } from './src/server/common/apiResponse';

// Export for backward-compatibility if any external code requires it
export { performHandwrittenOcrAndParse } from './src/backend/geminiOcrService';

dotenv.config();

const app = express();
const PORT = 3000;

// Security headers & strict CORS handling first
app.use(securityHeaders);
app.use(corsMiddleware);

// Body parsers with generous limits for scanned image uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Global structured request logging
app.use(requestLogger);

// Health check convenience endpoints
app.get('/health', (req: Request, res: Response) => {
  ApiResponse.success(res, {
    status: 'UP',
    service: 'IntelliGrade Production REST API Engine',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  ApiResponse.success(res, {
    status: 'UP',
    service: 'IntelliGrade Production REST API Engine',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Master REST API Router mounted at /api/v1 and /api (for backwards compatibility)
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// Catch unhandled /api/* requests with consistent JSON error response
app.all('/api/*', (req: Request, res: Response, next) => {
  next(new NotFoundError(`Endpoint '${req.method} ${req.originalUrl}' not found on this server.`));
});

// Global central exception handler
app.use(errorHandler);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IntelliGrade] Production REST API Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
