import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AppHeader } from "@/components/app-header"
import { prisma } from "@/lib/prisma"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const levelProgress = await prisma.levelProgress.findUnique({
    where: { userId: session.user.id },
  })

  const level = levelProgress?.level || 1
  const totalXp = levelProgress?.totalXp || 0

  // Calculate total streak (sum of all active resolution streaks)
  const activeResolutions = await prisma.resolution.findMany({
    where: {
      userId: session.user.id,
      isArchived: false,
    },
  })

  // For simplicity, just show the max streak
  let maxStreak = 0
  for (const resolution of activeResolutions) {
    const checkIns = await prisma.checkIn.findMany({
      where: { userId: session.user.id, resolutionId: resolution.id },
      orderBy: { date: "desc" },
      take: 30,
    })
    
    if (checkIns.length > 0) {
      // Simple streak calculation
      let streak = 0
      for (const checkIn of checkIns) {
        if (checkIn.status === "DONE" || checkIn.status === "PARTIAL") {
          streak++
        } else {
          break
        }
      }
      maxStreak = Math.max(maxStreak, streak)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader level={level} totalXp={totalXp} streakSummary={maxStreak} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

