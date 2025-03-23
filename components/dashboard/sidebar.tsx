"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  Brain,
  Calendar,
  FileText,
  Users,
  Settings,
  HelpCircle,
  BarChart,
  Stethoscope,
  UserPlus,
  Server,
  Shield,
  Menu,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const menuItems = {
  patient: [
    { name: "Home", icon: Home, href: "/dashboard" },
    { name: "Cognitive Tests", icon: Brain, href: "/dashboard/tests" },
    { name: "Activities", icon: Calendar, href: "/dashboard/activities" },
    { name: "Reports", icon: FileText, href: "/dashboard/reports" },
    { name: "Caregivers", icon: Users, href: "/dashboard/caregivers" },
  ],
  caregiver: [
    { name: "Home", icon: Home, href: "/dashboard" },
    { name: "Patients", icon: Users, href: "/dashboard/patients" },
    { name: "Activities", icon: Calendar, href: "/dashboard/activities" },
    { name: "Reports", icon: FileText, href: "/dashboard/reports" },
  ],
  doctor: [
    { name: "Home", icon: Home, href: "/dashboard" },
    { name: "Patients", icon: Users, href: "/dashboard/patients" },
    { name: "Assessments", icon: Stethoscope, href: "/dashboard/assessments" },
    { name: "Analytics", icon: BarChart, href: "/dashboard/analytics" },
    { name: "Appointments", icon: Calendar, href: "/dashboard/appointments" },
  ],
  admin: [
    { name: "Home", icon: Home, href: "/dashboard" },
    { name: "User Management", icon: UserPlus, href: "/dashboard/users" },
    { name: "System Health", icon: Server, href: "/dashboard/system" },
    { name: "Security", icon: Shield, href: "/dashboard/security" },
    { name: "Logs", icon: FileText, href: "/dashboard/logs" },
  ],
}

const navItems = [
  { name: "Dashboard", href: "/patient", icon: Home },
  { name: "Brain Training", href: "/patient/brain-training", icon: Brain },
  { name: "Activity Calendar", href: "/patient/activity-calendar", icon: Calendar },
  { name: "Health History", href: "/patient/health-history", icon: FileText },
  { name: "Settings", href: "/patient/settings", icon: Settings },
  { name: "Help", href: "/patient/help", icon: HelpCircle },
]

export default function DashboardSidebar({ userRole }: { userRole: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  const items = menuItems[userRole as keyof typeof menuItems] || []

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent pathname={pathname} items={items} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        </SheetContent>
      </Sheet>
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <SidebarContent pathname={pathname} items={items} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </aside>
    </>
  )
}

function SidebarContent({
  pathname,
  items,
  isCollapsed,
  toggleSidebar,
}: { pathname: string; items: any[]; isCollapsed: boolean; toggleSidebar: () => void }) {
  return (
    <ScrollArea className="flex-1">
      <motion.aside
        initial={{ width: 250 }}
        animate={{ width: isCollapsed ? 80 : 250 }}
        className="bg-white border-r border-gray-200 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4">
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            className="text-xl font-semibold text-turquoise-700"
          >
            Memoright
          </motion.span>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {isCollapsed ? "→" : "←"}
          </Button>
        </div>
        <nav className="mt-5 px-2">
          {items.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start mb-2 ${
                  pathname === item.href ? "bg-turquoise-100 text-turquoise-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5 mr-2" />
                <motion.span initial={{ opacity: 1 }} animate={{ opacity: isCollapsed ? 0 : 1 }}>
                  {item.name}
                </motion.span>
              </Button>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="h-5 w-5 mr-2" />
              <motion.span initial={{ opacity: 1 }} animate={{ opacity: isCollapsed ? 0 : 1 }}>
                Settings
              </motion.span>
            </Button>
          </Link>
          <Link href="/dashboard/help">
            <Button variant="ghost" className="w-full justify-start mt-2">
              <HelpCircle className="h-5 w-5 mr-2" />
              <motion.span initial={{ opacity: 1 }} animate={{ opacity: isCollapsed ? 0 : 1 }}>
                Help
              </motion.span>
            </Button>
          </Link>
        </div>
      </motion.aside>
    </ScrollArea>
  )
}

