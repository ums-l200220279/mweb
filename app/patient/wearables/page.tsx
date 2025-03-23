import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db-client"
import WearableDashboard from "@/components/patient/wearable-dashboard"

export const metadata: Metadata = {
  title: "Wearable Health Monitoring | MemorRight",
  description: "Monitor your health metrics from connected wearable devices",
}

export default async function WearablesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/patient/wearables")
  }

  // Get patient ID for the current user
  const patient = await prisma.patient.findFirst({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  })

  if (!patient) {
    // Handle case where user is not a patient
    redirect("/dashboard")
  }

  return (
    <div className="container py-6">
      <WearableDashboard patientId={patient.id} />
    </div>
  )
}

