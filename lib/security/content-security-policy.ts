/**
 * Content Security Policy (CSP) configuration
 * This helps prevent XSS attacks by controlling which resources can be loaded
 */
export function getContentSecurityPolicy(): string {
  const policy = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://vercel.live"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://*.vercel.app"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", "https://*.vercel.app", "https://vercel.live", process.env.NEXT_PUBLIC_API_URL || ""],
    "media-src": ["'self'"],
    "frame-src": ["'self'"],
    "frame-ancestors": ["'self'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],
    "upgrade-insecure-requests": [],
  }

  // Convert policy object to string
  return Object.entries(policy)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key
      }
      return `${key} ${values.join(" ")}`
    })
    .join("; ")
}

/**
 * Apply security headers to a response
 * @param headers The headers object to modify
 */
export function applySecurityHeaders(headers: Headers): void {
  // Content Security Policy
  headers.set("Content-Security-Policy", getContentSecurityPolicy())

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff")

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY")

  // Enable XSS protection in browsers
  headers.set("X-XSS-Protection", "1; mode=block")

  // Strict Transport Security (HSTS)
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

  // Referrer Policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Permissions Policy
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()")
}

