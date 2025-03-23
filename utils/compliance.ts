import crypto from "crypto"

// This is a simplified example. In a real-world application, you would use a more robust encryption method
// and securely manage encryption keys.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-this"

export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(data, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

export function decryptData(encryptedData: string): string {
  const [ivHex, encryptedHex] = encryptedData.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encryptedHex, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

export function logAudit(action: string, userId: string, data: any) {
  // In a real-world application, you would log this to a secure, tamper-evident storage
  console.log(`AUDIT: ${new Date().toISOString()} - User ${userId} performed action: ${action}`)
  console.log(`AUDIT DATA: ${JSON.stringify(data)}`)
}

export function sanitizeData(data: any): any {
  // Remove any sensitive information before logging or displaying
  const sensitiveFields = ["ssn", "creditCard", "password"]
  return Object.keys(data).reduce((acc, key) => {
    if (sensitiveFields.includes(key)) {
      acc[key] = "[REDACTED]"
    } else {
      acc[key] = data[key]
    }
    return acc
  }, {})
}

