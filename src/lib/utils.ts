import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatEventCountdown(startDate: string | null, endDate: string | null) {
  if (!startDate) return "Date TBC"
  const toUtcDay = (d: string) => {
    const [y, m, day] = d.split("-").map(Number)
    return Date.UTC(y, m - 1, day)
  }
  const todayMs = toUtcDay(new Date().toISOString().slice(0, 10))
  const startMs = toUtcDay(startDate)
  const endMs = endDate ? toUtcDay(endDate) : startMs
  const dayMs = 86_400_000

  if (todayMs >= startMs && todayMs <= endMs) return "Live now"
  const diffDays = Math.round((startMs - todayMs) / dayMs)
  if (diffDays < 0) return "In progress"
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays <= 13) return `In ${diffDays} days`
  if (diffDays <= 55) return `In ${Math.round(diffDays / 7)} weeks`
  return `In ${Math.round(diffDays / 30)} months`
}
