import { PrismaClient } from "@prisma/client"
import type { ConsentType, ConsentStatus } from "@/types/consent"

const prisma = new PrismaClient()

export class ConsentManager {
  /**
   * Record a new consent
   */
  static async recordConsent({
    userId,
    type,
    status,
    details = {},
    expiresAt = null,
  }: {
    userId: string
    type: ConsentType
    status: ConsentStatus
    details?: any
    expiresAt?: Date | null
  }): Promise<any> {
    return prisma.consent.create({
      data: {
        userId,
        type,
        status,
        details,
        grantedAt: new Date(),
        expiresAt,
      },
    })
  }

  /**
   * Check if a user has given consent for a specific type
   */
  static async hasConsent({
    userId,
    type,
  }: {
    userId: string
    type: ConsentType
  }): Promise<boolean> {
    const consent = await prisma.consent.findFirst({
      where: {
        userId,
        type,
        status: "GRANTED",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { grantedAt: "desc" },
    })

    return !!consent
  }

  /**
   * Revoke a consent
   */
  static async revokeConsent({
    userId,
    type,
  }: {
    userId: string
    type: ConsentType
  }): Promise<void> {
    await prisma.consent.updateMany({
      where: {
        userId,
        type,
        status: "GRANTED",
      },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    })
  }

  /**
   * Get all consents for a user
   */
  static async getUserConsents(userId: string): Promise<any[]> {
    return prisma.consent.findMany({
      where: { userId },
      orderBy: { grantedAt: "desc" },
    })
  }
}

