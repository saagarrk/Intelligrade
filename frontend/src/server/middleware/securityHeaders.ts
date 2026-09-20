import { Request, Response, NextFunction } from 'express';
import { SecurityConfig } from '../common/securityConfig';

/**
 * Production Security Headers & CORS Middleware
 * Hardens the HTTP response against MIME-sniffing, clickjacking, XSS, and Cross-Site Request Forgery.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // 1. Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 2. Legacy XSS filter for older user agents
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 3. Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 4. Restrict unused browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // 5. Content Security Policy allowing AI Studio preview framing while isolating untrusted scripts
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: http: ws: wss:; frame-ancestors 'self' https://ai.studio https://*.google.com https://*.run.app;"
  );

  next();
}

/**
 * Production CORS Middleware
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const allowedOrigins = SecurityConfig.ALLOWED_ORIGINS;

  let isAllowed = false;
  if (!origin) {
    // Same-origin request or direct API client (curl, mobile apps)
    isAllowed = true;
  } else if (allowedOrigins.includes('*')) {
    isAllowed = true;
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.includes('localhost')) {
    isAllowed = true;
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
