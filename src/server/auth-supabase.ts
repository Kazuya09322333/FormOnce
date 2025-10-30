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
