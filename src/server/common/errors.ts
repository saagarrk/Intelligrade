export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;
  readonly details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly errorCode = 'BAD_REQUEST';
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly errorCode = 'UNAUTHORIZED';
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly errorCode = 'FORBIDDEN';
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly errorCode = 'NOT_FOUND';
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly errorCode = 'CONFLICT';
}

export class PayloadTooLargeError extends AppError {
  readonly statusCode = 413;
  readonly errorCode = 'PAYLOAD_TOO_LARGE';
}

export class UnsupportedMediaTypeError extends AppError {
  readonly statusCode = 415;
  readonly errorCode = 'UNSUPPORTED_MEDIA_TYPE';
}

export class UnprocessableEntityError extends AppError {
  readonly statusCode = 422;
  readonly errorCode = 'UNPROCESSABLE_ENTITY';
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly errorCode = 'INTERNAL_SERVER_ERROR';
}

export class BadGatewayError extends AppError {
  readonly statusCode = 502;
  readonly errorCode = 'BAD_GATEWAY';
}

export class GatewayTimeoutError extends AppError {
  readonly statusCode = 504;
  readonly errorCode = 'GATEWAY_TIMEOUT';
}
