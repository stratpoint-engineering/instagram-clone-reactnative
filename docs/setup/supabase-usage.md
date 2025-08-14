# Using Supabase in Your React Native App

This guide shows how to use Supabase in your React Native app after completing the [Supabase Setup](./supabase-setup.md).

## Installation

First, install the required dependencies:

```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

## Configuration

### 1. Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './database/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper function to get the current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting current session:', error);
    return null;
  }
  return session;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
```

### 2. Database Types

Create `lib/database/types.ts` for TypeScript support:

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          caption: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          caption?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          caption?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other tables as needed...
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
```

## Authentication Usage

### 1. Sign Up

```typescript
import { supabase } from '@/lib/supabase';

const signUp = async (email: string, password: string, userData: any) => {
  try {
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create profile if signup successful
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: userData.username,
          full_name: userData.fullName,
        });

      if (profileError) throw profileError;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error };
  }
};
```

### 2. Sign In

```typescript
const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Signin error:', error);
    return { success: false, error };
  }
};
```

### 3. Auth State Listener

```typescript
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';

const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading };
};
```

## Database Operations

### 1. Create Profile

```typescript
const createProfile = async (profileData: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Create profile error:', error);
    return { success: false, error };
  }
};
```

### 2. Get User Profile

```typescript
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error };
  }
};
```

### 3. Create Post

```typescript
const createPost = async (postData: any) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Create post error:', error);
    return { success: false, error };
  }
};
```

### 4. Get Posts Feed

```typescript
const getPostsFeed = async (limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        ),
        likes (count),
        comments (count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Get posts error:', error);
    return { success: false, error };
  }
};
```

## Real-time Subscriptions

### 1. Listen to New Posts

```typescript
const usePostsSubscription = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Subscribe to new posts
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('New post:', payload.new);
          setPosts(current => [payload.new, ...current]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return posts;
};
```

### 2. Listen to Profile Changes

```typescript
const useProfileSubscription = (userId: string) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`profile:${userId}`)
      .on('postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return profile;
};
```

## Error Handling

### 1. Common Error Types

```typescript
const handleSupabaseError = (error: any) => {
  if (error.code === 'PGRST116') {
    return 'No data found';
  } else if (error.code === '23505') {
    return 'This item already exists';
  } else if (error.code === '42501') {
    return 'Permission denied';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};
```

### 2. Retry Logic

```typescript
const withRetry = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Best Practices

### 1. Use TypeScript

Always use TypeScript with Supabase for better type safety:

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// data is now properly typed as Profile
```

### 2. Handle Loading States

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const result = await supabase.from('posts').select('*');
    // Handle result
  } finally {
    setLoading(false);
  }
};
```

### 3. Optimize Queries

```typescript
// Good: Select only needed fields
const { data } = await supabase
  .from('posts')
  .select('id, caption, created_at')
  .limit(10);

// Bad: Select all fields when not needed
const { data } = await supabase
  .from('posts')
  .select('*');
```

## Next Steps

- [Storage Usage Guide](./supabase-storage-setup.md)
- [Authentication Patterns](../security/authentication.md)
- [Real-time Features](../data/realtime-data.md)
- [Performance Optimization](../tools/performance.md)
