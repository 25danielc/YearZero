"use client"

import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  streak: number
  isOnTrack?: boolean
  className?: string
}

export function StreakBadge({ streak, isOnTrack = false, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm transition-all",
        isOnTrack
          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-2 border-orange-300 shadow-orange-200"
          : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 border border-gray-300",
        className
      )}
    >
      <Flame className={cn("w-4 h-4", isOnTrack && "animate-bounce")} />
      <span>{streak}</span>
      {isOnTrack && <span className="text-xs ml-0.5">🔥</span>}
    </div>
  )
}

