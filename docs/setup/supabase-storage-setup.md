# Supabase Storage Setup Guide

This guide will help you set up the storage buckets in your Supabase project for the Instagram clone app.

## Required Storage Buckets

You need to create three storage buckets:

1. **avatars** - For user profile pictures
2. **posts** - For post images
3. **stories** - For story images

## Step-by-Step Setup

### 1. Access Storage in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. You'll see the storage overview page

### 2. Create Storage Buckets

For each bucket, follow these steps:

#### Create "avatars" bucket:
1. Click **"New bucket"**
2. **Bucket name**: `avatars`
3. **Public bucket**: ✅ **Enable** (avatars should be publicly accessible)
4. **File size limit**: `10 MB`
5. **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
6. Click **"Create bucket"**

#### Create "posts" bucket:
1. Click **"New bucket"**
2. **Bucket name**: `posts`
3. **Public bucket**: ✅ **Enable** (posts should be publicly accessible)
4. **File size limit**: `10 MB`
5. **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
6. Click **"Create bucket"**

#### Create "stories" bucket:
1. Click **"New bucket"**
2. **Bucket name**: `stories`
3. **Public bucket**: ✅ **Enable** (stories should be publicly accessible)
4. **File size limit**: `10 MB`
5. **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
6. Click **"Create bucket"**

### 3. Set Up Storage Policies (RLS)

For each bucket, you need to set up Row Level Security (RLS) policies:

#### Avatars Bucket Policies:

1. Go to **Storage** → **Policies**
2. Select the **avatars** bucket
3. Click **"New policy"**

**Policy 1: Allow authenticated users to upload their own avatars**
```sql
-- Policy name: "Users can upload their own avatars"
-- Operation: INSERT
-- Target roles: authenticated

(auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 2: Allow public read access to avatars**
```sql
-- Policy name: "Public read access for avatars"
-- Operation: SELECT
-- Target roles: public, authenticated

true
```

**Policy 3: Allow users to update their own avatars**
```sql
-- Policy name: "Users can update their own avatars"
-- Operation: UPDATE
-- Target roles: authenticated

(auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 4: Allow users to delete their own avatars**
```sql
-- Policy name: "Users can delete their own avatars"
-- Operation: DELETE
-- Target roles: authenticated

(auth.uid()::text = (storage.foldername(name))[1])
```

#### Posts Bucket Policies:

**Policy 1: Allow authenticated users to upload posts**
```sql
-- Policy name: "Users can upload their own posts"
-- Operation: INSERT
-- Target roles: authenticated

(auth.uid()::text = (storage.foldername(name))[2])
```

**Policy 2: Allow public read access to posts**
```sql
-- Policy name: "Public read access for posts"
-- Operation: SELECT
-- Target roles: public, authenticated

true
```

**Policy 3: Allow users to delete their own posts**
```sql
-- Policy name: "Users can delete their own posts"
-- Operation: DELETE
-- Target roles: authenticated

(auth.uid()::text = (storage.foldername(name))[2])
```

#### Stories Bucket Policies:

**Policy 1: Allow authenticated users to upload stories**
```sql
-- Policy name: "Users can upload their own stories"
-- Operation: INSERT
-- Target roles: authenticated

(auth.uid()::text = (storage.foldername(name))[2])
```

**Policy 2: Allow public read access to stories**
```sql
-- Policy name: "Public read access for stories"
-- Operation: SELECT
-- Target roles: public, authenticated

true
```

**Policy 3: Allow users to delete their own stories**
```sql
-- Policy name: "Users can delete their own stories"
-- Operation: DELETE
-- Target roles: authenticated

(auth.uid()::text = (storage.foldername(name))[2])
```

### 4. Test Storage Setup

After setting up the buckets and policies, you can test the storage functionality:

1. Try uploading a test image through the Supabase dashboard
2. Verify that the public URL works
3. Test the policies by trying to access files with different user roles

## File Organization Structure

The storage utilities in the app organize files as follows:

```
avatars/
  └── {userId}/
      └── {timestamp}_{random}.{ext}

posts/
  └── posts/
      └── {userId}/
          └── {timestamp}_{random}.{ext}

stories/
  └── stories/
      └── {userId}/
          └── {timestamp}_{random}.{ext}
```

## Security Notes

- All buckets are set to public for read access (required for displaying images)
- Write/delete access is restricted to the file owner via RLS policies
- File size is limited to 10MB per file
- Only image files are allowed (JPEG, PNG, WebP)
- Files are organized by user ID to prevent conflicts and enable proper access control

## Troubleshooting

**Issue: "Access denied" when uploading**
- Check that RLS policies are correctly set up
- Verify that the user is authenticated
- Ensure the file path follows the expected structure

**Issue: Images not loading**
- Verify that the bucket is set to public
- Check that the public URL is correctly generated
- Ensure the file was uploaded successfully

**Issue: File upload fails**
- Check file size (must be < 10MB)
- Verify file type is allowed (JPEG, PNG, WebP)
- Check network connectivity
