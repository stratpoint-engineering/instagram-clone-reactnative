import { supabase } from '../supabase';
import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  ApiResponse,
  PaginatedResponse,
  Follow,
} from '../database/types';
import {
  validateProfileInsert,
  validateProfileUpdate,
  validateUUID,
  validatePagination,
  validateSearchQuery,
  validateUsername,
} from '../utils/serviceValidation';
import {
  parseSupabaseError,
  createErrorResponse,
  createPaginatedErrorResponse,
  createValidationErrorResponse,
  handleAsyncOperation,
  retryOperation,
  logError,
} from '../utils/errorHandling';

// User service for profile management and user operations
export class UserService {
  /**
   * Get a user profile by ID
   */
  async getProfile(userId: string): Promise<ApiResponse<Profile>> {
    // Validate input
    const uuidValidation = validateUUID(userId, 'userId');
    if (!uuidValidation.isValid) {
      return createValidationErrorResponse(uuidValidation.errors);
    }

    const result = await handleAsyncOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        const serviceError = parseSupabaseError(error);
        logError(serviceError, 'UserService.getProfile', userId);
        return createErrorResponse(serviceError);
      }

      return { data, error: null, success: true };
    }, 'UserService.getProfile');

    if ('type' in result) {
      // It's a ServiceError
      return createErrorResponse(result);
    }

    return result;
  }

  /**
   * Get a user profile by username
   */
  async getProfileByUsername(username: string): Promise<ApiResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  /**
   * Create a new user profile
   */
  async createProfile(profileData: ProfileInsert): Promise<ApiResponse<Profile>> {
    // Validate input
    const validation = validateProfileInsert(profileData);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.errors);
    }

    const result = await handleAsyncOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        const serviceError = parseSupabaseError(error);
        logError(serviceError, 'UserService.createProfile', profileData.id, { profileData });
        return createErrorResponse(serviceError);
      }

      return { data, error: null, success: true };
    }, 'UserService.createProfile');

    if ('type' in result) {
      return createErrorResponse(result);
    }

    return result;
  }

  /**
   * Update a user profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<ApiResponse<Profile>> {
    // Validate input
    const uuidValidation = validateUUID(userId, 'userId');
    if (!uuidValidation.isValid) {
      return createValidationErrorResponse(uuidValidation.errors);
    }

    const validation = validateProfileUpdate(updates);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.errors);
    }

    const result = await handleAsyncOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        const serviceError = parseSupabaseError(error);
        logError(serviceError, 'UserService.updateProfile', userId, { updates });
        return createErrorResponse(serviceError);
      }

      return { data, error: null, success: true };
    }, 'UserService.updateProfile');

    if ('type' in result) {
      return createErrorResponse(result);
    }

    return result;
  }

  /**
   * Delete a user profile
   */
  async deleteProfile(userId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: null, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  /**
   * Search users by username or full name
   */
  async searchUsers(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Profile>> {
    // Validate input
    const queryValidation = validateSearchQuery(query);
    if (!queryValidation.isValid) {
      return createPaginatedErrorResponse(
        { type: 'VALIDATION' as any, message: queryValidation.errors[0].message },
        limit,
        offset
      );
    }

    const paginationValidation = validatePagination(limit, offset);
    if (!paginationValidation.isValid) {
      return createPaginatedErrorResponse(
        { type: 'VALIDATION' as any, message: paginationValidation.errors[0].message },
        limit,
        offset
      );
    }

    const result = await handleAsyncOperation(async () => {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('username')
        .range(offset, offset + limit - 1);

      if (error) {
        const serviceError = parseSupabaseError(error);
        logError(serviceError, 'UserService.searchUsers', undefined, { query, limit, offset });
        return createPaginatedErrorResponse(serviceError, limit, offset);
      }

      const total = count || 0;
      const page = Math.floor(offset / limit) + 1;
      const hasMore = offset + limit < total;

      return {
        data: data || [],
        error: null,
        success: true,
        pagination: {
          page,
          limit,
          total,
          hasMore,
        },
      };
    }, 'UserService.searchUsers');

    if ('type' in result) {
      return createPaginatedErrorResponse(result, limit, offset);
    }

    return result;
  }

  /**
   * Follow a user
   */
  async followUser(followingId: string): Promise<ApiResponse<Follow>> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: 'User not authenticated', success: false };
      }

      const { data, error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUser.user.id,
          following_id: followingId,
        })
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followingId: string): Promise<ApiResponse<null>> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: 'User not authenticated', success: false };
      }

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.user.id)
        .eq('following_id', followingId);

      if (error) {
        return { data: null, error: error.message, success: false };
      }

      return { data: null, error: null, success: true };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  /**
   * Check if current user is following another user
   */
  async isFollowing(followingId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: false, error: null, success: true };
      }

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.user.id)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        return { data: false, error: error.message, success: false };
      }

      return { data: !!data, error: null, success: true };
    } catch (error) {
      return {
        data: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  /**
   * Get user's followers
   */
  async getFollowers(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Profile>> {
    try {
      const { data, error, count } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey (*)
        `, { count: 'exact' })
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
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
      }

      const profiles = data?.map(item => (item as any).profiles).filter(Boolean) || [];
      const total = count || 0;
      const page = Math.floor(offset / limit) + 1;
      const hasMore = offset + limit < total;

      return {
        data: profiles,
        error: null,
        success: true,
        pagination: {
          page,
          limit,
          total,
          hasMore,
        },
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total: 0,
          hasMore: false,
        },
      };
    }
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Profile>> {
    try {
      const { data, error, count } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (*)
        `, { count: 'exact' })
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
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
      }

      const profiles = data?.map(item => (item as any).profiles).filter(Boolean) || [];
      const total = count || 0;
      const page = Math.floor(offset / limit) + 1;
      const hasMore = offset + limit < total;

      return {
        data: profiles,
        error: null,
        success: true,
        pagination: {
          page,
          limit,
          total,
          hasMore,
        },
      };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total: 0,
          hasMore: false,
        },
      };
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<ApiResponse<boolean>> {
    // Validate input
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return createValidationErrorResponse(usernameValidation.errors, false);
    }

    const result = await handleAsyncOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (error && error.code === 'PGRST116') { // Not found - username is available
        return { data: true, error: null, success: true };
      }

      if (error) {
        const serviceError = parseSupabaseError(error);
        logError(serviceError, 'UserService.isUsernameAvailable', undefined, { username });
        return createErrorResponse(serviceError, false);
      }

      return { data: false, error: null, success: true }; // Username exists
    }, 'UserService.isUsernameAvailable');

    if ('type' in result) {
      return createErrorResponse(result, false);
    }

    return result;
  }
}

// Export singleton instance
export const userService = new UserService();
