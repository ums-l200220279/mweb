import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db-client"
import WearableDashboard from "@/components/patient/wearable-dashboard"

export const metadata: Metadata = {
  title: "Patient Wearable Data | MemorRight",
  description: "Monitor patient health metrics from connected wearable devices",
}

export default async function DoctorPatientWearablesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/doctor/patients")
  }

  // Check if user is a doctor
  const doctor = await prisma.doctor.findFirst({
    where: {
      userId: session.user.id,
    },
  })

  if (!doctor) {
    // Handle case where user is not a doctor
    redirect("/dashboard")
  }

  // Check if patient belongs to this doctor
  const patient = await prisma.patient.findFirst({
    where: {
      id: params.id,
      doctorId: doctor.id,
    },
    select: {
      id: true,
      name: true,
    },
  })

  if (!patient) {
    // Handle case where patient doesn't exist or doesn't belong to this doctor
    redirect("/doctor/patients")
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Wearable Data for {patient.name}</h1>
      <WearableDashboard patientId={patient.id} />
    </div>
  )
}

