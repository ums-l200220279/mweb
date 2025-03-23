/**
 * Test Setup Configuration
 *
 * This file configures the testing environment for the Memoright application.
 * It sets up Jest, React Testing Library, and Mock Service Worker for API mocking.
 */

import "@testing-library/jest-dom"
import { server } from "./mocks/server"

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())

// Mock IntersectionObserver
class MockIntersectionObserver {
  readonly root: Element | null
  readonly rootMargin: string
  readonly thresholds: ReadonlyArray<number>

  constructor() {
    this.root = null
    this.rootMargin = ""
    this.thresholds = []
  }

  disconnect() {
    return null
  }

  observe() {
    return null
  }

  takeRecords() {
    return []
  }

  unobserve() {
    return null
  }
}

global.IntersectionObserver = MockIntersectionObserver

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock scrollTo
window.scrollTo = jest.fn()

// Suppress console errors during tests
const originalConsoleError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Warning: ReactDOM.render") ||
      args[0].includes("Warning: React.createElement") ||
      args[0].includes("Warning: Each child in a list"))
  ) {
    return
  }
  originalConsoleError(...args)
}

