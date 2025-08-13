import { UserService } from './userService';
import type { ProfileInsert, ProfileUpdate } from '../database/types';

// Mock query builder
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => mockQueryBuilder),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Import the mocked supabase
import { supabase } from '../supabase';

describe('UserService', () => {
  let userService: UserService;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    userService = new UserService();
    mockFrom = (supabase as any).from as jest.Mock;
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        full_name: 'Test User',
        bio: 'Test bio',
        avatar_url: null,
        website: null,
        is_private: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await userService.getProfile('123e4567-e89b-12d3-a456-426614174000');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('profiles');
    });

    it('should return error for invalid UUID', async () => {
      const result = await userService.getProfile('invalid-uuid');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('must be a valid UUID');
    });

    it('should handle not found error', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' },
      });

      const result = await userService.getProfile('123e4567-e89b-12d3-a456-426614174000');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('not found');
    });
  });

  describe('createProfile', () => {
    it('should create profile successfully', async () => {
      const profileData: ProfileInsert = {
        id: 'user-123',
        username: 'testuser',
        full_name: 'Test User',
      };

      const mockCreatedProfile = {
        ...profileData,
        bio: null,
        avatar_url: null,
        website: null,
        is_private: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockCreatedProfile,
        error: null,
      });

      const result = await userService.createProfile(profileData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedProfile);
      expect(result.error).toBeNull();
    });

    it('should return validation error for invalid username', async () => {
      const profileData: ProfileInsert = {
        id: 'user-123',
        username: 'ab', // Too short
      };

      const result = await userService.createProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('at least 3 characters');
    });

    it('should handle username conflict', async () => {
      const profileData: ProfileInsert = {
        id: 'user-123',
        username: 'testuser',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint "profiles_username_key"' },
      });

      const result = await userService.createProfile(profileData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('username is already taken');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updates: ProfileUpdate = {
        bio: 'Updated bio',
        website: 'https://example.com',
      };

      const mockUpdatedProfile = {
        id: 'user-123',
        username: 'testuser',
        full_name: 'Test User',
        bio: 'Updated bio',
        avatar_url: null,
        website: 'https://example.com',
        is_private: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await userService.updateProfile('123e4567-e89b-12d3-a456-426614174000', updates);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedProfile);
      expect(result.error).toBeNull();
    });

    it('should return validation error for invalid website', async () => {
      const updates: ProfileUpdate = {
        website: 'invalid-url',
      };

      const result = await userService.updateProfile('123e4567-e89b-12d3-a456-426614174000', updates);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('valid website URL');
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          username: 'testuser1',
          full_name: 'Test User 1',
          bio: null,
          avatar_url: null,
          website: null,
          is_private: false,
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockQueryBuilder.range.mockResolvedValue({
        data: mockUsers,
        error: null,
        count: 1,
      });

      const result = await userService.searchUsers('test', 20, 0);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.hasMore).toBe(false);
    });

    it('should return validation error for short query', async () => {
      const result = await userService.searchUsers('a', 20, 0);

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toContain('at least 2 characters');
    });

    it('should return validation error for invalid limit', async () => {
      const result = await userService.searchUsers('test', 101, 0);

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toContain('cannot exceed 100');
    });
  });

  describe('followUser', () => {
    beforeEach(() => {
      (supabase as any).auth.getUser.mockResolvedValue({
        data: { user: { id: 'current-user-123' } },
        error: null,
      });
    });

    it('should follow user successfully', async () => {
      const mockFollow = {
        id: 'follow-123',
        follower_id: 'current-user-123',
        following_id: 'user-456',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockFollow,
        error: null,
      });

      const result = await userService.followUser('user-456');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFollow);
      expect(result.error).toBeNull();
    });

    it('should return error when not authenticated', async () => {
      (supabase as any).auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await userService.followUser('user-456');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('not authenticated');
    });
  });

  describe('isUsernameAvailable', () => {
    it('should return true when username is available', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' },
      });

      const result = await userService.isUsernameAvailable('newuser');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return false when username is taken', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: { id: 'user-123' },
        error: null,
      });

      const result = await userService.isUsernameAvailable('existinguser');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should return validation error for invalid username', async () => {
      const result = await userService.isUsernameAvailable('ab');

      expect(result.success).toBe(false);
      expect(result.data).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });
  });
});
