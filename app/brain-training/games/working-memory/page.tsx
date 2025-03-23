import type { Metadata } from "next"
import WorkingMemoryClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Working Memory | Brain Training | Memoright",
  description: "Test and improve your working memory with the N-Back task",
}

export default function WorkingMemoryPage() {
  return <WorkingMemoryClientPage />
}

