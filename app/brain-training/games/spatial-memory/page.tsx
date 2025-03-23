import type { Metadata } from "next"
import SpatialMemoryClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Spatial Memory | Brain Training | Memoright",
  description: "Test and improve your spatial memory by remembering patterns in a grid",
}

export default function SpatialMemoryPage() {
  return <SpatialMemoryClientPage />
}

