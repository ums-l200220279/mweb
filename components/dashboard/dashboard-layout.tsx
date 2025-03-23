/**
 * Dashboard Layout Component
 *
 * This component provides the layout structure for dashboard pages.
 * It includes the sidebar, header, and main content area.
 */

"use client"

import { type ReactNode, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  Brain,
  Menu,
  Users,
  BarChart,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  Activity,
  FileText,
  Bell,
  User,
} from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ErrorBoundary } from "@/lib/monitoring/error-boundary"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Patients",
      icon: Users,
      href: "/patients",
      active: pathname === "/patients" || pathname?.startsWith("/patient/"),
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/analytics",
      active: pathname === "/analytics",
    },
    {
      label: "Assessments",
      icon: FileText,
      href: "/assessments",
      active: pathname === "/assessments",
    },
    {
      label: "Appointments",
      icon: Calendar,
      href: "/appointments",
      active: pathname === "/appointments",
    },
    {
      label: "Monitoring",
      icon: Activity,
      href: "/monitoring",
      active: pathname === "/monitoring",
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/notifications",
      active: pathname === "/notifications",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
    {
      label: "Help",
      icon: HelpCircle,
      href: "/help",
      active: pathname === "/help",
    },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-[80]">
        <div className="flex flex-col h-full py-4 border-r bg-background">
          <div className="px-4 py-2 flex items-center gap-2 mb-6">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Memoright</span>
          </div>
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", route.active && "bg-secondary")}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="h-5 w-5 mr-3" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="mt-auto px-3 py-2">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/profile">
                  <User className="h-5 w-5 mr-3" />
                  Profile
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed left-4 top-3 z-40">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full py-4">
            <div className="px-4 py-2 flex items-center gap-2 mb-6">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Memoright</span>
            </div>
            <ScrollArea className="flex-1 px-3">
              <div className="space-y-1">
                {routes.map((route) => (
                  <Button
                    key={route.href}
                    variant={route.active ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", route.active && "bg-secondary")}
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link href={route.href}>
                      <route.icon className="h-5 w-5 mr-3" />
                      {route.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-auto px-3 py-2">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setOpen(false)}>
                  <Link href="/profile">
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => setOpen(false)}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className={cn("flex-1 overflow-auto", isDesktop ? "lg:pl-64" : "w-full")}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
    </div>
  )
}

