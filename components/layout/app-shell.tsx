import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AppShellProps {
  header?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function AppShell({ header, sidebar, footer, children, className }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {header && <header className="sticky top-0 z-40 w-full">{header}</header>}
      <div className="flex flex-1">
        {sidebar && <aside className="hidden md:block w-64 shrink-0 border-r">{sidebar}</aside>}
        <main className={cn("flex-1", className)}>{children}</main>
      </div>
      {footer && <footer className="border-t">{footer}</footer>}
    </div>
  )
}

