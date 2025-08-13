import {
  validateUsername,
  validateEmail,
  validateBio,
  validateWebsite,
  validateProfileInsert,
  validateProfileUpdate,
  validatePostInsert,
  validatePostUpdate,
  validateCommentInsert,
  validateCommentUpdate,
  validateUUID,
  validatePagination,
  validateSearchQuery,
} from './serviceValidation';
import type { ProfileInsert, ProfileUpdate, PostInsert, PostUpdate, CommentInsert, CommentUpdate } from '../database/types';

describe('Service Validation', () => {
  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      const validUsernames = ['testuser', 'test_user', 'test.user', 'user123', 'test123.user'];
      
      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid usernames', () => {
      const testCases = [
        { username: '', expectedError: 'Username is required' },
        { username: 'ab', expectedError: 'at least 3 characters' },
        { username: 'a'.repeat(31), expectedError: 'no more than 30 characters' },
        { username: 'test user', expectedError: 'can only contain' },
        { username: 'test@user', expectedError: 'can only contain' },
        { username: '.testuser', expectedError: 'cannot start or end' },
        { username: 'testuser.', expectedError: 'cannot start or end' },
        { username: 'test..user', expectedError: 'consecutive dots' },
      ];

      testCases.forEach(({ username, expectedError }) => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toContain(expectedError);
      });
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'test+tag@example.org'];
      
      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid emails', () => {
      const testCases = [
        { email: '', expectedError: 'Email is required' },
        { email: 'invalid-email', expectedError: 'valid email address' },
        { email: '@example.com', expectedError: 'valid email address' },
        { email: 'test@', expectedError: 'valid email address' },
      ];

      testCases.forEach(({ email, expectedError }) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toContain(expectedError);
      });
    });
  });

  describe('validateBio', () => {
    it('should validate correct bios', () => {
      const validBios = [null, '', 'Short bio', 'A'.repeat(150)];
      
      validBios.forEach(bio => {
        const result = validateBio(bio);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject bio that is too long', () => {
      const result = validateBio('A'.repeat(151));
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('no more than 150 characters');
    });
  });

  describe('validateWebsite', () => {
    it('should validate correct websites', () => {
      const validWebsites = [null, 'https://example.com', 'http://test.org', 'https://sub.domain.co.uk'];
      
      validWebsites.forEach(website => {
        const result = validateWebsite(website);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid websites', () => {
      const invalidWebsites = ['example.com', 'ftp://example.com', 'not-a-url'];
      
      invalidWebsites.forEach(website => {
        const result = validateWebsite(website);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toContain('valid website URL');
      });
    });
  });

  describe('validateProfileInsert', () => {
    it('should validate correct profile insert', () => {
      const profile: ProfileInsert = {
        id: 'user-123',
        username: 'testuser',
        full_name: 'Test User',
        bio: 'Test bio',
        website: 'https://example.com',
      };

      const result = validateProfileInsert(profile);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject profile with invalid fields', () => {
      const profile: ProfileInsert = {
        id: 'user-123',
        username: 'ab', // Too short
        full_name: 'A'.repeat(101), // Too long
        bio: 'A'.repeat(151), // Too long
        website: 'invalid-url', // Invalid URL
      };

      const result = validateProfileInsert(profile);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
    });
  });

  describe('validatePostInsert', () => {
    it('should validate correct post insert', () => {
      const post: PostInsert = {
        user_id: 'user-123',
        caption: 'Test caption',
        image_url: 'https://example.com/image.jpg',
      };

      const result = validatePostInsert(post);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject post with missing required fields', () => {
      const post: PostInsert = {
        user_id: '',
        caption: 'A'.repeat(2201), // Too long
        image_url: '',
      };

      const result = validatePostInsert(post);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('validateCommentInsert', () => {
    it('should validate correct comment insert', () => {
      const comment: CommentInsert = {
        user_id: 'user-123',
        post_id: 'post-456',
        content: 'Great post!',
      };

      const result = validateCommentInsert(comment);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject comment with invalid content', () => {
      const comment: CommentInsert = {
        user_id: '',
        post_id: '',
        content: '', // Empty content
      };

      const result = validateCommentInsert(comment);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('validateUUID', () => {
    it('should validate correct UUIDs', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ];
      
      validUUIDs.forEach(uuid => {
        const result = validateUUID(uuid);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid UUIDs', () => {
      const testCases = [
        { uuid: '', expectedError: 'id is required' },
        { uuid: 'not-a-uuid', expectedError: 'valid UUID' },
        { uuid: '123e4567-e89b-12d3-a456', expectedError: 'valid UUID' },
      ];

      testCases.forEach(({ uuid, expectedError }) => {
        const result = validateUUID(uuid);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toContain(expectedError);
      });
    });
  });

  describe('validatePagination', () => {
    it('should validate correct pagination', () => {
      const testCases = [
        { limit: 20, offset: 0 },
        { limit: 1, offset: 100 },
        { limit: 100, offset: 0 },
      ];
      
      testCases.forEach(({ limit, offset }) => {
        const result = validatePagination(limit, offset);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid pagination', () => {
      const testCases = [
        { limit: 0, offset: 0, expectedError: 'at least 1' },
        { limit: 101, offset: 0, expectedError: 'cannot exceed 100' },
        { limit: 20, offset: -1, expectedError: 'cannot be negative' },
      ];

      testCases.forEach(({ limit, offset, expectedError }) => {
        const result = validatePagination(limit, offset);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toContain(expectedError);
      });
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate correct search queries', () => {
      const validQueries = ['ab', 'test', 'search query', 'A'.repeat(100)];
      
      validQueries.forEach(query => {
        const result = validateSearchQuery(query);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid search queries', () => {
      const testCases = [
        { query: '', expectedError: 'Search query is required' },
        { query: 'a', expectedError: 'at least 2 characters' },
        { query: 'A'.repeat(101), expectedError: 'no more than 100 characters' },
      ];

      testCases.forEach(({ query, expectedError }) => {
        const result = validateSearchQuery(query);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].message).toContain(expectedError);
      });
    });
  });
});
