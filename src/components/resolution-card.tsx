"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "./ui/badge"
import { StreakBadge } from "./streak-badge"
import { Category, FrequencyType } from "@/lib/enums"
import { StreakInfo } from "@/lib/streak"
import { CheckCircle2, Circle, XCircle, ChevronRight } from "lucide-react"

interface ResolutionCardProps {
  resolution: {
    id: string
    title: string
    description?: string | null
    category: Category
    frequencyType: FrequencyType
    targetPerPeriod: number
    startDate: Date | string
  }
  streakInfo: StreakInfo
  progress?: {
    done: number
    partial: number
    missed: number
    target: number
  }
  userId: string
}

const categoryLabels: Record<Category, string> = {
  HEALTH: "Health",
  FITNESS: "Fitness",
  LEARNING: "Learning",
  PRODUCTIVITY: "Productivity",
  RELATIONSHIPS: "Relationships",
  FINANCIAL: "Financial",
  CREATIVE: "Creative",
  MINDFULNESS: "Mindfulness",
  OTHER: "Other",
}

export function ResolutionCard({ resolution, streakInfo, progress, userId }: ResolutionCardProps) {
  const categoryLabel = categoryLabels[resolution.category]
  const frequencyLabel = resolution.frequencyType === FrequencyType.DAILY ? "Daily" : "Weekly"

  const progressValue = progress
    ? ((progress.done + progress.partial * 0.5) / progress.target) * 100
    : 0

  return (
    <Card className="hover:shadow-lg transition-all hover:scale-[1.02] border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{resolution.title}</CardTitle>
            {resolution.description && (
              <CardDescription>{resolution.description}</CardDescription>
            )}
          </div>
          <Link href={`/app/resolutions/${resolution.id}`}>
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{categoryLabel}</Badge>
          <Badge variant="outline">{frequencyLabel}</Badge>
          <StreakBadge streak={streakInfo.currentStreak} isOnTrack={streakInfo.isOnTrack} />
        </div>
      </CardHeader>
      <CardContent>
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold text-purple-600">
                {progress.done + progress.partial}/{progress.target}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: progress.target }).map((_, i) => {
                if (i < progress.done) {
                  return <CheckCircle2 key={i} className="w-5 h-5 text-green-600" />
                } else if (i < progress.done + progress.partial) {
                  return <Circle key={i} className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                } else {
                  return <XCircle key={i} className="w-5 h-5 text-gray-300" />
                }
              })}
            </div>
          </div>
        )}
        <Link href={`/app/checkin?resolution=${resolution.id}`}>
          <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Check In
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

