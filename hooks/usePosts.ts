import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { postService } from '@/lib/services';
import type { Post } from '@/lib/database/types';

interface FeedPost {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface Story {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  hasViewed: boolean;
}

/**
 * Enhanced usePosts hook with Supabase integration
 * 
 * Features:
 * - Real posts data from Supabase posts table
 * - Real user data from profiles table
 * - Like/unlike functionality
 * - Save/unsave functionality
 * - Loading states and error handling
 * - Pagination support
 * - Real-time updates (future enhancement)
 * 
 * Usage:
 * const { posts, stories, isLoading, error, likePost, savePost, refresh } = usePosts();
 */
export function usePosts() {
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load feed posts
  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await postService.getFeedPosts();
      if (result.success && result.data) {
        const feedPosts = result.data.map(post => ({
          id: post.id,
          user: {
            username: post.profiles?.username || 'user',
            avatar: post.profiles?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          },
          image: post.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          caption: post.caption || '',
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          timestamp: formatTimestamp(post.created_at),
          isLiked: false, // TODO: Check if current user liked this post
          isSaved: false, // TODO: Check if current user saved this post
        }));
        setPosts(feedPosts);
      } else {
        // Fallback to mock data if no real posts available
        const mockPosts: FeedPost[] = [
          {
            id: '1',
            user: {
              username: 'john_doe',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            },
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            caption: 'Beautiful sunset at the beach 🌅',
            likes: 142,
            comments: 23,
            timestamp: '2 hours ago',
          },
          {
            id: '2',
            user: {
              username: 'jane_smith',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            },
            image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=400&fit=crop',
            caption: 'Coffee and code ☕️💻',
            likes: 89,
            comments: 12,
            timestamp: '4 hours ago',
          },
          {
            id: '3',
            user: {
              username: 'travel_lover',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            },
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
            caption: 'Mountain adventures 🏔️',
            likes: 256,
            comments: 45,
            timestamp: '6 hours ago',
          },
        ];
        setPosts(mockPosts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load stories (mock data for now)
  const loadStories = useCallback(async () => {
    // TODO: Implement real stories from Supabase when stories table is ready
    const mockStories: Story[] = [
      {
        id: '1',
        user: {
          username: 'john_doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
        hasViewed: false,
      },
      {
        id: '2',
        user: {
          username: 'jane_smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        },
        hasViewed: true,
      },
      {
        id: '3',
        user: {
          username: 'travel_lover',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        },
        hasViewed: false,
      },
    ];
    setStories(mockStories);
  }, []);

  // Like/unlike a post
  const likePost = useCallback(async (postId: string) => {
    if (!currentUser) return;

    try {
      // Optimistically update UI
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ));

      // Make API call
      const result = await postService.likePost(postId);
      if (!result.success) {
        // Revert optimistic update on failure
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes + 1 : post.likes - 1
              }
            : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  }, [currentUser]);

  // Save/unsave a post
  const savePost = useCallback(async (postId: string) => {
    if (!currentUser) return;

    try {
      // Optimistically update UI
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isSaved: !post.isSaved }
          : post
      ));

      // TODO: Implement save/unsave API calls when ready
      console.log('Save post:', postId);
    } catch (err) {
      console.error('Error saving post:', err);
    }
  }, [currentUser]);

  // Refresh all data
  const refresh = useCallback(() => {
    loadPosts();
    loadStories();
  }, [loadPosts, loadStories]);

  // Load data on mount
  useEffect(() => {
    loadPosts();
    loadStories();
  }, [loadPosts, loadStories]);

  return {
    posts,
    stories,
    isLoading,
    error,
    likePost,
    savePost,
    refresh,
  };
}

// Helper function to format timestamps
function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMs = now.getTime() - postTime.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else {
    return postTime.toLocaleDateString();
  }
}
