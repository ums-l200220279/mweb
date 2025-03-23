import type React from "react"
import Navbar from "@/components/navbar" // ✅ Ensure this is correct
import Footer from "@/components/footer" // ✅ Ensure this is correct
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

