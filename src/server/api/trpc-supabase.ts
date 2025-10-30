/**
 * Supabase Auth用のtRPC設定
 *
 * NextAuthからSupabase Authへの移行用ファイル
 */

import type { User } from '@supabase/supabase-js'
import { TRPCError, initTRPC } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { createServerSupabaseClient } from '~/lib/supabase-server'
import { prisma } from '~/server/db'

/**
 * コンテキストの定義
 */
interface CreateContextOptions {
  user: User | null
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    prisma,
  }
}

/**
 * リクエストごとに作成されるコンテキスト
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  // Supabaseクライアントを作成
  const supabase = createServerSupabaseClient()

  // 現在のユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return createInnerTRPCContext({
    user,
  })
}

/**
 * tRPCの初期化
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * ルーターとプロシージャの作成
 */
export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

/**
 * 認証ミドルウェア
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user, // 型安全なユーザー
    },
  })
})

/**
 * 認証が必要なプロシージャ
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
