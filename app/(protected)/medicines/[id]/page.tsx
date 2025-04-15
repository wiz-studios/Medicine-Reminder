"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Medicine, MedicineFormData } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowLeft, Loader2, Trash2, Pill, Calendar, Package, FileText, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

// Import our enhanced components
import { EnhancedTimePicker } from "@/components/enhanced-time-picker"
import { NumberInput } from "@/components/number-input"
import { cn } from "@/lib/utils"

export default function MedicinePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const isNew = params.id === "new"
  const [medicine, setMedicine] = useState<MedicineFormData>({
    name: "",
    expiry_date: format(new Date(), "yyyy-MM-dd"),
    quantity: 1,
    unit: "tablets",
    notes: "",
    image_url: "",
    daily_dosage: 1,
    dosage_times: ["08:00"],
  })
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user || isNew) return

    const fetchMedicine = async () => {
      try {
        const { data, error } = await supabase
          .from("medicines")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()

        if (error) throw error
        if (!data) {
          router.push("/dashboard")
          return
        }

        setMedicine({
          name: data.name,
          expiry_date: data.expiry_date,
          quantity: data.quantity,
          unit: data.unit,
          notes: data.notes || "",
          image_url: data.image_url || "",
          status: data.status,
          daily_dosage: data.daily_dosage || 1,
          dosage_times: data.dosage_times || ["08:00"],
        })
      } catch (error) {
        console.error("Error fetching medicine:", error)
        setError("Failed to load medicine details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedicine()
  }, [user, params.id, isNew, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMedicine((prev) => ({ ...prev, [name]: value }))

    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setMedicine((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!medicine.name.trim()) {
      errors.name = "Medicine name is required"
    }

    if (!medicine.expiry_date) {
      errors.expiry_date = "Expiry date is required"
    }

    if (medicine.quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0"
    }

    if (medicine.daily_dosage < 0 || medicine.daily_dosage > 10) {
      errors.daily_dosage = "Daily dosage must be between 0 and 10"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const expiryDate = new Date(medicine.expiry_date)

      // Determine status based on expiry date
      const status = medicine.status || (expiryDate < today ? "expired" : "active")

      if (isNew) {
        const { error } = await supabase.from("medicines").insert([
          {
            ...medicine,
            user_id: user.id,
            status,
          },
        ])

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("medicines")
          .update({
            ...medicine,
            status,
            updated_at: new Date().toISOString(),
            daily_dosage: medicine.daily_dosage,
            dosage_times: medicine.dosage_times,
          })
          .eq("id", params.id)
          .eq("user_id", user.id)

        if (error) throw error
      }

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving medicine:", error)
      setError("Failed to save medicine")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user || isNew || !confirm("Are you sure you want to delete this medicine?")) return

    setIsSaving(true)
    setError(null)

    try {
      const { error } = await supabase.from("medicines").delete().eq("id", params.id).eq("user_id", user.id)

      if (error) throw error
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting medicine:", error)
      setError("Failed to delete medicine")
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = (status: string) => {
    setMedicine((prev) => ({ ...prev, status: status as Medicine["status"] }))
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4 rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{isNew ? "Add Medicine" : "Edit Medicine"}</h1>
      </div>

      <Card className="rounded-2xl shadow-soft">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              {isNew ? "Add a new medicine" : "Edit medicine details"}
            </CardTitle>
            <CardDescription>Fill in the details of your medicine to keep track of its expiry date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                <Pill className="h-4 w-4" />
                Medicine Name
              </Label>
              <Input
                id="name"
                name="name"
                value={medicine.name}
                onChange={handleChange}
                className={cn("rounded-xl", validationErrors.name && "border-red-500 focus-visible:ring-red-500")}
                required
              />
              {validationErrors.name && <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Expiry Date
              </Label>
              <Input
                id="expiry_date"
                name="expiry_date"
                type="date"
                value={medicine.expiry_date}
                onChange={handleChange}
                className={cn(
                  "rounded-xl",
                  validationErrors.expiry_date && "border-red-500 focus-visible:ring-red-500",
                )}
                required
              />
              {validationErrors.expiry_date && (
                <p className="text-xs text-red-500 mt-1">{validationErrors.expiry_date}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  Quantity
                </Label>
                <NumberInput
                  value={medicine.quantity}
                  onChange={(value) => {
                    setMedicine((prev) => ({ ...prev, quantity: value }))
                    if (validationErrors.quantity) {
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.quantity
                        return newErrors
                      })
                    }
                  }}
                  min={1}
                  max={1000}
                  error={validationErrors.quantity}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={medicine.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                  <SelectTrigger id="unit" className="rounded-xl">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="capsules">Capsules</SelectItem>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="mg">Milligrams (mg)</SelectItem>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isNew && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={medicine.status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status" className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="donated">Donated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="daily_dosage" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Daily Dosage
              </Label>
              <NumberInput
                value={medicine.daily_dosage}
                onChange={(value) => {
                  // Adjust dosage_times array based on new daily_dosage
                  let newDosageTimes = [...(medicine.dosage_times || [])]
                  if (value > newDosageTimes.length) {
                    // Add more time slots if needed
                    while (newDosageTimes.length < value) {
                      newDosageTimes.push("08:00")
                    }
                  } else if (value < newDosageTimes.length) {
                    // Remove extra time slots
                    newDosageTimes = newDosageTimes.slice(0, value)
                  }

                  setMedicine((prev) => ({
                    ...prev,
                    daily_dosage: value,
                    dosage_times: newDosageTimes,
                  }))

                  if (validationErrors.daily_dosage) {
                    setValidationErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.daily_dosage
                      return newErrors
                    })
                  }
                }}
                min={0}
                max={10}
                step={1}
                showSlider={true}
                unit="times per day"
                error={validationErrors.daily_dosage}
              />
            </div>

            {medicine.daily_dosage > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Dosage Times
                </Label>
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
                  {medicine.dosage_times?.map((time, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <EnhancedTimePicker
                          value={time}
                          onChange={(newTime) => {
                            setMedicine((prev) => {
                              const newDosageTimes = [...(prev.dosage_times || [])]
                              newDosageTimes[index] = newTime
                              return { ...prev, dosage_times: newDosageTimes }
                            })
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={medicine.notes}
                onChange={handleChange}
                rows={3}
                className="rounded-xl"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {!isNew && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSaving}
                className="rounded-xl"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="rounded-xl">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Medicine"
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
