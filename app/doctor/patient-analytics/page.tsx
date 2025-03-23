import type { Metadata } from "next"
import PatientAnalyticsClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Patient Analytics | Memoright",
  description: "Detailed cognitive analytics for patient monitoring and assessment",
}

export default function PatientAnalyticsPage() {
  return <PatientAnalyticsClientPage />
}

