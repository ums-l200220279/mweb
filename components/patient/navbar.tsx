"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Brain, Calendar, FileText, HelpCircle, Home, Menu, PhoneCall } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { name: "Home", href: "/patient", icon: Home },
  { name: "Brain Training", href: "/patient/brain-training", icon: Brain },
  { name: "Activity Calendar", href: "/patient/activity-calendar", icon: Calendar },
  { name: "Health History", href: "/patient/health-history", icon: FileText },
  { name: "Help", href: "/patient/help", icon: HelpCircle },
]

export default function PatientNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/patient" className="flex items-center space-x-2">
          <Brain className="h-6 w-6" />
          <span className="text-xl font-bold">Memoright</span>
        </Link>

        <nav className="hidden md:flex ml-6 space-x-4 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="destructive" size="sm" className="hidden md:flex">
            <PhoneCall className="mr-2 h-4 w-4" />
            Emergency
          </Button>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <Button variant="destructive" size="sm" className="mt-4">
                  <PhoneCall className="mr-2 h-4 w-4" />
                  Emergency
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

