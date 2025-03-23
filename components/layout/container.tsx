import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function Container({ children, className, size = "lg" }: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    full: "max-w-full",
  }

  return <div className={cn("mx-auto px-4 w-full", sizeClasses[size], className)}>{children}</div>
}

