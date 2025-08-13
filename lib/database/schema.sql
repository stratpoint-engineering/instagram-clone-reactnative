-- Instagram Clone Database Schema for Supabase
-- This file contains the complete database schema including tables, indexes, and triggers
-- Run this in Supabase SQL Editor or via migrations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types/enums if needed
-- (Currently no enums defined, but can be added here)

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    is_private BOOLEAN DEFAULT FALSE NOT NULL,
    followers_count INTEGER DEFAULT 0 NOT NULL,
    following_count INTEGER DEFAULT 0 NOT NULL,
    posts_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9._]+$'),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 150),
    CONSTRAINT counts_non_negative CHECK (
        followers_count >= 0 AND
        following_count >= 0 AND
        posts_count >= 0
    )
);

-- =====================================================
-- POSTS TABLE
-- =====================================================
-- Posts table for user content
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    caption TEXT,
    image_url TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT caption_length CHECK (char_length(caption) <= 2200),
    CONSTRAINT counts_non_negative CHECK (
        likes_count >= 0 AND
        comments_count >= 0
    )
);

-- =====================================================
-- LIKES TABLE
-- =====================================================
-- Likes table for post interactions
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Ensure one like per user per post
    UNIQUE(user_id, post_id)
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
-- Comments table for post interactions
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Constraints
    CONSTRAINT content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500),
    CONSTRAINT likes_count_non_negative CHECK (likes_count >= 0)
);

-- =====================================================
-- FOLLOWS TABLE
-- =====================================================
-- Follows table for user relationships
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Ensure unique follow relationships and prevent self-follows
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- =====================================================
-- STORIES TABLE
-- =====================================================
-- Stories table for temporary content (24-hour expiration)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    views_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours') NOT NULL,

    -- Constraints
    CONSTRAINT caption_length CHECK (char_length(caption) <= 500),
    CONSTRAINT views_count_non_negative CHECK (views_count >= 0),
    CONSTRAINT expires_after_creation CHECK (expires_at > created_at)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON public.posts(user_id, created_at DESC);

-- Likes indexes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at);

-- Stories indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_active ON public.stories(user_id, expires_at) WHERE expires_at > NOW();

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS FOR COUNT MAINTENANCE
-- =====================================================

-- Function to update post counts
CREATE OR REPLACE FUNCTION update_posts_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles
        SET posts_count = posts_count + 1
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles
        SET posts_count = posts_count - 1
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET likes_count = likes_count - 1
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET comments_count = comments_count - 1
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Function to update follow counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increase following count for follower
        UPDATE public.profiles
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;

        -- Increase followers count for followed user
        UPDATE public.profiles
        SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease following count for follower
        UPDATE public.profiles
        SET following_count = following_count - 1
        WHERE id = OLD.follower_id;

        -- Decrease followers count for followed user
        UPDATE public.profiles
        SET followers_count = followers_count - 1
        WHERE id = OLD.following_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply count triggers
CREATE TRIGGER posts_count_trigger
    AFTER INSERT OR DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_posts_count();

CREATE TRIGGER likes_count_trigger
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE TRIGGER comments_count_trigger
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_comments_count();

CREATE TRIGGER follow_counts_trigger
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.stories WHERE expires_at <= NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Note: In production, you would set up a cron job or use pg_cron extension
-- to automatically run cleanup_expired_stories() periodically

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view all public profiles and their own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (
        NOT is_private OR
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.follows
            WHERE follower_id = auth.uid() AND following_id = id
        )
    );

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- POSTS TABLE POLICIES
-- =====================================================

-- Users can view posts from public profiles, their own posts, and posts from users they follow
CREATE POLICY "Posts are viewable based on profile privacy" ON public.posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = posts.user_id AND (
                NOT profiles.is_private OR
                profiles.id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.follows
                    WHERE follower_id = auth.uid() AND following_id = profiles.id
                )
            )
        )
    );

-- Users can insert their own posts
CREATE POLICY "Users can insert their own posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.posts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- LIKES TABLE POLICIES
-- =====================================================

-- Users can view likes on posts they can see
CREATE POLICY "Likes are viewable on accessible posts" ON public.likes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = likes.post_id AND
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = posts.user_id AND (
                    NOT profiles.is_private OR
                    profiles.id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM public.follows
                        WHERE follower_id = auth.uid() AND following_id = profiles.id
                    )
                )
            )
        )
    );

-- Users can insert likes on posts they can see
CREATE POLICY "Users can like accessible posts" ON public.likes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = likes.post_id AND
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = posts.user_id AND (
                    NOT profiles.is_private OR
                    profiles.id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM public.follows
                        WHERE follower_id = auth.uid() AND following_id = profiles.id
                    )
                )
            )
        )
    );

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTS TABLE POLICIES
-- =====================================================

-- Users can view comments on posts they can see
CREATE POLICY "Comments are viewable on accessible posts" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = comments.post_id AND
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = posts.user_id AND (
                    NOT profiles.is_private OR
                    profiles.id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM public.follows
                        WHERE follower_id = auth.uid() AND following_id = profiles.id
                    )
                )
            )
        )
    );

-- Users can insert comments on posts they can see
CREATE POLICY "Users can comment on accessible posts" ON public.comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = comments.post_id AND
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = posts.user_id AND (
                    NOT profiles.is_private OR
                    profiles.id = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM public.follows
                        WHERE follower_id = auth.uid() AND following_id = profiles.id
                    )
                )
            )
        )
    );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FOLLOWS TABLE POLICIES
-- =====================================================

-- Users can view follows where they are involved or for public profiles
CREATE POLICY "Follows are viewable for involved users and public profiles" ON public.follows
    FOR SELECT USING (
        auth.uid() = follower_id OR
        auth.uid() = following_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = follows.following_id AND NOT profiles.is_private
        )
    );

-- Users can insert follows where they are the follower
CREATE POLICY "Users can follow others" ON public.follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can delete follows where they are the follower
CREATE POLICY "Users can unfollow others" ON public.follows
    FOR DELETE USING (auth.uid() = follower_id);

-- =====================================================
-- STORIES TABLE POLICIES
-- =====================================================

-- Users can view stories from public profiles, their own stories, and stories from users they follow
-- Only show non-expired stories
CREATE POLICY "Stories are viewable based on profile privacy and expiration" ON public.stories
    FOR SELECT USING (
        expires_at > NOW() AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = stories.user_id AND (
                NOT profiles.is_private OR
                profiles.id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.follows
                    WHERE follower_id = auth.uid() AND following_id = profiles.id
                )
            )
        )
    );

-- Users can insert their own stories
CREATE POLICY "Users can insert their own stories" ON public.stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own stories
CREATE POLICY "Users can update their own stories" ON public.stories
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own stories
CREATE POLICY "Users can delete their own stories" ON public.stories
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS FOR PROFILE CREATION
-- =====================================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECURITY NOTES
-- =====================================================
-- 1. All policies respect profile privacy settings
-- 2. Users can only modify their own content
-- 3. Follow relationships control access to private profiles
-- 4. Stories automatically expire after 24 hours
-- 5. Counts are maintained automatically via triggers
-- 6. Profile creation is automatic on user signup
