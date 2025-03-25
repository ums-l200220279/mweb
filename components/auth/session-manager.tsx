"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CsrfForm } from "@/components/auth/csrf-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, LogOut, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Session {
  id: string
  current: boolean
  lastActive: number
  createdAt: number
  userAgent: string
  ip: string
  provider?: string
}

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [revoking, setRevoking] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions")

      if (!response.ok) {
        throw new Error("Failed to fetch sessions")
      }

      const data = await response.json()
      setSessions(data.sessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId)
    setError("")

    try {
      const response = await fetch("/api/auth/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          csrfToken: document.querySelector<HTMLInputElement>('input[name="csrfToken"]')?.value,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to revoke session")
      }

      // Remove the revoked session from the list
      setSessions(sessions.filter((session) => session.id !== sessionId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setRevoking(null)
    }
  }

  const handleRevokeAll = async () => {
    setRevokingAll(true)
    setError("")

    try {
      const response = await fetch("/api/auth/sessions/revoke-all", {
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
        throw new Error(data.error || "Failed to revoke all sessions")
      }

      // Keep only the current session
      setSessions(sessions.filter((session) => session.current))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setRevokingAll(false)
    }
  }

  const formatUserAgent = (userAgent: string) => {
    if (!userAgent || userAgent === "unknown") return "Unknown device"

    // Simple user agent parsing
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent)
    const isTablet = /tablet|ipad/i.test(userAgent)
    const isWindows = /windows/i.test(userAgent)
    const isMac = /macintosh|mac os/i.test(userAgent)
    const isLinux = /linux/i.test(userAgent)

    let device = "Computer"
    if (isMobile && !isTablet) device = "Mobile"
    if (isTablet) device = "Tablet"

    let os = "Unknown OS"
    if (isWindows) os = "Windows"
    if (isMac) os = "Mac OS"
    if (isLinux) os = "Linux"
    if (/android/i.test(userAgent)) os = "Android"
    if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS"

    let browser = "Unknown browser"
    if (/chrome/i.test(userAgent) && !/edge|opr|opera/i.test(userAgent)) browser = "Chrome"
    if (/firefox/i.test(userAgent)) browser = "Firefox"
    if (/safari/i.test(userAgent) && !/chrome|edge|opr|opera/i.test(userAgent)) browser = "Safari"
    if (/edge/i.test(userAgent)) browser = "Edge"
    if (/opera|opr/i.test(userAgent)) browser = "Opera"

    return `${device} • ${os} • ${browser}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Manage your active sessions across different devices</CardDescription>
      </CardHeader>
      <CardContent>
        <CsrfForm action="/api/auth/sessions" className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-4">No active sessions found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatUserAgent(session.userAgent)}
                            {session.current && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.provider ? `Signed in with ${session.provider}` : "Email & password"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.lastActive
                          ? formatDistanceToNow(session.lastActive, { addSuffix: true })
                          : formatDistanceToNow(session.createdAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{session.ip || "Unknown"}</span>
                      </TableCell>
                      <TableCell>
                        {session.current ? (
                          <span className="text-xs text-muted-foreground">Current session</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(session.id)}
                            disabled={revoking === session.id}
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            {revoking === session.id ? "Revoking..." : "Revoke"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {sessions.length > 1 && (
                <div className="mt-4">
                  <Button variant="outline" onClick={handleRevokeAll} disabled={revokingAll} className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    {revokingAll ? "Revoking all sessions..." : "Revoke all other sessions"}
                  </Button>
                </div>
              )}
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CsrfForm>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-sm text-muted-foreground">
          If you notice any suspicious activity, revoke the session immediately and change your password.
        </p>
      </CardFooter>
    </Card>
  )
}

