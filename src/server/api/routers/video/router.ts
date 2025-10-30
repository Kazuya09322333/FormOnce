import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '~/server/api/trpc'

const VIDEOS_BUCKET = 'videos'

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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { filename, fileType } = input
      const userId = ctx.session?.user?.id || 'anonymous'

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
      const video = await ctx.db.video.findUnique({
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
      const video = await ctx.db.video.findUnique({
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
      const video = await ctx.db.video.findUnique({
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
      await ctx.db.video.delete({
        where: { id: input.videoId },
      })

      return { success: true }
    }),

  // List user's videos
  listVideos: protectedProcedure.query(async ({ ctx }) => {
    const videos = await ctx.db.video.findMany({
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
