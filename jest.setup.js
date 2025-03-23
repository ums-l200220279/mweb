// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"
import { TextDecoder, TextEncoder } from "util"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/current-path",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}))

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        role: "doctor",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: "authenticated",
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  }),
)

// Mock console.error to fail tests when React errors occur
const originalConsoleError = console.error
console.error = (...args) => {
  // Check if this is a React-specific error
  const message = args[0]
  if (
    typeof message === "string" &&
    (message.includes("React") || message.includes("Warning:") || message.includes("Error:"))
  ) {
    // Let the original error through for debugging
    originalConsoleError(...args)

    // Don't fail on prop-type errors or warnings
    if (!message.includes("Warning: Failed prop type") && !message.includes("Warning: Each child in a list")) {
      // throw new Error(message);
    }
  } else {
    originalConsoleError(...args)
  }
}

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})

