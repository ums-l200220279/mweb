import type { Metadata } from "next"
import MemoryMatchClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Memory Match | Brain Training | Memoright",
  description: "Improve your memory by matching pairs of cards in this brain training game",
}

export default function MemoryMatchPage() {
  return <MemoryMatchClientPage />
}

