"use client"

import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ErrorMessageProps {
  title?: string
  message: string
  className?: string
  variant?: "default" | "destructive"
  onRetry?: () => void
}

export function ErrorMessage({
  title = "Error",
  message,
  className,
  variant = "destructive",
  onRetry,
}: ErrorMessageProps) {
  return (
    <Alert variant={variant} className={cn(className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <span>{message}</span>
        {onRetry && (
          <button onClick={onRetry} className="text-sm underline underline-offset-4 hover:text-primary">
            Try again
          </button>
        )}
      </AlertDescription>
    </Alert>
  )
}

