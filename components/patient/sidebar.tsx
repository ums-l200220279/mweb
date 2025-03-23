"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Calendar, FileText, HelpCircle, Home, Menu, Settings, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { name: "Dashboard", href: "/patient", icon: Home },
  { name: "Brain Training", href: "/patient/brain-training", icon: Brain },
  { name: "Activity Calendar", href: "/patient/activity-calendar", icon: Calendar },
  { name: "Health History", href: "/patient/health-history", icon: FileText },
  { name: "Settings", href: "/patient/settings", icon: Settings },
  { name: "Help", href: "/patient/help", icon: HelpCircle },
]

export default function PatientSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

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
          <SidebarContent pathname={pathname} />
        </SheetContent>
      </Sheet>
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <SidebarContent pathname={pathname} />
      </aside>
    </>
  )
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Memoright</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.name}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href="/logout">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </Button>
      </div>
    </ScrollArea>
  )
}

