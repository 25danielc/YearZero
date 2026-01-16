import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckInStatus } from "@/lib/enums"
import { CheckCircle2, Circle, XCircle } from "lucide-react"

interface CheckInHistoryProps {
  resolutionId: string
  userId: string
}

export async function CheckInHistory({ resolutionId, userId }: CheckInHistoryProps) {
  const checkIns = await prisma.checkIn.findMany({
    where: {
      resolutionId,
      userId,
    },
    orderBy: {
      date: "desc",
    },
    take: 30,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Check-ins</CardTitle>
        <CardDescription>Last 30 check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        {checkIns.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No check-ins yet</p>
        ) : (
          <div className="space-y-2">
            {checkIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {checkIn.status === CheckInStatus.DONE && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {checkIn.status === CheckInStatus.PARTIAL && (
                    <Circle className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                  )}
                  {checkIn.status === CheckInStatus.MISSED && (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <div className="font-medium">{checkIn.date}</div>
                    {checkIn.note && (
                      <div className="text-sm text-muted-foreground">{checkIn.note}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">+{checkIn.xpAwarded} XP</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

