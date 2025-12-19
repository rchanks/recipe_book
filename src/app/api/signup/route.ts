import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth-utils'
import {
  generateGroupSlug,
  generateDefaultGroupName,
} from '@/lib/group-utils'

/**
 * User Signup Endpoint
 * POST /api/signup
 *
 * Creates a new user account with hashed password
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user, group, and membership atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name ? name.trim() : null,
        },
      })

      // 2. Create group
      const groupName = generateDefaultGroupName(user.name, user.email)
      const group = await tx.group.create({
        data: {
          name: groupName,
          slug: generateGroupSlug(user.id),
          allowPowerUserEdit: true,
        },
      })

      // 3. Create membership (user is ADMIN of their own group)
      await tx.groupMembership.create({
        data: {
          userId: user.id,
          groupId: group.id,
          role: 'ADMIN',
        },
      })

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        group,
      }
    })

    return NextResponse.json(
      { user: result.user, message: 'Account created successfully' },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('Signup error:', errorMessage)

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
