/**
 * Internationalization Service untuk Memoright
 *
 * Layanan untuk mengelola terjemahan dan lokalisasi aplikasi.
 */

import { Service } from "@/lib/architecture/dependency-injection"
import { logger } from "@/lib/logger"

export interface Locale {
  code: string
  name: string
  direction: "ltr" | "rtl"
}

export interface TranslationOptions {
  interpolation?: Record<string, string | number>
  count?: number
  context?: string
}

@Service("i18nService")
export class I18nService {
  private translations: Record<string, Record<string, string>> = {}
  private currentLocale = "en"
  private fallbackLocale = "en"
  private supportedLocales: Locale[] = [
    { code: "en", name: "English", direction: "ltr" },
    { code: "id", name: "Bahasa Indonesia", direction: "ltr" },
    { code: "ar", name: "العربية", direction: "rtl" },
    { code: "zh", name: "中文", direction: "ltr" },
    { code: "es", name: "Español", direction: "ltr" },
  ]
  private initialized = false

  /**
   * Inisialisasi service
   */
  public async initialize(locale?: string): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Set locale
      if (locale && this.isLocaleSupported(locale)) {
        this.currentLocale = locale
      }

      // Muat terjemahan untuk locale saat ini dan fallback
      await this.loadTranslations(this.currentLocale)
      if (this.currentLocale !== this.fallbackLocale) {
        await this.loadTranslations(this.fallbackLocale)
      }

      this.initialized = true
      logger.info(`I18n service initialized with locale: ${this.currentLocale}`)
    } catch (error) {
      logger.error("Failed to initialize i18n service", error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Muat terjemahan untuk locale tertentu
   */
  private async loadTranslations(locale: string): Promise<void> {
    try {
      // Muat terjemahan dari API atau file
      const translations = await import(`@/locales/${locale}.json`)
      this.translations[locale] = translations.default
      logger.info(`Loaded translations for locale: ${locale}`)
    } catch (error) {
      logger.error(
        `Failed to load translations for locale: ${locale}`,
        error instanceof Error ? error : new Error(String(error)),
      )

      // Fallback ke objek kosong jika gagal
      this.translations[locale] = {}
    }
  }

  /**
   * Mendapatkan terjemahan berdasarkan key
   */
  public t(key: string, options?: TranslationOptions): string {
    if (!this.initialized) {
      logger.warn("I18n service not initialized")
      return key
    }

    // Cari terjemahan di locale saat ini
    let translation = this.getTranslation(key, this.currentLocale)

    // Fallback ke locale default jika tidak ditemukan
    if (!translation && this.currentLocale !== this.fallbackLocale) {
      translation = this.getTranslation(key, this.fallbackLocale)
    }

    // Fallback ke key jika tidak ditemukan
    if (!translation) {
      return key
    }

    // Proses terjemahan dengan opsi
    return this.processTranslation(translation, options)
  }

  /**
   * Mendapatkan terjemahan dari cache
   */
  private getTranslation(key: string, locale: string): string | undefined {
    const translations = this.translations[locale]
    if (!translations) {
      return undefined
    }

    // Handle nested keys (e.g. 'common.buttons.submit')
    const parts = key.split(".")
    let result: any = translations

    for (const part of parts) {
      if (result && typeof result === "object" && part in result) {
        result = result[part]
      } else {
        return undefined
      }
    }

    return typeof result === "string" ? result : undefined
  }

  /**
   * Proses terjemahan dengan opsi
   */
  private processTranslation(translation: string, options?: TranslationOptions): string {
    let result = translation

    // Proses interpolasi
    if (options?.interpolation) {
      for (const [key, value] of Object.entries(options.interpolation)) {
        result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), String(value))
      }
    }

    // Proses pluralisasi
    if (options?.count !== undefined && result.includes("{{count}}")) {
      result = result.replace(/{{count}}/g, String(options.count))
    }

    return result
  }

  /**
   * Mengubah locale saat ini
   */
  public async changeLocale(locale: string): Promise<void> {
    if (!this.isLocaleSupported(locale)) {
      throw new Error(`Locale not supported: ${locale}`)
    }

    if (locale === this.currentLocale) {
      return
    }

    // Muat terjemahan jika belum dimuat
    if (!this.translations[locale]) {
      await this.loadTranslations(locale)
    }

    this.currentLocale = locale
    logger.info(`Changed locale to: ${locale}`)
  }

  /**
   * Mendapatkan locale saat ini
   */
  public getCurrentLocale(): string {
    return this.currentLocale
  }

  /**
   * Mendapatkan arah teks untuk locale saat ini
   */
  public getDirection(): "ltr" | "rtl" {
    const locale = this.supportedLocales.find((l) => l.code === this.currentLocale)
    return locale?.direction || "ltr"
  }

  /**
   * Mendapatkan semua locale yang didukung
   */
  public getSupportedLocales(): Locale[] {
    return [...this.supportedLocales]
  }

  /**
   * Memeriksa apakah locale didukung
   */
  public isLocaleSupported(locale: string): boolean {
    return this.supportedLocales.some((l) => l.code === locale)
  }

  /**
   * Format tanggal berdasarkan locale saat ini
   */
  public formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date)
  }

  /**
   * Format angka berdasarkan locale saat ini
   */
  public formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormatOptions(this.currentLocale, options).format(number)
  }

  /**
   * Membersihkan resources saat service dihentikan
   */
  public dispose(): void {
    this.translations = {}
    this.initialized = false
  }
}

