import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UnauthorizedError, ForbiddenError } from '../common/errors';
import { UserEntity } from '../database/inMemoryDb';

// Extend Express Request interface to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: UserEntity;
      token?: string;
    }
  }
}

export function requireAuth(allowedRoles: string[] = []) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or malformed Authorization header. Bearer token required.');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedError('Empty authorization token provided.');
      }

      const user = await authService.verifySession(token);
      if (!user) {
        throw new UnauthorizedError('Invalid or expired authentication session. Please sign in again.');
      }

      if (user.isActive === false) {
        throw new ForbiddenError('Account is deactivated by an institutional administrator.');
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        throw new ForbiddenError(`Access denied: Requires one of [${allowedRoles.join(', ')}] clearance. Current role: ${user.role}.`);
      }

      req.user = user;
      req.token = token;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function optionalAuth() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token) {
          const user = await authService.verifySession(token);
          if (user && user.isActive !== false) {
            req.user = user;
            req.token = token;
          }
        }
      }
      next();
    } catch {
      next();
    }
  };
}
