"use client";

import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PhoneNumbersEmptyState } from "@/components/phone-numbers/PhoneNumbersEmptyState";
import { AddPhoneNumberDialog } from "@/components/phone-numbers/AddPhoneNumberDialog";

export default function PhoneNumbersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Phone Numbers</h1>
          <div className="flex-1" />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <PhoneNumbersEmptyState
            onAddPhoneNumber={() => setIsDialogOpen(true)}
          />
        </div>
      </div>

      {/* Add Phone Number Dialog */}
      <AddPhoneNumberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}

