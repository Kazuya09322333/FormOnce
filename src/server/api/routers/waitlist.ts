import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { getSupabaseAdmin } from '~/lib/supabase'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'

/** Index
 * 1. Join Procedure: This procedure is used to add a user to the waitlist.
 **/

export const waitlistRouter = createTRPCRouter({
  join: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const supabase = getSupabaseAdmin()

        // Check if email already exists
        const { data: existing } = await supabase
          .from('Waitlist')
          .select('email')
          .eq('email', input.email)
          .single()

        type WaitlistEmail = { email: string }

        if (existing) {
          // Already exists, just return it
          return { email: (existing as WaitlistEmail).email }
        }

        // Create new entry
        const { data, error } = await supabase
          .from('Waitlist')
          .insert({ email: input.email } as any)
          .select('email')
          .single()

        if (error || !data) {
          console.log(error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          })
        }

        return data as WaitlistEmail
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
