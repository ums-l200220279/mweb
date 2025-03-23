/**
 * Encryption Service untuk Memoright
 *
 * Layanan untuk enkripsi dan dekripsi data sensitif menggunakan
 * algoritma kriptografi modern.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"
import crypto from "crypto"

@Service("encryptionService")
export class EncryptionService {
  private encryptionKey: Buffer
  private algorithm = "aes-256-gcm"
  private initialized = false

  constructor() {
    // Dapatkan encryption key dari environment variable
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
      throw new Error("ENCRYPTION_KEY environment variable is not set")
    }

    // Derive key dari string menggunakan PBKDF2
    const salt = "memoright-salt"
    this.encryptionKey = crypto.pbkdf2Sync(key, salt, 10000, 32, "sha256")
  }

  /**
   * Inisialisasi service
   */
  public initialize(): void {
    if (this.initialized) {
      return
    }

    // Verifikasi bahwa encryption key valid
    if (!this.encryptionKey || this.encryptionKey.length !== 32) {
      throw new Error("Invalid encryption key")
    }

    this.initialized = true
    logger.info("Encryption service initialized")
  }

  /**
   * Enkripsi data
   */
  public encrypt(data: string): string {
    if (!this.initialized) {
      this.initialize()
    }

    try {
      // Generate random IV
      const iv = crypto.randomBytes(16)

      // Buat cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv)

      // Enkripsi data
      let encrypted = cipher.update(data, "utf8", "hex")
      encrypted += cipher.final("hex")

      // Dapatkan auth tag
      const authTag = cipher.getAuthTag()

      // Gabungkan IV, auth tag, dan data terenkripsi
      return Buffer.concat([iv, authTag, Buffer.from(encrypted, "hex")]).toString("base64")
    } catch (error) {
      logger.error("Encryption failed", error instanceof Error ? error : new Error(String(error)))
      throw new Error("Encryption failed")
    }
  }

  /**
   * Dekripsi data
   */
  public decrypt(encryptedData: string): string {
    if (!this.initialized) {
      this.initialize()
    }

    try {
      // Decode base64
      const buffer = Buffer.from(encryptedData, "base64")

      // Ekstrak IV, auth tag, dan data terenkripsi
      const iv = buffer.subarray(0, 16)
      const authTag = buffer.subarray(16, 32)
      const encrypted = buffer.subarray(32).toString("hex")

      // Buat decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv)
      decipher.setAuthTag(authTag)

      // Dekripsi data
      let decrypted = decipher.update(encrypted, "hex", "utf8")
      decrypted += decipher.final("utf8")

      return decrypted
    } catch (error) {
      logger.error("Decryption failed", error instanceof Error ? error : new Error(String(error)))
      throw new Error("Decryption failed")
    }
  }

  /**
   * Enkripsi objek
   */
  public encryptObject<T>(obj: T): string {
    const json = JSON.stringify(obj)
    return this.encrypt(json)
  }

  /**
   * Dekripsi objek
   */
  public decryptObject<T>(encryptedData: string): T {
    const json = this.decrypt(encryptedData)
    return JSON.parse(json) as T
  }

  /**
   * Generate hash dari data
   */
  public hash(data: string, algorithm: "sha256" | "sha512" = "sha256"): string {
    return crypto.createHash(algorithm).update(data).digest("hex")
  }

  /**
   * Generate HMAC dari data
   */
  public hmac(data: string, algorithm: "sha256" | "sha512" = "sha256"): string {
    return crypto.createHmac(algorithm, this.encryptionKey).update(data).digest("hex")
  }

  /**
   * Generate token acak
   */
  public generateRandomToken(length = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    this.initialized = false
  }
}

