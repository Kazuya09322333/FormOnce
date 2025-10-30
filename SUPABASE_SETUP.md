# Supabase Storage Setup for Video Uploads

This project now uses **Supabase Storage** for video file storage instead of Bunny.net and Backblaze B2.

## Prerequisites

- A Supabase account (free tier is sufficient for development)
- Supabase project created

## Setup Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details and click "Create project"

### 2. Create Storage Bucket

1. In your Supabase dashboard, navigate to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Name the bucket: `videos`
4. Set **Public bucket** to `true` (so videos can be accessed via public URLs)
5. Click **"Create bucket"**

### 3. Set Bucket Policies (Optional)

If you want more control over who can upload/access videos:

1. Go to **Storage** > **Policies**
2. Create policies for the `videos` bucket:

```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow public read access to videos
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');
```

### 4. Get Your Supabase Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:

   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### 5. Update Environment Variables

Update your `.env` file with the Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 6. Run Database Migration

Apply the Prisma schema changes to add the Video model:

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push
```

### 7. Start Development Server

```bash
pnpm dev
```

## Usage

### Uploading Videos

1. Navigate to `/dashboard/forms/new`
2. Click the video upload button
3. Select a video file
4. The video will be uploaded directly to Supabase Storage
5. Once complete, the video URL will be available in your form

### Video Storage Structure

Videos are stored in the following path format:
```
videos/{userId}/{timestamp}_{filename}
```

Example: `videos/abc-123/1699123456789_my-video.mp4`

## Troubleshooting

### Authentication Errors

If you see authentication errors:
- Make sure all three Supabase environment variables are set correctly
- Check that the `SUPABASE_SERVICE_ROLE_KEY` has admin privileges
- Verify the storage bucket exists and is named exactly `videos`

### Upload Fails

If uploads fail:
- Check browser console for errors
- Verify the bucket is set to **public**
- Ensure your Supabase project is active (not paused)
- Check storage policies allow uploads

### Videos Not Playing

If videos don't play:
- Verify the bucket is set to **public**
- Check the video URL is accessible in your browser
- Ensure the file was uploaded successfully

## Migration from Bunny.net/Backblaze

The following changes were made:

1. ✅ Removed Bunny.net TUS upload implementation
2. ✅ Removed Backblaze B2 multipart upload
3. ✅ Added Supabase Storage integration
4. ✅ Updated video router API endpoints
5. ✅ Updated VideoUploadDialog component
6. ✅ Added Video model to Prisma schema

Old environment variables (no longer needed):
- ~~BUNNY_API_KEY~~
- ~~BUNNY_LIBRARY_ID~~
- ~~BUNNY_STREAM_URL~~
- ~~BACKBLAZE_KEY_ID~~
- ~~BACKBLAZE_APPLICATION_KEY~~
- ~~BACKBLAZE_ENDPOINT~~
- ~~BACKBLAZE_BUCKET_NAME~~

## Benefits of Supabase Storage

- ✅ Simple setup and integration
- ✅ Already integrated with the project
- ✅ Generous free tier (1GB storage + 2GB bandwidth)
- ✅ Built-in authentication
- ✅ S3-compatible API
- ✅ No additional services required
- ✅ Direct upload from browser
- ✅ Automatic CDN distribution

## Next Steps

For production deployment:
- Consider upgrading your Supabase plan for more storage
- Enable RLS (Row Level Security) policies for better security
- Set up video transcoding if needed (using external service)
- Configure CORS if deploying to a different domain
