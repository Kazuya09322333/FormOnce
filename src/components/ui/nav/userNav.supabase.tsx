import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '~/lib/supabase'
import { useWorkspaceStore } from '~/store'

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const { setSelectedWorkspace } = useWorkspaceStore()

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    void getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignout = async () => {
    // Remove selected workspace
    setSelectedWorkspace({
      id: null as unknown as string,
      name: null as unknown as string,
    })

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Redirect to signin page
    void router.push('/auth/signin')
  }

  // If no user, don't render anything
  if (!user) return null

  const userName =
    user.user_metadata?.name || user.user_metadata?.full_name || user.email
  const userInitial = userName?.charAt(0).toUpperCase() || '?'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.user_metadata?.avatar_url || ''}
              alt={userName || ''}
            />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        {/* will add these in future */}
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link className="w-full" href="/settings/profile">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="w-full" href="/settings/billing">
              Billing
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignout}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
