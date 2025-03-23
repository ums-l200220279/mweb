"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: string
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("grid items-start gap-2", className)} {...props}>
      {items.map((item) => {
        const Icon = Icons[item.icon as keyof typeof Icons]
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent" : "transparent",
                "cursor-pointer",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

