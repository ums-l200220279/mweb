"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Brain, Menu } from "lucide-react"

const routes = [
  {
    title: "Brain Gym",
    href: "/brain-gym",
    description: "Interactive cognitive exercises to strengthen your brain",
  },
  {
    title: "Cognitive Tests",
    href: "/cognitive-test",
    description: "Standardized assessments to monitor your cognitive health",
  },
  {
    title: "Progress",
    href: "/progress",
    description: "Track your cognitive improvements over time",
  },
  {
    title: "Resources",
    href: "/resources/brain-health",
    description: "Educational content about brain health and cognitive wellness",
  },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">MemoRight</span>
          </Link>
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {routes.map((route) => (
                  <NavigationMenuItem key={route.href}>
                    <Link href={route.href} legacyBehavior passHref>
                      <NavigationMenuLink className={navigationMenuTriggerStyle()} active={pathname === route.href}>
                        {route.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex md:items-center md:gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-6 py-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Brain className="h-6 w-6 text-primary" />
                  <span className="font-bold">MemoRight</span>
                </Link>
                <div className="grid gap-3">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "flex items-center gap-2 text-lg font-medium",
                        pathname === route.href ? "text-primary" : "text-muted-foreground",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {route.title}
                    </Link>
                  ))}
                </div>
                <div className="grid gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

