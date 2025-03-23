import type React from "react"
interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <main className="container grid flex-1 gap-12 pb-8 pt-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        {children}
      </main>
    </div>
  )
}

