# Database Setup Instructions

## Issue Found
The Supabase connection is working, but the database tables don't exist yet. You need to run the database migrations.

## Quick Fix - Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `uyqiufmrawjplnytezxu`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Initial Schema Migration**
   - Copy the entire contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Run the RLS Policies Migration**
   - Copy the entire contents of `supabase/migrations/20240101000001_rls_policies.sql`
   - Paste it into a new query in the SQL editor
   - Click "Run" to execute

## Quick Fix - Option 2: Using Node.js Script

I can create a script to run the migrations automatically:

```bash
node run-migrations.js
```

## What the Migrations Do

### Initial Schema (20240101000000_initial_schema.sql)
- Creates all database tables: profiles, posts, likes, comments, follows, stories
- Sets up indexes for optimal performance
- Creates triggers for automatic timestamp updates
- Implements count maintenance functions

### RLS Policies (20240101000001_rls_policies.sql)
- Enables Row Level Security on all tables
- Creates security policies for data access
- Sets up automatic profile creation on user signup

## After Running Migrations

Once the migrations are complete, you should be able to:
- Sign up new users
- Log in existing users
- Create and view profiles
- Post content and interact with posts

## Testing the Setup

After running migrations, test with:
```bash
node test-supabase.js
```

This should show all tables exist and auth is working.

## Current Environment Variables

Your Supabase configuration:
- URL: `https://uyqiufmrawjplnytezxu.supabase.co`
- Key: `sb_publishable_4MvD7MDqzsIogUDWojkijA_guTM_iMa` (looks incomplete)

⚠️ **Note**: Your Supabase key appears to be truncated. Make sure you have the complete anon/public key from your Supabase dashboard.
