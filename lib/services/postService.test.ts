import { PostService } from './postService';
import type { PostInsert, PostUpdate, CommentInsert } from '../database/types';

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

describe('PostService', () => {
  let postService: PostService;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    postService = new PostService();
    mockFrom = (supabase as any).from as jest.Mock;
    jest.clearAllMocks();
  });

  describe('getPost', () => {
    it('should return post when found', async () => {
      const mockPost = {
        id: 'post-123',
        user_id: 'user-123',
        caption: 'Test caption',
        image_url: 'https://example.com/image.jpg',
        likes_count: 5,
        comments_count: 2,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        profiles: {
          id: 'user-123',
          username: 'testuser',
          full_name: 'Test User',
        },
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockPost,
        error: null,
      });

      const result = await postService.getPost('post-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPost);
      expect(result.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('posts');
    });

    it('should handle not found error', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' },
      });

      const result = await postService.getPost('post-123');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('not found');
    });
  });

  describe('createPost', () => {
    it('should create post successfully', async () => {
      const postData: PostInsert = {
        user_id: 'user-123',
        caption: 'Test caption',
        image_url: 'https://example.com/image.jpg',
      };

      const mockCreatedPost = {
        id: 'post-123',
        ...postData,
        likes_count: 0,
        comments_count: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        profiles: {
          id: 'user-123',
          username: 'testuser',
          full_name: 'Test User',
        },
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockCreatedPost,
        error: null,
      });

      const result = await postService.createPost(postData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedPost);
      expect(result.error).toBeNull();
    });

    it('should return validation error for missing image_url', async () => {
      const postData: PostInsert = {
        user_id: 'user-123',
        caption: 'Test caption',
        image_url: '', // Empty image URL
      };

      const result = await postService.createPost(postData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Image URL is required');
    });

    it('should return validation error for long caption', async () => {
      const postData: PostInsert = {
        user_id: 'user-123',
        caption: 'a'.repeat(2201), // Too long
        image_url: 'https://example.com/image.jpg',
      };

      const result = await postService.createPost(postData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('no more than 2200 characters');
    });
  });

  describe('updatePost', () => {
    it('should update post successfully', async () => {
      const updates: PostUpdate = {
        caption: 'Updated caption',
      };

      const mockUpdatedPost = {
        id: 'post-123',
        user_id: 'user-123',
        caption: 'Updated caption',
        image_url: 'https://example.com/image.jpg',
        likes_count: 5,
        comments_count: 2,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        profiles: {
          id: 'user-123',
          username: 'testuser',
          full_name: 'Test User',
        },
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockUpdatedPost,
        error: null,
      });

      const result = await postService.updatePost('post-123', updates);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedPost);
      expect(result.error).toBeNull();
    });
  });

  describe('likePost', () => {
    beforeEach(() => {
      (supabase as any).auth.getUser.mockResolvedValue({
        data: { user: { id: 'current-user-123' } },
        error: null,
      });
    });

    it('should like post successfully', async () => {
      const mockLike = {
        id: 'like-123',
        user_id: 'current-user-123',
        post_id: 'post-456',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockLike,
        error: null,
      });

      const result = await postService.likePost('post-456');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLike);
      expect(result.error).toBeNull();
    });

    it('should return error when not authenticated', async () => {
      (supabase as any).auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await postService.likePost('post-456');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('not authenticated');
    });

    it('should handle duplicate like error', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      });

      const result = await postService.likePost('post-456');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('duplicate key value');
    });
  });

  describe('addComment', () => {
    beforeEach(() => {
      (supabase as any).auth.getUser.mockResolvedValue({
        data: { user: { id: 'current-user-123' } },
        error: null,
      });
    });

    it('should add comment successfully', async () => {
      const commentData: CommentInsert = {
        user_id: 'current-user-123',
        post_id: 'post-456',
        content: 'Great post!',
      };

      const mockComment = {
        id: 'comment-123',
        ...commentData,
        likes_count: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        profiles: {
          id: 'current-user-123',
          username: 'currentuser',
          full_name: 'Current User',
        },
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockComment,
        error: null,
      });

      const result = await postService.addComment(commentData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockComment);
      expect(result.error).toBeNull();
    });

    it('should return validation error for empty content', async () => {
      const commentData: CommentInsert = {
        user_id: 'current-user-123',
        post_id: 'post-456',
        content: '', // Empty content
      };

      const result = await postService.addComment(commentData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('Comment content is required');
    });

    it('should return validation error for long content', async () => {
      const commentData: CommentInsert = {
        user_id: 'current-user-123',
        post_id: 'post-456',
        content: 'a'.repeat(501), // Too long
      };

      const result = await postService.addComment(commentData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toContain('no more than 500 characters');
    });
  });

  describe('getUserPosts', () => {
    it('should get user posts successfully', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          user_id: 'user-123',
          caption: 'Post 1',
          image_url: 'https://example.com/image1.jpg',
          likes_count: 5,
          comments_count: 2,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          profiles: {
            id: 'user-123',
            username: 'testuser',
            full_name: 'Test User',
          },
        },
      ];

      mockQueryBuilder.range.mockResolvedValue({
        data: mockPosts,
        error: null,
        count: 1,
      });

      const result = await postService.getUserPosts('user-123', 20, 0);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPosts);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.hasMore).toBe(false);
    });
  });

  describe('isPostLiked', () => {
    beforeEach(() => {
      (supabase as any).auth.getUser.mockResolvedValue({
        data: { user: { id: 'current-user-123' } },
        error: null,
      });
    });

    it('should return true when post is liked', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: { id: 'like-123' },
        error: null,
      });

      const result = await postService.isPostLiked('post-456');

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return false when post is not liked', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' },
      });

      const result = await postService.isPostLiked('post-456');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should return false when not authenticated', async () => {
      (supabase as any).auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await postService.isPostLiked('post-456');

      expect(result.success).toBe(true);
      expect(result.data).toBe(false);
      expect(result.error).toBeNull();
    });
  });
});
