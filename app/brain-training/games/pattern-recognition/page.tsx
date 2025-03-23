import type { Metadata } from "next"
import PatternRecognitionClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Pattern Recognition | Brain Training | Memoright",
  description: "Enhance your visual memory by recognizing and repeating patterns in this brain training game",
}

export default function PatternRecognitionPage() {
  return <PatternRecognitionClientPage />
}

