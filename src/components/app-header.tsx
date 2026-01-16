"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Home } from "lucide-react"
import { XPProgress } from "./xp-progress"

interface AppHeaderProps {
  level: number
  totalXp: number
  streakSummary?: number
}

export function AppHeader({ level, totalXp, streakSummary }: AppHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/app" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                YearZero
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/app" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/app/resolutions" className="text-sm text-muted-foreground hover:text-foreground">
                Resolutions
              </Link>
              <Link href="/app/checkin" className="text-sm text-muted-foreground hover:text-foreground">
                Check In
              </Link>
              <Link href="/app/review" className="text-sm text-muted-foreground hover:text-foreground">
                Review
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {streakSummary !== undefined && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold shadow-sm">
                🔥 <span>{streakSummary}</span> day combo
              </div>
            )}
            <XPProgress level={level} totalXp={totalXp} />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/app/settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

