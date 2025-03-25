import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AuthSocialButtons } from "@/components/auth/auth-social-buttons"
import { AuthVisual } from "@/components/auth/auth-visual"
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter"

export const metadata: Metadata = {
  title: "Register | MemoRight",
  description: "Create a MemoRight account to start your cognitive training journey.",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column - Visual */}
      <AuthVisual
        title="Start your cognitive training journey"
        description="Join thousands of users improving their mental performance with MemoRight."
        stats={[
          { label: "Training Sessions", value: "2M+" },
          { label: "Skill Categories", value: "5+" },
          { label: "User Satisfaction", value: "97%" },
        ]}
        variant="register"
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
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Start your cognitive training journey and track your progress over time.
            </p>
          </div>

          <div className="mt-8">
            <form action="#" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    First name
                  </label>
                  <Input id="firstName" placeholder="John" autoComplete="given-name" required className="h-11" />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Last name
                  </label>
                  <Input id="lastName" placeholder="Doe" autoComplete="family-name" required className="h-11" />
                </div>
              </div>

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
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  className="h-11"
                />
                <PasswordStrengthMeter />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters with a number and a special character.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox id="terms" className="mt-1" />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <Button type="submit" className="w-full h-11 text-base">
                Create account
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
            By creating an account, you agree to receive updates and marketing communications from MemoRight.
          </div>
        </div>
      </div>
    </div>
  )
}

