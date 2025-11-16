/**
 * Supabase OAuth callback for Pages Router
 * This ensures cookie compatibility with dashboard pages
 */
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log('[OAuth Callback] Received request:', {
    query: req.query,
    url: req.url,
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
    },
  })

  const code = req.query.code

  if (code && typeof code === 'string') {
    console.log('[OAuth Callback] Exchanging code for session...')
    const supabase = createPagesServerClient({ req, res })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[OAuth Callback] Exchange result:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      userId: data.user?.id,
      error: error?.message,
    })

    if (error) {
      console.error('[OAuth Callback] Error:', error)
      return res.redirect('/auth/signin?error=callback_failed')
    }

    if (data.session && data.user) {
      console.log('[OAuth Callback] Session established successfully')

      // Setup user in database (create User and Workspace if needed)
      try {
        const { prisma } = await import('~/server/db')

        const existingUser = await prisma.user.findUnique({
          where: { id: data.user.id },
        })

        if (!existingUser) {
          console.log('[OAuth Callback] Creating user in database...')

          const userName =
            data.user.user_metadata?.name ||
            data.user.user_metadata?.full_name ||
            data.user.email?.split('@')[0] ||
            'User'

          await prisma.user.create({
            data: {
              id: data.user.id,
              email: data.user.email!,
              name: userName,
              emailVerified: data.user.email_confirmed_at
                ? new Date(data.user.email_confirmed_at)
                : null,
              WorkspaceMember: {
                create: {
                  role: 'OWNER',
                  Workspace: {
                    create: {
                      name: `${userName}'s Workspace`,
                      isPersonal: true,
                    },
                  },
                },
              },
            },
          })

          console.log('[OAuth Callback] User created successfully')
        } else {
          console.log('[OAuth Callback] User already exists')
        }
      } catch (error) {
        console.error('[OAuth Callback] Error setting up user:', error)
        // Continue anyway - user might already exist
      }
    }
  } else {
    console.log('[OAuth Callback] No code provided')
  }

  // Redirect to dashboard after successful authentication
  console.log('[OAuth Callback] Redirecting to /dashboard')
  res.redirect(307, '/dashboard')
}
