import { createHash } from 'crypto'
import { z } from 'zod'
import { createServerSupabaseClient } from '~/lib/supabase-server'
import {
  createTRPCRouter,
  protectedProcedure,
} from '~/server/api/trpc-supabase'

export const videoRouterSupabase = createTRPCRouter({
  // ビデオファイルのアップロード用署名付きURL取得
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        fileType: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { filename, fileType } = input
      const userId = ctx.user.id

      const supabase = createServerSupabaseClient()

      // ユーザーIDをフォルダ名として使用（RLSポリシーと連携）
      const filePath = `${userId}/${Date.now()}_${filename}`

      // Supabase Storageに署名付きURLを作成
      const { data, error } = await supabase.storage
        .from('uploads')
        .createSignedUploadUrl(filePath)

      if (error) {
        console.error('Error creating signed upload URL:', error)
        throw new Error('Failed to create upload URL')
      }

      return {
        uploadUrl: data.signedUrl,
        filePath: data.path,
        token: data.token,
      }
    }),

  // アップロード完了後の処理（Bunny.netへの連携）
  finalizeUpload: protectedProcedure
    .input(
      z.object({
        filePath: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { filePath, title } = input

      const supabase = createServerSupabaseClient()

      // Supabase Storageから公開URLを取得
      const { data: urlData } = await supabase.storage
        .from('uploads')
        .createSignedUrl(filePath, 3600) // 1時間有効

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get file URL')
      }

      // Bunny.netにビデオを登録
      const bunnyResponse = await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            AccessKey: process.env.BUNNY_API_KEY!,
          },
          body: JSON.stringify({
            title,
            url: urlData.signedUrl,
          }),
        },
      )

      if (!bunnyResponse.ok) {
        throw new Error('Failed to create video in Bunny.net')
      }

      const bunnyData = await bunnyResponse.json()
      return {
        videoId: bunnyData.guid,
        playbackUrl: `${process.env.BUNNY_STREAM_URL}/${bunnyData.guid}/play.m3u8`,
        thumbnailUrl: `${process.env.BUNNY_STREAM_URL}/${bunnyData.guid}/thumbnail.jpg`,
      }
    }),

  // Bunny.net関連のメソッドはそのまま維持
  createVideo: protectedProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ input }) => {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            AccessKey: process.env.BUNNY_API_KEY!,
          },
          body: JSON.stringify({ title: input.title }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to create video in Bunny.net')
      }

      const data = await response.json()
      return { videoId: data.guid }
    }),

  getVideoStatus: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${input.videoId}`,
        {
          headers: {
            Accept: 'application/json',
            AccessKey: process.env.BUNNY_API_KEY!,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to get video status')
      }

      return response.json()
    }),

  getTusUploadUrl: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        filename: z.string(),
        fileType: z.string(),
      }),
    )
    .mutation(({ input }) => {
      const expirationTime = Math.floor(Date.now() / 1000) + 3600
      const signature = createHash('sha256')
        .update(
          process.env.BUNNY_LIBRARY_ID! +
            process.env.BUNNY_API_KEY! +
            expirationTime +
            input.videoId,
        )
        .digest('hex')

      return {
        uploadUrl: 'https://video.bunnycdn.com/tusupload',
        headers: {
          AuthorizationSignature: signature,
          AuthorizationExpire: expirationTime.toString(),
          VideoId: input.videoId,
          LibraryId: process.env.BUNNY_LIBRARY_ID!,
        },
        metadata: {
          filetype: input.fileType,
          title: input.filename,
        },
      }
    }),
})
