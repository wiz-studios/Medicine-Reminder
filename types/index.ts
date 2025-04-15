export type Medicine = {
  id: string
  user_id: string
  name: string
  expiry_date: string
  quantity: number
  unit: string
  status: "active" | "expired" | "donated"
  notes?: string
  image_url?: string
  daily_dosage: number
  dosage_times: string[]
  created_at: string
  updated_at: string
}

export type UserSettings = {
  id: string
  user_id: string
  reminder_threshold: number
  reminder_type: "email" | "in-app" | "both"
  created_at: string
  updated_at: string
}

export type MedicineFormData = Omit<Medicine, "id" | "user_id" | "created_at" | "updated_at" | "status"> & {
  status?: "active" | "expired" | "donated"
}
