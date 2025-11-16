import { TRPCError } from '@trpc/server'
import { getSupabaseAdmin } from '~/lib/supabase'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

import { ZAddkey, ZDeletekey, ZDisablekey, ZEnablekey } from './dtos'

/** Index
 * getAll: protectedProcedure - get all keys
 * create: protectedProcedure - create a new key
 * delete: protectedProcedure - delete a key
 * disable: protectedProcedure - disable a key
 * enable: protectedProcedure - enable a key
 **/

export const ApikeyRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const supabase = getSupabaseAdmin()

      const workspaceId = ctx.session.user.workspaceId
      if (!workspaceId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Workspace ID is required',
        })
      }

      const { data, error } = await supabase
        .from('ApiKey')
        .select(`
          *,
          createdBy:User!ApiKey_createdById_fkey(id, name)
        `)
        .eq('workspaceId', workspaceId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not get key, please try again later.',
        })
      }

      return data
    } catch (error) {
      console.log(error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not get key, please try again later.',
      })
    }
  }),

  create: protectedProcedure.input(ZAddkey).mutation(async ({ ctx, input }) => {
    try {
      const supabase = getSupabaseAdmin()

      const workspaceId = ctx.session.user.workspaceId
      if (!workspaceId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Workspace ID is required',
        })
      }

      const { data, error } = await supabase
        .from('ApiKey')
        .insert({
          name: input.name,
          key:
            Math.random().toString(36).substring(2) +
            Math.random().toString(36).substring(2),
          createdById: ctx.session.user.id,
          workspaceId: workspaceId,
        } as any)
        .select()
        .single()

      if (error || !data) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not create key, please try again later.',
        })
      }

      return data
    } catch (error) {
      console.log(error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not create key, please try again later.',
      })
    }
  }),
  delete: protectedProcedure
    .input(ZDeletekey)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        const workspaceId = ctx.session.user.workspaceId
        if (!workspaceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Workspace ID is required',
          })
        }

        const { data, error } = await supabase
          .from('ApiKey')
          .delete()
          .eq('id', input.id)
          .eq('workspaceId', workspaceId)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'could not delete key, please try again later.',
          })
        }

        return data
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not delete key, please try again later.',
        })
      }
    }),

  disable: protectedProcedure
    .input(ZDisablekey)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        const workspaceId = ctx.session.user.workspaceId
        if (!workspaceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Workspace ID is required',
          })
        }

        const updateData: { enabled?: boolean } = { enabled: false }

        const { data, error } = await supabase
          .from('ApiKey')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.id)
          .eq('workspaceId', workspaceId)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'could not disable key, please try again later.',
          })
        }

        return data
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not disable key, please try again later.',
        })
      }
    }),

  enable: protectedProcedure
    .input(ZEnablekey)
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        const workspaceId = ctx.session.user.workspaceId
        if (!workspaceId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Workspace ID is required',
          })
        }

        const updateData: { enabled?: boolean } = { enabled: true }

        const { data, error } = await supabase
          .from('ApiKey')
          // @ts-ignore - Supabase type inference issue
          .update(updateData as any)
          .eq('id', input.id)
          .eq('workspaceId', workspaceId)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'could not enable key, please try again later.',
          })
        }

        return data
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not enable key, please try again later.',
        })
      }
    }),
})
