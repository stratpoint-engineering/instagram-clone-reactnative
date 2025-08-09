import { useState, useEffect, useMemo } from 'react';

interface Post {
  id: string;
  image: string;
  likes: number;
}

export function useSearch(query: string) {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);

  useEffect(() => {
    // Mock trending posts
    const mockPosts: Post[] = [
      { id: '1', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', likes: 142 },
      { id: '2', image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=400&fit=crop', likes: 89 },
      { id: '3', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop', likes: 256 },
      { id: '4', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop', likes: 178 },
      { id: '5', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop', likes: 203 },
      { id: '6', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop', likes: 134 },
      { id: '7', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', likes: 167 },
      { id: '8', image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=400&fit=crop', likes: 92 },
      { id: '9', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop', likes: 245 },
    ];

    setTrendingPosts(mockPosts);
  }, []);

  const searchResults = useMemo(() => {
    if (!query) return [];
    // Mock search - in a real app, this would be an API call
    return trendingPosts.filter((_, index) => index % 2 === 0);
  }, [query, trendingPosts]);

  return { searchResults, trendingPosts };
}