import { useState, useEffect } from 'react';

interface User {
  username: string;
  avatar: string;
}

interface Post {
  image: string;
}

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow';
  user: User;
  post?: Post;
  comment?: string;
  timestamp: string;
}

interface Activities {
  today: Activity[];
  thisWeek: Activity[];
  thisMonth: Activity[];
}

export function useActivity() {
  const [activities, setActivities] = useState<Activities>({
    today: [],
    thisWeek: [],
    thisMonth: [],
  });

  useEffect(() => {
    const mockActivities: Activities = {
      today: [
        {
          id: '1',
          type: 'like',
          user: {
            username: 'john_doe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          },
          post: {
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          },
          timestamp: '2h',
        },
        {
          id: '2',
          type: 'comment',
          user: {
            username: 'jane_smith',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          },
          post: {
            image: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=400&h=400&fit=crop',
          },
          comment: 'Amazing shot!',
          timestamp: '4h',
        },
      ],
      thisWeek: [
        {
          id: '3',
          type: 'follow',
          user: {
            username: 'travel_lover',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          },
          timestamp: '2d',
        },
        {
          id: '4',
          type: 'like',
          user: {
            username: 'photo_enthusiast',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
          },
          post: {
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
          },
          timestamp: '3d',
        },
      ],
      thisMonth: [
        {
          id: '5',
          type: 'comment',
          user: {
            username: 'nature_lover',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          },
          post: {
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
          },
          comment: 'Beautiful landscape!',
          timestamp: '1w',
        },
      ],
    };

    setActivities(mockActivities);
  }, []);

  return { activities };
}