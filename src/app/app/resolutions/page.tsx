import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Archive, Edit, Trash2 } from "lucide-react"
import { deleteResolution, archiveResolution } from "@/app/actions/resolutions"
import { ResolutionActions } from "@/components/resolution-actions"

export default async function ResolutionsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const resolutions = await prisma.resolution.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  const activeResolutions = resolutions.filter(r => !r.isArchived)
  const archivedResolutions = resolutions.filter(r => r.isArchived)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Resolutions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your resolutions
          </p>
        </div>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Link href="/app/resolutions/new">
            <Plus className="w-4 h-4 mr-2" />
            New Resolution
          </Link>
        </Button>
      </div>

      {activeResolutions.length === 0 && archivedResolutions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You don't have any resolutions yet.
            </p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Link href="/app/resolutions/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Resolution
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeResolutions.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Active
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeResolutions.map((resolution) => (
                  <ResolutionCard
                    key={resolution.id}
                    resolution={resolution}
                    userId={session.user.id}
                  />
                ))}
              </div>
            </div>
          )}

          {archivedResolutions.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">Archived</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedResolutions.map((resolution) => (
                  <ResolutionCard
                    key={resolution.id}
                    resolution={resolution}
                    userId={session.user.id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ResolutionCard({
  resolution,
  userId,
}: {
  resolution: any
  userId: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{resolution.title}</h3>
            {resolution.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {resolution.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{resolution.category.toLowerCase()}</span>
            <span>•</span>
            <span className="capitalize">{resolution.frequencyType.toLowerCase()}</span>
          </div>
          <ResolutionActions resolution={resolution} userId={userId} />
        </div>
      </CardContent>
    </Card>
  )
}

