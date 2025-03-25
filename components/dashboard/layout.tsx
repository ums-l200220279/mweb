"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import DashboardSidebar from "@/components/dashboard/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Bell, Settings, User, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { motion } from "framer-motion"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: string
}

export default function DashboardLayout({ children, userRole = "patient" }: DashboardLayoutProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href: string }[]>([])
  const pathname = usePathname()

  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbItems = pathSegments.map((segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join("/")}`
      return {
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        href,
      }
    })

    // Add home as first item
    breadcrumbItems.unshift({ label: "Home", href: "/dashboard" })

    setBreadcrumbs(breadcrumbItems)
  }, [pathname])

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <DashboardSidebar userRole={userRole} />

      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Breadcrumbs */}
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <BreadcrumbItem key={index}>
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">3</Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[
                    {
                      title: "New cognitive test available",
                      description: "Try our new memory assessment test",
                      time: "5 minutes ago",
                    },
                    {
                      title: "Reminder: Daily exercise",
                      description: "Don't forget your daily brain training",
                      time: "1 hour ago",
                    },
                    {
                      title: "Progress report ready",
                      description: "Your weekly cognitive progress report is ready",
                      time: "Yesterday",
                    },
                  ].map((notification, index) => (
                    <DropdownMenuItem key={index} className="flex flex-col items-start p-3 cursor-pointer">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center font-medium">View all notifications</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help */}
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="font-medium hidden sm:inline-block">John Doe</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

