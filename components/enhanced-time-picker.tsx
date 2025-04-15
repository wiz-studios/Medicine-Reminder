"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  className?: string
}

export function EnhancedTimePicker({ value, onChange, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState(() => {
    const [h] = value.split(":").map(Number)
    return h
  })
  const [minutes, setMinutes] = useState(() => {
    const [, m] = value.split(":").map(Number)
    return m
  })
  const [period, setPeriod] = useState<"AM" | "PM">(() => {
    const [h] = value.split(":").map(Number)
    return h >= 12 ? "PM" : "AM"
  })
  const [activeTab, setActiveTab] = useState<string>("clock")

  // Format the time for display
  const formattedTime = () => {
    const h = hours % 12 === 0 ? 12 : hours % 12
    const m = minutes.toString().padStart(2, "0")
    return `${h}:${m} ${period}`
  }

  // Format the time in 24-hour format for the value
  const formatTimeValue = () => {
    let h = hours
    if (period === "PM" && h < 12) h += 12
    if (period === "AM" && h === 12) h = 0
    return `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Update the time when any component changes
  useEffect(() => {
    onChange(formatTimeValue())
  }, [hours, minutes, period])

  // Handle increment/decrement for hours and minutes
  const incrementHours = () => {
    setHours((prev) => (prev + 1) % 24)
  }

  const decrementHours = () => {
    setHours((prev) => (prev - 1 + 24) % 24)
  }

  const incrementMinutes = () => {
    setMinutes((prev) => (prev + 5) % 60)
  }

  const decrementMinutes = () => {
    setMinutes((prev) => (prev - 5 + 60) % 60)
  }

  const togglePeriod = () => {
    setPeriod((prev) => (prev === "AM" ? "PM" : "AM"))
    if (period === "AM") {
      setHours((prev) => (prev + 12) % 24)
    } else {
      setHours((prev) => (prev - 12 + 24) % 24)
    }
  }

  // Common time presets
  const timePresets = [
    { label: "Morning", time: "08:00" },
    { label: "Noon", time: "12:00" },
    { label: "Afternoon", time: "15:00" },
    { label: "Evening", time: "18:00" },
    { label: "Night", time: "21:00" },
    { label: "Bedtime", time: "22:00" },
  ]

  const selectPreset = (preset: string) => {
    const [h, m] = preset.split(":").map(Number)
    setHours(h)
    setMinutes(m)
    setPeriod(h >= 12 ? "PM" : "AM")
    onChange(preset)
  }

  // Generate clock face numbers
  const clockNumbers = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[140px] justify-start text-left font-normal rounded-xl",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4 text-primary" />
          {formattedTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 rounded-xl" align="start">
        <Tabs defaultValue="clock" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium">Select Time</h3>
            <TabsList className="grid grid-cols-2 h-8 rounded-lg">
              <TabsTrigger value="clock" className="text-xs rounded-md">
                Clock
              </TabsTrigger>
              <TabsTrigger value="presets" className="text-xs rounded-md">
                Presets
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="clock" className="p-4 pb-2">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementHours}
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="w-12 h-12 flex items-center justify-center text-xl font-semibold bg-primary/5 rounded-full">
                    {hours % 12 === 0 ? 12 : hours % 12}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementHours}
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-xl font-bold">:</div>

                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementMinutes}
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <div className="w-12 h-12 flex items-center justify-center text-xl font-semibold bg-primary/5 rounded-full">
                    {minutes.toString().padStart(2, "0")}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementMinutes}
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant={period === "AM" ? "default" : "outline"}
                  size="sm"
                  onClick={togglePeriod}
                  className="ml-2 h-12 rounded-xl"
                >
                  AM
                </Button>
                <Button
                  variant={period === "PM" ? "default" : "outline"}
                  size="sm"
                  onClick={togglePeriod}
                  className="h-12 rounded-xl"
                >
                  PM
                </Button>
              </div>
            </div>

            <div className="relative mt-4 mb-2">
              <div className="w-[220px] h-[220px] mx-auto relative rounded-full bg-primary/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                {clockNumbers.map((num) => {
                  const angle = (num * 30 - 90) * (Math.PI / 180)
                  const x = 90 * Math.cos(angle) + 110
                  const y = 90 * Math.sin(angle) + 110
                  const isSelected = (hours % 12 || 12) === num

                  return (
                    <Button
                      key={num}
                      variant={isSelected ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        const newHours = period === "AM" ? num % 12 : (num % 12) + 12
                        setHours(newHours === 24 ? 0 : newHours)
                      }}
                      className={cn(
                        "absolute w-10 h-10 rounded-full p-0 flex items-center justify-center",
                        isSelected && "bg-primary text-primary-foreground",
                      )}
                      style={{
                        left: `${x - 20}px`,
                        top: `${y - 20}px`,
                      }}
                    >
                      {num}
                    </Button>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {timePresets.map((preset) => (
                <Button
                  key={preset.time}
                  variant="outline"
                  size="sm"
                  onClick={() => selectPreset(preset.time)}
                  className={cn("justify-start rounded-xl", value === preset.time && "border-primary bg-primary/5")}
                >
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  {preset.label}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">{formattedTime()}</div>
          <Button size="sm" onClick={() => setIsOpen(false)} className="rounded-xl">
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
