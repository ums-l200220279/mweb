// Simple encryption/decryption utilities for sensitive data
// In a real app, use a proper encryption library

export function encrypt(text: string): string {
  // This is a placeholder. In a real app, use proper encryption
  // For demo purposes, we're just doing a simple encoding
  return Buffer.from(text).toString("base64")
}

export function decrypt(encryptedText: string): string {
  // This is a placeholder. In a real app, use proper decryption
  // For demo purposes, we're just doing a simple decoding
  return Buffer.from(encryptedText, "base64").toString("utf-8")
}

