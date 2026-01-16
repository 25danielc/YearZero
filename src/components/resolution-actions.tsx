"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Archive, Edit, Trash2 } from "lucide-react"
import { deleteResolution, archiveResolution } from "@/app/actions/resolutions"
import { toast } from "sonner"

export function ResolutionActions({
  resolution,
  userId,
}: {
  resolution: { id: string; isArchived: boolean; title: string }
  userId: string
}) {
  const router = useRouter()

  const handleArchive = async () => {
    const result = await archiveResolution(userId, resolution.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(resolution.isArchived ? "Resolution unarchived" : "Resolution archived")
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${resolution.title}"? This cannot be undone.`)) {
      return
    }

    const result = await deleteResolution(userId, resolution.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Resolution deleted")
      router.refresh()
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/app/resolutions/${resolution.id}`}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={handleArchive}>
        <Archive className="w-4 h-4 mr-2" />
        {resolution.isArchived ? "Unarchive" : "Archive"}
      </Button>
      <Button variant="outline" size="sm" onClick={handleDelete}>
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  )
}

