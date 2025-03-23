import type React from "react"
import PatientSidebar from "@/components/patient/sidebar"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <PatientSidebar />
      <main className="flex-1 p-8 bg-background">{children}</main>
    </div>
  )
}

