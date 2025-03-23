/**
 * Test Utilities
 *
 * This file provides utility functions and components for testing.
 */

import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/lib/design-system/theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { jest } from "@jest/globals"

// Create a custom render function that includes providers
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">{children}</ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options })

// Re-export everything from testing-library
export * from "@testing-library/react"

// Override render method
export { customRender as render }

// Mock next/navigation
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
}

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ""} />
  },
}))

