import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import AppleProvider from "next-auth/providers/apple"
import { compare } from "bcrypt"
import prisma from "@/lib/db-client"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Redis } from "@upstash/redis"

// Initialize Redis client for session tracking
const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            twoFactorAuth: true,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        // Check if 2FA is enabled
        if (user.twoFactorAuth?.enabled) {
          if (!credentials.totpCode) {
            throw new Error("2FA_REQUIRED")
          }

          // Verify TOTP code
          const { authenticator } = await import("otplib")
          const isValidToken = authenticator.verify({
            token: credentials.totpCode,
            secret: user.twoFactorAuth.secret,
          })

          if (!isValidToken) {
            throw new Error("INVALID_2FA_CODE")
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.sessionToken = crypto.randomUUID()
      }

      // Track session for monitoring
      if (token.id && token.sessionToken) {
        try {
          await redis.hset(`sessions:${token.id}`, {
            [token.sessionToken]: JSON.stringify({
              createdAt: Date.now(),
              provider: account?.provider || "credentials",
            }),
          })
          // Set expiry for session tracking (30 days)
          await redis.expire(`sessions:${token.id}`, 60 * 60 * 24 * 30)
        } catch (error) {
          // Silent fail - don't block authentication if session tracking fails
          console.error("Session tracking error:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.sessionToken = token.sessionToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    newUser: "/onboarding",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signOut({ token }) {
      if (token?.id && token?.sessionToken) {
        try {
          // Remove the specific session that was signed out
          await redis.hdel(`sessions:${token.id}`, token.sessionToken)
        } catch (error) {
          console.error("Error removing session on signout:", error)
        }
      }
    },
  },
}

