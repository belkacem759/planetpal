import { NextResponse } from 'next/server';
import { ValiError } from 'valibot';

// Error types
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  

  
  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Server
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Business Logic
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',
  PLANT_CARE_CONFLICT = 'PLANT_CARE_CONFLICT',
}

// Error response interface
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    path?: string;
  };
}

// Success response interface
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

// Custom error class
export class ApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// Predefined error creators
export const createError = {
  unauthorized: (message = 'Authentication required') => 
    new ApiError(ErrorCode.UNAUTHORIZED, message, 401),
    
  forbidden: (message = 'Access denied') => 
    new ApiError(ErrorCode.FORBIDDEN, message, 403),
    
  notFound: (resource = 'Resource', id?: string) => 
    new ApiError(
      ErrorCode.NOT_FOUND, 
      `${resource}${id ? ` with id '${id}'` : ''} not found`, 
      404
    ),
    
  validation: (message = 'Validation failed', details?: any) => 
    new ApiError(ErrorCode.VALIDATION_ERROR, message, 400, details),
    
  conflict: (message = 'Resource conflict') => 
    new ApiError(ErrorCode.RESOURCE_CONFLICT, message, 409),
    
  rateLimit: (message = 'Rate limit exceeded') => 
    new ApiError(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429),
    
  
    
  database: (message = 'Database operation failed', details?: any) => 
    new ApiError(ErrorCode.DATABASE_ERROR, message, 500, details),
    
  internal: (message = 'Internal server error', details?: any) => 
    new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details),
    
  insufficientStock: (productName?: string) => 
    new ApiError(
      ErrorCode.INSUFFICIENT_STOCK,
      `Insufficient stock${productName ? ` for ${productName}` : ''}`,
      400
    ),
};

// Error handler function
export function handleApiError(error: unknown, path?: string): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error);

  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof ValiError) {
    apiError = new ApiError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      400,
      error.issues
    );
  } else if (error instanceof Error) {
    // Check for specific database errors
    if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
      apiError = new ApiError(
        ErrorCode.ALREADY_EXISTS,
        'Resource already exists',
        409,
        { originalError: error.message }
      );
    } else if (error.message.includes('foreign key') || error.message.includes('violates')) {
      apiError = new ApiError(
        ErrorCode.RESOURCE_CONFLICT,
        'Resource conflict',
        409,
        { originalError: error.message }
      );
    } else {
      apiError = new ApiError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred',
        500,
        { originalError: error.message }
      );
    }
  } else {
    apiError = new ApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      500
    );
  }

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      timestamp: new Date().toISOString(),
      path,
    },
  };

  return NextResponse.json(errorResponse, { status: apiError.statusCode });
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta']
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response);
}

// Pagination helper
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse<ApiSuccessResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return createSuccessResponse(data, {
    pagination: {
      ...pagination,
      totalPages,
    },
    timestamp: new Date().toISOString(),
  });
}

// Async error wrapper for API routes
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ApiErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Validation helper
export function validateRequired<T>(data: T, fields: (keyof T)[]): void {
  const missing = fields.filter(field => 
    data[field] === undefined || 
    data[field] === null || 
    data[field] === ''
  );

  if (missing.length > 0) {
    throw createError.validation(
      `Missing required fields: ${missing.join(', ')}`,
      { missingFields: missing }
    );
  }
}

// Type guards
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isApiErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

export function isApiSuccessResponse<T>(response: unknown): response is ApiSuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === true &&
    'data' in response
  );
}

// Logger utility
export const logger = {
  error: (message: string, error?: unknown, context?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      context,
      timestamp: new Date().toISOString(),
    });
  },
  
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, {
      context,
      timestamp: new Date().toISOString(),
    });
  },
  
  info: (message: string, context?: Record<string, any>) => {
    console.info(`[INFO] ${message}`, {
      context,
      timestamp: new Date().toISOString(),
    });
  },
};

// Export commonly used errors
export { ErrorCode as ApiErrorCode };