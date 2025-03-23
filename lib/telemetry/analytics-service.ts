/**
 * Analytics Service untuk Memoright
 *
 * Layanan untuk melacak dan menganalisis perilaku pengguna dan performa aplikasi.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface PageViewEvent {
  path: string
  referrer?: string
  title?: string
  properties?: Record<string, any>
}

export interface UserProperties {
  id: string
  [key: string]: any
}

@Service("analyticsService")
export class AnalyticsService {
  private initialized = false
  private userId: string | null = null
  private sessionId: string | null = null
  private eventQueue: AnalyticsEvent[] = []
  private flushInterval: NodeJS.Timeout | null = null
  private providers: AnalyticsProvider[] = []

  /**
   * Inisialisasi service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Buat session ID baru
      this.sessionId = this.generateSessionId()

      // Inisialisasi providers
      this.initializeProviders()

      // Set interval untuk flush events
      this.flushInterval = setInterval(() => {
        this.flushEvents().catch((error) => {
          logger.error("Failed to flush analytics events", error instanceof Error ? error : new Error(String(error)))
        })
      }, 30 * 1000) // Flush setiap 30 detik

      // Tambahkan event listener untuk beforeunload
      if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", () => {
          this.flushEvents()
        })
      }

      this.initialized = true
      logger.info("Analytics service initialized")
    } catch (error) {
      logger.error("Failed to initialize analytics service", error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Inisialisasi providers analytics
   */
  private initializeProviders(): void {
    // Tambahkan providers yang diinginkan
    if (process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true") {
      this.providers.push(new VercelAnalyticsProvider())
    }

    if (process.env.NEXT_PUBLIC_ENABLE_CUSTOM_ANALYTICS === "true") {
      this.providers.push(new CustomAnalyticsProvider())
    }

    // Inisialisasi semua providers
    for (const provider of this.providers) {
      provider.initialize().catch((error) => {
        logger.error(
          `Failed to initialize analytics provider: ${provider.name}`,
          error instanceof Error ? error : new Error(String(error)),
        )
      })
    }
  }

  /**
   * Set user ID untuk analytics
   */
  public setUserId(userId: string): void {
    this.userId = userId

    // Update user ID di semua providers
    for (const provider of this.providers) {
      provider.setUserId(userId)
    }
  }

  /**
   * Set user properties untuk analytics
   */
  public setUserProperties(properties: UserProperties): void {
    if (!this.initialized) {
      logger.warn("Analytics service not initialized")
      return
    }

    // Set user properties di semua providers
    for (const provider of this.providers) {
      provider.setUserProperties(properties)
    }
  }

  /**
   * Track event analytics
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized) {
      logger.warn("Analytics service not initialized")
      return
    }

    // Tambahkan timestamp jika tidak ada
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date(),
    }

    // Tambahkan ke queue
    this.eventQueue.push(eventWithTimestamp)

    // Flush jika queue terlalu besar
    if (this.eventQueue.length >= 20) {
      this.flushEvents().catch((error) => {
        logger.error("Failed to flush analytics events", error instanceof Error ? error : new Error(String(error)))
      })
    }
  }

  /**
   * Track page view
   */
  public trackPageView(pageView: PageViewEvent): void {
    if (!this.initialized) {
      logger.warn("Analytics service not initialized")
      return
    }

    // Track page view di semua providers
    for (const provider of this.providers) {
      provider.trackPageView(pageView)
    }
  }

  /**
   * Flush events ke semua providers
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return
    }

    const events = [...this.eventQueue]
    this.eventQueue = []

    // Kirim events ke semua providers
    const promises = this.providers.map((provider) =>
      provider.trackEvents(events).catch((error) => {
        logger.error(
          `Failed to track events with provider: ${provider.name}`,
          error instanceof Error ? error : new Error(String(error)),
        )
      }),
    )

    await Promise.all(promises)
  }

  /**
   * Generate session ID unik
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }

    // Flush events yang tersisa
    this.flushEvents().catch((error) => {
      logger.error(
        "Failed to flush analytics events during disposal",
        error instanceof Error ? error : new Error(String(error)),
      )
    })

    // Dispose semua providers
    for (const provider of this.providers) {
      provider.dispose()
    }

    this.providers = []
    this.initialized = false
  }
}

/**
 * Interface untuk analytics provider
 */
interface AnalyticsProvider {
  name: string
  initialize(): Promise<void>
  setUserId(userId: string): void
  setUserProperties(properties: UserProperties): void
  trackEvent(event: AnalyticsEvent): Promise<void>
  trackEvents(events: AnalyticsEvent[]): Promise<void>
  trackPageView(pageView: PageViewEvent): void
  dispose(): void
}

/**
 * Provider untuk Vercel Analytics
 */
class VercelAnalyticsProvider implements AnalyticsProvider {
  name = "Vercel Analytics"

  async initialize(): Promise<void> {
    // Vercel Analytics diinisialisasi otomatis oleh Next.js
  }

  setUserId(userId: string): void {
    // Vercel Analytics tidak mendukung user ID
  }

  setUserProperties(properties: UserProperties): void {
    // Vercel Analytics tidak mendukung user properties
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (typeof window !== "undefined" && "va" in window) {
      ;(window as any).va("event", {
        name: event.name,
        ...event.properties,
      })
    }
  }

  async trackEvents(events: AnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      await this.trackEvent(event)
    }
  }

  trackPageView(pageView: PageViewEvent): void {
    // Vercel Analytics melacak page view otomatis
  }

  dispose(): void {
    // Tidak ada yang perlu dibersihkan
  }
}

/**
 * Provider untuk Custom Analytics
 */
class CustomAnalyticsProvider implements AnalyticsProvider {
  name = "Custom Analytics"
  private apiEndpoint: string
  private apiKey: string

  constructor() {
    this.apiEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || ""
    this.apiKey = process.env.NEXT_PUBLIC_ANALYTICS_API_KEY || ""
  }

  async initialize(): Promise<void> {
    // Tidak ada inisialisasi khusus yang diperlukan
  }

  setUserId(userId: string): void {
    // Simpan user ID di localStorage untuk digunakan nanti
    if (typeof window !== "undefined") {
      localStorage.setItem("analytics_user_id", userId)
    }
  }

  setUserProperties(properties: UserProperties): void {
    // Simpan user properties di localStorage untuk digunakan nanti
    if (typeof window !== "undefined") {
      localStorage.setItem("analytics_user_properties", JSON.stringify(properties))
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.apiEndpoint) {
      return
    }

    try {
      const userId = typeof window !== "undefined" ? localStorage.getItem("analytics_user_id") : null

      await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          type: "event",
          userId,
          event: {
            name: event.name,
            properties: event.properties,
            timestamp: event.timestamp?.toISOString(),
          },
        }),
      })
    } catch (error) {
      logger.error(
        "Failed to track event with custom analytics",
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  async trackEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.apiEndpoint || events.length === 0) {
      return
    }

    try {
      const userId = typeof window !== "undefined" ? localStorage.getItem("analytics_user_id") : null

      await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          type: "batch",
          userId,
          events: events.map((event) => ({
            name: event.name,
            properties: event.properties,
            timestamp: event.timestamp?.toISOString(),
          })),
        }),
      })
    } catch (error) {
      logger.error(
        "Failed to track events with custom analytics",
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  trackPageView(pageView: PageViewEvent): void {
    if (!this.apiEndpoint) {
      return
    }

    try {
      const userId = typeof window !== "undefined" ? localStorage.getItem("analytics_user_id") : null

      fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          type: "pageview",
          userId,
          pageView: {
            path: pageView.path,
            referrer: pageView.referrer,
            title: pageView.title,
            properties: pageView.properties,
            timestamp: new Date().toISOString(),
          },
        }),
      })
    } catch (error) {
      logger.error(
        "Failed to track page view with custom analytics",
        error instanceof Error ? error : new Error(String(error)),
      )
    }
  }

  dispose(): void {
    // Tidak ada yang perlu dibersihkan
  }
}

