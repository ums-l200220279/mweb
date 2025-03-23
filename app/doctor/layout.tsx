import type React from "react"
import DoctorNavbar from "@/components/doctor/navbar"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DoctorNavbar />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  )
}

