import { type AppType } from 'next/app'
import { api } from '~/utils/api'
import '~/styles/globals.css'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const MyApp: AppType<{ initialSession?: Session }> = ({
  Component,
  pageProps,
}) => {
  const [isHyderated, setIsHyderated] = useState(false)
  const [supabaseClient] = useState(() => createPagesBrowserClient())

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHyderated(true)
  }, [])

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
