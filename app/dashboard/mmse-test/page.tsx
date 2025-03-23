import type { Metadata } from "next"
import MMSETestClientPage from "./client-page"

export const metadata: Metadata = {
  title: "MMSE Test | Memoright",
  description: "Mini-Mental State Examination (MMSE) for cognitive assessment",
}

export default function MMSETestPage() {
  return <MMSETestClientPage />
}

