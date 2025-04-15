# 💊 Expired Medicine Reminder App

A simple and smart web app that helps users keep track of their medicines, get reminders before they expire, and optionally donate unused medicines before they go to waste.

---

## 🚀 Features

- ✅ **Medicine Tracking**: Add medicine name, quantity, expiration date, and dosage frequency (e.g., 1x3).
- ⏰ **Smart Reminders**:
  - Get notified 10 minutes before each dose.
  - Receive warnings when medicine is about to expire.
- 💾 **Supabase Integration**: Secure user login and cloud database for storing medicine records.
- ❤️ **Donate Button**: Mark unused medicine as donated to avoid waste.
- 📱 **Mobile Ready**: Built to convert easily into a mobile app using Expo for Android.
- 🛡️ **Secure**: All user data protected via Supabase row-level security and auth.

---

## 🧠 Tech Stack

- **Frontend**: React / React Native (Expo for mobile)
- **Backend**: Supabase (Auth + Database)
- **Reminders**: `expo-notifications` for push/local notifications
- **Date Handling**: `date-fns`
- **UI Styling**: Tailwind CSS / NativeBase / Expo components (depending on platform)

---

## 📦 How to Run (Web)

```bash
git clone https://github.com/YOUR_USERNAME/expired-medicine-reminder.git
cd expired-medicine-reminder
npm install
npm run dev
