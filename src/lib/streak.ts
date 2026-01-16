import { prisma } from "@/lib/prisma"
import { CheckInStatus, FrequencyType } from "@/lib/enums"
import type { Resolution } from "@prisma/client"
import { getDateString, getWeekStart, getDaysInRange, getWeekStart as getWeekStartDate } from "@/lib/utils"

export interface StreakInfo {
  currentStreak: number
  isOnTrack: boolean
  lastSuccessDate: string | null
}

export async function computeStreak(
  userId: string,
  resolutionId: string,
  resolution: Resolution
): Promise<StreakInfo> {
  const today = getDateString()
  const allCheckIns = await prisma.checkIn.findMany({
    where: {
      userId,
      resolutionId,
    },
    orderBy: {
      date: "desc",
    },
  })

  if (resolution.frequencyType === FrequencyType.DAILY) {
    return computeDailyStreak(resolution, allCheckIns, today)
  } else {
    return computeWeeklyStreak(resolution, allCheckIns, today)
  }
}

function computeDailyStreak(
  resolution: Resolution,
  checkIns: any[],
  today: string
): StreakInfo {
  if (checkIns.length === 0) {
    return {
      currentStreak: 0,
      isOnTrack: false,
      lastSuccessDate: null,
    }
  }

  // Sort by date descending
  const sortedCheckIns = [...checkIns].sort((a, b) => b.date.localeCompare(a.date))
  
  let streak = 0
  let currentDate = new Date(today)
  let lastSuccessDate: string | null = null
  let foundBreak = false

  // Check today first
  const todayCheckIn = sortedCheckIns.find(c => c.date === today)
  const todayStatus = todayCheckIn?.status

  if (todayStatus === CheckInStatus.DONE || todayStatus === CheckInStatus.PARTIAL) {
    lastSuccessDate = today
  }

  // Work backwards from today
  for (let i = 0; i < 365; i++) { // Max 365 days
    const dateStr = getDateString(currentDate)
    const checkIn = sortedCheckIns.find(c => c.date === dateStr)

    if (!checkIn) {
      // No check-in for this day - streak breaks unless we're before start date
      if (new Date(dateStr) >= new Date(resolution.startDate)) {
        // Check if grace token was used
        const month = dateStr.substring(0, 7) // YYYY-MM
        // For MVP, we'll assume no grace token for simplicity in calculation
        // In practice, you'd check GraceToken table
        if (i === 0 && todayStatus !== CheckInStatus.MISSED) {
          // Today might not have a check-in yet, that's okay
          currentDate.setDate(currentDate.getDate() - 1)
          continue
        }
        break
      }
    } else {
      const status = checkIn.status
      if (status === CheckInStatus.DONE || status === CheckInStatus.PARTIAL) {
        if (!foundBreak) {
          streak++
          if (!lastSuccessDate) {
            lastSuccessDate = dateStr
          }
        }
      } else if (status === CheckInStatus.MISSED) {
        // Check if grace token was used (simplified - in production check GraceToken)
        // For now, MISSED breaks streak
        if (i > 0 || todayStatus === CheckInStatus.MISSED) {
          foundBreak = true
          break
        }
      }
    }

    currentDate.setDate(currentDate.getDate() - 1)
  }

  // Determine if on track
  const isOnTrack = todayStatus === CheckInStatus.DONE || 
                   todayStatus === CheckInStatus.PARTIAL ||
                   (todayStatus === undefined && new Date(today) >= new Date(resolution.startDate))

  return {
    currentStreak: streak,
    isOnTrack: isOnTrack || false,
    lastSuccessDate,
  }
}

function computeWeeklyStreak(
  resolution: Resolution,
  checkIns: any[],
  today: string
): StreakInfo {
  if (checkIns.length === 0) {
    return {
      currentStreak: 0,
      isOnTrack: false,
      lastSuccessDate: null,
    }
  }

  // Group check-ins by week
  const weeklyData: Map<string, { done: number; partial: number; missed: number }> = new Map()
  
  checkIns.forEach(checkIn => {
    const weekStart = getWeekStart(new Date(checkIn.date))
    const weekData = weeklyData.get(weekStart) || { done: 0, partial: 0, missed: 0 }
    
    if (checkIn.status === CheckInStatus.DONE) {
      weekData.done++
    } else if (checkIn.status === CheckInStatus.PARTIAL) {
      weekData.partial++
    } else {
      weekData.missed++
    }
    
    weeklyData.set(weekStart, weekData)
  })

  // Get all weeks from start date to today
  const startDate = new Date(resolution.startDate)
  const todayDate = new Date(today)
  const currentWeekStart = getWeekStart(todayDate)
  
  let streak = 0
  let currentWeek = new Date(currentWeekStart)
  let lastSuccessWeek: string | null = null
  let foundBreak = false

  // Check current week
  const currentWeekData = weeklyData.get(currentWeekStart)
  const currentWeekSuccess = currentWeekData 
    ? (currentWeekData.done + currentWeekData.partial) >= resolution.targetPerPeriod
    : false

  if (currentWeekSuccess) {
    lastSuccessWeek = currentWeekStart
  }

  // Work backwards week by week
  while (currentWeek >= startDate && !foundBreak) {
    const weekStr = getWeekStart(currentWeek)
    const weekData = weeklyData.get(weekStr)
    
    if (!weekData) {
      // No data for this week
      if (currentWeek.toISOString().split('T')[0] < currentWeekStart) {
        break
      }
    } else {
      const successCount = weekData.done + weekData.partial
      const isSuccessful = successCount >= resolution.targetPerPeriod
      
      if (isSuccessful) {
        if (!foundBreak) {
          streak++
          if (!lastSuccessWeek) {
            lastSuccessWeek = weekStr
          }
        }
      } else {
        // Week failed - check if grace token used (simplified)
        if (weekStr < currentWeekStart) {
          foundBreak = true
          break
        }
      }
    }

    // Move to previous week
    currentWeek.setDate(currentWeek.getDate() - 7)
  }

  const isOnTrack = currentWeekSuccess || 
                   (currentWeekData === undefined && new Date(currentWeekStart) >= startDate)

  return {
    currentStreak: streak,
    isOnTrack,
    lastSuccessDate: lastSuccessWeek,
  }
}

export async function getCurrentPeriodProgress(
  userId: string,
  resolutionId: string,
  resolution: Resolution
): Promise<{ done: number; partial: number; missed: number; target: number }> {
  const today = getDateString()
  
  if (resolution.frequencyType === FrequencyType.DAILY) {
    const todayCheckIn = await prisma.checkIn.findUnique({
      where: {
        userId_resolutionId_date: {
          userId,
          resolutionId,
          date: today,
        },
      },
    })
    
    return {
      done: todayCheckIn?.status === CheckInStatus.DONE ? 1 : 0,
      partial: todayCheckIn?.status === CheckInStatus.PARTIAL ? 1 : 0,
      missed: todayCheckIn?.status === CheckInStatus.MISSED ? 1 : 0,
      target: 1,
    }
  } else {
    // Weekly
    const weekStart = getWeekStart()
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const weekEndStr = getDateString(weekEnd)
    
    const weekCheckIns = await prisma.checkIn.findMany({
      where: {
        userId,
        resolutionId,
        date: {
          gte: weekStart,
          lte: weekEndStr,
        },
      },
    })
    
    const done = weekCheckIns.filter(c => c.status === CheckInStatus.DONE).length
    const partial = weekCheckIns.filter(c => c.status === CheckInStatus.PARTIAL).length
    const missed = weekCheckIns.filter(c => c.status === CheckInStatus.MISSED).length
    
    return {
      done,
      partial,
      missed,
      target: resolution.targetPerPeriod,
    }
  }
}

