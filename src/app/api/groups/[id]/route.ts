import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireGroupMembership } from '@/lib/authorization'

/**
 * GET /api/groups/[id]
 * Get group details including governance settings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify user is a member of this group
    await requireGroupMembership(session.user.id, id)

    // Fetch group
    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        allowPowerUserEdit: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    return NextResponse.json(group)
  } catch (error) {
    console.error('Error fetching group:', error)

    if (error instanceof Error) {
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }

    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}
