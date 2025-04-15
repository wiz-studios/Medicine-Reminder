"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { UserSettings } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, Save, Bell } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { NumberInput } from "@/components/number-input"

export default function SettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [reminderThreshold, setReminderThreshold] = useState(7)
  const [reminderType, setReminderType] = useState<"email" | "in-app" | "both">("in-app")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setSettings(data)
          setReminderThreshold(data.reminder_threshold)
          setReminderType(data.reminder_type || "in-app")
        } else {
          // Create default settings if none exist
          const { data: newSettings, error: createError } = await supabase
            .from("user_settings")
            .insert([{ user_id: user.id, reminder_threshold: 7, reminder_type: "in-app" }])
            .select()
            .single()

          if (createError) throw createError
          setSettings(newSettings)
          setReminderThreshold(newSettings.reminder_threshold)
          setReminderType(newSettings.reminder_type || "in-app")
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        setError("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !settings) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          reminder_threshold: reminderThreshold,
          reminder_type: reminderType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)
        .eq("user_id", user.id)

      if (error) throw error
      setSuccessMessage("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
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
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <Card className="rounded-2xl shadow-soft">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure when you want to be notified about expiring medicines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert variant="success" className="bg-accent/10 text-accent rounded-xl border border-accent/20">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="reminderThreshold" className="text-base">
                Reminder Threshold (Days)
              </Label>
              <NumberInput
                value={reminderThreshold}
                onChange={setReminderThreshold}
                min={1}
                max={90}
                step={1}
                showSlider={true}
                unit="days"
                label="Notify me when medicines expire within:"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="reminderType" className="text-base">
                Reminder Type
              </Label>
              <RadioGroup
                value={reminderType}
                onValueChange={(value) => setReminderType(value as "email" | "in-app" | "both")}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="in-app" id="in-app" />
                  <Label htmlFor="in-app" className="font-normal cursor-pointer flex-1">
                    In-app notifications only
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="font-normal cursor-pointer flex-1">
                    Email notifications only
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="font-normal cursor-pointer flex-1">
                    Both in-app and email notifications
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="rounded-xl">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
