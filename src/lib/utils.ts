import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function getDateString(date: Date = new Date()): string {
  return formatDate(date)
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday as start
  const monday = new Date(d.setDate(diff))
  return formatDate(monday)
}

export function getMonthString(date: Date = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getDaysInRange(start: string, end: string): string[] {
  const dates: string[] = []
  const startDate = new Date(start)
  const endDate = new Date(end)
  const current = new Date(startDate)

  while (current <= endDate) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export function getWeeksInRange(start: string, end: string): string[] {
  const weeks: string[] = []
  const startDate = new Date(start)
  const endDate = new Date(end)
  let current = new Date(startDate)
  
  // Align to Monday
  const day = current.getDay()
  const diff = current.getDate() - day + (day === 0 ? -6 : 1)
  current = new Date(current.setDate(diff))

  while (current <= endDate) {
    weeks.push(getWeekStart(current))
    current.setDate(current.getDate() + 7)
  }

  return weeks
}

export function getLevelFromXp(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1
}

export function getXpForNextLevel(totalXp: number): number {
  const currentLevel = getLevelFromXp(totalXp)
  const xpForNextLevel = currentLevel * 100
  return xpForNextLevel - totalXp
}

export function getXpProgress(totalXp: number): number {
  const currentLevel = getLevelFromXp(totalXp)
  const xpForCurrentLevel = (currentLevel - 1) * 100
  const xpInCurrentLevel = totalXp - xpForCurrentLevel
  return (xpInCurrentLevel / 100) * 100
}

