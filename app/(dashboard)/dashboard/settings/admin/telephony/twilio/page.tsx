"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Settings, Info, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { TwilioConfigForm } from "@/features/admin/telephony/components/twilio-config/TwilioConfigForm";
import { useTwilioConfig, useUpdateTwilioConfig } from "@/features/admin/telephony/hooks/useTwilioConfig";
import { toastError, toastSuccess } from "@/lib/toast";

export default function TwilioConfigPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const {
    data: config,
    isLoading,
    isError,
    error,
  } = useTwilioConfig();
  const updateMutation = useUpdateTwilioConfig();

  useEffect(() => {
    if (isError && error) {
      toastError(error.message || "Failed to load Twilio configuration");
    }
  }, [isError, error]);

  const maskValue = (value: string | undefined, show: boolean) => {
    if (!value) return "-";
    if (show) return value;
    return value.length > 4
      ? `${value.slice(0, 2)}${"*".repeat(Math.max(value.length - 4, 0))}${value.slice(-2)}`
      : "***";
  };

  const handleSubmit = async (values: Parameters<typeof updateMutation.mutateAsync>[0]) => {
    try {
      await updateMutation.mutateAsync(values);
      toastSuccess("Twilio configuration updated successfully");
      setIsEditMode(false);
    } catch (submitError) {
      const err = submitError as Error;
      toastError(`Failed to update configuration: ${err.message}`);
    }
  };

  const effectiveConfig = {
    accountSid: config?.accountSid ?? "",
    authToken: config?.authToken ?? "",
    sipTrunkAddress: config?.sipTrunkAddress ?? "",
    sipTrunkUsername: config?.sipTrunkUsername ?? "",
    sipTrunkPassword: config?.sipTrunkPassword ?? "",
    inboundVoiceWebhookUrl: config?.inboundVoiceWebhookUrl ?? "",
    inboundSmsWebhookUrl: config?.inboundSmsWebhookUrl ?? "",
  };

  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Telephony Settings</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <AdminTelephonySecondaryMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Twilio Configuration
                </h1>
              </div>
              {!isEditMode ? (
                <Button
                  variant="secondary"
                  className="flex items-center gap-2 text-white"
                  onClick={() => setIsEditMode(true)}
                  disabled={isLoading}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4 max-w-4xl">
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    <div className="mt-4 space-y-2">
                      <div className="h-3 w-full bg-muted animate-pulse rounded" />
                      <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl">
                {isEditMode ? (
                  <Card>
                    <CardContent className="pt-6">
                      <TwilioConfigForm
                        defaultValues={{
                          accountSid: effectiveConfig.accountSid || "",
                          authToken: effectiveConfig.authToken || "",
                          sipTrunkAddress: effectiveConfig.sipTrunkAddress || "",
                          sipTrunkUsername: effectiveConfig.sipTrunkUsername || "",
                          sipTrunkPassword: effectiveConfig.sipTrunkPassword || "",
                          inboundVoiceWebhookUrl: effectiveConfig.inboundVoiceWebhookUrl || "",
                          inboundSmsWebhookUrl: effectiveConfig.inboundSmsWebhookUrl || "",
                        }}
                        onSubmit={handleSubmit}
                        isLoading={updateMutation.isPending}
                        submitLabel="Save Configuration"
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Twilio API Credentials */}
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Twilio API Credentials</h3>
                          <p className="text-sm text-muted-foreground">
                            Used for Twilio API calls (buying numbers, managing trunks, etc.)
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Account SID</label>
                          <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm">
                            {maskValue(effectiveConfig.accountSid, true)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Auth Token</label>
                          <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm">
                            {maskValue(effectiveConfig.authToken, false)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* SIP Trunk Credentials */}
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">SIP Trunk Credentials</h3>
                          <p className="text-sm text-muted-foreground">
                            Default credentials for LiveKit outbound trunks to connect to Twilio. Can be overridden per-trunk.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">SIP Trunk Address</label>
                          <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm">
                            {effectiveConfig.sipTrunkAddress || "-"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">SIP Trunk Username</label>
                          <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm">
                            {effectiveConfig.sipTrunkUsername || "-"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">SIP Trunk Password</label>
                          <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm">
                            {maskValue(effectiveConfig.sipTrunkPassword, false)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Webhook URLs */}
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">Webhook URLs</h3>
                          <p className="text-sm text-muted-foreground">
                            Twilio calls these URLs when receiving inbound calls or SMS.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Inbound Voice Webhook URL</label>
                          <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm break-all">
                            {effectiveConfig.inboundVoiceWebhookUrl || "-"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Inbound SMS Webhook URL</label>
                          <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm break-all">
                            {effectiveConfig.inboundSmsWebhookUrl || "-"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Info Card */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="space-y-2 text-sm">
                            <p className="font-medium text-blue-900">Programmatic Management</p>
                            <p className="text-blue-700">
                              All Twilio settings can be managed programmatically via the Twilio Go SDK or API.
                              No need to use the Twilio Console. These credentials are used across all LiveKit
                              trunks unless overridden per-trunk.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
