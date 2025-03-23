import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Redirect based on user role
  switch (session.user.role) {
    case "PATIENT":
      redirect("/dashboard/patient")
    case "DOCTOR":
      redirect("/dashboard/doctor")
    case "CAREGIVER":
      redirect("/dashboard/caregiver")
    case "ADMIN":
      redirect("/dashboard/admin")
    default:
      redirect("/")
  }
}

