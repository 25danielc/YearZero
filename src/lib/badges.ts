import { prisma } from "@/lib/prisma"
import { BadgeType, CheckInStatus } from "@/lib/enums"
import { getDateString, getWeekStart } from "@/lib/utils"
import { computeStreak } from "./streak"

export async function evaluateBadges(
  userId: string,
  resolutionId: string,
  resolution: any,
  checkInStatus: CheckInStatus
): Promise<BadgeType[]> {
  const newBadges: BadgeType[] = []

  // Check existing badges
  const existingBadges = await prisma.badge.findMany({
    where: { userId },
    select: { type: true },
  })
  const existingTypes = new Set(existingBadges.map(b => b.type))

  // FIRST_CHECKIN
  if (!existingTypes.has(BadgeType.FIRST_CHECKIN)) {
    const totalCheckIns = await prisma.checkIn.count({
      where: { userId },
    })
    if (totalCheckIns === 1) {
      newBadges.push(BadgeType.FIRST_CHECKIN)
    }
  }

  // STREAK_7_DAYS
  if (!existingTypes.has(BadgeType.STREAK_7_DAYS)) {
    const streakInfo = await computeStreak(userId, resolutionId, resolution)
    if (resolution.frequencyType === "DAILY") {
      if (streakInfo.currentStreak >= 7) {
        newBadges.push(BadgeType.STREAK_7_DAYS)
      }
    } else {
      // For weekly, 3 consecutive successful weeks = ~21 days
      if (streakInfo.currentStreak >= 3) {
        newBadges.push(BadgeType.STREAK_7_DAYS)
      }
    }
  }

  // COMEBACK
  if (!existingTypes.has(BadgeType.COMEBACK)) {
    if (checkInStatus === CheckInStatus.DONE || checkInStatus === CheckInStatus.PARTIAL) {
      // Check if previous check-in was MISSED
      const previousCheckIns = await prisma.checkIn.findMany({
        where: {
          userId,
          resolutionId,
        },
        orderBy: {
          date: "desc",
        },
        take: 2,
      })
      
      if (previousCheckIns.length >= 2) {
        const prevStatus = previousCheckIns[1].status
        if (prevStatus === CheckInStatus.MISSED) {
          newBadges.push(BadgeType.COMEBACK)
        }
      }
    }
  }

  // XP_100
  if (!existingTypes.has(BadgeType.XP_100)) {
    const levelProgress = await prisma.levelProgress.findUnique({
      where: { userId },
    })
    if (levelProgress && levelProgress.totalXp >= 100) {
      newBadges.push(BadgeType.XP_100)
    }
  }

  // Create new badges
  if (newBadges.length > 0) {
    await Promise.all(
      newBadges.map(type =>
        prisma.badge.create({
          data: {
            userId,
            type,
          },
        })
      )
    )
  }

  return newBadges
}

