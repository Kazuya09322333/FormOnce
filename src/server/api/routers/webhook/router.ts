import { TRPCError } from '@trpc/server'
import { getSupabaseAdmin } from '~/lib/supabase'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

import {
  ZAddWebhook,
  ZDeleteWebhook,
  ZDisableWebhook,
  ZEnableWebhook,
  ZUpdateWebhook,
} from './dtos'

/** Index
 * getAll: protectedProcedure - get all webhooks
 * create: protectedProcedure - create a new webhook
 * delete: protectedProcedure - delete a webhook
 * disable: protectedProcedure - disable a webhook
 * enable: protectedProcedure - enable a webhook
 * update: protectedProcedure - update a webhook
 **/

export const webhooksRouter = createTRPCRouter({
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
        .from('Webhook')
        .select(`
          *,
          createdBy:User!Webhook_createdById_fkey(id, name)
        `)
        .eq('workspaceId', workspaceId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not get webhooks, please try again later.',
        })
      }

      return data
    } catch (error) {
      console.log(error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'could not get webhooks, please try again later.',
      })
    }
  }),

  create: protectedProcedure
    .input(ZAddWebhook)
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
          .from('Webhook')
          .insert({
            url: input.url,
            name: input.name,
            secret: input.secret,
            events: input.events,
            createdById: ctx.session.user.id,
            workspaceId: workspaceId,
          } as any)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'could not create webhook, please try again later.',
          })
        }

        return data
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not create webhook, please try again later.',
        })
      }
    }),
  delete: protectedProcedure
    .input(ZDeleteWebhook)
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
          .from('Webhook')
          .delete()
          .eq('id', input.id)
          .eq('workspaceId', workspaceId)
          .select()
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'could not delete webhook, please try again later.',
          })
        }

        return data
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not delete webhook, please try again later.',
        })
      }
    }),

  disable: protectedProcedure
    .input(ZDisableWebhook)
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
          .from('Webhook')
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
            message: 'could not disable webhook, please try again later.',
          })
        }

        return data
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not disable webhook, please try again later.',
        })
      }
    }),

  enable: protectedProcedure
    .input(ZEnableWebhook)
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
          .from('Webhook')
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
            message: 'could not enable webhook, please try again later.',
          })
        }

        return data
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not enable webhook, please try again later.',
        })
      }
    }),

  update: protectedProcedure
    .input(ZUpdateWebhook)
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

        const updateData: {
          url?: string
          name?: string
          secret?: string
          events?: string[]
        } = {
          url: input.url,
          name: input.name,
          secret: input.secret,
          events: input.events,
        }

        const { data, error } = await supabase
          .from('Webhook')
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
            message: 'could not update webhook, please try again later.',
          })
        }

        return data
      } catch (error) {
        console.log(error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'could not update webhook, please try again later.',
        })
      }
    }),
})
