import { Loader } from 'lucide-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '~/hooks/useAuth'
import DashboardLayout from '~/layouts/dashboardLayout'

export default function Forms() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      void router.push('/auth/signin')
    } else if (!loading && user) {
      void router.push('/dashboard/forms')
    }
  }, [user, loading, router])

  return (
    <DashboardLayout title="dashboard">
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    </DashboardLayout>
  )
}
