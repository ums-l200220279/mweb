import type { Metadata } from "next"
import CognitiveTrendsClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Cognitive Trends | Memoright",
  description: "View and analyze your cognitive health trends over time",
}

export default function CognitiveTrendsPage() {
  return <CognitiveTrendsClientPage />
}

