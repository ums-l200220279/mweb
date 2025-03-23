/**
 * Encryption Utilities
 *
 * This module provides utilities for encrypting and decrypting sensitive data.
 * It implements industry-standard encryption algorithms and best practices.
 */

import { logger } from "@/lib/monitoring/logger"

// Encryption key should be stored in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

// Check if encryption key is available
if (!ENCRYPTION_KEY && process.env.NODE_ENV === "production") {
  logger.error("ENCRYPTION_KEY environment variable is not set")
}

// Generate a random initialization vector
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12))
}

// Convert string to ArrayBuffer
async function stringToArrayBuffer(str: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  return encoder.encode(str).buffer
}

// Convert ArrayBuffer to string
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder()
  return decoder.decode(new Uint8Array(buffer))
}

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""

  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}

// Derive encryption key from the provided key
async function deriveKey(key: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey("raw", await stringToArrayBuffer(key), { name: "PBKDF2" }, false, [
    "deriveBits",
    "deriveKey",
  ])

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: await stringToArrayBuffer("memoright-salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

// Encrypt data
export async function encrypt(data: string): Promise<string> {
  try {
    if (!ENCRYPTION_KEY) {
      throw new Error("Encryption key is not available")
    }

    const key = await deriveKey(ENCRYPTION_KEY)
    const iv = generateIV()
    const dataBuffer = await stringToArrayBuffer(data)

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      dataBuffer,
    )

    // Combine IV and encrypted data
    const combinedBuffer = new Uint8Array(iv.length + new Uint8Array(encryptedBuffer).length)
    combinedBuffer.set(iv)
    combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length)

    // Return as Base64 string
    return arrayBufferToBase64(combinedBuffer.buffer)
  } catch (error) {
    logger.error("Encryption failed", error)
    throw new Error("Failed to encrypt data")
  }
}

// Decrypt data
export async function decrypt(encryptedData: string): Promise<string> {
  try {
    if (!ENCRYPTION_KEY) {
      throw new Error("Encryption key is not available")
    }

    const key = await deriveKey(ENCRYPTION_KEY)
    const combinedBuffer = base64ToArrayBuffer(encryptedData)

    // Extract IV and encrypted data
    const iv = new Uint8Array(combinedBuffer.slice(0, 12))
    const encryptedBuffer = new Uint8Array(combinedBuffer.slice(12))

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encryptedBuffer,
    )

    return arrayBufferToString(decryptedBuffer)
  } catch (error) {
    logger.error("Decryption failed", error)
    throw new Error("Failed to decrypt data")
  }
}

// Hash data (one-way)
export async function hash(data: string): Promise<string> {
  try {
    const dataBuffer = await stringToArrayBuffer(data)
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)

    return arrayBufferToBase64(hashBuffer)
  } catch (error) {
    logger.error("Hashing failed", error)
    throw new Error("Failed to hash data")
  }
}

// Generate a secure random token
export function generateSecureToken(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return arrayBufferToBase64(bytes.buffer)
}

// Anonymize sensitive data (e.g., for logging)
export function anonymize(data: string): string {
  if (!data) return ""

  // For emails: show only the first character and domain
  if (data.includes("@")) {
    const [localPart, domain] = data.split("@")
    return `${localPart.charAt(0)}${"*".repeat(localPart.length - 1)}@${domain}`
  }

  // For other identifiers: show only first and last character
  if (data.length > 4) {
    return `${data.charAt(0)}${"*".repeat(data.length - 2)}${data.charAt(data.length - 1)}`
  }

  // For short strings: replace all with asterisks
  return "*".repeat(data.length)
}

