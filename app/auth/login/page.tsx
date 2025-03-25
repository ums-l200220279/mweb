import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons"
import { AuthVisual } from "@/components/auth/auth-visual"

export const metadata: Metadata = {
  title: "Login | MemoRight",
  description: "Login to your MemoRight account to track your cognitive training progress.",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column - Visual */}
      <AuthVisual
        title="Welcome back to MemoRight"
        description="Continue your cognitive training journey and track your progress."
        stats={[
          { label: "Active Users", value: "10K+" },
          { label: "Cognitive Games", value: "12+" },
          { label: "Avg. Improvement", value: "32%" },
        ]}
      />

      {/* Right Column - Form */}
      <div className="flex w-full flex-col justify-center px-4 md:w-1/2 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to home
            </Link>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/register" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-3xl font-bold tracking-tight">Sign in to your account</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access your dashboard and training sessions.
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </label>
              </div>

              <Button type="submit" className="w-full h-11 text-base">
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <AuthSocialButtons />
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  )
}

