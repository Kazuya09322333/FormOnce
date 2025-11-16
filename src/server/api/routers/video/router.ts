import { randomUUID } from 'crypto'
import { z } from 'zod'
import { getSupabaseAdmin } from '~/lib/supabase'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'

const VIDEOS_BUCKET = 'videos'
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB in bytes
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
]

export const videoRouter = createTRPCRouter({
  // Get signed upload URL for direct upload from client
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileType: z.string(),
        fileSize: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { filename, fileType, fileSize } = input
      const userId = ctx.session?.user?.id || 'anonymous'

      // Validate file type
      if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
        throw new Error(
          `対応していないファイル形式です。対応形式: ${ALLOWED_VIDEO_TYPES.join(
            ', ',
          )}`,
        )
      }

      // Validate file size if provided
      if (fileSize && fileSize > MAX_FILE_SIZE) {
        throw new Error(
          `ファイルサイズが大きすぎます。最大${
            MAX_FILE_SIZE / 1024 / 1024
          }MBまでです。`,
        )
      }

      // Create unique file path
      const timestamp = Date.now()
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `${userId}/${timestamp}_${sanitizedFilename}`

      // Generate signed upload URL (valid for 1 hour)
      const { data, error } = await getSupabaseAdmin()
        .storage.from(VIDEOS_BUCKET)
        .createSignedUploadUrl(filePath)

      if (error) {
        console.error('Error creating signed upload URL:', error)
        throw new Error(`Failed to create upload URL: ${error.message}`)
      }

      return {
        uploadUrl: data.signedUrl,
        filePath: filePath,
        token: data.token,
      }
    }),

  // Upload thumbnail for video
  uploadThumbnail: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        thumbnailBase64: z.string(), // Base64 encoded image
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { videoId, thumbnailBase64 } = input
      const supabase = getSupabaseAdmin()

      // Get video to ensure it exists and belongs to user
      const { data: video, error: videoError } = await supabase
        .from('Video')
        .select()
        .eq('id', videoId)
        .single()

      if (videoError || !video) {
        throw new Error('Video not found')
      }

      type VideoType = {
        userId: string
        filePath: string
      }

      const typedVideo = video as VideoType

      // Verify ownership
      if (typedVideo.userId !== ctx.session?.user?.id) {
        throw new Error('Unauthorized')
      }

      // Convert base64 to buffer
      const base64Data = thumbnailBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')

      // Create thumbnail file path
      const thumbnailPath = `${typedVideo.filePath}_thumbnail.jpg`

      // Upload thumbnail to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(VIDEOS_BUCKET)
        .upload(thumbnailPath, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (uploadError) {
        console.error('Error uploading thumbnail:', uploadError)
        throw new Error(`Failed to upload thumbnail: ${uploadError.message}`)
      }

      // Get public URL for thumbnail
      const { data: urlData } = supabase.storage
        .from(VIDEOS_BUCKET)
        .getPublicUrl(thumbnailPath)

      // Update video with thumbnail URL
      const { error: updateError } = await supabase
        .from('Video')
        .update({ thumbnailUrl: urlData.publicUrl })
        .eq('id', videoId)

      if (updateError) {
        console.error('Error updating video with thumbnail:', updateError)
        throw new Error(`Failed to update video: ${updateError.message}`)
      }

      return {
        thumbnailUrl: urlData.publicUrl,
      }
    }),

  // Finalize video after upload
  finalizeVideo: protectedProcedure
    .input(
      z.object({
        filePath: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { filePath, title } = input
      const supabase = getSupabaseAdmin()

      // Get public URL for the video
      const { data } = supabase.storage
        .from(VIDEOS_BUCKET)
        .getPublicUrl(filePath)

      // Store video metadata in database
      const { data: video, error } = await supabase
        .from('Video')
        .insert({
          id: randomUUID(),
          title: title,
          filePath: filePath,
          url: data.publicUrl,
          userId: ctx.session?.user?.id || 'anonymous',
          status: 'READY',
          updatedAt: new Date().toISOString(),
        } as any)
        .select()
        .single()

      if (error || !video) {
        console.error('Error creating video:', error)
        throw new Error(
          `Failed to create video: ${error?.message || 'Unknown error'}`,
        )
      }

      type VideoType = {
        id: string
        filePath: string
      }

      const typedVideo = video as VideoType

      return {
        videoId: typedVideo.id,
        url: data.publicUrl,
        filePath: typedVideo.filePath,
      }
    }),

  // Get video by ID
  getVideo: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin()

      const { data: video, error } = await supabase
        .from('Video')
        .select()
        .eq('id', input.videoId)
        .single()

      if (error || !video) {
        throw new Error('Video not found')
      }

      return video
    }),

  // Get video status (for compatibility with existing code)
  getVideoStatus: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin()

      const { data: video, error } = await supabase
        .from('Video')
        .select()
        .eq('id', input.videoId)
        .single()

      if (error || !video) {
        throw new Error('Video not found')
      }

      type VideoStatusType = {
        status: string
        id: string
        title: string
        url: string
      }

      const typedVideo = video as VideoStatusType

      return {
        status: typedVideo.status,
        videoId: typedVideo.id,
        title: typedVideo.title,
        url: typedVideo.url,
      }
    }),

  // Delete video
  deleteVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabaseAdmin()

      const { data: video, error: fetchError } = await supabase
        .from('Video')
        .select()
        .eq('id', input.videoId)
        .single()

      if (fetchError || !video) {
        throw new Error('Video not found')
      }

      type VideoWithFilePath = {
        filePath: string
      }

      const typedVideo = video as VideoWithFilePath

      // Delete from storage
      const { error } = await supabase.storage
        .from(VIDEOS_BUCKET)
        .remove([typedVideo.filePath])

      if (error) {
        console.error('Error deleting video from storage:', error)
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('Video')
        .delete()
        .eq('id', input.videoId)

      if (deleteError) {
        console.error('Error deleting video from database:', deleteError)
        throw new Error(`Failed to delete video: ${deleteError.message}`)
      }

      return { success: true }
    }),

  // List user's videos
  listVideos: protectedProcedure.query(async ({ ctx }) => {
    const supabase = getSupabaseAdmin()

    const { data: videos, error } = await supabase
      .from('Video')
      .select()
      .eq('userId', ctx.session?.user?.id || 'anonymous')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching videos:', error)
      throw new Error(`Failed to fetch videos: ${error.message}`)
    }

    return videos
  }),
})
