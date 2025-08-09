import { useState, useEffect } from 'react';

interface User {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  website?: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface Post {
  id: string;
  image: string;
}

export function useProfile() {
  const [user] = useState<User>({
    username: 'your_username',
    displayName: 'Your Name',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    bio: 'Living life one photo at a time 📸\nTravel • Photography • Coffee',
    website: 'www.yourwebsite.com',
    postsCount: 127,
    followersCount: 1234,
    followingCount: 567,
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const mockPosts: Post[] = [
      { id: '1', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },
      { id: '2', image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=400&fit=crop' },
      { id: '3', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop' },
      { id: '4', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop' },
      { id: '5', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop' },
      { id: '6', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop' },
      { id: '7', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop' },
      { id: '8', image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=400&fit=crop' },
      { id: '9', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop' },
    ];

    setPosts(mockPosts);
  }, []);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return { user, posts, isFollowing, toggleFollow };
}