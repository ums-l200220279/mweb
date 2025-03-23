/**
 * Error Boundary Component
 *
 * This file provides an error boundary component to catch and handle
 * JavaScript errors in the component tree.
 */

"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { logger } from "./logger"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    logger.error("Error caught by ErrorBoundary", {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Render default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            An unexpected error occurred. Our team has been notified.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh page
            </Button>
            <Button onClick={this.resetErrorBoundary}>Try again</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

