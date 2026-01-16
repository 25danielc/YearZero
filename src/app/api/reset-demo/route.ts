import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { seedDemoData } from "@/lib/seed"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { userId } = await request.json()

    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete all user data
    await prisma.checkIn.deleteMany({ where: { userId } })
    await prisma.badge.deleteMany({ where: { userId } })
    await prisma.graceToken.deleteMany({ where: { userId } })
    await prisma.resolution.deleteMany({ where: { userId } })
    await prisma.levelProgress.deleteMany({ where: { userId } })

    // Seed demo data
    await seedDemoData(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset demo error:", error)
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 })
  }
}

