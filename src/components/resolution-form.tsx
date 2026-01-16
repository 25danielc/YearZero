"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Category, FrequencyType } from "@/lib/enums"
import { createResolution, updateResolution } from "@/app/actions/resolutions"
import { toast } from "sonner"

interface ResolutionFormProps {
  userId: string
  resolution?: {
    id: string
    title: string
    description?: string | null
    category: Category
    frequencyType: FrequencyType
    targetPerPeriod: number
    startDate: string
  }
}

const categories = Object.values(Category)
const frequencyTypes = Object.values(FrequencyType)

export function ResolutionForm({ userId, resolution }: ResolutionFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(resolution?.title || "")
  const [description, setDescription] = useState(resolution?.description || "")
  const [category, setCategory] = useState<Category>(resolution?.category || Category.OTHER)
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    resolution?.frequencyType || FrequencyType.DAILY
  )
  const [targetPerPeriod, setTargetPerPeriod] = useState(
    resolution?.targetPerPeriod || 1
  )
  const [startDate, setStartDate] = useState(
    resolution?.startDate || new Date().toISOString().split("T")[0]
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        title,
        description: description || undefined,
        category,
        frequencyType,
        targetPerPeriod,
        startDate,
      }

      let result
      if (resolution) {
        result = await updateResolution(userId, { id: resolution.id, ...data })
      } else {
        result = await createResolution(userId, data)
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(resolution ? "Resolution updated" : "Resolution created")
      router.push("/app/resolutions")
      router.refresh()
    } catch (error) {
      toast.error("Failed to save resolution")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resolution ? "Edit Resolution" : "Create Resolution"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Exercise daily"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencyType">Frequency *</Label>
              <Select
                value={frequencyType}
                onValueChange={(value) => setFrequencyType(value as FrequencyType)}
              >
                <SelectTrigger id="frequencyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencyTypes.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq === FrequencyType.DAILY ? "Daily" : "Weekly"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetPerPeriod">
                Target Per {frequencyType === FrequencyType.DAILY ? "Day" : "Week"} *
              </Label>
              <Input
                id="targetPerPeriod"
                type="number"
                min="1"
                value={targetPerPeriod}
                onChange={(e) => setTargetPerPeriod(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : resolution ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

