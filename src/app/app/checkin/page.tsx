import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CheckInForm } from "@/components/checkin-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDateString } from "@/lib/utils"
import { CheckInStatus } from "@/lib/enums"

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: { resolution?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const today = getDateString()
  const whereClause = {
    userId: session.user.id,
    isArchived: false,
    ...(searchParams.resolution ? { id: searchParams.resolution } : {}),
  }

  const resolutions = await prisma.resolution.findMany({
    where: whereClause,
    orderBy: { title: "asc" },
  })

  // Get existing check-ins for today
  const existingCheckIns = await prisma.checkIn.findMany({
    where: {
      userId: session.user.id,
      date: today,
    },
    select: {
      resolutionId: true,
      status: true,
      note: true,
    },
  })

  const checkInMap = new Map(
    existingCheckIns.map(c => [c.resolutionId, { status: c.status as CheckInStatus, note: c.note }])
  )

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Daily Check-in
        </h1>
        <p className="text-muted-foreground mt-1">
          Update your progress for today
        </p>
      </div>

      {resolutions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No active resolutions to check in.
            </p>
          </CardContent>
        </Card>
      ) : (
        <CheckInForm
          resolutions={resolutions}
          existingCheckIns={checkInMap}
          userId={session.user.id}
        />
      )}
    </div>
  )
}

