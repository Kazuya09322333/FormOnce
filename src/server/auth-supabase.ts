/**
 * Supabase Auth用のサーバーサイド認証ヘルパー
 */

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext } from 'next'

/**
 * GetServerSidePropsでSupabaseセッションを取得
 */
export const getServerAuthSessionSupabase = async (
  ctx: GetServerSidePropsContext,
) => {
  const supabase = createPagesServerClient(ctx)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // デバッグログ
  console.log('[Auth Debug] Cookie:', ctx.req.headers.cookie?.substring(0, 100))
  console.log(
    '[Auth Debug] User:',
    user ? `${user.id} (${user.email})` : 'null',
  )
  console.log('[Auth Debug] Error:', error)

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
