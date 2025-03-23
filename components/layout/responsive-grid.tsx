import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: string
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = "gap-4",
}: ResponsiveGridProps) {
  const { default: defaultCols, sm, md, lg, xl } = cols

  const gridCols = cn(
    `grid-cols-${defaultCols}`,
    sm && `sm:grid-cols-${sm}`,
    md && `md:grid-cols-${md}`,
    lg && `lg:grid-cols-${lg}`,
    xl && `xl:grid-cols-${xl}`,
  )

  return <div className={cn("grid", gridCols, gap, className)}>{children}</div>
}

