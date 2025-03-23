import type { ReactNode } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface GameHeaderProps {
  title: string
  description: string
  icon: ReactNode
}

export function GameHeader({ title, description, icon }: GameHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" asChild className="w-fit">
        <Link href="/brain-training">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Brain Training
        </Link>
      </Button>

      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">{icon}</div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">{description}</p>
        </div>
      </div>
    </div>
  )
}

