import type { Medicine } from "@/types"
import { format, differenceInDays, parse } from "date-fns"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(typeof date === "string" ? new Date(date) : date, "MMM dd, yyyy")
}

export function getDaysUntilExpiry(expiryDate: string | Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate
  return differenceInDays(expiry, today)
}

export function getMedicineStatus(
  medicine: Pick<Medicine, "expiry_date" | "status">,
): "active" | "expired" | "donated" {
  if (medicine.status === "donated") return "donated"

  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date)
  return daysUntilExpiry < 0 ? "expired" : "active"
}

export function shouldShowDonationPrompt(medicine: Pick<Medicine, "expiry_date" | "status">): boolean {
  if (medicine.status !== "active") return false

  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date)
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30
}

export function getExpiryStatusColor(medicine: Pick<Medicine, "expiry_date" | "status">): string {
  if (medicine.status === "donated") return "text-blue-600 dark:text-blue-400"

  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date)

  if (daysUntilExpiry < 0) return "text-red-600 dark:text-red-400"
  if (daysUntilExpiry <= 7) return "text-amber-600 dark:text-amber-400"
  if (daysUntilExpiry <= 30) return "text-yellow-600 dark:text-yellow-400"
  return "text-green-600 dark:text-green-400"
}

export function getExpiryStatusText(medicine: Pick<Medicine, "expiry_date" | "status">): string {
  if (medicine.status === "donated") return "Donated"

  const daysUntilExpiry = getDaysUntilExpiry(medicine.expiry_date)

  if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)} days ago`
  if (daysUntilExpiry === 0) return "Expires today"
  if (daysUntilExpiry === 1) return "Expires tomorrow"
  return `Expires in ${daysUntilExpiry} days`
}

export function formatTime(timeString: string): string {
  try {
    const date = parse(timeString, "HH:mm", new Date())
    return format(date, "h:mm a")
  } catch (error) {
    return timeString
  }
}

export function getNextDosageTime(dosageTimes: string[]): string | null {
  if (!dosageTimes || dosageTimes.length === 0) return null

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  // Convert all dosage times to minutes since midnight for comparison
  const dosageTimesInMinutes = dosageTimes.map((time) => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  })

  // Find the next dosage time that is after the current time
  let nextDosageTimeInMinutes = dosageTimesInMinutes.find((time) => time > currentTimeInMinutes)

  // If no dosage time is found for today, get the first dosage time for tomorrow
  if (nextDosageTimeInMinutes === undefined) {
    nextDosageTimeInMinutes = Math.min(...dosageTimesInMinutes)
  }

  // Convert back to HH:MM format
  const nextHours = Math.floor(nextDosageTimeInMinutes / 60)
  const nextMinutes = nextDosageTimeInMinutes % 60
  return `${nextHours.toString().padStart(2, "0")}:${nextMinutes.toString().padStart(2, "0")}`
}

export function getTimeUntilNextDosage(dosageTimes: string[]): { hours: number; minutes: number } | null {
  const nextDosageTime = getNextDosageTime(dosageTimes)
  if (!nextDosageTime) return null

  const now = new Date()
  const [nextHours, nextMinutes] = nextDosageTime.split(":").map(Number)

  const nextDosageDate = new Date(now)
  nextDosageDate.setHours(nextHours, nextMinutes, 0, 0)

  // If the next dosage time is earlier today, it means it's for tomorrow
  if (nextDosageDate < now) {
    nextDosageDate.setDate(nextDosageDate.getDate() + 1)
  }

  const diffMs = nextDosageDate.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return { hours: diffHours, minutes: diffMinutes }
}
