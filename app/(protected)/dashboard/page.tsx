"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Medicine, UserSettings } from "@/types"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, PlusCircle, Clock, Search } from "lucide-react"
import { DonateModal } from "@/components/donate-modal"
import { UpcomingDosages } from "@/components/upcoming-dosages"
import { MedicineCard } from "@/components/medicine-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { user } = useAuth()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("asc")
  const [donationMedicine, setDonationMedicine] = useState<Medicine | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch medicines
        const { data: medicinesData, error: medicinesError } = await supabase
          .from("medicines")
          .select("*")
          .eq("user_id", user.id)
          .order("expiry_date", { ascending: true })

        if (medicinesError) throw medicinesError
        setMedicines(medicinesData || [])

        // Fetch user settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (settingsError && settingsError.code !== "PGRST116") {
          throw settingsError
        }

        if (settingsData) {
          setUserSettings(settingsData)
        } else {
          // Create default settings if none exist
          const { data: newSettings, error: createError } = await supabase
            .from("user_settings")
            .insert([{ user_id: user.id, reminder_threshold: 7, reminder_type: "in-app" }])
            .select()
            .single()

          if (createError) throw createError
          setUserSettings(newSettings)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  useEffect(() => {
    if (!medicines.length) {
      setFilteredMedicines([])
      return
    }

    let filtered = [...medicines]

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((medicine) => medicine.status === statusFilter)
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (medicine) => medicine.name.toLowerCase().includes(term) || medicine.notes?.toLowerCase().includes(term),
      )
    }

    // Apply sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.expiry_date).getTime()
      const dateB = new Date(b.expiry_date).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

    setFilteredMedicines(filtered)
  }, [medicines, searchTerm, statusFilter, sortOrder])

  const expiringMedicines = medicines.filter((medicine) => {
    if (medicine.status !== "active") return false

    const expiryDate = new Date(medicine.expiry_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays >= 0 && diffDays <= (userSettings?.reminder_threshold || 7)
  })

  const handleDonate = (medicine: Medicine) => {
    setDonationMedicine(medicine)
  }

  const handleDonationComplete = async (medicine: Medicine) => {
    try {
      const { error } = await supabase
        .from("medicines")
        .update({
          status: "donated",
          updated_at: new Date().toISOString(),
        })
        .eq("id", medicine.id)
        .eq("user_id", user.id)

      if (error) throw error

      // Update the local state
      setMedicines((prev) => prev.map((m) => (m.id === medicine.id ? { ...m, status: "donated" } : m)))

      setDonationMedicine(null)
    } catch (error) {
      console.error("Error donating medicine:", error)
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
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage your medicines and track expiry dates</p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/medicines/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Medicine
          </Link>
        </Button>
      </div>

      {expiringMedicines.length > 0 && (
        <Alert variant="warning" className="bg-warning/10 border border-warning/20 text-warning-foreground rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Medicines Expiring Soon</AlertTitle>
          <AlertDescription>
            You have {expiringMedicines.length} medicine{expiringMedicines.length > 1 ? "s" : ""} expiring within the
            next {userSettings?.reminder_threshold || 7} days.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search medicines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <div className="w-40">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="donated">Donated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Sort by expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Expiring Soon</SelectItem>
                      <SelectItem value="desc">Expiring Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full max-w-xs grid-cols-2 rounded-xl p-1">
                <TabsTrigger value="grid" className="rounded-lg">
                  Grid View
                </TabsTrigger>
                <TabsTrigger value="list" className="rounded-lg">
                  List View
                </TabsTrigger>
              </TabsList>
              <TabsContent value="grid" className="mt-4">
                {filteredMedicines.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No medicines found</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/medicines/new">Add your first medicine</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredMedicines.map((medicine) => (
                      <MedicineCard key={medicine.id} medicine={medicine} onDonate={handleDonate} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="list" className="mt-4">
                {filteredMedicines.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                    <p className="text-muted-foreground">No medicines found</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/medicines/new">Add your first medicine</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMedicines.map((medicine) => (
                      <MedicineCard key={medicine.id} medicine={medicine} onDonate={handleDonate} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          <UpcomingDosages medicines={medicines} />

          <Card className="rounded-2xl shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start rounded-xl" variant="outline" asChild>
                <Link href="/medicines/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Medicine
                </Link>
              </Button>
              <Button className="w-full justify-start rounded-xl" variant="outline" asChild>
                <Link href="/settings">
                  <Clock className="mr-2 h-4 w-4" />
                  Manage Reminders
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {donationMedicine && (
        <DonateModal
          medicine={donationMedicine}
          onClose={() => setDonationMedicine(null)}
          onDonate={handleDonationComplete}
        />
      )}
    </div>
  )
}
