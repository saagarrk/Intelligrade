import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponsePayload<T> {
  success: boolean;
  statusCode: number;
  data: T;
  meta?: PaginationMeta;
  timestamp: string;
  [key: string]: any; // Allow top-level properties for backward compatibility
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    statusCode = 200,
    meta?: PaginationMeta,
    extraFields?: Record<string, any>
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      statusCode,
      data,
      ...(meta && { meta, pagination: meta }),
      timestamp: new Date().toISOString(),
      ...(extraFields || {})
    };

    // If data is an object, also spread top-level keys for backwards compatibility with tests & existing client code
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.assign(payload, data);
    }

    return res.status(statusCode).json(payload);
  }

  static created<T>(
    res: Response,
    data: T,
    extraFields?: Record<string, any>
  ): Response {
    return this.success(res, data, 201, undefined, extraFields);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    errorCode = 'ERROR',
    details?: any
  ): Response {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      errorCode,
      error: message, // Backward-compatible with client expecting data.error
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }
}
