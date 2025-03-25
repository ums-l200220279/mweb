"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CsrfForm } from "@/components/auth/csrf-form"
import { AlertCircle } from "lucide-react"

export function TwoFactorDisable() {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/two-factor/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          csrfToken: document.querySelector<HTMLInputElement>('input[name="csrfToken"]')?.value,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to disable two-factor authentication")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Disable Two-Factor Authentication</CardTitle>
        <CardDescription>Remove the two-factor authentication requirement from your account</CardDescription>
      </CardHeader>
      <CardContent>
        <CsrfForm action="/api/auth/two-factor/disable" className="space-y-4">
          {!success ? (
            <>
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Security Warning</AlertTitle>
                <AlertDescription>
                  Disabling two-factor authentication will make your account less secure. We recommend keeping it
                  enabled.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  placeholder="Enter the 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a verification code from your authenticator app to confirm
                </p>
              </div>

              <Button
                type="button"
                onClick={handleDisable}
                disabled={loading || token.length !== 6}
                variant="destructive"
                className="w-full"
              >
                {loading ? "Disabling..." : "Disable two-factor authentication"}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Two-factor authentication disabled</AlertTitle>
                <AlertDescription>
                  Two-factor authentication has been successfully disabled for your account.
                </AlertDescription>
              </Alert>
              <Button type="button" onClick={() => (window.location.href = "/settings/security")} className="w-full">
                Return to security settings
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CsrfForm>
      </CardContent>
    </Card>
  )
}

