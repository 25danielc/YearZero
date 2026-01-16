import { PrismaClient } from "@prisma/client"
import { Category, FrequencyType, CheckInStatus } from "@/lib/enums"
import { prisma } from "@/lib/prisma"
import { getDateString } from "@/lib/utils"

export async function seedDemoData(userId: string) {
  // Create level progress
  await prisma.levelProgress.upsert({
    where: { userId },
    update: { totalXp: 0, level: 1 },
    create: {
      userId,
      totalXp: 0,
      level: 1,
    },
  })

  // Create 3 demo resolutions
  const resolution1 = await prisma.resolution.create({
    data: {
      userId,
      title: "Exercise Daily",
      description: "30 minutes of exercise every day",
      category: Category.FITNESS,
      frequencyType: FrequencyType.DAILY,
      targetPerPeriod: 1,
      startDate: new Date(),
    },
  })

  const resolution2 = await prisma.resolution.create({
    data: {
      userId,
      title: "Read 3 Books Per Week",
      description: "Read at least 3 books per week",
      category: Category.LEARNING,
      frequencyType: FrequencyType.WEEKLY,
      targetPerPeriod: 3,
      startDate: new Date(),
    },
  })

  const resolution3 = await prisma.resolution.create({
    data: {
      userId,
      title: "Meditate Daily",
      description: "10 minutes of meditation every morning",
      category: Category.MINDFULNESS,
      frequencyType: FrequencyType.DAILY,
      targetPerPeriod: 1,
      startDate: new Date(),
    },
  })

  // Create some check-ins for the last week
  const today = new Date()
  const resolutions = [resolution1, resolution2, resolution3]

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = getDateString(date)

    // Check in for resolution 1 (daily)
    const status1 = i < 5 ? CheckInStatus.DONE : i === 5 ? CheckInStatus.PARTIAL : CheckInStatus.MISSED
    await prisma.checkIn.create({
      data: {
        userId,
        resolutionId: resolution1.id,
        date: dateStr,
        status: status1,
        xpAwarded: status1 === CheckInStatus.DONE ? 10 : status1 === CheckInStatus.PARTIAL ? 5 : 0,
      },
    })

    // Check in for resolution 2 (weekly - only some days)
    if (i % 2 === 0) {
      await prisma.checkIn.create({
        data: {
          userId,
          resolutionId: resolution2.id,
          date: dateStr,
          status: CheckInStatus.DONE,
          xpAwarded: 10,
        },
      })
    }

    // Check in for resolution 3 (daily)
    if (i < 6) {
      await prisma.checkIn.create({
        data: {
          userId,
          resolutionId: resolution3.id,
          date: dateStr,
          status: CheckInStatus.DONE,
          xpAwarded: 10,
        },
      })
    }
  }

  // Update total XP
  const checkIns = await prisma.checkIn.findMany({
    where: { userId },
  })

  const totalXp = checkIns.reduce((sum: number, c: { xpAwarded: number }) => sum + c.xpAwarded, 0)
  const level = Math.floor(totalXp / 100) + 1

  await prisma.levelProgress.update({
    where: { userId },
    data: {
      totalXp,
      level,
    },
  })
}

