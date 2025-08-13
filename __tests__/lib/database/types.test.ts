import type {
  Database,
  Profile,
  Post,
  Like,
  Comment,
  Follow,
  Story,
  User,
  AuthUser,
  ApiResponse,
  PaginatedResponse,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../../lib/database/types';

describe('Database Types', () => {
  describe('Database Schema', () => {
    it('should have correct table structure', () => {
      // This test ensures the Database type has the expected structure
      const mockDatabase: Database = {
        public: {
          Tables: {
            profiles: {
              Row: {} as Profile,
              Insert: {} as any,
              Update: {} as any,
            },
            posts: {
              Row: {} as Post,
              Insert: {} as any,
              Update: {} as any,
            },
            likes: {
              Row: {} as Like,
              Insert: {} as any,
              Update: {} as any,
            },
            comments: {
              Row: {} as Comment,
              Insert: {} as any,
              Update: {} as any,
            },
            follows: {
              Row: {} as Follow,
              Insert: {} as any,
              Update: {} as any,
            },
            stories: {
              Row: {} as Story,
              Insert: {} as any,
              Update: {} as any,
            },
          },
          Views: {},
          Functions: {},
          Enums: {},
        },
      };

      expect(mockDatabase.public.Tables).toBeDefined();
      expect(mockDatabase.public.Tables.profiles).toBeDefined();
      expect(mockDatabase.public.Tables.posts).toBeDefined();
      expect(mockDatabase.public.Tables.likes).toBeDefined();
      expect(mockDatabase.public.Tables.comments).toBeDefined();
      expect(mockDatabase.public.Tables.follows).toBeDefined();
      expect(mockDatabase.public.Tables.stories).toBeDefined();
    });
  });

  describe('Profile Types', () => {
    it('should have correct Profile structure', () => {
      const mockProfile: Profile = {
        id: 'user-123',
        username: 'testuser',
        full_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
        website: 'https://example.com',
        is_private: false,
        followers_count: 100,
        following_count: 50,
        posts_count: 25,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      expect(mockProfile.id).toBe('user-123');
      expect(mockProfile.username).toBe('testuser');
      expect(typeof mockProfile.is_private).toBe('boolean');
      expect(typeof mockProfile.followers_count).toBe('number');
    });

    it('should allow nullable fields in Profile', () => {
      const mockProfile: Profile = {
        id: 'user-123',
        username: 'testuser',
        full_name: null,
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

      expect(mockProfile.full_name).toBeNull();
      expect(mockProfile.bio).toBeNull();
      expect(mockProfile.avatar_url).toBeNull();
      expect(mockProfile.website).toBeNull();
    });
  });

  describe('Post Types', () => {
    it('should have correct Post structure', () => {
      const mockPost: Post = {
        id: 'post-123',
        user_id: 'user-123',
        caption: 'Test caption',
        image_url: 'https://example.com/image.jpg',
        likes_count: 10,
        comments_count: 5,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      expect(mockPost.id).toBe('post-123');
      expect(mockPost.user_id).toBe('user-123');
      expect(typeof mockPost.likes_count).toBe('number');
      expect(typeof mockPost.comments_count).toBe('number');
    });

    it('should allow optional joined data in Post', () => {
      const mockPost: Post = {
        id: 'post-123',
        user_id: 'user-123',
        caption: null,
        image_url: 'https://example.com/image.jpg',
        likes_count: 10,
        comments_count: 5,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        profiles: {
          id: 'user-123',
          username: 'testuser',
        } as Profile,
        is_liked: true,
      };

      expect(mockPost.profiles).toBeDefined();
      expect(mockPost.is_liked).toBe(true);
    });
  });

  describe('Like Types', () => {
    it('should have correct Like structure', () => {
      const mockLike: Like = {
        id: 'like-123',
        user_id: 'user-123',
        post_id: 'post-123',
        created_at: '2023-01-01T00:00:00Z',
      };

      expect(mockLike.id).toBe('like-123');
      expect(mockLike.user_id).toBe('user-123');
      expect(mockLike.post_id).toBe('post-123');
    });
  });

  describe('Comment Types', () => {
    it('should have correct Comment structure', () => {
      const mockComment: Comment = {
        id: 'comment-123',
        user_id: 'user-123',
        post_id: 'post-123',
        content: 'Great post!',
        likes_count: 2,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      expect(mockComment.id).toBe('comment-123');
      expect(mockComment.content).toBe('Great post!');
      expect(typeof mockComment.likes_count).toBe('number');
    });
  });

  describe('Follow Types', () => {
    it('should have correct Follow structure', () => {
      const mockFollow: Follow = {
        id: 'follow-123',
        follower_id: 'user-123',
        following_id: 'user-456',
        created_at: '2023-01-01T00:00:00Z',
      };

      expect(mockFollow.id).toBe('follow-123');
      expect(mockFollow.follower_id).toBe('user-123');
      expect(mockFollow.following_id).toBe('user-456');
    });
  });

  describe('Story Types', () => {
    it('should have correct Story structure', () => {
      const mockStory: Story = {
        id: 'story-123',
        user_id: 'user-123',
        image_url: 'https://example.com/story.jpg',
        caption: 'Story caption',
        views_count: 50,
        created_at: '2023-01-01T00:00:00Z',
        expires_at: '2023-01-02T00:00:00Z',
      };

      expect(mockStory.id).toBe('story-123');
      expect(mockStory.user_id).toBe('user-123');
      expect(typeof mockStory.views_count).toBe('number');
    });
  });

  describe('Utility Types', () => {
    it('should work with Tables utility type', () => {
      type ProfileRow = Tables<'profiles'>;
      type PostRow = Tables<'posts'>;

      const profile: ProfileRow = {
        id: 'user-123',
        username: 'testuser',
      } as ProfileRow;

      const post: PostRow = {
        id: 'post-123',
        user_id: 'user-123',
      } as PostRow;

      expect(profile.id).toBe('user-123');
      expect(post.id).toBe('post-123');
    });
  });

  describe('Auth Types', () => {
    it('should have correct AuthUser structure', () => {
      const mockAuthUser: AuthUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
      };

      expect(mockAuthUser.id).toBe('user-123');
      expect(mockAuthUser.email).toBe('test@example.com');
      expect(typeof mockAuthUser.app_metadata).toBe('object');
    });

    it('should have correct User structure with profile', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        app_metadata: {},
        user_metadata: {},
        profile: {
          id: 'user-123',
          username: 'testuser',
        } as Profile,
      };

      expect(mockUser.profile).toBeDefined();
      expect(mockUser.profile?.username).toBe('testuser');
    });
  });

  describe('API Response Types', () => {
    it('should have correct ApiResponse structure', () => {
      const successResponse: ApiResponse<Profile> = {
        data: {
          id: 'user-123',
          username: 'testuser',
        } as Profile,
        error: null,
        success: true,
      };

      const errorResponse: ApiResponse = {
        data: null,
        error: 'Something went wrong',
        success: false,
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBeDefined();
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Something went wrong');
    });

    it('should have correct PaginatedResponse structure', () => {
      const paginatedResponse: PaginatedResponse<Post> = {
        data: [
          {
            id: 'post-1',
            user_id: 'user-123',
          } as Post,
        ],
        error: null,
        success: true,
        pagination: {
          page: 1,
          limit: 10,
          total: 100,
          hasMore: true,
        },
      };

      expect(paginatedResponse.pagination).toBeDefined();
      expect(paginatedResponse.pagination.page).toBe(1);
      expect(paginatedResponse.pagination.hasMore).toBe(true);
    });
  });
});
