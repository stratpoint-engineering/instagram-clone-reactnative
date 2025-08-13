import {
  ErrorType,
  parseSupabaseError,
  createErrorResponse,
  createPaginatedErrorResponse,
  createValidationErrorResponse,
  handleAsyncOperation,
  isRetryableError,
  getUserFriendlyMessage,
  sanitizeError,
} from './errorHandling';
import type { ValidationError } from './serviceValidation';

describe('Error Handling', () => {
  describe('parseSupabaseError', () => {
    it('should parse not found error', () => {
      const error = { code: 'PGRST116', message: 'Row not found' };
      const result = parseSupabaseError(error);

      expect(result.type).toBe(ErrorType.NOT_FOUND);
      expect(result.message).toContain('not found');
    });

    it('should parse username conflict error', () => {
      const error = {
        code: '23505',
        message: 'duplicate key value violates unique constraint "profiles_username_key"',
      };
      const result = parseSupabaseError(error);

      expect(result.type).toBe(ErrorType.CONFLICT);
      expect(result.message).toContain('username is already taken');
    });

    it('should parse email conflict error', () => {
      const error = {
        code: '23505',
        message: 'duplicate key value violates unique constraint "profiles_email_key"',
      };
      const result = parseSupabaseError(error);

      expect(result.type).toBe(ErrorType.CONFLICT);
      expect(result.message).toContain('email is already registered');
    });

    it('should parse authorization error', () => {
      const error = { code: '42501', message: 'permission denied' };
      const result = parseSupabaseError(error);

      expect(result.type).toBe(ErrorType.AUTHORIZATION);
      expect(result.message).toContain('do not have permission');
    });

    it('should handle unknown error', () => {
      const error = { code: 'UNKNOWN', message: 'Unknown error' };
      const result = parseSupabaseError(error);

      expect(result.type).toBe(ErrorType.SERVER_ERROR);
      expect(result.message).toBe('Unknown error');
    });

    it('should handle null error', () => {
      const result = parseSupabaseError(null);

      expect(result.type).toBe(ErrorType.UNKNOWN);
      expect(result.message).toContain('unknown error');
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with default data', () => {
      const error = {
        type: ErrorType.VALIDATION,
        message: 'Validation failed',
      };

      const result = createErrorResponse(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(result.data).toBeNull();
    });

    it('should create error response with custom default data', () => {
      const error = {
        type: ErrorType.NOT_FOUND,
        message: 'Not found',
      };

      const result = createErrorResponse(error, []);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
      expect(result.data).toEqual([]);
    });
  });

  describe('createPaginatedErrorResponse', () => {
    it('should create paginated error response', () => {
      const error = {
        type: ErrorType.SERVER_ERROR,
        message: 'Server error',
      };

      const result = createPaginatedErrorResponse(error, 20, 40);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
      expect(result.data).toEqual([]);
      expect(result.pagination).toEqual({
        page: 3, // Math.floor(40 / 20) + 1
        limit: 20,
        total: 0,
        hasMore: false,
      });
    });
  });

  describe('createValidationErrorResponse', () => {
    it('should create validation error response with single error', () => {
      const validationErrors: ValidationError[] = [
        { field: 'username', message: 'Username is required' },
      ];

      const result = createValidationErrorResponse(validationErrors);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is required');
      expect(result.data).toBeNull();
    });

    it('should create validation error response with multiple errors', () => {
      const validationErrors: ValidationError[] = [
        { field: 'username', message: 'Username is required' },
        { field: 'email', message: 'Email is invalid' },
      ];

      const result = createValidationErrorResponse(validationErrors);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('Username is required');
      expect(result.error).toContain('Email is invalid');
    });
  });

  describe('handleAsyncOperation', () => {
    it('should return result on success', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await handleAsyncOperation(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should return ServiceError on failure', async () => {
      const error = { code: 'PGRST116', message: 'Not found' };
      const operation = jest.fn().mockRejectedValue(error);
      const result = await handleAsyncOperation(operation);

      expect(result).toHaveProperty('type', ErrorType.NOT_FOUND);
      expect(result).toHaveProperty('message');
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [
        { type: ErrorType.NETWORK_ERROR, message: 'Network error' },
        { type: ErrorType.SERVER_ERROR, message: 'Server error' },
        { type: ErrorType.RATE_LIMIT, message: 'Rate limit' },
      ];

      retryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        { type: ErrorType.VALIDATION, message: 'Validation error' },
        { type: ErrorType.AUTHENTICATION, message: 'Auth error' },
        { type: ErrorType.AUTHORIZATION, message: 'Authorization error' },
        { type: ErrorType.NOT_FOUND, message: 'Not found' },
        { type: ErrorType.CONFLICT, message: 'Conflict' },
      ];

      nonRetryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(false);
      });
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly messages', () => {
      const testCases = [
        {
          error: { type: ErrorType.AUTHENTICATION, message: 'JWT expired' },
          expected: 'Please sign in to continue',
        },
        {
          error: { type: ErrorType.AUTHORIZATION, message: 'Permission denied' },
          expected: 'You do not have permission to perform this action',
        },
        {
          error: { type: ErrorType.NOT_FOUND, message: 'Row not found' },
          expected: 'The requested item could not be found',
        },
        {
          error: { type: ErrorType.RATE_LIMIT, message: 'Too many requests' },
          expected: 'Too many requests. Please try again later',
        },
        {
          error: { type: ErrorType.NETWORK_ERROR, message: 'Network error' },
          expected: 'Network error. Please check your connection and try again',
        },
        {
          error: { type: ErrorType.SERVER_ERROR, message: 'Internal error' },
          expected: 'A server error occurred. Please try again later',
        },
        {
          error: { type: ErrorType.UNKNOWN, message: 'Unknown error' },
          expected: 'An unexpected error occurred. Please try again',
        },
      ];

      testCases.forEach(({ error, expected }) => {
        const result = getUserFriendlyMessage(error);
        expect(result).toBe(expected);
      });
    });

    it('should return original message for validation and conflict errors', () => {
      const validationError = {
        type: ErrorType.VALIDATION,
        message: 'Username is required',
      };
      expect(getUserFriendlyMessage(validationError)).toBe('Username is required');

      const conflictError = {
        type: ErrorType.CONFLICT,
        message: 'Username is already taken',
      };
      expect(getUserFriendlyMessage(conflictError)).toBe('Username is already taken');
    });
  });

  describe('sanitizeError', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      // Restore original environment
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it('should return full error in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      });

      const error = {
        type: ErrorType.SERVER_ERROR,
        message: 'Internal server error',
        details: { code: 500 },
      };

      const result = sanitizeError(error);
      expect(result).toEqual(error);
    });

    it('should sanitize error in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      });

      const error = {
        type: ErrorType.SERVER_ERROR,
        message: 'Internal server error',
        details: { code: 500 },
      };

      const result = sanitizeError(error);
      expect(result.type).toBe(ErrorType.SERVER_ERROR);
      expect(result.message).toBe('A server error occurred. Please try again later');
      expect(result.details).toBeUndefined();
    });
  });
});
