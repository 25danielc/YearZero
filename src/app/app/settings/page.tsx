import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResetDemoButton } from "@/components/reset-demo-button"
import { TrophyCase } from "@/components/trophy-case"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      levelProgress: true,
    },
  })

  const levelProgress = user?.levelProgress

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          {levelProgress && (
            <div>
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="font-medium">
                Level {levelProgress.level} ({levelProgress.totalXp} XP)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <TrophyCase userId={session.user.id} />

      <Card>
        <CardHeader>
          <CardTitle>Demo Data</CardTitle>
          <CardDescription>
            Reset your account with demo data for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetDemoButton userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  )
}

