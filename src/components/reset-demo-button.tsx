"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ResetDemoButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!confirm("This will delete all your data and reset with demo data. Continue?")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/reset-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const result = await response.json()

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Demo data loaded!")
      router.push("/app")
      router.refresh()
    } catch (error) {
      toast.error("Failed to reset demo data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleReset} disabled={loading}>
      {loading ? "Resetting..." : "Reset with Demo Data"}
    </Button>
  )
}

