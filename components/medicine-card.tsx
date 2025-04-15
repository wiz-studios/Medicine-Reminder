"use client"

import Link from "next/link"
import {
  cn,
  formatDate,
  getExpiryStatusColor,
  getExpiryStatusText,
  shouldShowDonationPrompt,
  formatTime,
} from "@/lib/utils"
import type { Medicine } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Edit, MapPin, Pill } from "lucide-react"

interface MedicineCardProps {
  medicine: Medicine
  onDonate: (medicine: Medicine) => void
}

export function MedicineCard({ medicine, onDonate }: MedicineCardProps) {
  const statusClass =
    medicine.status === "active"
      ? "medicine-card-active"
      : medicine.status === "expired"
        ? "medicine-card-expired"
        : "medicine-card-donated"

  return (
    <div className={cn("medicine-card p-0", statusClass)}>
      <div className="p-4 pb-2">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 rounded-full p-1.5">
              <Pill className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-lg line-clamp-1">{medicine.name}</h3>
          </div>
          <Badge
            variant={
              medicine.status === "active" ? "default" : medicine.status === "expired" ? "destructive" : "secondary"
            }
            className="rounded-xl"
          >
            {medicine.status.charAt(0).toUpperCase() + medicine.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-medium">
              {medicine.quantity} {medicine.unit}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expires:</span>
            <span className="font-medium">{formatDate(medicine.expiry_date)}</span>
          </div>

          <div className={cn("text-sm font-medium flex justify-between", getExpiryStatusColor(medicine))}>
            <span className="text-muted-foreground">Status:</span>
            <span>{getExpiryStatusText(medicine)}</span>
          </div>

          {medicine.daily_dosage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dosage:</span>
              <span className="font-medium">
                {medicine.daily_dosage} time{medicine.daily_dosage !== 1 ? "s" : ""} daily
              </span>
            </div>
          )}

          {medicine.dosage_times && medicine.dosage_times.length > 0 && (
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <Clock className="h-3 w-3" />
              <span>{medicine.dosage_times.map((time) => formatTime(time)).join(", ")}</span>
            </div>
          )}

          {medicine.notes && (
            <div className="text-sm text-muted-foreground line-clamp-2 italic">"{medicine.notes}"</div>
          )}
        </div>
      </div>

      <div className="flex border-t border-border">
        <Button variant="ghost" size="sm" asChild className="flex-1 rounded-none border-r border-border h-10">
          <Link href={`/medicines/${medicine.id}`}>
            <Edit className="mr-2 h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>

        {shouldShowDonationPrompt(medicine) ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDonate(medicine)}
            className="flex-1 rounded-none text-accent hover:text-accent h-10"
          >
            <MapPin className="mr-2 h-3.5 w-3.5" />
            Donate
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled className="flex-1 rounded-none h-10 opacity-50">
            <MapPin className="mr-2 h-3.5 w-3.5" />
            Donate
          </Button>
        )}
      </div>
    </div>
  )
}
