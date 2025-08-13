-- Row Level Security (RLS) policies migration
-- This migration enables RLS and creates all security policies

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

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
