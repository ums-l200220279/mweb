"use client"

import { useState } from "react"

export function PasswordStrengthMeter() {
  const [strength, setStrength] = useState(0)

  // This would normally be connected to the actual password input
  // For demo purposes, we're just showing a static meter

  return (
    <div className="mt-1 space-y-2">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`transition-all duration-300 ${getStrengthColor(strength)}`}
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span>Weak</span>
        <span>Medium</span>
        <span>Strong</span>
      </div>
    </div>
  )
}

function getStrengthColor(strength: number): string {
  if (strength < 33) return "bg-red-500"
  if (strength < 66) return "bg-yellow-500"
  return "bg-green-500"
}

