import { type AppType } from 'next/app'
import { api } from '~/utils/api'
import '~/styles/globals.css'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const MyApp: AppType<{ initialSession?: Session }> = ({
  Component,
  pageProps,
}) => {
  const [isHyderated, setIsHyderated] = useState(false)
  const [supabaseClient] = useState(() => createPagesBrowserClient())
  const router = useRouter()

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHyderated(true)
  }, [])

  // Prevent rapid navigation loops
  useEffect(() => {
    const handleRouteChange = () => {
      // Do nothing, just block rapid changes
    }

    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router])

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      {isHyderated && <Component {...pageProps} />}
    </SessionContextProvider>
  )
}

export default api.withTRPC(MyApp)
