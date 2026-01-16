"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { CheckInStatus } from "@/lib/enums"
import { getDateString } from "@/lib/utils"
import { getXpForStatus, updateUserXp } from "@/lib/xp"
import { evaluateBadges } from "@/lib/badges"

const checkInSchema = z.object({
  resolutionId: z.string(),
  status: z.nativeEnum(CheckInStatus),
  note: z.string().optional(),
  date: z.string().optional(),
})

export async function submitCheckIn(
  userId: string,
  data: z.infer<typeof checkInSchema>
) {
  try {
    const validated = checkInSchema.parse(data)
    const date = validated.date || getDateString()

    // Verify resolution ownership
    const resolution = await prisma.resolution.findFirst({
      where: {
        id: validated.resolutionId,
        userId,
        isArchived: false,
      },
    })

    if (!resolution) {
      return { error: "Resolution not found" }
    }

    // Calculate XP for this check-in
    const xpAwarded = getXpForStatus(validated.status)

    // Check if check-in already exists for this date
    const existing = await prisma.checkIn.findUnique({
      where: {
        userId_resolutionId_date: {
          userId,
          resolutionId: validated.resolutionId,
          date,
        },
      },
    })

    let xpDelta = xpAwarded

    if (existing) {
      // Update existing check-in and adjust XP
      const oldXp = existing.xpAwarded
      xpDelta = xpAwarded - oldXp

      await prisma.checkIn.update({
        where: {
          userId_resolutionId_date: {
            userId,
            resolutionId: validated.resolutionId,
            date,
          },
        },
        data: {
          status: validated.status,
          note: validated.note,
          xpAwarded,
        },
      })
    } else {
      // Create new check-in
      await prisma.checkIn.create({
        data: {
          userId,
          resolutionId: validated.resolutionId,
          date,
          status: validated.status,
          note: validated.note,
          xpAwarded,
        },
      })
    }

    // Update user XP and check for level up
    const { newLevel, leveledUp } = await updateUserXp(userId, xpDelta)

    // Evaluate badges
    const newBadges = await evaluateBadges(
      userId,
      validated.resolutionId,
      resolution,
      validated.status
    )

    return {
      success: true,
      leveledUp,
      newLevel,
      newBadges,
      xpAwarded,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }
    return { error: "Failed to submit check-in" }
  }
}

export async function submitMultipleCheckIns(
  userId: string,
  checkIns: Array<z.infer<typeof checkInSchema>>
) {
  try {
    const results = []
    let totalXpGained = 0
    let leveledUp = false
    let newLevel = 1
    const allNewBadges: string[] = []

    for (const checkIn of checkIns) {
      const result = await submitCheckIn(userId, checkIn)
      if (result.success) {
        results.push(result)
        totalXpGained += result.xpAwarded || 0
        if (result.leveledUp) {
          leveledUp = true
          newLevel = result.newLevel || 1
        }
        if (result.newBadges) {
          allNewBadges.push(...result.newBadges)
        }
      } else {
        return { error: result.error || "Failed to submit check-ins" }
      }
    }

    return {
      success: true,
      leveledUp,
      newLevel,
      newBadges: allNewBadges,
      totalXpGained,
    }
  } catch (error) {
    return { error: "Failed to submit check-ins" }
  }
}

