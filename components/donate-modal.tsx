"use client"

import { useState } from "react"
import type { Medicine } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { Loader2, MapPin, Check, Heart } from "lucide-react"

interface DonateModalProps {
  medicine: Medicine
  onClose: () => void
  onDonate: (medicine: Medicine) => Promise<void>
}

export function DonateModal({ medicine, onClose, onDonate }: DonateModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)

  const handleDonate = async () => {
    setIsLoading(true)
    try {
      await onDonate(medicine)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" />
            Donate Medicine
          </DialogTitle>
          <DialogDescription>Mark this medicine as donated and find nearby donation locations.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium text-lg">{medicine.name}</h3>
            <p className="text-sm text-muted-foreground">
              {medicine.quantity} {medicine.unit} • Expires: {formatDate(medicine.expiry_date)}
            </p>
          </div>

          <div className="rounded-xl bg-muted p-4">
            <p className="text-sm">Donating unused medicine helps others in need. Please ensure the medicine is:</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-accent" />
                Not expired
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-accent" />
                In original packaging
              </li>
              <li className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-accent" />
                Not opened (if applicable)
              </li>
            </ul>
          </div>

          {showMap ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Nearby Donation Locations</h4>
              <div className="h-[200px] rounded-xl bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Map would be displayed here</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: In a production app, this would show a Google Maps integration with nearby pharmacies and donation
                centers.
              </p>
            </div>
          ) : (
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowMap(true)}>
              <MapPin className="mr-2 h-4 w-4" />
              Find Donation Locations
            </Button>
          )}
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleDonate}
            disabled={isLoading}
            className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Mark as Donated
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
