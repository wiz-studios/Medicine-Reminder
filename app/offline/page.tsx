import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <WifiOff className="h-16 w-16 text-muted-foreground" />
      <h1 className="mt-6 text-3xl font-bold">You're offline</h1>
      <p className="mt-2 text-muted-foreground">Please check your internet connection and try again.</p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Try again</Link>
      </Button>
    </div>
  )
}
