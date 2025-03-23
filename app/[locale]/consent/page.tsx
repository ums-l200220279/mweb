"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConsentPage() {
  const { formatMessage } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get("returnUrl") || "/"

  const [consents, setConsents] = useState({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false,
  })

  const [expanded, setExpanded] = useState<string | null>(null)

  const handleToggleConsent = (type: keyof typeof consents) => {
    if (type === "necessary") return // Cannot toggle necessary cookies

    setConsents((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  const handleAcceptAll = () => {
    setConsents({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
  }

  const handleAcceptSelected = () => {
    saveConsent(consents)
  }

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    }

    setConsents(minimalConsent)
    saveConsent(minimalConsent)
  }

  const saveConsent = async (consentData: typeof consents) => {
    try {
      // Save consent to backend
      const response = await fetch("/api/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consent: consentData,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save consent")
      }

      // Set consent cookie
      document.cookie = `cookie_consent=${JSON.stringify(consentData)}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`

      // Redirect back to the original URL
      router.push(returnUrl)
    } catch (error) {
      console.error("Error saving consent:", error)
      // Show error message to user
      alert(formatMessage("errors.consentSave"))
    }
  }

  const toggleExpand = (section: string) => {
    setExpanded(expanded === section ? null : section)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>{formatMessage("consent.title")}</CardTitle>
          <CardDescription>{formatMessage("consent.description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Necessary Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="necessary" checked={consents.necessary} disabled />
                <label htmlFor="necessary" className="font-medium">
                  {formatMessage("consent.necessary.title")}
                </label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toggleExpand("necessary")}>
                {expanded === "necessary" ? formatMessage("common.hide") : formatMessage("common.details")}
              </Button>
            </div>

            {expanded === "necessary" && (
              <div className="mt-2 text-sm text-gray-600">{formatMessage("consent.necessary.description")}</div>
            )}
          </div>

          {/* Functional Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="functional"
                  checked={consents.functional}
                  onCheckedChange={() => handleToggleConsent("functional")}
                />
                <label htmlFor="functional" className="font-medium">
                  {formatMessage("consent.functional.title")}
                </label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toggleExpand("functional")}>
                {expanded === "functional" ? formatMessage("common.hide") : formatMessage("common.details")}
              </Button>
            </div>

            {expanded === "functional" && (
              <div className="mt-2 text-sm text-gray-600">{formatMessage("consent.functional.description")}</div>
            )}
          </div>

          {/* Analytics Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={consents.analytics}
                  onCheckedChange={() => handleToggleConsent("analytics")}
                />
                <label htmlFor="analytics" className="font-medium">
                  {formatMessage("consent.analytics.title")}
                </label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toggleExpand("analytics")}>
                {expanded === "analytics" ? formatMessage("common.hide") : formatMessage("common.details")}
              </Button>
            </div>

            {expanded === "analytics" && (
              <div className="mt-2 text-sm text-gray-600">{formatMessage("consent.analytics.description")}</div>
            )}
          </div>

          {/* Marketing Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing"
                  checked={consents.marketing}
                  onCheckedChange={() => handleToggleConsent("marketing")}
                />
                <label htmlFor="marketing" className="font-medium">
                  {formatMessage("consent.marketing.title")}
                </label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toggleExpand("marketing")}>
                {expanded === "marketing" ? formatMessage("common.hide") : formatMessage("common.details")}
              </Button>
            </div>

            {expanded === "marketing" && (
              <div className="mt-2 text-sm text-gray-600">{formatMessage("consent.marketing.description")}</div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
          <Button variant="outline" onClick={handleRejectAll}>
            {formatMessage("consent.rejectAll")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAcceptSelected}>
              {formatMessage("consent.acceptSelected")}
            </Button>
            <Button onClick={handleAcceptAll}>{formatMessage("consent.acceptAll")}</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

