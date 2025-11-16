import { TRPCError } from '@trpc/server'
import * as argon2 from 'argon2'
import { z } from 'zod'
import { getSupabaseAdmin } from '~/lib/supabase'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

/** Index
 * signup: publicProcedure - create user
 **/

export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({ name: z.string(), email: z.string(), password: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('User')
          .select('id')
          .eq('email', input.email)
          .single()

        if (existingUser) {
          console.log('Email already in use')
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Email already in use',
          })
        }

        const hashedPassword = await argon2.hash(input.password, {
          saltLength: 12,
        })

        // Create workspace first
        const { data: workspace, error: workspaceError } = await supabase
          .from('Workspace')
          .insert({
            name: `${input.name}'s Workspace`,
            isPersonal: true,
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

        // Create user
        const { data: user, error: userError } = await supabase
          .from('User')
          .insert({
            name: input.name,
            email: input.email,
            password: hashedPassword,
          } as any)
          .select()
          .single()

        if (userError || !user) {
          console.log(userError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          })
        }

        // Type assertions for TypeScript
        type WorkspaceType = { id: string; name: string; isPersonal: boolean }
        type UserType = { id: string; email: string; name: string | null }
        const typedWorkspace = workspace as WorkspaceType
        const typedUser = user as UserType

        // Create workspace member
        const { data: member, error: memberError } = await supabase
          .from('WorkspaceMember')
          .insert({
            role: 'OWNER',
            userId: typedUser.id,
            workspaceId: typedWorkspace.id,
          } as any)
          .select()
          .single()

        if (memberError || !member) {
          console.log(memberError)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          })
        }

        type MemberType = {
          id: string
          userId: string
          workspaceId: string
          role: string
        }
        const typedMember = member as MemberType

        type UserWithWorkspace = UserType & {
          WorkspaceMember: Array<MemberType & { Workspace: WorkspaceType }>
        }

        // Return user with workspace member data
        return {
          ...typedUser,
          WorkspaceMember: [
            {
              ...typedMember,
              Workspace: typedWorkspace,
            },
          ],
        } as UserWithWorkspace
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
