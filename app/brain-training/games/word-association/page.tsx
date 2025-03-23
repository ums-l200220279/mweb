import type { Metadata } from "next"
import WordAssociationClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Word Association | Brain Training | Memoright",
  description: "Test your semantic processing and language skills by identifying related word pairs",
}

export default function WordAssociationPage() {
  return <WordAssociationClientPage />
}

