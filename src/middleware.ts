import { type CookieOptions, createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware for API routes, static files, and assets
  const path = req.nextUrl.pathname
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.includes('.') // Skip files with extensions (images, fonts, etc.)
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    },
  )

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  return res
}

// Specify which routes should use this middleware
// The middleware function itself handles path filtering
export const config = {
  matcher: [
    /*
     * Match all paths - filtering is done in the middleware function
     */
    '/(.*)',
  ],
}
