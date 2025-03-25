import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthVisual } from "@/components/auth/auth-visual"

export const metadata: Metadata = {
  title: "Forgot Password | MemoRight",
  description: "Reset your MemoRight account password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column - Visual */}
      <AuthVisual
        title="Reset your password"
        description="We'll send you a link to reset your password and get back to training."
        stats={[
          { label: "Password Reset", value: "<2min" },
          { label: "Account Security", value: "100%" },
          { label: "Support Response", value: "<24h" },
        ]}
      />

      {/* Right Column - Form */}
      <div className="flex w-full flex-col justify-center px-4 md:w-1/2 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between">
            <Link
              href="/auth/login"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>

          <div className="mt-8">
            <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="mt-8">
            <form action="#" className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base">
                Send reset link
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-sm font-medium">Need help?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Contact our support team at{" "}
              <a href="mailto:support@memoright.com" className="font-medium text-primary hover:underline">
                support@memoright.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

