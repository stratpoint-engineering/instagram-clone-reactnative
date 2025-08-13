import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { userService, postService } from '@/lib/services';
import type { Profile, Post } from '@/lib/database/types';

interface ProfileUser {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  website?: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface ProfilePost {
  id: string;
  image: string;
}

/**
 * Enhanced useProfile hook with Supabase integration
 *
 * Features:
 * - Real user data from Supabase profiles table
 * - Real posts data from Supabase posts table
 * - Follow/unfollow functionality
 * - Loading states and error handling
 * - Support for viewing other users' profiles
 *
 * Usage:
 * const { user, posts, isLoading, error, isFollowing, toggleFollow } = useProfile(userId);
 */
export function useProfile(userId?: string) {
  const { user: currentUser, profile: currentProfile } = useAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine which user profile to load
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  // Load user profile data
  const loadProfile = useCallback(async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // If viewing own profile, use current profile data
      if (isOwnProfile && currentProfile) {
        setUser({
          username: currentProfile.username || 'your_username',
          displayName: currentProfile.full_name || 'Your Name',
          avatar: currentProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
          bio: currentProfile.bio || 'Living life one photo at a time 📸\nTravel • Photography • Coffee',
          website: currentProfile.website || undefined,
          postsCount: 0, // Will be updated when posts load
          followersCount: 0, // TODO: Implement follower count
          followingCount: 0, // TODO: Implement following count
        });
      } else {
        // Load other user's profile
        const profileResult = await userService.getProfile(targetUserId);
        if (profileResult.success && profileResult.data) {
          const profile = profileResult.data;
          setUser({
            username: profile.username || 'user',
            displayName: profile.full_name || 'User',
            avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
            bio: profile.bio || 'No bio available',
            website: profile.website || undefined,
            postsCount: 0, // Will be updated when posts load
            followersCount: 0, // TODO: Implement follower count
            followingCount: 0, // TODO: Implement following count
          });

          // Check if current user is following this user
          if (currentUser && !isOwnProfile) {
            const followResult = await userService.isFollowing(targetUserId);
            if (followResult.success) {
              setIsFollowing(followResult.data || false);
            }
          }
        } else {
          setError(profileResult.error || 'Failed to load profile');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId, isOwnProfile, currentProfile, currentUser]);

  // Load user posts
  const loadPosts = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const postsResult = await postService.getUserPosts(targetUserId);
      if (postsResult.success && postsResult.data) {
        const userPosts = postsResult.data.map(post => ({
          id: post.id,
          image: post.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        }));
        setPosts(userPosts);

        // Update posts count
        setUser(prev => prev ? { ...prev, postsCount: userPosts.length } : null);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    }
  }, [targetUserId]);

  // Toggle follow status
  const toggleFollow = useCallback(async () => {
    if (!currentUser || !targetUserId || isOwnProfile) return;

    try {
      if (isFollowing) {
        const result = await userService.unfollowUser(targetUserId);
        if (result.success) {
          setIsFollowing(false);
        }
      } else {
        const result = await userService.followUser(targetUserId);
        if (result.success) {
          setIsFollowing(true);
        }
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  }, [currentUser, targetUserId, isOwnProfile, isFollowing]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    user,
    posts,
    isFollowing,
    toggleFollow,
    isLoading,
    error,
    isOwnProfile,
    refresh: () => {
      loadProfile();
      loadPosts();
    }
  };
}
