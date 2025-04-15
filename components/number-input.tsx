"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  showSlider?: boolean
  className?: string
  inputClassName?: string
  label?: string
  unit?: string
  error?: string
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showSlider = false,
  className,
  inputClassName,
  label,
  unit,
  error,
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState<string>(value.toString())
  const [isFocused, setIsFocused] = useState(false)

  // Update local value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toString())
    }
  }, [value, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    // Allow empty string for typing
    if (newValue === "") {
      setLocalValue("")
      return
    }

    // Only allow numbers
    if (!/^\d*\.?\d*$/.test(newValue)) {
      return
    }

    setLocalValue(newValue)
  }

  const handleBlur = () => {
    setIsFocused(false)

    // Parse the value and ensure it's within bounds
    let parsedValue = Number.parseFloat(localValue)

    if (isNaN(parsedValue)) {
      parsedValue = min
    } else {
      parsedValue = Math.max(min, Math.min(max, parsedValue))
    }

    // Round to nearest step if needed
    if (step !== 0) {
      parsedValue = Math.round(parsedValue / step) * step
    }

    setLocalValue(parsedValue.toString())
    onChange(parsedValue)
  }

  const increment = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
    setLocalValue(newValue.toString())
  }

  const decrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
    setLocalValue(newValue.toString())
  }

  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0])
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <div className="text-sm font-medium">{label}</div>}

      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className="h-9 w-9 rounded-xl flex-shrink-0"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="relative flex-1">
          <Input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            className={cn(
              "pr-8 rounded-xl text-center",
              error && "border-red-500 focus-visible:ring-red-500",
              inputClassName,
            )}
            aria-invalid={!!error}
          />
          {unit && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              {unit}
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className="h-9 w-9 rounded-xl flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showSlider && (
        <Slider value={[value]} min={min} max={max} step={step} onValueChange={handleSliderChange} className="py-2" />
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
