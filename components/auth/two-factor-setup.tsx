"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CsrfForm } from "@/components/auth/csrf-form"
import { QrCode } from "lucide-react"
import Image from "next/image"

export function TwoFactorSetup() {
  const [step, setStep] = useState<"initial" | "qrcode" | "verify" | "success">("initial")
  const [secret, setSecret] = useState("")
  const [otpauth, setOtpauth] = useState("")
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSetup = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/two-factor/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csrfToken: document.querySelector<HTMLInputElement>('input[name="csrfToken"]')?.value,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to set up two-factor authentication")
      }

      const data = await response.json()
      setSecret(data.secret)
      setOtpauth(data.otpauth)
      setStep("qrcode")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/two-factor/verify", {
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
        throw new Error(data.error || "Failed to verify code")
      }

      setStep("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Enhance your account security with two-factor authentication</CardDescription>
      </CardHeader>
      <CardContent>
        <CsrfForm action="/api/auth/two-factor/setup" className="space-y-4">
          {step === "initial" && (
            <div className="space-y-4">
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertTitle>Enhanced Security</AlertTitle>
                <AlertDescription>
                  Two-factor authentication adds an extra layer of security to your account by requiring a verification
                  code in addition to your password.
                </AlertDescription>
              </Alert>
              <Button type="button" onClick={handleSetup} disabled={loading} className="w-full">
                {loading ? "Setting up..." : "Set up two-factor authentication"}
              </Button>
            </div>
          )}

          {step === "qrcode" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-white p-4 inline-block rounded-lg mb-4">
                  <Image
                    src={`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(otpauth)}`}
                    alt="QR Code for two-factor authentication"
                    width={200}
                    height={200}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Scan this QR code with your authenticator app</p>
                <p className="text-xs text-muted-foreground break-all px-6">
                  Or manually enter this secret: <span className="font-mono">{secret}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  placeholder="Enter the 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>

              <Button type="button" onClick={handleVerify} disabled={loading || token.length !== 6} className="w-full">
                {loading ? "Verifying..." : "Verify and activate"}
              </Button>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Two-factor authentication has been successfully enabled for your account.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                From now on, you'll need to enter a verification code from your authenticator app when signing in.
              </p>
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

