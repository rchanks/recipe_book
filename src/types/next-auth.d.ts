import { Role } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      groupId: string
      groupSlug: string
      role: Role
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string | null
    groupId: string
    groupSlug: string
    role: Role
  }
}
