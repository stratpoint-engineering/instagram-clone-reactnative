# Database Migrations

This directory contains Supabase database migrations for the Instagram Clone application.

## Migration Files

### 20240101000000_initial_schema.sql
- Creates all database tables (profiles, posts, likes, comments, follows, stories)
- Sets up indexes for optimal performance
- Creates triggers for automatic timestamp updates
- Implements count maintenance functions and triggers
- Adds cleanup functions for expired stories

### 20240101000001_rls_policies.sql
- Enables Row Level Security (RLS) on all tables
- Creates comprehensive security policies
- Implements privacy controls for profiles and content
- Sets up automatic profile creation on user signup

## Running Migrations

### Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase in your project:
   ```bash
   supabase init
   ```

3. Link to your Supabase project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file
4. Run them in order (initial_schema.sql first, then rls_policies.sql)

## Migration Order

**Important**: Run migrations in the following order:

1. `20240101000000_initial_schema.sql` - Creates tables and basic structure
2. `20240101000001_rls_policies.sql` - Adds security policies

## Schema Overview

### Tables Created

- **profiles**: User profile information (extends auth.users)
- **posts**: User posts with images and captions
- **likes**: Post likes/reactions
- **comments**: Post comments
- **follows**: User follow relationships
- **stories**: Temporary stories (24-hour expiration)

### Key Features

- **Automatic Counts**: Follower, following, post, like, and comment counts are maintained automatically
- **Privacy Controls**: Private profiles and content visibility based on follow relationships
- **Story Expiration**: Stories automatically expire after 24 hours
- **Profile Creation**: User profiles are created automatically when users sign up
- **Data Integrity**: Foreign key constraints and check constraints ensure data consistency

### Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own content
- Privacy settings control content visibility
- Follow relationships determine access to private profiles
- Comprehensive access control policies

## Development Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
- UUIDs are used for all primary keys
- Indexes are optimized for common query patterns
- Triggers maintain data consistency automatically
- Functions are marked as `SECURITY DEFINER` where appropriate

## Rollback

To rollback migrations, you can:

1. Use Supabase CLI reset:
   ```bash
   supabase db reset
   ```

2. Or manually drop tables in reverse dependency order:
   ```sql
   DROP TABLE IF EXISTS public.stories;
   DROP TABLE IF EXISTS public.follows;
   DROP TABLE IF EXISTS public.comments;
   DROP TABLE IF EXISTS public.likes;
   DROP TABLE IF EXISTS public.posts;
   DROP TABLE IF EXISTS public.profiles;
   ```

## Testing

After running migrations, verify the setup by:

1. Checking that all tables exist
2. Verifying RLS policies are active
3. Testing profile creation on user signup
4. Confirming count triggers work correctly
5. Validating privacy controls function as expected
