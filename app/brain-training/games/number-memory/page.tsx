import type { Metadata } from "next"
import NumberMemoryClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Number Memory | Brain Training | Memoright",
  description: "Test and improve your short-term memory by remembering increasingly longer sequences of numbers",
}

export default function NumberMemoryPage() {
  return <NumberMemoryClientPage />
}

