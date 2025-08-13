import type { ApiResponse, PaginatedResponse } from '../database/types';
import type { ValidationError } from './serviceValidation';

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface ServiceError {
  type: ErrorType;
  message: string;
  details?: any;
  validationErrors?: ValidationError[];
}

// Error mapping for common Supabase errors
const SUPABASE_ERROR_MAP: Record<string, ErrorType> = {
  'PGRST116': ErrorType.NOT_FOUND, // Row not found
  'PGRST301': ErrorType.AUTHENTICATION, // JWT expired
  'PGRST302': ErrorType.AUTHENTICATION, // JWT invalid
  '23505': ErrorType.CONFLICT, // Unique constraint violation
  '23503': ErrorType.CONFLICT, // Foreign key constraint violation
  '42501': ErrorType.AUTHORIZATION, // Insufficient privilege
  'auth/user-not-found': ErrorType.NOT_FOUND,
  'auth/invalid-email': ErrorType.VALIDATION,
  'auth/weak-password': ErrorType.VALIDATION,
  'auth/email-already-in-use': ErrorType.CONFLICT,
  'auth/too-many-requests': ErrorType.RATE_LIMIT,
};

// Parse Supabase error into ServiceError
export const parseSupabaseError = (error: any): ServiceError => {
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unknown error occurred',
    };
  }

  const errorCode = error.code || error.error_code || error.status;
  const errorMessage = error.message || error.error_description || 'An error occurred';

  // Map known error codes
  const errorType = SUPABASE_ERROR_MAP[errorCode] || ErrorType.SERVER_ERROR;

  // Handle specific error cases
  switch (errorCode) {
    case 'PGRST116':
      return {
        type: ErrorType.NOT_FOUND,
        message: 'The requested resource was not found',
        details: { originalMessage: errorMessage },
      };

    case '23505':
      // Extract constraint name for better error messages
      if (errorMessage.includes('username')) {
        return {
          type: ErrorType.CONFLICT,
          message: 'This username is already taken',
          details: { field: 'username' },
        };
      }
      if (errorMessage.includes('email')) {
        return {
          type: ErrorType.CONFLICT,
          message: 'This email is already registered',
          details: { field: 'email' },
        };
      }
      return {
        type: ErrorType.CONFLICT,
        message: 'This value already exists',
        details: { originalMessage: errorMessage },
      };

    case '23503':
      return {
        type: ErrorType.CONFLICT,
        message: 'Cannot perform this action due to related data',
        details: { originalMessage: errorMessage },
      };

    case '42501':
      return {
        type: ErrorType.AUTHORIZATION,
        message: 'You do not have permission to perform this action',
        details: { originalMessage: errorMessage },
      };

    default:
      return {
        type: errorType,
        message: errorMessage,
        details: { code: errorCode },
      };
  }
};

// Create standardized error response
export const createErrorResponse = <T = any>(
  error: ServiceError,
  defaultData: T = null as T
): ApiResponse<T> => {
  return {
    data: defaultData,
    error: error.message,
    success: false,
  };
};

// Create standardized paginated error response
export const createPaginatedErrorResponse = <T = any>(
  error: ServiceError,
  limit: number = 20,
  offset: number = 0
): PaginatedResponse<T> => {
  return {
    data: [],
    error: error.message,
    success: false,
    pagination: {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: 0,
      hasMore: false,
    },
  };
};

// Create validation error response
export const createValidationErrorResponse = <T = any>(
  validationErrors: ValidationError[],
  defaultData: T = null as T
): ApiResponse<T> => {
  const errorMessage = validationErrors.length === 1
    ? validationErrors[0].message
    : `Validation failed: ${validationErrors.map(e => e.message).join(', ')}`;

  return {
    data: defaultData,
    error: errorMessage,
    success: false,
  };
};

// Handle async operations with error catching
export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  context: string = 'operation'
): Promise<T | ServiceError> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    return parseSupabaseError(error);
  }
};

// Retry mechanism for transient errors
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      const serviceError = parseSupabaseError(error);
      if ([
        ErrorType.VALIDATION,
        ErrorType.AUTHENTICATION,
        ErrorType.AUTHORIZATION,
        ErrorType.NOT_FOUND,
        ErrorType.CONFLICT,
      ].includes(serviceError.type)) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
};

// Log errors for monitoring
export const logError = (
  error: ServiceError,
  context: string,
  userId?: string,
  additionalData?: any
): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      type: error.type,
      message: error.message,
      details: error.details,
    },
    userId,
    additionalData,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Service Error:', logData);
  }

  // In production, you would send this to your logging service
  // Example: sendToLoggingService(logData);
};

// Check if error is retryable
export const isRetryableError = (error: ServiceError): boolean => {
  return [
    ErrorType.NETWORK_ERROR,
    ErrorType.SERVER_ERROR,
    ErrorType.RATE_LIMIT,
  ].includes(error.type);
};

// Get user-friendly error message
export const getUserFriendlyMessage = (error: ServiceError): string => {
  switch (error.type) {
    case ErrorType.VALIDATION:
      return error.message; // Validation messages are already user-friendly

    case ErrorType.AUTHENTICATION:
      return 'Please sign in to continue';

    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action';

    case ErrorType.NOT_FOUND:
      return 'The requested item could not be found';

    case ErrorType.CONFLICT:
      return error.message; // Conflict messages are usually specific

    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please try again later';

    case ErrorType.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again';

    case ErrorType.SERVER_ERROR:
      return 'A server error occurred. Please try again later';

    default:
      return 'An unexpected error occurred. Please try again';
  }
};

// Sanitize error for client response (remove sensitive information)
export const sanitizeError = (error: ServiceError): ServiceError => {
  // In production, you might want to hide certain error details
  if (process.env.NODE_ENV === 'production') {
    return {
      type: error.type,
      message: getUserFriendlyMessage(error),
      // Don't include details in production
    };
  }

  return error;
};
