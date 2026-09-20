import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../common/errors';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const message = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new BadRequestError(`Validation failed: ${message}`, (error as any).format?.() || issues));
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const message = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new BadRequestError(`Query parameter validation failed: ${message}`, (error as any).format?.() || issues));
      } else {
        next(error);
      }
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const message = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        next(new BadRequestError(`Path parameter validation failed: ${message}`, (error as any).format?.() || issues));
      } else {
        next(error);
      }
    }
  };
}
