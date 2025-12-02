"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Phone, PhoneCall, Loader2, XCircle, Settings } from "lucide-react";
import { PhoneSettingsSecondaryMenu } from "@/components/phone-settings-secondary-menu";
import { useUserPhoneNumbers } from "@/features/phone-numbers/hooks/useUserPhoneNumbers";
import type { UserPhoneNumber } from "@/features/phone-numbers/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneNumbersEmptyState } from "@/components/phone-numbers/PhoneNumbersEmptyState";
import { AddPhoneNumberDialog } from "@/components/phone-numbers/AddPhoneNumberDialog";
import { PhoneNumberConfigDialog } from "@/components/phone-numbers/PhoneNumberConfigDialog";

export default function DialNumbersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] =
    useState<UserPhoneNumber | null>(null);
  const { data: phoneNumbers, isLoading, error } = useUserPhoneNumbers();

  const dialNumbers =
    phoneNumbers?.filter(
      (pn) => pn.twilioSid && !pn.twilioSid.startsWith("non-twilio-")
    ) ?? [];

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("+1") && phone.length === 12) {
      const area = phone.slice(2, 5);
      const prefix = phone.slice(5, 8);
      const number = phone.slice(8);
      return `+1 (${area}) ${prefix}-${number}`;
    }
    return phone;
  };

  return (
    <div className="flex h-screen">
      {/* Secondary menu */}
      <aside className="w-60 shrink-0 border-r bg-white flex flex-col">
        <div className="px-4 pt-4 pb-2 border-b">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Phone
          </h2>
        </div>
        <div className="flex-1 px-4 py-4">
          <PhoneSettingsSecondaryMenu />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Dial Numbers</h1>
          <div className="flex-1" />
          <Button
            variant="secondary"
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <PhoneCall className="h-4 w-4" />
            Add Dial Number
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <p>Failed to load dial numbers. Please try again.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && dialNumbers.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Dial Numbers
                  </h2>
                  <p className="text-muted-foreground">
                    These are phone numbers you can place outbound calls from.
                  </p>
                </div>

                <div className="space-y-3">
                  {dialNumbers.map((phoneNumber) => (
                    <Card
                      key={phoneNumber.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">
                                {phoneNumber.friendlyName ||
                                  formatPhoneNumber(phoneNumber.phoneNumber)}
                              </h3>
                              <Badge
                                variant="default"
                                className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                              >
                                Dial
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {formatPhoneNumber(phoneNumber.phoneNumber)}
                              </span>
                              {phoneNumber.country && (
                                <span className="text-xs text-muted-foreground">
                                  {phoneNumber.country}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedPhoneNumber(phoneNumber);
                              setConfigDialogOpen(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Settings className="h-4 w-4" />
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && !error && dialNumbers.length === 0 && (
              <PhoneNumbersEmptyState
                onAddPhoneNumber={() => setIsDialogOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Phone Number Dialog */}
      <AddPhoneNumberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* Phone Number Configuration Dialog */}
      <PhoneNumberConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        phoneNumber={selectedPhoneNumber}
      />
    </div>
  );
}


