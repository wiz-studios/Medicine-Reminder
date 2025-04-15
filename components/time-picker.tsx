"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState(() => {
    const [h] = value.split(":").map(Number)
    return h.toString().padStart(2, "0")
  })
  const [minutes, setMinutes] = useState(() => {
    const [, m] = value.split(":").map(Number)
    return m.toString().padStart(2, "0")
  })

  const hoursInputRef = useRef<HTMLInputElement>(null)
  const minutesInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && hoursInputRef.current) {
      hoursInputRef.current.focus()
      hoursInputRef.current.select()
    }
  }, [isOpen])

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = e.target.value
    if (/^\d{0,2}$/.test(newHours)) {
      setHours(newHours)
      if (newHours.length === 2) {
        const hoursNum = Number.parseInt(newHours, 10)
        if (hoursNum >= 0 && hoursNum <= 23) {
          minutesInputRef.current?.focus()
          minutesInputRef.current?.select()
        }
      }
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = e.target.value
    if (/^\d{0,2}$/.test(newMinutes)) {
      setMinutes(newMinutes)
    }
  }

  const handleBlur = () => {
    const hoursNum = Number.parseInt(hours, 10) || 0
    const minutesNum = Number.parseInt(minutes, 10) || 0

    const validHours = Math.min(Math.max(hoursNum, 0), 23)
    const validMinutes = Math.min(Math.max(minutesNum, 0), 59)

    const formattedHours = validHours.toString().padStart(2, "0")
    const formattedMinutes = validMinutes.toString().padStart(2, "0")

    setHours(formattedHours)
    setMinutes(formattedMinutes)

    onChange(`${formattedHours}:${formattedMinutes}`)
  }

  const handleApply = () => {
    handleBlur()
    setIsOpen(false)
  }

  const commonTimeButtons = [
    { label: "Morning", time: "08:00" },
    { label: "Noon", time: "12:00" },
    { label: "Evening", time: "18:00" },
    { label: "Night", time: "21:00" },
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[120px] justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Time</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={hoursInputRef}
                value={hours}
                onChange={handleHoursChange}
                onBlur={handleBlur}
                className="w-[60px]"
                placeholder="HH"
                maxLength={2}
              />
              <span className="text-center">:</span>
              <Input
                ref={minutesInputRef}
                value={minutes}
                onChange={handleMinutesChange}
                onBlur={handleBlur}
                className="w-[60px]"
                placeholder="MM"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Common Times</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonTimeButtons.map((item) => (
                <Button
                  key={item.time}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const [h, m] = item.time.split(":").map(Number)
                    setHours(h.toString().padStart(2, "0"))
                    setMinutes(m.toString().padStart(2, "0"))
                    onChange(item.time)
                  }}
                >
                  {item.label} ({item.time})
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
