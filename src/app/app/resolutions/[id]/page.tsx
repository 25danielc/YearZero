import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ResolutionForm } from "@/components/resolution-form"
import { computeStreak, getCurrentPeriodProgress } from "@/lib/streak"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StreakBadge } from "@/components/streak-badge"
import { CheckInHistory } from "@/components/checkin-history"
import { Category, FrequencyType } from "@/lib/enums"

export const dynamic = 'force-dynamic'

export default async function ResolutionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const resolution = await prisma.resolution.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  })

  if (!resolution) {
    notFound()
  }

  const streakInfo = await computeStreak(session.user.id, resolution.id, resolution)
  const progress = await getCurrentPeriodProgress(session.user.id, resolution.id, resolution)

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {resolution.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {resolution.description || "No description"}
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">{resolution.category}</Badge>
          <Badge variant="outline">
            {resolution.frequencyType === "DAILY" ? "Daily" : "Weekly"}
          </Badge>
          <StreakBadge streak={streakInfo.currentStreak} isOnTrack={streakInfo.isOnTrack} />
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Current Progress</CardTitle>
          <CardDescription>
            This {resolution.frequencyType === "DAILY" ? "day" : "week"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {progress.done + progress.partial}/{progress.target}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: progress.target }).map((_, i) => {
                if (i < progress.done) {
                  return <div key={i} className="w-8 h-8 rounded-full bg-green-600" />
                } else if (i < progress.done + progress.partial) {
                  return <div key={i} className="w-8 h-8 rounded-full bg-yellow-600" />
                } else {
                  return <div key={i} className="w-8 h-8 rounded-full bg-gray-300" />
                }
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <CheckInHistory resolutionId={resolution.id} userId={session.user.id} />

      <Card>
        <CardHeader>
          <CardTitle>Edit Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResolutionForm 
            userId={session.user.id} 
            resolution={{
              id: resolution.id,
              title: resolution.title,
              description: resolution.description,
              category: resolution.category as Category,
              frequencyType: resolution.frequencyType as FrequencyType,
              targetPerPeriod: resolution.targetPerPeriod,
              startDate: resolution.startDate.toISOString().split('T')[0],
            }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}

