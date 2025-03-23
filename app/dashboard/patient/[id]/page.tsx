import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getPatient } from "@/lib/data/patients"
import { PatientDashboard } from "@/components/patient-analytics/patient-dashboard"
import { PatientDashboardSkeleton } from "@/components/patient-analytics/patient-dashboard-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import { logger } from "@/lib/logger"

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  try {
    const patient = await getPatient(params.id)

    if (!patient) {
      return {
        title: "Patient Not Found",
      }
    }

    return {
      title: `${patient.firstName} ${patient.lastName} | Patient Dashboard`,
      description: `Cognitive health dashboard for patient ${patient.firstName} ${patient.lastName}`,
    }
  } catch (error) {
    logger.error(
      `Error generating metadata for patient page`,
      error instanceof Error ? error : new Error(String(error)),
    )

    return {
      title: "Patient Dashboard",
      description: "Cognitive health dashboard for patient",
    }
  }
}

export default async function PatientPage({
  params,
}: {
  params: { id: string }
}) {
  try {
    // Fetch patient data
    const patient = await getPatient(params.id)

    // If patient not found, show 404 page
    if (!patient) {
      notFound()
    }

    return (
      <ErrorBoundary>
        <Suspense fallback={<PatientDashboardSkeleton />}>
          <PatientDashboard patientId={params.id} />
        </Suspense>
      </ErrorBoundary>
    )
  } catch (error) {
    logger.error(
      `Error rendering patient page for ID ${params.id}`,
      error instanceof Error ? error : new Error(String(error)),
    )

    throw error // Let the error boundary handle it
  }
}

