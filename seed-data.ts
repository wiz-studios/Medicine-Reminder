import { createClient } from "@supabase/supabase-js"
import { addDays, format, subDays } from "date-fns"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample user ID - this would be replaced with the actual user ID in a real scenario
const userId = "00000000-0000-0000-0000-000000000000"

// Function to seed the database with sample data
async function seedDatabase() {
  console.log("Starting database seeding...")

  // Create sample medicines
  const medicines = [
    {
      user_id: userId,
      name: "Ibuprofen",
      expiry_date: format(addDays(new Date(), 60), "yyyy-MM-dd"),
      quantity: 30,
      unit: "tablets",
      status: "active",
      notes: "Take as needed for pain relief",
      daily_dosage: 2,
      dosage_times: ["08:00", "20:00"],
    },
    {
      user_id: userId,
      name: "Vitamin D",
      expiry_date: format(addDays(new Date(), 120), "yyyy-MM-dd"),
      quantity: 60,
      unit: "tablets",
      status: "active",
      notes: "Take one daily with food",
      daily_dosage: 1,
      dosage_times: ["08:00"],
    },
    {
      user_id: userId,
      name: "Amoxicillin",
      expiry_date: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      quantity: 10,
      unit: "capsules",
      status: "expired",
      notes: "Antibiotic for bacterial infections",
      daily_dosage: 3,
      dosage_times: ["08:00", "14:00", "20:00"],
    },
    {
      user_id: userId,
      name: "Allergy Relief",
      expiry_date: format(addDays(new Date(), 15), "yyyy-MM-dd"),
      quantity: 20,
      unit: "tablets",
      status: "active",
      notes: "Take one daily for allergies",
      daily_dosage: 1,
      dosage_times: ["08:00"],
    },
    {
      user_id: userId,
      name: "Cough Syrup",
      expiry_date: format(addDays(new Date(), 5), "yyyy-MM-dd"),
      quantity: 1,
      unit: "bottles",
      status: "active",
      notes: "Take as needed for cough",
      daily_dosage: 3,
      dosage_times: ["08:00", "14:00", "20:00"],
    },
  ]

  // Insert medicines
  const { error: medicinesError } = await supabase.from("medicines").insert(medicines)

  if (medicinesError) {
    console.error("Error inserting medicines:", medicinesError)
    return
  }

  // Create user settings
  const userSettings = {
    user_id: userId,
    reminder_threshold: 7,
    reminder_type: "in-app",
  }

  // Insert user settings
  const { error: settingsError } = await supabase.from("user_settings").insert([userSettings])

  if (settingsError) {
    console.error("Error inserting user settings:", settingsError)
    return
  }

  console.log("Database seeding completed successfully!")
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("Seeding process finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error during seeding:", error)
    process.exit(1)
  })
