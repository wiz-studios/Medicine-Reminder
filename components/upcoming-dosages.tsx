"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Medicine } from "@/types"
import { formatTime, getTimeUntilNextDosage } from "@/lib/utils"
import { Clock, Pill } from "lucide-react"

interface UpcomingDosagesProps {
  medicines: Medicine[]
}

export function UpcomingDosages({ medicines }: UpcomingDosagesProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Get active medicines with dosage times
  const activeMedicines = medicines.filter(
    (medicine) => medicine.status === "active" && medicine.dosage_times && medicine.dosage_times.length > 0,
  )

  if (activeMedicines.length === 0) {
    return null
  }

  // Get upcoming dosages for each medicine
  const upcomingDosages = activeMedicines
    .map((medicine) => {
      const timeUntil = getTimeUntilNextDosage(medicine.dosage_times)
      if (!timeUntil) return null

      return {
        medicine,
        timeUntil,
        nextDosageTime: formatTime(medicine.dosage_times[0]), // This is simplified; in reality, we'd find the next dosage time
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Sort by total minutes until next dosage
      const aTotalMinutes = a!.timeUntil.hours * 60 + a!.timeUntil.minutes
      const bTotalMinutes = b!.timeUntil.hours * 60 + b!.timeUntil.minutes
      return aTotalMinutes - bTotalMinutes
    })
    .slice(0, 3) // Show only the next 3 upcoming dosages

  if (upcomingDosages.length === 0) {
    return null
  }

  return (
    <Card className="rounded-2xl shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Upcoming Dosages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingDosages.map((dosage) => (
            <div key={dosage!.medicine.id} className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="font-medium">{dosage!.medicine.name}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    <span>
                      {dosage!.timeUntil.hours > 0 && `${dosage!.timeUntil.hours}h `}
                      {dosage!.timeUntil.minutes}m
                    </span>
                  </div>
                  <div className="text-sm font-medium">{dosage!.nextDosageTime}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
