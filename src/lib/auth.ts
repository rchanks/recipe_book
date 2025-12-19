import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth-utils'
import type { NextAuthConfig } from 'next-auth'

/**
 * NextAuth.js Configuration
 * Implements email/password authentication with JWT sessions
 */
const authConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user) {
            return null
          }

          // Verify password
          const isValid = await verifyPassword(
            credentials.password as string,
            user.password
          )

          if (!isValid) {
            return null
          }

          // Return user object (will be stored in JWT)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Use JWT instead of database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login', // Custom login page
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user ID to token on signin
      if (user) {
        // Fetch user's primary group membership
        const membership = await prisma.groupMembership.findFirst({
          where: { userId: user.id },
          include: { group: true },
          orderBy: { joinedAt: 'asc' },
        })

        token.id = user.id
        token.email = user.email
        token.name = user.name

        // Add group and role to token
        if (membership) {
          token.groupId = membership.groupId
          token.groupSlug = membership.group.slug
          token.role = membership.role
        }
      }
      return token
    },
    async session({ session, token }) {
      // Add user ID and group/role to session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string | null
        session.user.groupId = token.groupId as string
        session.user.groupSlug = token.groupSlug as string
        session.user.role = token.role as any
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
