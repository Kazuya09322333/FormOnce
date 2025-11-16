import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '~/lib/supabase'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

/** Index
 * create: privateProcedure - create new workspace and add current user as owner
 **/

export const workspaceRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id
        const supabase = getSupabaseAdmin()

        // Create workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('Workspace')
          .insert({
            name: input.name,
            isPersonal: false,
          } as any)
          .select()
          .single()

        if (workspaceError || !workspace) {
          console.log(workspaceError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          })
        }

        type WorkspaceType = {
          id: string
        }

        const typedWorkspace = workspace as WorkspaceType

        // Create workspace member
        const { error: memberError } = await supabase
          .from('WorkspaceMember')
          .insert({
            role: 'OWNER',
            userId: userId,
            workspaceId: typedWorkspace.id,
          } as any)

        if (memberError) {
          console.log(memberError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          })
        }

        return workspace
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id
        const supabase = getSupabaseAdmin()

        // First check if user is a member of this workspace
        const { data: membership } = await supabase
          .from('WorkspaceMember')
          .select('workspaceId')
          .eq('workspaceId', input.id)
          .eq('userId', userId)
          .single()

        if (!membership) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Workspace not found',
          })
        }

        // Get the workspace
        const { data: workspace, error } = await supabase
          .from('Workspace')
          .select()
          .eq('id', input.id)
          .single()

        if (error || !workspace) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Workspace not found',
          })
        }

        return workspace
      } catch (error) {
        console.log(error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id
      const supabase = getSupabaseAdmin()

      // Get all workspace IDs the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('WorkspaceMember')
        .select('workspaceId')
        .eq('userId', userId)

      if (membershipError) {
        console.log(membershipError)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }

      if (!memberships || memberships.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      }

      type MembershipType = {
        workspaceId: string
      }

      const workspaceIds = memberships.map(
        (m) => (m as MembershipType).workspaceId,
      )

      // Get all workspaces
      const { data: workspace, error } = await supabase
        .from('Workspace')
        .select()
        .in('id', workspaceIds)

      if (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        })
      }

      if (!workspace) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })
      }

      return workspace
    } catch (error) {
      console.log(error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      })
    }
  }),
})
