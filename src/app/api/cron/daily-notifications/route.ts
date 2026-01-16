import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendDailyNotification } from "@/lib/email"
import { computeStreak } from "@/lib/streak"
import { getDateString } from "@/lib/utils"

/**
 * Daily notification cron job endpoint
 * Should be called at midnight (00:00) every day
 * 
 * For production deployment (e.g., Vercel):
 * Add this to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-notifications",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 * 
 * For local development, use a service like cron-job.org or set up a cron job
 * that calls this endpoint: GET https://your-domain.com/api/cron/daily-notifications
 * 
 * To protect from unauthorized access, verify a secret header:
 */
// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Optional: Add authentication for cron endpoint
  // const authHeader = request.headers.get("authorization")
  // const cronSecret = process.env.CRON_SECRET
  // if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  try {
    const today = getDateString()
    console.log(`[${today}] Starting daily notification job...`)

    // Get all active users
    const users = await prisma.user.findMany({
      include: {
        levelProgress: true,
        resolutions: {
          where: {
            isArchived: false,
          },
        },
      },
    })

    let emailsSent = 0
    let emailsFailed = 0
    const errors: string[] = []

    // Process each user
    for (const user of users) {
      try {
        // Skip if user has no resolutions
        if (user.resolutions.length === 0) {
          continue
        }

        // Get today's check-ins for this user
        const todayCheckIns = await prisma.checkIn.findMany({
          where: {
            userId: user.id,
            date: today,
          },
          select: {
            resolutionId: true,
          },
        })

        const checkedInResolutionIds = new Set(todayCheckIns.map((c) => c.resolutionId))
        
        // Get resolutions that haven't been checked in today
        const uncheckedResolutions = user.resolutions.filter(
          (r) => !checkedInResolutionIds.has(r.id)
        )

        // Skip if all resolutions are already checked in
        if (uncheckedResolutions.length === 0) {
          continue
        }

        // Get streak info for each unchecked resolution
        const resolutionData = await Promise.all(
          uncheckedResolutions.map(async (resolution) => {
            const streakInfo = await computeStreak(user.id, resolution.id, resolution)
            return {
              title: resolution.title,
              category: resolution.category,
              currentStreak: streakInfo.currentStreak,
            }
          })
        )

        // Get user's stats
        const levelProgress = user.levelProgress || { totalXp: 0, level: 1 }
        
        // Calculate overall streak (for daily resolutions, count consecutive days with at least one check-in)
        // This is simplified - you might want a more sophisticated calculation
        const allRecentCheckIns = await prisma.checkIn.findMany({
          where: {
            userId: user.id,
            date: {
              // Look at last 30 days for streak calculation
              gte: getDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            },
          },
          orderBy: {
            date: "desc",
          },
          distinct: ["date"],
        })

        // Count consecutive days with check-ins from today backwards
        let overallStreak = 0
        let currentDate = new Date()
        for (let i = 0; i < 365; i++) {
          const dateStr = getDateString(currentDate)
          const hasCheckIn = allRecentCheckIns.some((c) => c.date === dateStr)
          if (hasCheckIn) {
            overallStreak++
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            // Allow today to not have check-ins yet (that's why we're sending the email!)
            if (i === 0) {
              currentDate.setDate(currentDate.getDate() - 1)
              continue
            }
            break
          }
        }

        // Send email notification
        const success = await sendDailyNotification({
          email: user.email,
          userName: user.email.split("@")[0], // Use email prefix as name
          uncheckedResolutions: resolutionData,
          totalXP: levelProgress.totalXp,
          level: levelProgress.level,
          currentStreak: overallStreak,
        })

        if (success) {
          emailsSent++
          console.log(`✓ Sent notification to ${user.email}`)
        } else {
          emailsFailed++
          errors.push(`Failed to send email to ${user.email} (email not configured)`)
          console.warn(`✗ Failed to send notification to ${user.email}`)
        }
      } catch (error) {
        emailsFailed++
        const errorMessage = `Error processing user ${user.email}: ${
          error instanceof Error ? error.message : String(error)
        }`
        errors.push(errorMessage)
        console.error(errorMessage, error)
      }
    }

    const summary = {
      timestamp: new Date().toISOString(),
      usersProcessed: users.length,
      emailsSent,
      emailsFailed,
      errors: errors.length > 0 ? errors : undefined,
    }

    console.log(`[${today}] Daily notification job completed:`, summary)

    return NextResponse.json({
      success: true,
      ...summary,
    })
  } catch (error) {
    console.error("Error in daily notification cron job:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

