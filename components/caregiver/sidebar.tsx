"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Calendar,
  Settings,
  HelpCircle,
  MessageSquare,
  Home,
  Activity,
  BookOpen,
  AlertTriangle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function CaregiverSidebar({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  const items = [
    {
      href: "/caregiver",
      title: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      href: "/caregiver/patients",
      title: "My Patients",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      href: "/caregiver/appointments",
      title: "Appointments",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      href: "/caregiver/monitoring",
      title: "Patient Monitoring",
      icon: <Activity className="mr-2 h-4 w-4" />,
    },
    {
      href: "/caregiver/alerts",
      title: "Emergency Alerts",
      icon: <AlertTriangle className="mr-2 h-4 w-4" />,
    },
    {
      href: "/caregiver/community",
      title: "Community Support",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      href: "/caregiver/resources",
      title: "Resources",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
    },
    {
      href: "/caregiver/help",
      title: "Help Center",
      icon: <HelpCircle className="mr-2 h-4 w-4" />,
    },
    {
      href: "/caregiver/settings",
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className={cn("flex flex-col space-y-1 bg-slate-50 h-screen w-64 p-4 border-r", className)} {...props}>
      <div className="flex items-center mb-6 px-2">
        <Link href="/caregiver" className="flex items-center space-x-2">
          <span className="font-bold text-2xl text-turquoise-600">Memoright</span>
        </Link>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === item.href
                ? "bg-turquoise-100 text-turquoise-900 hover:bg-turquoise-200 hover:text-turquoise-900"
                : "hover:bg-slate-100",
            )}
            asChild
          >
            <Link href={item.href}>
              {item.icon}
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
      <div className="mt-auto pt-4 border-t">
        <div className="flex items-center px-2 py-2">
          <div className="w-10 h-10 rounded-full bg-turquoise-200 flex items-center justify-center text-turquoise-700 font-semibold">
            CG
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium">Sarah Johnson</p>
            <p className="text-xs text-slate-500">Caregiver</p>
          </div>
        </div>
      </div>
    </nav>
  )
}

