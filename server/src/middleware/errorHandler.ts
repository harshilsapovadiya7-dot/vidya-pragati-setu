import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details: any = undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired. Please log in again.';
  }

  // Handle Prisma known request errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target.join(', ')
      : err.meta?.target || 'field';
    message = `A record with this ${target} already exists.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'The requested record was not found.';
  }

  // Log non-operational (system/unexpected) errors
  if (!err.isOperational && statusCode === 500) {
    console.error('💥 UNEXPECTED SYSTEM ERROR:', err);
  }

  const responsePayload: {
    success: boolean;
    error: string;
    statusCode: number;
    details?: any;
    stack?: string;
  } = {
    success: false,
    error: message,
    statusCode,
  };

  if (details) {
    responsePayload.details = details;
  }

  // Only expose stack trace in non-production environments
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};
