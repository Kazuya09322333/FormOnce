'use client'

import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from '@radix-ui/react-icons'
import * as React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar'
import { Button } from '@components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select'
import type { Workspace } from '@prisma/client'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { api } from '@utils/api'
import { cn } from '@utils/cn'
import { useWorkspaceStore } from '~/store'
import { Icons } from '../icons'

const getGroups = (workspaces: Workspace[] | undefined) => {
  const groups = [
    {
      label: 'Personal',
      teams: [] as Team[],
    },
    {
      label: 'Teams',
      teams: [] as Team[],
    },
  ]

  workspaces?.forEach((workspace) => {
    if (workspace.isPersonal) {
      groups[0]?.teams.push({
        name: 'Personal',
        id: workspace.id,
      })
    } else {
      groups[1]?.teams.push({
        name: workspace.name,
        id: workspace.id,
      })
    }
  })

  return groups
}

type Team = {
  name: string
  id: string
}

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TeamSwitcherProps extends PopoverTriggerProps {
  className?: string
}

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const user = useUser()
  const supabase = useSupabaseClient()

  const { data: workspaces, refetch: refetchWorkspaces } =
    api.workspace.getAll.useQuery(undefined, {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }) as { data: Workspace[] | undefined; refetch: () => Promise<any> }

  const addWorkspace = api.workspace.create.useMutation()

  const { selectedWorkspace, setSelectedWorkspace } = useWorkspaceStore()
  const [open, setOpen] = React.useState(false)
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false)
  const [newWorkspaceInfo, setNewWorkspaceInfo] = React.useState({
    name: '',
    plan: 'free',
  })

  const groups = React.useMemo(() => getGroups(workspaces), [workspaces])

  const [hasInitialized, setHasInitialized] = React.useState(false)

  React.useEffect(() => {
    // Only run once when workspaces are loaded
    if (!workspaces || workspaces.length === 0 || hasInitialized) return

    // Get workspaceId from user metadata if it exists
    const userWorkspaceId = user?.user_metadata?.workspaceId

    if (userWorkspaceId) {
      const workspace = workspaces?.find(
        (workspace) => workspace.id === userWorkspaceId,
      )
      if (workspace) {
        setSelectedWorkspace({
          name: workspace?.isPersonal ? 'Personal' : workspace?.name ?? '',
          id: workspace?.id ?? '',
        })
        setHasInitialized(true)
      }
    } else {
      const defaultWorkspace = groups[0]?.teams[0]
      if (defaultWorkspace) {
        setSelectedWorkspace(defaultWorkspace)
        setHasInitialized(true)

        // Update workspaceId in user metadata
        if (user) {
          supabase.auth
            .updateUser({
              data: {
                workspaceId: defaultWorkspace.id,
              },
            })
            .catch(console.error)
        }
      }
    }
  }, [workspaces?.length, hasInitialized])

  const handleUpdateWorkspace = async (team: Team) => {
    setSelectedWorkspace(team)
    setOpen(false)

    // Update workspaceId in user metadata
    if (user) {
      await supabase.auth.updateUser({
        data: {
          workspaceId: team.id,
        },
      })
    }

    // refresh
    window.location.reload()
  }

  const handleCreateTeam = async () => {
    const name = newWorkspaceInfo.name.trim()
    try {
      await addWorkspace.mutateAsync({ name })
      await refetchWorkspaces()
      setShowNewTeamDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const name = e.target.name
    setNewWorkspaceInfo({ ...newWorkspaceInfo, [name]: val })
  }

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn('w-[220px] justify-between', className)}
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${selectedWorkspace?.id}.png`}
                alt={selectedWorkspace?.name}
              />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            {selectedWorkspace?.name}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No team found.</CommandEmpty>
              {groups?.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.teams.map((team) => (
                    <CommandItem
                      key={team.id}
                      onSelect={() => handleUpdateWorkspace(team)}
                      className="text-sm"
                    >
                      <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${team.id}.png`}
                          alt={team.name}
                          className="grayscale"
                        />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      {team.name}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedWorkspace?.id === team.id
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewTeamDialog(true)
                    }}
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Create Workspace
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to manage forms & collaborate with others
          </DialogDescription>
        </DialogHeader>
        <div>
          <form className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Input
                id="name"
                name="name"
                label="Workspace name"
                placeholder="Acme Inc."
                value={newWorkspaceInfo.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Subscription plan</Label>
              <Select name="plan" disabled defaultValue="free">
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <span className="font-medium">Free</span> -{' '}
                    <span className="text-muted-foreground">
                      Trial for two months
                    </span>
                  </SelectItem>
                  <SelectItem value="pro">
                    <span className="font-medium">Pro</span> -{' '}
                    <span className="text-muted-foreground">
                      $5/month per user
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewTeamDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleCreateTeam()}>
            {addWorkspace.isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
