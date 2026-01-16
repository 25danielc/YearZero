import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ResolutionCard } from "@/components/resolution-card"
import { TrophyCase } from "@/components/trophy-case"
import { computeStreak, getCurrentPeriodProgress } from "@/lib/streak"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CheckCircle } from "lucide-react"
import { getDateString } from "@/lib/utils"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const resolutions = await prisma.resolution.findMany({
    where: {
      userId: session.user.id,
      isArchived: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Get today's check-ins
  const today = getDateString()
  const todayCheckIns = await prisma.checkIn.findMany({
    where: {
      userId: session.user.id,
      date: today,
    },
    select: {
      resolutionId: true,
    },
  })

  const checkedInResolutionIds = new Set(todayCheckIns.map(c => c.resolutionId))
  const uncheckedResolutions = resolutions.filter(r => !checkedInResolutionIds.has(r.id))

  // Compute streak info for each resolution
  const resolutionsWithStreaks = await Promise.all(
    resolutions.map(async (resolution) => {
      const streakInfo = await computeStreak(session.user.id, resolution.id, resolution)
      const progress = await getCurrentPeriodProgress(session.user.id, resolution.id, resolution)
      return { resolution, streakInfo, progress }
    })
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, hero! Ready to level up today?
          </p>
        </div>
        <div className="flex gap-2">
          {uncheckedResolutions.length > 0 && (
            <Button asChild>
              <Link href="/app/checkin">
                <CheckCircle className="w-4 h-4 mr-2" />
                Today's Check-in ({uncheckedResolutions.length})
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="border-purple-300 hover:bg-purple-50">
            <Link href="/app/resolutions">
              <Plus className="w-4 h-4 mr-2" />
              New Resolution
            </Link>
          </Button>
        </div>
      </div>

      {uncheckedResolutions.length > 0 && (
        <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Daily Check-in Available
            </CardTitle>
            <CardDescription>
              You have {uncheckedResolutions.length} resolution{uncheckedResolutions.length !== 1 ? "s" : ""} ready to check in today. Earn XP and keep your streak alive!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/app/checkin">Check In Now →</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Active Resolutions
        </h2>
        {resolutionsWithStreaks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No active resolutions yet. Start your journey!
              </p>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="/app/resolutions">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Resolution
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resolutionsWithStreaks.map(({ resolution, streakInfo, progress }) => (
              <ResolutionCard
                key={resolution.id}
                resolution={resolution}
                streakInfo={streakInfo}
                progress={progress}
                userId={session.user.id}
              />
            ))}
          </div>
        )}
      </div>

      <TrophyCase userId={session.user.id} />
    </div>
  )
}

