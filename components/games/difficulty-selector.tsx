"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

type Difficulty = "easy" | "medium" | "hard" | "adaptive"

interface DifficultySelectorProps {
  difficulty: Difficulty
  onChange: (difficulty: Difficulty) => void
  disabled?: boolean
}

export function DifficultySelector({ difficulty, onChange, disabled = false }: DifficultySelectorProps) {
  const difficultyLabels: Record<Difficulty, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    adaptive: "Adaptive",
  }

  return (
    <div className="flex justify-end mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button variant="outline" className="w-40">
            <span className="mr-2">Difficulty:</span>
            <span className="font-medium">{difficultyLabels[difficulty]}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onChange("easy")}>Easy</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange("medium")}>Medium</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange("hard")}>Hard</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange("adaptive")}>Adaptive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

