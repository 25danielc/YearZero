"use client"

import { getXpProgress, getXpForNextLevel } from "@/lib/utils"
import { Progress } from "./ui/progress"
import { Sparkles } from "lucide-react"

interface XPProgressProps {
  level: number
  totalXp: number
  compact?: boolean
}

export function XPProgress({ level, totalXp, compact = false }: XPProgressProps) {
  const progress = getXpProgress(totalXp)
  const xpNeeded = getXpForNextLevel(totalXp)

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-[120px]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-sm font-bold">Lv {level}</span>
        </div>
        <Progress value={progress} className="h-2 flex-1" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 min-w-[220px] bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 px-3 py-2 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
      <div className="text-right">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <div className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Level {level}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{xpNeeded} XP to next</div>
      </div>
      <div className="flex-1 space-y-1">
        <Progress value={progress} className="h-2.5" />
        <div className="text-xs text-muted-foreground text-right font-medium">{totalXp} XP</div>
      </div>
    </div>
  )
}

