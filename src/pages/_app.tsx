import { type AppType } from 'next/app'
import { api } from '~/utils/api'
import '~/styles/globals.css'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isHyderated, setIsHyderated] = useState(false)
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

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
