import crypto from "crypto"
import { cookies } from "next/headers"
import { RedisCache } from "@/lib/cache/redis-cache"

export class CSRFProtection {
  private static readonly CSRF_SECRET_KEY = "csrf:secret"
  private static readonly CSRF_TOKEN_PREFIX = "csrf:token:"
  private static readonly TOKEN_TTL = 3600 // 1 hour

  /**
   * Generate a CSRF token for a session
   * @param sessionId The session ID
   * @returns The generated CSRF token
   */
  static async generateToken(sessionId: string): Promise<string> {
    // Get or create a secret for CSRF tokens
    const secret = await this.getOrCreateSecret()

    // Generate a random token
    const randomBytes = crypto.randomBytes(32).toString("hex")

    // Create a timestamp to prevent token reuse
    const timestamp = Date.now().toString()

    // Create the token payload
    const payload = `${sessionId}:${timestamp}:${randomBytes}`

    // Create HMAC signature
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(payload)
    const signature = hmac.digest("hex")

    // Combine payload and signature
    const token = `${payload}:${signature}`

    // Store token in Redis for double submit validation
    const redisKey = `${this.CSRF_TOKEN_PREFIX}${sessionId}`
    await RedisCache.set(redisKey, token, { ttl: this.TOKEN_TTL })

    // Set token in cookie for double submit
    cookies().set("csrf_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: this.TOKEN_TTL,
      path: "/",
    })

    return token
  }

  /**
   * Validate a CSRF token
   * @param sessionId The session ID
   * @param token The CSRF token to validate
   * @returns True if valid, false otherwise
   */
  static async validateToken(sessionId: string, token: string): Promise<boolean> {
    // Get the secret
    const secret = await this.getOrCreateSecret()

    // Get stored token from Redis
    const redisKey = `${this.CSRF_TOKEN_PREFIX}${sessionId}`
    const storedToken = await RedisCache.get<string>(redisKey)

    // Get token from cookie for double submit validation
    const cookieToken = cookies().get("csrf_token")?.value

    // If no stored token or cookie token doesn't match, invalid
    if (!storedToken || !cookieToken || cookieToken !== token) {
      return false
    }

    // Split token into parts
    const parts = token.split(":")

    // Token should have 4 parts: sessionId, timestamp, randomBytes, signature
    if (parts.length !== 4) {
      return false
    }

    const [tokenSessionId, timestamp, randomBytes, signature] = parts

    // Verify session ID
    if (tokenSessionId !== sessionId) {
      return false
    }

    // Check if token is expired (1 hour)
    const tokenTime = Number.parseInt(timestamp, 10)
    const now = Date.now()

    if (now - tokenTime > this.TOKEN_TTL * 1000) {
      return false
    }

    // Recreate the signature
    const payload = `${tokenSessionId}:${timestamp}:${randomBytes}`
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(payload)
    const expectedSignature = hmac.digest("hex")

    // Compare signatures
    if (signature !== expectedSignature) {
      return false
    }

    return true
  }

  /**
   * Get or create a secret for CSRF tokens
   * @returns The secret
   */
  private static async getOrCreateSecret(): Promise<string> {
    // Try to get existing secret
    let secret = await RedisCache.get<string>(this.CSRF_SECRET_KEY)

    // If no secret exists, create one
    if (!secret) {
      secret = crypto.randomBytes(32).toString("hex")
      await RedisCache.set(this.CSRF_SECRET_KEY, secret)
    }

    return secret
  }

  /**
   * Invalidate a CSRF token
   * @param sessionId The session ID
   */
  static async invalidateToken(sessionId: string): Promise<void> {
    const redisKey = `${this.CSRF_TOKEN_PREFIX}${sessionId}`
    await RedisCache.delete(redisKey)

    // Remove cookie
    cookies().delete("csrf_token")
  }
}

