/**
 * OAuth callback page - handles authentication on client side
 */
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { supabase } from '~/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[Callback Page] Processing OAuth callback...')

      // Supabase will automatically handle the callback and set cookies
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      console.log('[Callback Page] Session:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        error: error?.message,
      })

      if (error) {
        console.error('[Callback Page] Error:', error)
        router.push('/auth/signin?error=callback_failed')
        return
      }

      if (session) {
        console.log(
          '[Callback Page] Session established, setting up user workspace',
        )

        // Setup user workspace (creates User and Workspace if first login)
        try {
          const setupResponse = await fetch('/api/auth/setup-user', {
            method: 'POST',
          })

          if (!setupResponse.ok) {
            console.error(
              '[Callback Page] Failed to setup user:',
              await setupResponse.text(),
            )
          }
        } catch (error) {
          console.error('[Callback Page] Error setting up user:', error)
        }

        router.push('/dashboard')
      } else {
        console.log('[Callback Page] No session, redirecting to signin')
        router.push('/auth/signin')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 text-lg">Authenticating...</div>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}
