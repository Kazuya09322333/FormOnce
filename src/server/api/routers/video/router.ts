import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
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

// Lazy initialization of Supabase client to avoid errors when env vars are not set
let supabaseAdmin: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
      )
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseAdmin
}

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

      // Get public URL for the video
      const { data } = getSupabaseAdmin()
        .storage.from(VIDEOS_BUCKET)
        .getPublicUrl(filePath)

      // Store video metadata in database
      const video = await ctx.prisma.video.create({
        data: {
          title: title,
          filePath: filePath,
          url: data.publicUrl,
          userId: ctx.session?.user?.id || 'anonymous',
          status: 'READY',
        },
      })

      return {
        videoId: video.id,
        url: data.publicUrl,
        filePath: filePath,
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
      const video = await ctx.prisma.video.findUnique({
        where: { id: input.videoId },
      })

      if (!video) {
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
      const video = await ctx.prisma.video.findUnique({
        where: { id: input.videoId },
      })

      if (!video) {
        throw new Error('Video not found')
      }

      return {
        status: video.status,
        videoId: video.id,
        title: video.title,
        url: video.url,
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
      const video = await ctx.prisma.video.findUnique({
        where: { id: input.videoId },
      })

      if (!video) {
        throw new Error('Video not found')
      }

      // Delete from storage
      const { error } = await getSupabaseAdmin()
        .storage.from(VIDEOS_BUCKET)
        .remove([video.filePath])

      if (error) {
        console.error('Error deleting video from storage:', error)
      }

      // Delete from database
      await ctx.prisma.video.delete({
        where: { id: input.videoId },
      })

      return { success: true }
    }),

  // List user's videos
  listVideos: protectedProcedure.query(async ({ ctx }) => {
    const videos = await ctx.prisma.video.findMany({
      where: {
        userId: ctx.session?.user?.id || 'anonymous',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return videos
  }),
})
