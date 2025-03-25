import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"
import type { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      sessionToken: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    sessionToken: string
  }
}

