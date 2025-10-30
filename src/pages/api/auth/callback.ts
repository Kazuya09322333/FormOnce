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
  })

  const code = req.query.code

  if (code && typeof code === 'string') {
    console.log('[OAuth Callback] Exchanging code for session...')
    const supabase = createPagesServerClient({ req, res })
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('[OAuth Callback] Exchange result:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
      error: error?.message,
    })

    if (error) {
      console.error('[OAuth Callback] Error:', error)
      return res.redirect('/auth/signin?error=callback_failed')
    }
  } else {
    console.log('[OAuth Callback] No code provided')
  }

  // Redirect to dashboard after successful authentication
  console.log('[OAuth Callback] Redirecting to /dashboard')
  res.redirect('/dashboard')
}
