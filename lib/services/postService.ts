import { supabase } from '../supabase';
import type {
  Post,
  PostInsert,
  PostUpdate,
  Like,
  Comment,
  CommentInsert,
  CommentUpdate,
  ApiResponse,
  PaginatedResponse,
} from '../database/types';
import {
  validatePostInsert,
  validatePostUpdate,
  validateCommentInsert,
  validateCommentUpdate,
  validateUUID,
  validatePagination,
} from '../utils/serviceValidation';
import {
  parseSupabaseError,
  createErrorResponse,
  createPaginatedErrorResponse,
  createValidationErrorResponse,
  handleAsyncOperation,
  logError,
} from '../utils/errorHandling';

// Post service for post management and interactions
export class PostService {
  /**
   * Get a post by ID with profile information
   */
  async getPost(postId: string): Promise<ApiResponse<Post>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*)
        `)
        .eq('id', postId)
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
   * Create a new post
   */
  async createPost(postData: PostInsert): Promise<ApiResponse<Post>> {
    // Validate input
    const validation = validatePostInsert(postData);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.errors);
    }

    const result = await handleAsyncOperation(async () => {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select(`
          *,
          profiles (*)
        `)
        .single();

      if (error) {
        const serviceError = parseSupabaseError(error);
        logError(serviceError, 'PostService.createPost', postData.user_id, { postData });
        return createErrorResponse(serviceError);
      }

      return { data, error: null, success: true };
    }, 'PostService.createPost');

    if ('type' in result) {
      return createErrorResponse(result);
    }

    return result;
  }

  /**
   * Update a post
   */
  async updatePost(postId: string, updates: PostUpdate): Promise<ApiResponse<Post>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select(`
          *,
          profiles (*)
        `)
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
   * Delete a post
   */
  async deletePost(postId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

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
   * Get posts for feed (from followed users and public posts)
   */
  async getFeedPosts(
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Post>> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return {
          data: [],
          error: 'User not authenticated',
          success: false,
          pagination: {
            page: Math.floor(offset / limit) + 1,
            limit,
            total: 0,
            hasMore: false,
          },
        };
      }

      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          is_liked:likes!inner(user_id)
        `, { count: 'exact' })
        .or(`
          user_id.eq.${currentUser.user.id},
          user_id.in.(
            select following_id from follows where follower_id = '${currentUser.user.id}'
          )
        `)
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
   * Get posts by user ID
   */
  async getUserPosts(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Post>> {
    try {
      const { data, error, count } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*)
        `, { count: 'exact' })
        .eq('user_id', userId)
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
   * Like a post
   */
  async likePost(postId: string): Promise<ApiResponse<Like>> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: 'User not authenticated', success: false };
      }

      const { data, error } = await supabase
        .from('likes')
        .insert({
          user_id: currentUser.user.id,
          post_id: postId,
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
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<ApiResponse<null>> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: 'User not authenticated', success: false };
      }

      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUser.user.id)
        .eq('post_id', postId);

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
   * Check if current user has liked a post
   */
  async isPostLiked(postId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: false, error: null, success: true };
      }

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', currentUser.user.id)
        .eq('post_id', postId)
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
   * Get likes for a post
   */
  async getPostLikes(
    postId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Like>> {
    try {
      const { data, error, count } = await supabase
        .from('likes')
        .select(`
          *,
          profiles (*)
        `, { count: 'exact' })
        .eq('post_id', postId)
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
   * Add a comment to a post
   */
  async addComment(commentData: CommentInsert): Promise<ApiResponse<Comment>> {
    // Validate input
    const validation = validateCommentInsert(commentData);
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.errors);
    }

    const result = await handleAsyncOperation(async () => {
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          profiles (*)
        `)
        .single();

      if (error) {
        const serviceError = parseSupabaseError(error);
        logError(serviceError, 'PostService.addComment', commentData.user_id, { commentData });
        return createErrorResponse(serviceError);
      }

      return { data, error: null, success: true };
    }, 'PostService.addComment');

    if ('type' in result) {
      return createErrorResponse(result);
    }

    return result;
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, updates: CommentUpdate): Promise<ApiResponse<Comment>> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', commentId)
        .select(`
          *,
          profiles (*)
        `)
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
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

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
   * Get comments for a post
   */
  async getPostComments(
    postId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedResponse<Comment>> {
    try {
      const { data, error, count } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (*)
        `, { count: 'exact' })
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
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
   * Get a comment by ID
   */
  async getComment(commentId: string): Promise<ApiResponse<Comment>> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (*)
        `)
        .eq('id', commentId)
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
}

// Export singleton instance
export const postService = new PostService();
