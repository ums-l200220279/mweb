import { TwoFactorSetup } from "@/components/auth/two-factor-setup"
import { TwoFactorDisable } from "@/components/auth/two-factor-disable"
import { SessionManager } from "@/components/auth/session-manager"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db-client"
import { redirect } from "next/navigation"

export default async function SecurityPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/settings/security")
  }

  // Check if 2FA is enabled for the user
  const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
    where: {
      userId: session.user.id,
    },
  })

  const is2FAEnabled = twoFactorAuth?.enabled || false

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      <div className="grid gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
          <p className="text-muted-foreground mb-4">
            Add an extra layer of security to your account by requiring a verification code in addition to your
            password.
          </p>

          {is2FAEnabled ? <TwoFactorDisable /> : <TwoFactorSetup />}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Session Management</h2>
          <p className="text-muted-foreground mb-4">View and manage your active sessions across different devices.</p>

          <SessionManager />
        </div>
      </div>
    </div>
  )
}

