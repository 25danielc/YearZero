import { prisma } from "@/lib/prisma"
import { BadgeType } from "@/lib/enums"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Award, Target, TrendingUp } from "lucide-react"

interface TrophyCaseProps {
  userId: string
}

const badgeConfig: Record<BadgeType, { label: string; icon: React.ReactNode; color: string }> = {
  FIRST_CHECKIN: {
    label: "First Check-in",
    icon: <Target className="w-6 h-6" />,
    color: "text-blue-600",
  },
  STREAK_7_DAYS: {
    label: "7 Day Streak",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "text-orange-600",
  },
  COMEBACK: {
    label: "Comeback",
    icon: <Award className="w-6 h-6" />,
    color: "text-purple-600",
  },
  XP_100: {
    label: "100 XP",
    icon: <Trophy className="w-6 h-6" />,
    color: "text-yellow-600",
  },
  STREAK_30_DAYS: {
    label: "30 Day Streak",
    icon: <Trophy className="w-6 h-6" />,
    color: "text-gold-600",
  },
}

export async function TrophyCase({ userId }: TrophyCaseProps) {
  const badges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { earnedAt: "desc" },
  })

  if (badges.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
        🏆 Achievement Hall
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const config = badgeConfig[badge.type as BadgeType]
          return (
            <Card key={badge.id} className="hover:shadow-lg transition-all hover:scale-105 border-2 border-yellow-200 dark:border-yellow-800">
              <CardContent className="pt-6 pb-6 text-center">
                <div className={`${config.color} mb-3 flex justify-center`}>
                  <div className="p-3 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30">
                    {config.icon}
                  </div>
                </div>
                <div className="font-bold text-sm">{config.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Unlocked {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

