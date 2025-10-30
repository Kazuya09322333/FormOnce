/**
 * Supabase Auth用のサーバーサイド認証ヘルパー
 */

import { createClient } from '@supabase/supabase-js'
import type { GetServerSidePropsContext } from 'next'

/**
 * GetServerSidePropsでSupabaseセッションを取得
 */
export const getServerAuthSessionSupabase = async (
  ctx: GetServerSidePropsContext,
) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        cookie: ctx.req.headers.cookie || '',
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata.name || user.email,
    },
  }
}
