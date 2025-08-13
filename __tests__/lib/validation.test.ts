// Unit tests for validation utilities
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
  validateFullName,
  validateUrl,
  validateBio,
  validatePhone,
  validateForm,
  VALIDATION_PATTERNS,
} from '../../lib/utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        if (result.isValid) {
          console.log(`Email "${email}" unexpectedly passed validation`);
        }
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should reject empty email when required', () => {
      const result = validateEmail('', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle optional email validation', () => {
      const result = validateEmail('', false);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'Password123',
        'MySecure1Pass',
        'Test1234',
        'ComplexP@ss1',
      ];

      validPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'weak',
        'password',
        'PASSWORD',
        '12345678',
        'Pass1', // too short
        'password123', // no uppercase
        'PASSWORD123', // no lowercase
        'Password', // no number
      ];

      invalidPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should validate matching passwords', () => {
      const result = validatePasswordConfirmation('Password123', 'Password123');
      expect(result.isValid).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const result = validatePasswordConfirmation('Password123', 'Different123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('do not match');
    });

    it('should handle empty confirmation when not required', () => {
      const result = validatePasswordConfirmation('Password123', '', false);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'username',
        'user_name_123',
      ];

      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'us', // too short
        'user-name', // contains dash
        'user name', // contains space
        'user@name', // contains special char
        '', // empty
      ];

      invalidUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('validateFullName', () => {
    it('should validate correct full names', () => {
      const validNames = [
        'John Doe',
        'Jane Smith',
        'Mary Jane Watson',
        'José García',
      ];

      validNames.forEach(name => {
        const result = validateFullName(name);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid full names', () => {
      const invalidNames = [
        'J', // too short
        '', // empty
        '   ', // only spaces
      ];

      invalidNames.forEach(name => {
        const result = validateFullName(name);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://subdomain.example.com/path',
        'http://localhost:3000',
      ];

      validUrls.forEach(url => {
        const result = validateUrl(url);
        if (!result.isValid) {
          console.log(`URL "${url}" unexpectedly failed validation:`, result.error);
        }
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'example.com', // no protocol
        'ftp://example.com', // wrong protocol
        'not-a-url',
        'http://',
      ];

      invalidUrls.forEach(url => {
        const result = validateUrl(url);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    it('should handle optional URL validation', () => {
      const result = validateUrl('', false);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateBio', () => {
    it('should validate correct bios', () => {
      const validBios = [
        'I love coding!',
        'Software developer passionate about React Native.',
        '', // empty is valid for optional field
      ];

      validBios.forEach(bio => {
        const result = validateBio(bio);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should reject bios that are too long', () => {
      const longBio = 'a'.repeat(151); // 151 characters
      const result = validateBio(longBio);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('150 characters');
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '(555) 123-4567',
        '555-123-4567',
        '+1 (555) 123-4567',
      ];

      validPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    it('should handle optional phone validation', () => {
      const result = validatePhone('', false);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateForm', () => {
    it('should validate entire form', () => {
      const formData = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser',
      };

      const validationRules = {
        email: validateEmail,
        password: validatePassword,
        username: validateUsername,
      };

      const result = validateForm(formData, validationRules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for invalid form', () => {
      const formData = {
        email: 'invalid-email',
        password: 'weak',
        username: 'us',
      };

      const validationRules = {
        email: validateEmail,
        password: validatePassword,
        username: validateUsername,
      };

      const result = validateForm(formData, validationRules);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.username).toBeDefined();
    });
  });

  describe('VALIDATION_PATTERNS', () => {
    it('should have correct email pattern', () => {
      expect(VALIDATION_PATTERNS.email.test('test@example.com')).toBe(true);
      expect(VALIDATION_PATTERNS.email.test('invalid-email')).toBe(false);
    });

    it('should have correct username pattern', () => {
      expect(VALIDATION_PATTERNS.username.test('valid_username123')).toBe(true);
      expect(VALIDATION_PATTERNS.username.test('invalid-username')).toBe(false);
    });

    it('should have correct password pattern', () => {
      expect(VALIDATION_PATTERNS.password.test('Password123')).toBe(true);
      expect(VALIDATION_PATTERNS.password.test('weakpass')).toBe(false);
    });

    it('should have correct URL pattern', () => {
      expect(VALIDATION_PATTERNS.url.test('https://example.com')).toBe(true);
      expect(VALIDATION_PATTERNS.url.test('example.com')).toBe(false);
    });
  });
});
