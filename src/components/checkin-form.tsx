"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckInStatus } from "@/lib/enums"
import type { Resolution } from "@prisma/client"
import { submitMultipleCheckIns } from "@/app/actions/checkins"
import { toast } from "sonner"

interface CheckInFormProps {
  resolutions: Resolution[]
  existingCheckIns: Map<string, { status: CheckInStatus; note?: string | null }>
  userId: string
}

export function CheckInForm({ resolutions, existingCheckIns, userId }: CheckInFormProps) {
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<
    Map<string, { status: CheckInStatus; note: string }>
  >(
    new Map(
      Array.from(existingCheckIns.entries()).map(([id, data]) => [
        id,
        { status: data.status, note: data.note || "" },
      ])
    )
  )
  const [notes, setNotes] = useState<Map<string, string>>(
    new Map(
      resolutions.map(r => [
        r.id,
        existingCheckIns.get(r.id)?.note || "",
      ])
    )
  )
  const [loading, setLoading] = useState(false)

  const updateStatus = (resolutionId: string, status: CheckInStatus) => {
    setCheckIns(new Map(checkIns.set(resolutionId, { status, note: notes.get(resolutionId) || "" })))
  }

  const updateNote = (resolutionId: string, note: string) => {
    setNotes(new Map(notes.set(resolutionId, note)))
    const current = checkIns.get(resolutionId)
    if (current) {
      setCheckIns(new Map(checkIns.set(resolutionId, { ...current, note })))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const checkInArray = Array.from(checkIns.entries()).map(([resolutionId, data]) => ({
        resolutionId,
        status: data.status,
        note: data.note || undefined,
      }))

      const result = await submitMultipleCheckIns(userId, checkInArray)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.leveledUp) {
        toast.success(`Level up! You're now level ${result.newLevel}! 🎉`)
      }

      if (result.newBadges && result.newBadges.length > 0) {
        toast.success(`You earned ${result.newBadges.length} badge(s)! 🏆`)
      }

      toast.success(`Check-in saved! +${result.totalXpGained} XP`)
      router.push("/app")
      router.refresh()
    } catch (error) {
      toast.error("Failed to submit check-in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {resolutions.map((resolution) => {
        const currentStatus = checkIns.get(resolution.id)?.status
        const currentNote = notes.get(resolution.id) || ""

        return (
          <Card key={resolution.id}>
            <CardHeader>
              <CardTitle>{resolution.title}</CardTitle>
              {resolution.description && (
                <CardDescription>{resolution.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Tabs
                  value={currentStatus || "MISSED"}
                  onValueChange={(value) => updateStatus(resolution.id, value as CheckInStatus)}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value={CheckInStatus.DONE}>
                      Done
                    </TabsTrigger>
                    <TabsTrigger value={CheckInStatus.PARTIAL}>
                      Partial
                    </TabsTrigger>
                    <TabsTrigger value={CheckInStatus.MISSED}>
                      Missed
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`note-${resolution.id}`}>Note (optional)</Label>
                <Textarea
                  id={`note-${resolution.id}`}
                  placeholder="Add a note about your progress..."
                  value={currentNote}
                  onChange={(e) => updateNote(resolution.id, e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          {loading ? "Saving..." : "Submit Check-in"}
        </Button>
      </div>
    </div>
  )
}

