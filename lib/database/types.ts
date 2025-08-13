// Database entity types for Instagram Clone
// These types represent the structure of our Supabase database tables

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
      };
      likes: {
        Row: Like;
        Insert: LikeInsert;
        Update: LikeUpdate;
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
      };
      follows: {
        Row: Follow;
        Insert: FollowInsert;
        Update: FollowUpdate;
      };
      stories: {
        Row: Story;
        Insert: StoryInsert;
        Update: StoryUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Profile types
export interface Profile {
  id: string; // UUID, matches auth.users.id
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  is_private: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  username: string;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  is_private?: boolean;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export interface ProfileUpdate {
  username?: string;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  is_private?: boolean;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  updated_at?: string;
}

// Post types
export interface Post {
  id: string;
  user_id: string;
  caption: string | null;
  image_url: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Joined data (not in database, but useful for queries)
  profiles?: Profile;
  is_liked?: boolean;
}

export interface PostInsert {
  user_id: string;
  caption?: string | null;
  image_url: string;
  likes_count?: number;
  comments_count?: number;
}

export interface PostUpdate {
  caption?: string | null;
  likes_count?: number;
  comments_count?: number;
  updated_at?: string;
}

// Like types
export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  // Joined data
  profiles?: Profile;
  posts?: Post;
}

export interface LikeInsert {
  user_id: string;
  post_id: string;
}

export interface LikeUpdate {
  // Likes typically don't get updated, only created/deleted
  [key: string]: never;
}

// Comment types
export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: Profile;
  posts?: Post;
}

export interface CommentInsert {
  user_id: string;
  post_id: string;
  content: string;
  likes_count?: number;
}

export interface CommentUpdate {
  content?: string;
  likes_count?: number;
  updated_at?: string;
}

// Follow types
export interface Follow {
  id: string;
  follower_id: string; // User who is following
  following_id: string; // User being followed
  created_at: string;
  // Joined data
  follower_profile?: Profile;
  following_profile?: Profile;
}

export interface FollowInsert {
  follower_id: string;
  following_id: string;
}

export interface FollowUpdate {
  // Follows typically don't get updated, only created/deleted
  [key: string]: never;
}

// Story types
export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  views_count: number;
  created_at: string;
  expires_at: string; // 24 hours from created_at
  // Joined data
  profiles?: Profile;
  is_viewed?: boolean;
}

export interface StoryInsert {
  user_id: string;
  image_url: string;
  caption?: string | null;
  views_count?: number;
  expires_at?: string;
}

export interface StoryUpdate {
  caption?: string | null;
  views_count?: number;
}

// Utility types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Auth user type (from Supabase Auth)
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
}

// Combined user type (Auth + Profile)
export interface User extends AuthUser {
  profile?: Profile;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
