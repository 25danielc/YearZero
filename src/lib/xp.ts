import { prisma } from "@/lib/prisma"
import { CheckInStatus } from "@/lib/enums"
import { getLevelFromXp } from "./utils"

export function getXpForStatus(status: CheckInStatus): number {
  switch (status) {
    case CheckInStatus.DONE:
      return 10
    case CheckInStatus.PARTIAL:
      return 5
    case CheckInStatus.MISSED:
      return 0
    default:
      return 0
  }
}

export async function updateUserXp(userId: string, xpDelta: number): Promise<{ newLevel: number; leveledUp: boolean }> {
  // Get or create level progress
  let levelProgress = await prisma.levelProgress.findUnique({
    where: { userId },
  })

  if (!levelProgress) {
    levelProgress = await prisma.levelProgress.create({
      data: {
        userId,
        totalXp: 0,
        level: 1,
      },
    })
  }

  const oldLevel = levelProgress.level
  const newTotalXp = levelProgress.totalXp + xpDelta
  const newLevel = getLevelFromXp(newTotalXp)
  const leveledUp = newLevel > oldLevel

  await prisma.levelProgress.update({
    where: { userId },
    data: {
      totalXp: newTotalXp,
      level: newLevel,
    },
  })

  return { newLevel, leveledUp }
}

