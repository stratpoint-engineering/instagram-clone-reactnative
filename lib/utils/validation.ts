/**
 * Form Validation Utilities
 *
 * Comprehensive validation functions for forms throughout the app.
 * Provides consistent validation logic and error messages.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  url: /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$|^https?:\/\/localhost(:[0-9]+)?(\/.*)?$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z\s\u00C0-\u017F]+$/,
  numeric: /^\d+$/,
} as const;

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  password: 'Password must contain uppercase, lowercase, and number',
  passwordLength: 'Password must be at least 8 characters',
  passwordMatch: 'Passwords do not match',
  username: 'Username can only contain letters, numbers, and underscores',
  usernameLength: 'Username must be at least 3 characters',
  url: 'Please enter a valid URL (including http:// or https://)',
  phone: 'Please enter a valid phone number',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be ${max} characters or less`,
  custom: 'Invalid value',
} as const;

/**
 * Generic validation function
 */
export function validateField(value: string, rules: ValidationRule): ValidationResult {
  // Required check
  if (rules.required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required };
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim().length === 0) {
    return { isValid: true };
  }

  // Min length check
  if (rules.minLength && value.length < rules.minLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.minLength(rules.minLength) };
  }

  // Max length check
  if (rules.maxLength && value.length > rules.maxLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.maxLength(rules.maxLength) };
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.custom };
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return { isValid: true };
}

/**
 * Email validation
 */
export function validateEmail(email: string, required = true): ValidationResult {
  return validateField(email, {
    required,
    pattern: VALIDATION_PATTERNS.email,
    custom: (value) => {
      if (!VALIDATION_PATTERNS.email.test(value)) {
        return { isValid: false, error: VALIDATION_MESSAGES.email };
      }
      // Check for consecutive dots
      if (value.includes('..')) {
        return { isValid: false, error: VALIDATION_MESSAGES.email };
      }
      return { isValid: true };
    },
  });
}

/**
 * Password validation
 */
export function validatePassword(password: string, required = true): ValidationResult {
  return validateField(password, {
    required,
    minLength: 8,
    custom: (value) => {
      if (value.length < 8) {
        return { isValid: false, error: VALIDATION_MESSAGES.passwordLength };
      }
      if (!VALIDATION_PATTERNS.password.test(value)) {
        return { isValid: false, error: VALIDATION_MESSAGES.password };
      }
      return { isValid: true };
    },
  });
}

/**
 * Password confirmation validation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
  required = true
): ValidationResult {
  const result = validateField(confirmPassword, { required });
  if (!result.isValid) return result;

  if (confirmPassword && password !== confirmPassword) {
    return { isValid: false, error: VALIDATION_MESSAGES.passwordMatch };
  }

  return { isValid: true };
}

/**
 * Username validation
 */
export function validateUsername(username: string, required = true): ValidationResult {
  return validateField(username, {
    required,
    minLength: 3,
    maxLength: 30,
    pattern: VALIDATION_PATTERNS.username,
    custom: (value) => {
      if (!VALIDATION_PATTERNS.username.test(value)) {
        return { isValid: false, error: VALIDATION_MESSAGES.username };
      }
      if (value.length < 3) {
        return { isValid: false, error: VALIDATION_MESSAGES.usernameLength };
      }
      return { isValid: true };
    },
  });
}

/**
 * Full name validation
 */
export function validateFullName(fullName: string, required = true): ValidationResult {
  return validateField(fullName, {
    required,
    minLength: 2,
    maxLength: 100,
    custom: (value) => {
      if (value.trim().length < 2) {
        return { isValid: false, error: 'Full name must be at least 2 characters' };
      }
      return { isValid: true };
    },
  });
}

/**
 * URL validation
 */
export function validateUrl(url: string, required = false): ValidationResult {
  return validateField(url, {
    required,
    pattern: VALIDATION_PATTERNS.url,
    custom: (value) => {
      if (!VALIDATION_PATTERNS.url.test(value)) {
        return { isValid: false, error: VALIDATION_MESSAGES.url };
      }
      return { isValid: true };
    },
  });
}

/**
 * Bio validation
 */
export function validateBio(bio: string, required = false): ValidationResult {
  return validateField(bio, {
    required,
    maxLength: 150,
  });
}

/**
 * Phone number validation
 */
export function validatePhone(phone: string, required = false): ValidationResult {
  return validateField(phone, {
    required,
    pattern: VALIDATION_PATTERNS.phone,
    custom: (value) => {
      if (!VALIDATION_PATTERNS.phone.test(value)) {
        return { isValid: false, error: VALIDATION_MESSAGES.phone };
      }
      return { isValid: true };
    },
  });
}

/**
 * Validate multiple fields at once
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  validationRules: Record<keyof T, (value: any) => ValidationResult>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(validationRules)) {
    const result = validator(data[field]);
    if (!result.isValid) {
      errors[field as keyof T] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validation hook for React components
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: Record<keyof T, (value: any) => ValidationResult>
) {
  const [data, setData] = React.useState<T>(initialData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});

  const updateField = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof T) => {
    const result = validationRules[field](data[field]);
    if (!result.isValid) {
      setErrors(prev => ({ ...prev, [field]: result.error }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    return result.isValid;
  };

  const validateAll = () => {
    const result = validateForm(data, validationRules);
    setErrors(result.errors);
    return result.isValid;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearError = (field: keyof T) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return {
    data,
    errors,
    updateField,
    validateField,
    validateAll,
    clearErrors,
    clearError,
    setData,
    setErrors,
  };
}

// Re-export React for the hook
import React from 'react';
