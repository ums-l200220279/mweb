"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Menu, LogOut, Settings, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export default function DoctorNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { name: "Dashboard", href: "/doctor" },
    { name: "Patients", href: "/doctor/patients" },
    { name: "Assessments", href: "/doctor/assessments" },
    { name: "Reports", href: "/doctor/reports" },
    { name: "Settings", href: "/doctor/settings" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/doctor" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Memoright</span>
            <span className="hidden text-sm text-muted-foreground md:inline-block">Doctor</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                <NotificationItem
                  title="New MMSE Test Result"
                  description="Patient John Doe completed MMSE test with score 24/30"
                  time="5 minutes ago"
                  isUrgent={true}
                />
                <NotificationItem
                  title="Appointment Reminder"
                  description="Video consultation with Sarah Smith at 2:00 PM today"
                  time="30 minutes ago"
                  isUrgent={false}
                />
                <NotificationItem
                  title="Cognitive Decline Alert"
                  description="Patient Robert Johnson shows significant decline in memory function"
                  time="2 hours ago"
                  isUrgent={true}
                />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-center">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Doctor Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Dr. Jane Smith" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Dr. Jane Smith</p>
                  <p className="text-xs leading-none text-muted-foreground">jane.smith@memoright.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 py-4">
                <Link href="/doctor" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                  <span className="text-xl font-bold text-primary">Memoright</span>
                  <span className="text-sm text-muted-foreground">Doctor</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function NotificationItem({
  title,
  description,
  time,
  isUrgent,
}: {
  title: string
  description: string
  time: string
  isUrgent: boolean
}) {
  return (
    <div className={`flex items-start gap-2 p-3 ${isUrgent ? "bg-red-50" : ""}`}>
      <div className={`mt-1 h-2 w-2 rounded-full ${isUrgent ? "bg-red-500" : "bg-blue-500"}`} />
      <div className="flex-1">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="mt-1 text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}

