import { randomBytes, createHmac } from "crypto"

// CSRF token expiration time (1 hour)
const EXPIRY_TIME = 60 * 60 * 1000

/**
 * Generate a CSRF token with expiration
 */
export function generateCsrfToken(): { csrfToken: string; csrfTokenExpiry: number } {
  const csrfTokenExpiry = Date.now() + EXPIRY_TIME
  const randomString = randomBytes(32).toString("hex")
  const hmac = createHmac("sha256", process.env.NEXTAUTH_SECRET || "csrf-secret")
  hmac.update(`${randomString}:${csrfTokenExpiry}`)
  const hash = hmac.digest("hex")

  const csrfToken = `${randomString}:${csrfTokenExpiry}:${hash}`
  return { csrfToken, csrfTokenExpiry }
}

/**
 * Validate a CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  try {
    const [randomString, expiryString, originalHash] = token.split(":")
    const expiry = Number.parseInt(expiryString, 10)

    // Check if token has expired
    if (Date.now() > expiry) {
      return false
    }

    // Recreate the hash to verify the token hasn't been tampered with
    const hmac = createHmac("sha256", process.env.NEXTAUTH_SECRET || "csrf-secret")
    hmac.update(`${randomString}:${expiry}`)
    const hash = hmac.digest("hex")

    return hash === originalHash
  } catch (error) {
    return false
  }
}

