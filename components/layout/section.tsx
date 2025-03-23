import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function Section({ title, description, children, className, contentClassName }: SectionProps) {
  return (
    <section className={cn("py-6", className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  )
}

