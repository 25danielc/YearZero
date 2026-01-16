import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckInStatus } from "@/lib/enums"
import { getWeeksInRange, getDateString } from "@/lib/utils"
import { WeeklyCharts } from "@/components/weekly-charts"

export default async function ReviewPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const resolutions = await prisma.resolution.findMany({
    where: { userId: session.user.id, isArchived: false },
  })

  // Get last 8 weeks of data
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 56) // 8 weeks

  const weeks = getWeeksInRange(getDateString(startDate), getDateString(endDate))

  // Get all check-ins in this period
  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: getDateString(startDate),
        lte: getDateString(endDate),
      },
    },
  })

  // Calculate completion rate per week
  const weeklyData = weeks.map((weekStart) => {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekEndStr = getDateString(weekEnd)

    const weekCheckIns = checkIns.filter(
      (c) => c.date >= weekStart && c.date <= weekEndStr
    )

    const total = weekCheckIns.length
    const done = weekCheckIns.filter((c) => c.status === CheckInStatus.DONE).length
    const partial = weekCheckIns.filter((c) => c.status === CheckInStatus.PARTIAL).length
    const completionRate = total > 0 ? ((done + partial * 0.5) / total) * 100 : 0

    // Calculate XP for the week
    const xp = weekCheckIns.reduce((sum, c) => sum + c.xpAwarded, 0)

    return {
      week: weekStart,
      completionRate,
      xp,
      total,
      done,
      partial,
    }
  })

  // Calculate best/worst day of week
  const dayOfWeekStats: Map<number, { done: number; total: number }> = new Map()
  checkIns.forEach((checkIn) => {
    const date = new Date(checkIn.date)
    const dayOfWeek = date.getDay()
    const current = dayOfWeekStats.get(dayOfWeek) || { done: 0, total: 0 }
    dayOfWeekStats.set(dayOfWeek, {
      done: current.done + (checkIn.status === CheckInStatus.DONE ? 1 : 0),
      total: current.total + 1,
    })
  })

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  let bestDay = 0
  let worstDay = 0
  let bestRate = 0
  let worstRate = 100

  dayOfWeekStats.forEach((stats, day) => {
    const rate = stats.total > 0 ? (stats.done / stats.total) * 100 : 0
    if (rate > bestRate) {
      bestRate = rate
      bestDay = day
    }
    if (rate < worstRate) {
      worstRate = rate
      worstDay = day
    }
  })

  // Check for weekend miss clusters
  const weekendMisses =
    (dayOfWeekStats.get(0)?.total || 0) +
    (dayOfWeekStats.get(6)?.total || 0)
  const totalMisses = Array.from(dayOfWeekStats.values()).reduce(
    (sum, s) => sum + s.total,
    0
  )
  const weekendMissPercentage =
    totalMisses > 0 ? (weekendMisses / totalMisses) * 100 : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Weekly Review
        </h1>
        <p className="text-muted-foreground mt-1">
          Insights into your progress and patterns
        </p>
      </div>

      <WeeklyCharts weeklyData={weeklyData} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>Patterns in your check-ins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-green-600">✓</span> Peak Performance Day
              </h3>
              <p className="text-muted-foreground">
                {dayNames[bestDay]} - {bestRate.toFixed(0)}% success rate
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="text-orange-600">⚠</span> Challenge Day
              </h3>
              <p className="text-muted-foreground">
                {dayNames[worstDay]} - {worstRate.toFixed(0)}% success rate
              </p>
            </div>
            {weekendMissPercentage > 40 && (
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                  <span>🎯</span> Pattern Detected
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You miss {weekendMissPercentage.toFixed(0)}% of quests on weekends.
                  Consider adjusting your strategy or using grace tokens.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

