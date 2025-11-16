import { type CookieOptions, createServerClient } from '@supabase/ssr'
import type { GetServerSidePropsContext } from 'next'

/**
 * Get the Supabase session for server-side rendering
 */
export const getServerAuthSessionSupabase = async (
  ctx: GetServerSidePropsContext,
) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return ctx.req.cookies[name]
        },
        set(name: string, value: string, options: CookieOptions) {
          ctx.res.setHeader(
            'Set-Cookie',
            `${name}=${value}; Path=/; ${
              options.maxAge ? `Max-Age=${options.maxAge};` : ''
            } ${options.httpOnly ? 'HttpOnly;' : ''} ${
              options.secure ? 'Secure;' : ''
            } ${options.sameSite ? `SameSite=${options.sameSite};` : ''}`,
          )
        },
        remove(name: string, options: CookieOptions) {
          ctx.res.setHeader(
            'Set-Cookie',
            `${name}=; Path=/; Max-Age=0; ${
              options.httpOnly ? 'HttpOnly;' : ''
            } ${options.secure ? 'Secure;' : ''} ${
              options.sameSite ? `SameSite=${options.sameSite};` : ''
            }`,
          )
        },
      },
    },
  )

  // Use getSession instead of getUser for better cookie handling
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  console.log(
    '[Auth Check] Session:',
    session?.user?.id,
    'Error:',
    error?.message,
  )

  if (!session?.user) {
    console.log('[Auth Check] No session found, returning null')
    return null
  }

  const user = session.user
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
