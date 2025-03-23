/**
 * Advanced Auth Service untuk Memoright
 *
 * Layanan autentikasi dan otorisasi tingkat lanjut dengan
 * dukungan untuk multi-factor authentication, RBAC, dan ABAC.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"
import { apiClient } from "@/lib/api/fetcher"
import type { EncryptionService } from "@/lib/security/encryption-service"
import type { AuditService } from "@/lib/security/audit-service"
import { RateLimiter } from "@/lib/security/rate-limiter"
import { container } from "@/lib/architecture/dependency-injection"

export interface User {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  attributes: Record<string, any>
  mfaEnabled: boolean
  lastLogin?: Date
}

export interface AuthSession {
  id: string
  userId: string
  token: string
  refreshToken: string
  expiresAt: Date
  createdAt: Date
  ipAddress?: string
  userAgent?: string
  mfaVerified: boolean
}

export interface LoginOptions {
  rememberMe?: boolean
  mfaCode?: string
  captchaToken?: string
}

export interface MfaMethod {
  id: string
  type: "totp" | "sms" | "email" | "push"
  verified: boolean
  createdAt: Date
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

@Service("advancedAuthService")
export class AdvancedAuthService {
  private currentUser: User | null = null
  private currentSession: AuthSession | null = null
  private initialized = false
  private refreshTimer: NodeJS.Timeout | null = null
  private encryptionService: EncryptionService
  private auditService: AuditService
  private loginRateLimiter: RateLimiter

  constructor() {
    this.encryptionService = container.resolve<EncryptionService>("encryptionService")
    this.auditService = container.resolve<AuditService>("auditService")

    // Rate limiter untuk login (5 percobaan per 15 menit)
    this.loginRateLimiter = new RateLimiter("login", 5, 15 * 60)
  }

  /**
   * Inisialisasi service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Coba restore session dari storage
      await this.restoreSession()

      this.initialized = true
      logger.info("Advanced auth service initialized")
    } catch (error) {
      logger.error(
        "Failed to initialize advanced auth service",
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  /**
   * Restore session dari storage
   */
  private async restoreSession(): Promise<void> {
    if (typeof window === "undefined") {
      return
    }

    try {
      // Dapatkan session dari localStorage
      const sessionData = localStorage.getItem("auth_session")
      if (!sessionData) {
        return
      }

      // Dekripsi session
      const session = this.encryptionService.decryptObject<AuthSession>(sessionData)

      // Periksa apakah session masih valid
      if (new Date(session.expiresAt) < new Date()) {
        // Session kedaluwarsa, coba refresh
        await this.refreshToken(session.refreshToken)
      } else {
        // Session masih valid, set session dan user
        this.currentSession = session
        await this.fetchCurrentUser()

        // Set timer untuk refresh token
        this.setupRefreshTimer()
      }
    } catch (error) {
      logger.error("Failed to restore session", error instanceof Error ? error : new Error(String(error)))

      // Hapus session yang rusak
      localStorage.removeItem("auth_session")
    }
  }

  /**
   * Login dengan email dan password
   */
  public async login(email: string, password: string, options: LoginOptions = {}): Promise<User> {
    if (!this.initialized) {
      await this.initialize()
    }

    // Periksa rate limit
    const isRateLimited = await this.loginRateLimiter.isRateLimited(email)
    if (isRateLimited) {
      throw new Error("Too many login attempts. Please try again later.")
    }

    try {
      // Kirim request login ke API
      const response = await apiClient.post<{
        session: AuthSession
        user: User
        requireMfa: boolean
      }>("/api/auth/login", {
        email,
        password,
        rememberMe: options.rememberMe,
        captchaToken: options.captchaToken,
      })

      // Jika memerlukan MFA
      if (response.requireMfa) {
        if (!options.mfaCode) {
          throw new Error("MFA code is required")
        }

        // Verifikasi MFA
        const mfaResponse = await apiClient.post<{
          session: AuthSession
          user: User
        }>("/api/auth/mfa/verify", {
          email,
          code: options.mfaCode,
        })

        this.currentSession = mfaResponse.session
        this.currentUser = mfaResponse.user
      } else {
        this.currentSession = response.session
        this.currentUser = response.user
      }

      // Simpan session ke localStorage
      if (typeof window !== "undefined") {
        const encryptedSession = this.encryptionService.encryptObject(this.currentSession)
        localStorage.setItem("auth_session", encryptedSession)
      }

      // Set timer untuk refresh token
      this.setupRefreshTimer()

      // Catat audit event
      await this.auditService.log({
        userId: this.currentUser.id,
        action: "user_login",
        resource: "auth",
        details: {
          email: this.currentUser.email,
          mfaVerified: this.currentSession.mfaVerified,
        },
        status: "success",
      })

      // Reset rate limiter
      await this.loginRateLimiter.resetRateLimit(email)

      return this.currentUser
    } catch (error) {
      // Catat audit event
      await this.auditService.log({
        userId: "anonymous",
        action: "user_login",
        resource: "auth",
        details: {
          email,
          error: error instanceof Error ? error.message : String(error),
        },
        status: "failure",
        reason: error instanceof Error ? error.message : String(error),
      })

      logger.error("Login failed", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Logout
   */
  public async logout(): Promise<void> {
    if (!this.currentSession) {
      return
    }

    try {
      // Kirim request logout ke API
      await apiClient.post("/api/auth/logout", {
        sessionId: this.currentSession.id,
      })

      // Catat audit event
      if (this.currentUser) {
        await this.auditService.log({
          userId: this.currentUser.id,
          action: "user_logout",
          resource: "auth",
          status: "success",
        })
      }
    } catch (error) {
      logger.error("Logout failed", error instanceof Error ? error : new Error(String(error)))
    } finally {
      // Hapus session dari localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_session")
      }

      // Bersihkan state
      this.currentUser = null
      this.currentSession = null

      // Hapus timer refresh
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer)
        this.refreshTimer = null
      }
    }
  }

  /**
   * Refresh token
   */
  private async refreshToken(refreshToken?: string): Promise<void> {
    if (!this.currentSession && !refreshToken) {
      return
    }

    try {
      // Kirim request refresh token ke API
      const response = await apiClient.post<{
        session: AuthSession
      }>("/api/auth/refresh", {
        refreshToken: refreshToken || this.currentSession?.refreshToken,
      })

      // Update session
      this.currentSession = response.session

      // Simpan session ke localStorage
      if (typeof window !== "undefined") {
        const encryptedSession = this.encryptionService.encryptObject(this.currentSession)
        localStorage.setItem("auth_session", encryptedSession)
      }

      // Set timer untuk refresh token berikutnya
      this.setupRefreshTimer()

      logger.debug("Token refreshed successfully")
    } catch (error) {
      logger.error("Token refresh failed", error instanceof Error ? error : new Error(String(error)))

      // Jika refresh gagal, logout
      await this.logout()
    }
  }

  /**
   * Setup timer untuk refresh token
   */
  private setupRefreshTimer(): void {
    if (!this.currentSession) {
      return
    }

    // Bersihkan timer yang ada
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    // Hitung waktu untuk refresh (5 menit sebelum kedaluwarsa)
    const expiresAt = new Date(this.currentSession.expiresAt).getTime()
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now
    const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000)

    // Set timer untuk refresh
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().catch((error) => {
        logger.error("Auto token refresh failed", error instanceof Error ? error : new Error(String(error)))
      })
    }, refreshTime)
  }

  /**
   * Fetch current user
   */
  private async fetchCurrentUser(): Promise<void> {
    if (!this.currentSession) {
      return
    }

    try {
      // Kirim request ke API
      const user = await apiClient.get<User>("/api/auth/me")
      this.currentUser = user
    } catch (error) {
      logger.error("Failed to fetch current user", error instanceof Error ? error : new Error(String(error)))

      // Jika gagal, logout
      await this.logout()
    }
  }

  /**
   * Mendapatkan user saat ini
   */
  public getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * Mendapatkan session saat ini
   */
  public getCurrentSession(): AuthSession | null {
    return this.currentSession
  }

  /**
   * Memeriksa apakah user terautentikasi
   */
  public isAuthenticated(): boolean {
    return !!this.currentUser && !!this.currentSession
  }

  /**
   * Memeriksa apakah user memiliki role tertentu
   */
  public hasRole(role: string): boolean {
    if (!this.currentUser) {
      return false
    }

    return this.currentUser.role === role
  }

  /**
   * Memeriksa apakah user memiliki permission tertentu
   */
  public hasPermission(permission: string): boolean {
    if (!this.currentUser) {
      return false
    }

    return this.currentUser.permissions.includes(permission)
  }

  /**
   * Memeriksa apakah user memiliki akses ke resource
   */
  public hasAccess(resource: string, action: string): boolean {
    if (!this.currentUser) {
      return false
    }

    // Periksa permission spesifik
    const specificPermission = `${resource}:${action}`
    if (this.currentUser.permissions.includes(specificPermission)) {
      return true
    }

    // Periksa permission wildcard
    const wildcardPermission = `${resource}:*`
    if (this.currentUser.permissions.includes(wildcardPermission)) {
      return true
    }

    // Periksa permission super admin
    if (this.currentUser.permissions.includes("*:*")) {
      return true
    }

    return false
  }

  /**
   * Mendapatkan metode MFA yang tersedia
   */
  public async getMfaMethods(): Promise<MfaMethod[]> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated")
    }

    try {
      return await apiClient.get<MfaMethod[]>("/api/auth/mfa/methods")
    } catch (error) {
      logger.error("Failed to get MFA methods", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mengaktifkan MFA
   */
  public async enableMfa(type: "totp" | "sms" | "email"): Promise<{
    secret?: string
    qrCode?: string
  }> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated")
    }

    try {
      const response = await apiClient.post<{
        secret?: string
        qrCode?: string
      }>("/api/auth/mfa/enable", {
        type,
      })

      // Catat audit event
      await this.auditService.log({
        userId: this.currentUser!.id,
        action: "mfa_enabled",
        resource: "auth",
        details: {
          type,
        },
        status: "success",
      })

      return response
    } catch (error) {
      logger.error("Failed to enable MFA", error instanceof Error ? error : new Error(String(error)))

      // Catat audit event
      await this.auditService.log({
        userId: this.currentUser!.id,
        action: "mfa_enabled",
        resource: "auth",
        details: {
          type,
          error: error instanceof Error ? error.message : String(error),
        },
        status: "failure",
        reason: error instanceof Error ? error.message : String(error),
      })

      throw error
    }
  }

  /**
   * Verifikasi MFA
   */
  public async verifyMfa(methodId: string, code: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated")
    }

    try {
      await apiClient.post("/api/auth/mfa/verify", {
        methodId,
        code,
      })

      // Update user
      await this.fetchCurrentUser()

      // Catat audit event
      await this.auditService.log({
        userId: this.currentUser!.id,
        action: "mfa_verified",
        resource: "auth",
        details: {
          methodId,
        },
        status: "success",
      })

      return true
    } catch (error) {
      logger.error("Failed to verify MFA", error instanceof Error ? error : new Error(String(error)))

      // Catat audit event
      await this.auditService.log({
        userId: this.currentUser!.id,
        action: "mfa_verified",
        resource: "auth",
        details: {
          methodId,
          error: error instanceof Error ? error.message : String(error),
        },
        status: "failure",
        reason: error instanceof Error ? error.message : String(error),
      })

      return false
    }
  }

  /**
   * Menonaktifkan MFA
   */
  public async disableMfa(methodId: string): Promise<boolean> {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated")
    }

    try {
      await apiClient.post("/api/auth/mfa/disable", {
        methodId,
      })

      // Update user
      await this.fetchCurrentUser()

      // Catat audit event
      await this.auditService.log({
        userId: this.currentUser!.id,
        action: "mfa_disabled",
        resource: "auth",
        details: {
          methodId,
        },
        status: "success",
      })

      return true
    } catch (error) {
      logger.error("Failed to disable MFA", error instanceof Error ? error : new Error(String(error)))

      // Catat audit event
      await this.auditService.log({
        userId: this.currentUser!.id,
        action: "mfa_disabled",
        resource: "auth",
        details: {
          methodId,
          error: error instanceof Error ? error.message : String(error),
        },
        status: "failure",
        reason: error instanceof Error ? error.message : String(error),
      })

      return false
    }
  }

  /**
   * Mendapatkan semua role
   */
  public async getRoles(): Promise<Role[]> {
    try {
      return await apiClient.get<Role[]>("/api/auth/roles")
    } catch (error) {
      logger.error("Failed to get roles", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Mendapatkan semua permission
   */
  public async getPermissions(): Promise<Permission[]> {
    try {
      return await apiClient.get<Permission[]>("/api/auth/permissions")
    } catch (error) {
      logger.error("Failed to get permissions", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
     error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    // Hapus timer refresh
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }

    // Bersihkan state
    this.currentUser = null
    this.currentSession = null
    this.initialized = false
  }
}

