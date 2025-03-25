import Image from "next/image"
import { Check } from "lucide-react"

interface Stat {
  label: string
  value: string
}

interface AuthVisualProps {
  title: string
  description: string
  stats: Stat[]
  variant?: "login" | "register"
}

export function AuthVisual({ title, description, stats, variant = "login" }: AuthVisualProps) {
  const bgColor = variant === "login" ? "bg-primary" : "bg-gradient-to-br from-primary to-purple-600"

  return (
    <div
      className={`relative hidden md:flex md:w-1/2 lg:flex flex-col items-center justify-center ${bgColor} text-white p-8`}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="relative z-10 max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-white/10 p-2 backdrop-blur-sm">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="MemoRight Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="mt-3 text-lg text-white/80">{description}</p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-4 text-left">
          <div className="flex items-start">
            <div className="mr-3 rounded-full bg-white/10 p-1">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Personalized Training</h3>
              <p className="text-sm text-white/70">Adaptive exercises tailored to your cognitive profile</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-3 rounded-full bg-white/10 p-1">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Progress Tracking</h3>
              <p className="text-sm text-white/70">Detailed analytics to monitor your improvement</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-3 rounded-full bg-white/10 p-1">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Scientific Approach</h3>
              <p className="text-sm text-white/70">Research-backed methods for cognitive enhancement</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-white/60">
        © {new Date().getFullYear()} MemoRight. All rights reserved.
      </div>
    </div>
  )
}

