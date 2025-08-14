# Complete Supabase Setup Guide

This guide covers the complete setup of Supabase for the Instagram clone app, including database, authentication, storage, and Row Level Security (RLS) policies.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of SQL and database concepts

## 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New project"**
3. Choose your organization
4. Fill in project details:
   - **Name**: `instagram-clone` (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the region closest to your users
5. Click **"Create new project"**
6. Wait for the project to be created (takes 1-2 minutes)

## 2. Environment Variables Setup

After your project is created, you'll need to get your project credentials:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

3. Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-public-key-here
```

**Important**: Never commit your `.env.local` file to version control!

## 3. Database Schema Setup

### 3.1 Create the Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follows table
CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create likes table
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Create Indexes for Performance

```sql
-- Create indexes for better query performance
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

## 4. Row Level Security (RLS) Setup

### 4.1 Enable RLS on All Tables

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

### 4.2 Create RLS Policies

```sql
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);
```

## 5. Authentication Setup

### 5.1 Configure Auth Settings

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure the following:

**Site URL**: `http://localhost:8081` (for development)
**Redirect URLs**: 
- `http://localhost:8081`
- `exp://localhost:19000` (for Expo development)

### 5.2 Email Templates (Optional)

You can customize email templates in **Authentication** → **Email Templates**:
- Confirm signup
- Magic link
- Change email address
- Reset password

## 6. Storage Setup

See the detailed [Supabase Storage Setup Guide](./supabase-storage-setup.md) for complete storage configuration.

## 7. Testing Your Setup

### 7.1 Test Database Connection

Create a simple test in your app:

```typescript
import { supabase } from '@/lib/supabase';

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Database connection failed:', error);
  } else {
    console.log('Database connected successfully!');
  }
};
```

### 7.2 Test Authentication

```typescript
// Test signup
const testSignup = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  console.log('Signup result:', { data, error });
};
```

## 8. Production Considerations

### 8.1 Environment Variables for Production

For production deployment, update your environment variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-public-key
```

### 8.2 Security Checklist

- ✅ RLS is enabled on all tables
- ✅ Policies are properly configured
- ✅ Storage policies are set up
- ✅ Environment variables are secure
- ✅ Auth settings are configured for production URLs

## 9. Troubleshooting

### Common Issues

**Issue: "Invalid API key"**
- Check that your environment variables are correct
- Ensure you're using the anon public key, not the service role key

**Issue: "Row Level Security policy violation"**
- Check that RLS policies are properly set up
- Verify that the user is authenticated when required

**Issue: "Table doesn't exist"**
- Ensure all SQL scripts have been run successfully
- Check the table names match exactly

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Next Steps

After completing this setup:

1. ✅ Test your app's signup/login functionality
2. ✅ Test creating and viewing posts
3. ✅ Test file uploads to storage
4. ✅ Deploy to production with updated environment variables

Your Supabase backend is now ready for the Instagram clone app!
