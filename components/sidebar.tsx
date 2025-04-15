"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LayoutDashboard, PlusCircle, Settings, LogOut, Pill, Heart } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Add Medicine",
    href: "/medicines/new",
    icon: PlusCircle,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="bg-primary/10 rounded-full p-1.5">
            <Pill className="h-5 w-5 text-primary" />
          </div>
          <span>Medicine Reminder</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="mt-6 px-2">
          <div className="rounded-xl bg-accent/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-accent" />
              <h3 className="font-medium">Donate Medicines</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Help others by donating your unused medicines before they expire.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t p-4">
        <Button variant="outline" className="w-full justify-start rounded-xl" onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
