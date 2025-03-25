"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CsrfForm } from "@/components/auth/csrf-form"
import { AlertCircle } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [require2FA, setRequire2FA] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        totpCode: require2FA ? totpCode : undefined,
        callbackUrl,
      })

      if (!result?.ok) {
        if (result?.error === "2FA_REQUIRED") {
          setRequire2FA(true)
          setLoading(false)
          return
        }

        throw new Error(
          result?.error === "INVALID_2FA_CODE"
            ? "Invalid verification code. Please try again."
            : "Invalid email or password",
        )
      }

      // Redirect to callback URL or dashboard
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <CsrfForm action="/api/auth/callback/credentials" className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || require2FA}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || require2FA}
          required
        />
      </div>

      {require2FA && (
        <div className="space-y-2">
          <Label htmlFor="totpCode">Verification Code</Label>
          <Input
            id="totpCode"
            type="text"
            placeholder="Enter 6-digit code"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            disabled={loading}
            required
            autoFocus
            maxLength={6}
            pattern="[0-9]{6}"
          />
          <p className="text-xs text-muted-foreground">Enter the verification code from your authenticator app</p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          disabled={loading}
        />
        <Label
          htmlFor="remember"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Remember me
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : require2FA ? "Verify" : "Sign in"}
      </Button>
    </CsrfForm>
  )
}

