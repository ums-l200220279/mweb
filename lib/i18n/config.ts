export const locales = ["en", "id", "es", "fr", "de", "ja", "zh"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export type Messages = {
  [key: string]: string | Messages
}

export type IntlMessages = {
  [locale in Locale]?: Messages
}

export const getLocaleFromPathname = (pathname: string): Locale => {
  const segments = pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale
  }

  return defaultLocale
}

