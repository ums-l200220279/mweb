import type React from "react"
import type { Metadata } from "next"
import { CaregiverSidebar } from "@/components/caregiver/sidebar"

export const metadata: Metadata = {
  title: "Caregiver Dashboard | Memoright",
  description: "Manage and monitor your patients with dementia and Alzheimer's",
}

interface CaregiverLayoutProps {
  children: React.ReactNode
}

export default function CaregiverLayout({ children }: CaregiverLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <CaregiverSidebar />
      <div className="flex-1 p-6 md:p-8 pt-6 overflow-auto">{children}</div>
    </div>
  )
}

