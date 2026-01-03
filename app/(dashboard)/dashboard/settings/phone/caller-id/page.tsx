"use client";

import { useMemo, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Phone, Loader2, XCircle, Settings } from "lucide-react";
import { PhoneNumbersEmptyState } from "@/components/phone-numbers/PhoneNumbersEmptyState";
import { AddPhoneNumberDialog } from "@/components/phone-numbers/AddPhoneNumberDialog";
import { useUserPhoneNumbers } from "@/features/phone-numbers/hooks/useUserPhoneNumbers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneSettingsSecondaryMenu } from "@/components/phone-settings-secondary-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

type StatusFilter = "all" | "active" | "inactive";

export default function CallerIdNumbersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: phoneNumbers, isLoading, error } = useUserPhoneNumbers();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const callerIdNumbers = useMemo(
    () =>
      phoneNumbers?.filter(
        (pn) => {
          const provider = pn.provider;
          return provider === "sms-verified";
        }
      ) ?? [],
    [phoneNumbers]
  );

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith("+1") && phone.length === 12) {
      const area = phone.slice(2, 5);
      const prefix = phone.slice(5, 8);
      const number = phone.slice(8);
      return `+1 (${area}) ${prefix}-${number}`;
    }
    return phone;
  };

  const getStatusBadgeClasses = (status: string) => {
    if (status === "active") {
      return "bg-green-100 text-green-700 border-green-200";
    }
    if (status === "released") {
      return "bg-gray-100 text-gray-700 border-gray-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const filteredCallerIdNumbers = useMemo(() => {
    return callerIdNumbers.filter((pn) => {
      const isActive = pn.status === "active";

      if (statusFilter === "active") {
        return isActive;
      }

      if (statusFilter === "inactive") {
        return !isActive;
      }

      return true;
    });
  }, [callerIdNumbers, statusFilter]);

  const hasAnyCallerIdNumbers = callerIdNumbers.length > 0;

  return (
    <div className="flex h-screen">
      {/* Secondary menu */}
      <aside className="w-60 shrink-0 border-r bg-white flex flex-col">
        <div className="px-4 pt-4 pb-2">
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
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
          <div className="flex-1" />
          <Button
            variant="secondary"
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2"
          >
            Add Verified Number
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
                    <p>Failed to load verified numbers. Please try again.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && hasAnyCallerIdNumbers && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Verified Numbers
                  </h2>
                  <p className="text-muted-foreground">
                    External numbers verified for <strong>Outbound Caller ID</strong> and <strong>Inbound AI Access</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Tabs
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                    className="w-full md:w-auto"
                  >
                    <TabsList className="grid grid-cols-3 w-full md:w-[320px]">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {filteredCallerIdNumbers.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">
                        No verified numbers in this status.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredCallerIdNumbers.map((phoneNumber) => (
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
                                  className={`text-xs ${getStatusBadgeClasses(
                                    phoneNumber.status
                                  )}`}
                                >
                                  {phoneNumber.status}
                                </Badge>
                                <Badge
                                  variant="default"
                                  className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  Verified
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
                              onClick={() => setIsDialogOpen(true)}
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
                )}
              </div>
            )}

            {!isLoading && !error && !hasAnyCallerIdNumbers && (
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
    </div>
  );
}


