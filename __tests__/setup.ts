import type React from "react"
// Jest setup file
import "@testing-library/jest-dom"
import { TextEncoder, TextDecoder } from "util"
import { server } from "./mocks/server"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />
  },
}))

// Mock Redis cache
jest.mock("@/lib/cache/redis", () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}))

// Mock Supabase
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: null })),
          limit: jest.fn(() => ({ data: [], error: null })),
          order: jest.fn(() => ({ data: [], error: null })),
          range: jest.fn(() => ({ data: [], error: null })),
          data: [],
          error: null,
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => ({ data: [], error: null })),
          data: [],
          error: null,
        })),
        limit: jest.fn(() => ({ data: [], error: null })),
        data: [],
        error: null,
      })),
      insert: jest.fn(() => ({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ data: null, error: null })),
        match: jest.fn(() => ({ data: null, error: null })),
        data: null,
        error: null,
      })),
      upsert: jest.fn(() => ({ data: null, error: null })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ data: null, error: null })),
        match: jest.fn(() => ({ data: null, error: null })),
        data: null,
        error: null,
      })),
    })),
    auth: {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: null, unsubscribe: jest.fn() })),
      getSession: jest.fn(() => ({ data: { session: null }, error: null })),
      getUser: jest.fn(() => ({ data: { user: null }, error: null })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: "" } })),
      })),
    },
  })),
}))

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: require("react").forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    path: require("react").forwardRef((props, ref) => <path ref={ref} {...props} />),
    svg: require("react").forwardRef(({ children, ...props }, ref) => (
      <svg ref={ref} {...props}>
        {children}
      </svg>
    )),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
  useInView: () => true,
}))

// Mock Stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    invoices: {
      retrieve: jest.fn(),
      list: jest.fn(),
    },
    paymentMethods: {
      list: jest.fn(),
      detach: jest.fn(),
    },
  }))
})

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
  STRIPE_SECRET_KEY: "sk_test_example",
  STRIPE_WEBHOOK_SECRET: "whsec_example",
}

// Polyfill TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})

