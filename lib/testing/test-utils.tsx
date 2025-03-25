import type React from "react"
import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "next-auth/react"

// Wrapper provider untuk testing
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider
      session={{
        user: {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
          role: "DOCTOR",
        },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}

// Custom render dengan providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllProviders, ...options })

// Re-export semua dari testing-library
export * from "@testing-library/react"
export { customRender as render }

// Helper untuk membuat test user
export function createTestUser(overrides = {}) {
  return {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    role: "DOCTOR",
    ...overrides,
  }
}

// Helper untuk membuat test patient
export function createTestPatient(overrides = {}) {
  return {
    id: "test-patient-id",
    firstName: "Test",
    lastName: "Patient",
    dateOfBirth: "1970-01-01",
    gender: "MALE",
    ...overrides,
  }
}

// Helper untuk membuat test assessment
export function createTestAssessment(overrides = {}) {
  return {
    id: "test-assessment-id",
    patientId: "test-patient-id",
    type: "MMSE",
    responses: [],
    score: {
      totalScore: 28,
      categoryScores: {
        orientation: 10,
        registration: 3,
        attentionCalculation: 5,
        recall: 3,
        language: 6,
        visuospatial: 1,
      },
      interpretation: "Normal cognitive function",
    },
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

