import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext } from 'next'

/**
 * Get the Supabase session for server-side rendering
 */
export const getServerAuthSessionSupabase = async (
  ctx: GetServerSidePropsContext,
) => {
  const supabase = createPagesServerClient(ctx)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  console.log('[Auth Check] User:', user?.id, 'Error:', error?.message)

  if (!user) {
    console.log('[Auth Check] No user found, returning null')
    return null
  }

  console.log('[Auth Check] User found:', user.email)

  return {
    user: {
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.name || user.user_metadata?.full_name || user.email,
    },
  }
}
