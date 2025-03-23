import { cookies } from "next/headers"
import { UserRole } from "@/types"

// Mock user data - in a real app, this would come from a database
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "patient@example.com",
    role: UserRole.PATIENT,
    image: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "caregiver@example.com",
    role: UserRole.CAREGIVER,
    image: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "3",
    name: "Dr. Smith",
    email: "doctor@example.com",
    role: UserRole.DOCTOR,
    image: "/placeholder.svg?height=32&width=32",
  },
  {
    id: "4",
    name: "Admin User",
    email: "admin@example.com",
    role: UserRole.ADMIN,
    image: "/placeholder.svg?height=32&width=32",
  },
]

export async function getCurrentUser() {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("user")

  // For demo purposes, we'll return a mock user based on a cookie
  // In a real app, you would verify a session token and fetch the user from a database
  if (userCookie) {
    try {
      const userEmail = userCookie.value
      return mockUsers.find((user) => user.email === userEmail) || mockUsers[0]
    } catch (error) {
      return null
    }
  }

  // Default to patient for demo
  return mockUsers[0]
}

