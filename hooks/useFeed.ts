import { useState, useEffect } from 'react';

interface User {
  username: string;
  avatar: string;
}

interface Post {
  id: string;
  user: User;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface Story {
  id: string;
  user: User;
  hasViewed: boolean;
}

export function useFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    // Mock data - in a real app, this would come from an API
    const mockPosts: Post[] = [
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
        caption: 'Delicious breakfast to start the day! 🥞',
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
        caption: 'Mountain hiking adventure! The view was incredible 🏔️',
        likes: 256,
        comments: 45,
        timestamp: '6 hours ago',
      },
    ];

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

    setPosts(mockPosts);
    setStories(mockStories);
  }, []);

  return { posts, stories };
}