import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/authorization'
import { hashPassword, validateEmail, generateTemporaryPassword } from '@/lib/auth-utils'
import type {
  GroupMember,
  CreateUserRequest,
  CreateUserResponse,
  GroupMembersResponse,
} from '@/types'

/**
 * GET /api/admin/users
 * List all members in the admin's group
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    await requirePermission('group:invite')

    // Fetch all members of the admin's group
    const members = await prisma.groupMembership.findMany({
      where: { groupId: session.user.groupId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    // Transform to GroupMember interface
    const groupMembers: GroupMember[] = members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role as any,
      joinedAt: m.joinedAt,
      user: {
        id: m.user.id,
        email: m.user.email,
        name: m.user.name,
        createdAt: m.user.createdAt,
      },
    }))

    const response: GroupMembersResponse = {
      members: groupMembers,
      total: groupMembers.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error listing users:', error)

    if (error instanceof Error) {
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }

    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
  }
}

/**
 * POST /api/admin/users
 * Create new user (direct add with temporary password)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    await requirePermission('group:invite')

    // Parse request body
    const body = await request.json()
    const { email, name, role } = body as CreateUserRequest

    // Validate email format
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error || 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check email doesn't already exist
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['ADMIN', 'POWER_USER', 'READ_ONLY']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    // Create user and group membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new user
      const user = await tx.user.create({
        data: {
          email,
          name: name || undefined,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      // Create group membership
      await tx.groupMembership.create({
        data: {
          userId: user.id,
          groupId: session.user.groupId,
          role,
        },
      })

      return user
    })

    const response: CreateUserResponse = {
      user: result,
      temporaryPassword,
      message: `User created successfully. Share this temporary password securely: ${temporaryPassword}`,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)

    if (error instanceof Error) {
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: error.message }, { status: 401 })
      }
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
