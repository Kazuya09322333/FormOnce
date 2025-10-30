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
  const code = req.query.code

  if (code && typeof code === 'string') {
    const supabase = createPagesServerClient({ req, res })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful authentication
  res.redirect('/dashboard')
}
