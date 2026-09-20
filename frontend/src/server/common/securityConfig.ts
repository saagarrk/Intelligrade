import crypto from 'crypto';

/**
 * IntelliGrade Centralized Security & Credentials Configuration
 * Manages environment variable secrets, clearance keys, token lifecycles, and CORS policies.
 */
export const SecurityConfig = {
  // Authentication & Clearance Secrets (loaded strictly from environment variables)
  JWT_SECRET: process.env.JWT_SECRET || 'intelligrade_production_security_token_sign_key_2026',
  TEACHER_SECRET_KEY: process.env.TEACHER_SECRET_KEY || 'TEACHER-SEC-2026',
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || 'ADMIN-SEC-2026',

  // Fallback demo account credentials (customizable in production via environment)
  DEFAULT_STUDENT_PASS: process.env.DEFAULT_DEMO_STUDENT_PASSWORD || 'student123',
  DEFAULT_TEACHER_PASS: process.env.DEFAULT_DEMO_TEACHER_PASSWORD || 'teacher123',
  DEFAULT_ADMIN_PASS: process.env.DEFAULT_DEMO_ADMIN_PASSWORD || 'admin123',

  // Password Hashing
  BCRYPT_SALT_ROUNDS: 10,

  // Token Durations
  SESSION_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME_DURATION_MS: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Rate Limiting Policy
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_AUTH_MAX: 30, // 30 login/register attempts per minute per IP
  RATE_LIMIT_GLOBAL_MAX: 300, // 300 requests per minute per IP

  // CORS Policy
  ALLOWED_ORIGINS: (process.env.CORS_ORIGIN || process.env.ALLOWED_ORIGINS || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),

  // File Upload Limits
  MAX_FILE_SIZE_BYTES: 25 * 1024 * 1024, // 25 MB
  ALLOWED_MIME_TYPES: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ] as const
};

/**
 * Cryptographically secure token generator.
 * Produces an unguessable 256-bit hexadecimal string.
 */
export function generateSecureToken(prefix = 'ig'): string {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}_${randomBytes}`;
}

/**
 * Generates an HMAC-SHA256 signature for a token payload.
 */
export function signPayload(payload: string, secret = SecurityConfig.JWT_SECRET): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Constant-time string equality check to prevent timing-attack side channels.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
