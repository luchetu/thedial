"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRegions } from "@/features/phone-numbers/hooks/useRegions"
import { useSearchPhoneNumbers } from "@/features/phone-numbers/hooks/useSearchPhoneNumbers"
import { useBuyPhoneNumber } from "@/features/phone-numbers/hooks/useBuyPhoneNumber"
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser"
import type { AvailablePhoneNumber } from "@/features/phone-numbers/types"
import type { ApiError } from "@/lib/http/client"

export function BuyPhoneNumberForm() {
  const [regionOpen, setRegionOpen] = React.useState(false)
  const [selectedRegion, setSelectedRegion] = React.useState("")
  const [areaCode, setAreaCode] = React.useState("")
  const [buyError, setBuyError] = React.useState<string | null>(null)
  const [selectedNumbers, setSelectedNumbers] = React.useState<Set<string>>(new Set())

  // Fetch available regions from backend
  const { data: regions, isLoading: isLoadingRegions, error: regionsError } = useRegions()
  const regionsToDisplay = regions || []

  // Fetch phone numbers automatically when region is selected
  const { data, isLoading, error } = useSearchPhoneNumbers({
    country: selectedRegion,
    type: "local",
    areaCode: areaCode || undefined,
  })

  const searchResults = data?.numbers || []
  const isSearching = isLoading

  // Clear selection when search results change
  React.useEffect(() => {
    setSelectedNumbers(new Set())
  }, [data])

  // Get current user for buy operation
  const { data: user } = useCurrentUser()
  const buyMutation = useBuyPhoneNumber()

  const handleBuySelected = async () => {
    if (!user?.id || selectedNumbers.size === 0) {
      return
    }

    const numbersToBuy = searchResults.filter(n => selectedNumbers.has(n.phoneNumber))
    
    try {
      setBuyError(null)
      // Buy numbers sequentially
      for (const number of numbersToBuy) {
        await buyMutation.mutateAsync({
          userId: user.id,
          phoneNumber: number.phoneNumber,
          country: number.country,
          capabilities: number.capabilities,
        })
      }
      // Success - clear selection
      setSelectedNumbers(new Set())
    } catch (err) {
      const error = err as ApiError | Error
      const message = (error as ApiError)?.message || error.message || "Failed to buy phone numbers"
      setBuyError(message)
    }
  }

  const toggleSelection = (phoneNumber: string) => {
    const newSelection = new Set(selectedNumbers)
    if (newSelection.has(phoneNumber)) {
      newSelection.delete(phoneNumber)
    } else {
      newSelection.add(phoneNumber)
    }
    setSelectedNumbers(newSelection)
  }


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Buy Phone Number</h3>
        <p className="text-sm text-muted-foreground">
          Select a country to search for available phone numbers.
        </p>
      </div>

      {/* Info Box */}
      <div className="flex gap-2 p-3 rounded-lg bg-muted/50 border border-muted">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            Select a country to view available phone numbers. You can optionally filter by area code.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Region/Country Selector */}
        <div className="space-y-2">
          <Label htmlFor="region" className="text-sm font-medium">
            Country <span className="text-destructive">*</span>
          </Label>
          <Popover open={regionOpen} onOpenChange={setRegionOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={regionOpen}
                className="w-full justify-between"
                id="region"
              >
                {selectedRegion
                  ? regionsToDisplay.find((region) => region.countryCode === selectedRegion)?.countryName
                  : "Select a country..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
              <Command>
                <CommandInput placeholder="Search country..." className="h-9" />
                <CommandList>
                  {isLoadingRegions && <CommandEmpty>Loading regions...</CommandEmpty>}
                  {regionsError && <CommandEmpty>Error loading regions.</CommandEmpty>}
                  {!isLoadingRegions && !regionsError && regionsToDisplay.length === 0 && <CommandEmpty>No regions found.</CommandEmpty>}
                  <CommandGroup> 
                    {regionsToDisplay.map((region) => (
                      <CommandItem
                        key={region.countryCode}
                        value={`${region.countryCode} ${region.countryName}`}
                        onSelect={(currentValue) => {
                          // Extract the country code (first part before space)
                          const code = currentValue.split(" ")[0]
                          setSelectedRegion(code === selectedRegion ? "" : code)
                          setRegionOpen(false)
                        }}
                      >
                        {region.countryName}
                        <Check
                          className={cn(
                            "ml-auto",
                            selectedRegion === region.countryCode ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Area Code (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="areaCode" className="text-sm font-medium">
            Area Code <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="areaCode"
            type="text"
            placeholder="e.g. 415, 984, 326"
            value={areaCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "")
              setAreaCode(value)
            }}
            maxLength={3}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Only US and Canada area codes are supported
          </p>
        </div>

      </div>

      {/* Search Results Area */}
      {isSearching && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center py-4">
            Searching for available phone numbers...
          </p>
        </div>
      )}

      {error && (
        <div className="pt-4 border-t">
          <p className="text-sm text-destructive text-center py-4" role="alert">
            Error loading phone numbers. Please try again.
          </p>
        </div>
      )}

      {buyError && (
        <div className="pt-4 border-t">
          <p className="text-sm text-destructive text-center py-4" role="alert">
            {buyError}
          </p>
        </div>
      )}

      {!isSearching && !error && searchResults.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Available Numbers ({searchResults.length})</h4>
            {selectedNumbers.size > 0 && (
              <Button
                onClick={handleBuySelected}
                disabled={buyMutation.isPending}
                size="sm"
              >
                {buyMutation.isPending ? "Buying..." : `Buy Selected (${selectedNumbers.size})`}
              </Button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto pr-2">
            <div className="space-y-2">
              {searchResults.map((number: AvailablePhoneNumber) => (
                <div
                  key={number.phoneNumber}
                  className="flex items-start gap-3 p-3 rounded-lg border border-muted hover:border-primary/50 hover:bg-accent/50 transition-all"
                >
                  <Checkbox
                    checked={selectedNumbers.has(number.phoneNumber)}
                    onCheckedChange={() => toggleSelection(number.phoneNumber)}
                    disabled={buyMutation.isPending}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{number.phoneNumber}</div>
                    {number.locality && number.region && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {number.locality}, {number.region}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      {number.capabilities.voice && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Voice
                        </span>
                      )}
                      {number.capabilities.sms && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          SMS
                        </span>
                      )}
                      {number.capabilities.mms && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          MMS
                        </span>
                      )}
                    </div>
                  </div>
                  {number.price && (
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        {number.currency} {number.price}
                      </div>
                      <div className="text-xs text-muted-foreground">/month</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isSearching && !error && searchResults.length === 0 && selectedRegion && (
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center py-4">
            No phone numbers found in {regionsToDisplay.find((r) => r.countryCode === selectedRegion)?.countryName}
          </p>
        </div>
      )}
    </div>
  )
}
