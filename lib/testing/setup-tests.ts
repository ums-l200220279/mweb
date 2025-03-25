import "@testing-library/jest-dom"
import { server } from "./mocks/server"
import { prisma } from "@/lib/prisma"
import { seedTestDatabase } from "./seed-data"

// Setup mock server
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Setup database untuk pengujian
beforeAll(async () => {
  // Gunakan database test
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL

  // Reset database
  await prisma.$executeRaw`TRUNCATE TABLE "CognitiveAssessment" CASCADE`
  await prisma.$executeRaw`TRUNCATE TABLE "Patient" CASCADE`
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`
  await prisma.$executeRaw`TRUNCATE TABLE "PatientUserRelationship" CASCADE`

  // Seed data test
  await seedTestDatabase()
})

// Cleanup setelah semua test
afterAll(async () => {
  await prisma.$disconnect()
})

// Mock untuk next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "",
}))

// Mock untuk next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        role: "DOCTOR",
      },
    },
    status: "authenticated",
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

