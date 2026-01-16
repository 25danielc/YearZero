import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ResolutionForm } from "@/components/resolution-form"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function NewResolutionPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          New Resolution
        </h1>
        <p className="text-muted-foreground mt-1">
          Create a new resolution to track
        </p>
      </div>

      <ResolutionForm userId={session.user.id} />
    </div>
  )
}

