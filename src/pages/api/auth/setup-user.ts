import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '~/server/db'

/**
 * Setup user after Supabase Auth signup
 * Creates User record in database and initial Workspace
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get authenticated user from Supabase
    const supabase = createPagesServerClient({ req, res })
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()

    if (!supabaseUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: {
        WorkspaceMember: {
          include: {
            Workspace: true,
          },
        },
      },
    })

    if (existingUser) {
      // User already setup
      return res.status(200).json({
        user: existingUser,
        workspace: existingUser.WorkspaceMember[0]?.Workspace,
      })
    }

    // Create user and workspace
    const userName =
      supabaseUser.user_metadata?.name ||
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.email?.split('@')[0] ||
      'User'

    console.log('Creating user:', {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: userName,
    })

    const newUser = await prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: userName,
        emailVerified: supabaseUser.email_confirmed_at
          ? new Date(supabaseUser.email_confirmed_at)
          : null,
        WorkspaceMember: {
          create: {
            role: 'OWNER',
            Workspace: {
              create: {
                name: `${userName}'s Workspace`,
                isPersonal: true,
              },
            },
          },
        },
      },
      include: {
        WorkspaceMember: {
          include: {
            Workspace: true,
          },
        },
      },
    })

    return res.status(201).json({
      user: newUser,
      workspace: newUser.WorkspaceMember[0]?.Workspace,
    })
  } catch (error) {
    console.error('Error setting up user:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return res.status(500).json({
      error: 'Failed to setup user',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
