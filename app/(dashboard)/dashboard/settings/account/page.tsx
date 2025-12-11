"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Mail, Shield, Calendar, CheckCircle2, XCircle, Save } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { updateCurrentUser } from "@/features/auth/api";
import { useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/lib/toast";
import { formatLongDate } from "@/lib/utils/date";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function AccountSettingsPage() {
  const { data: user, isLoading, error } = useCurrentUser();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form when user data loads
  useEffect(() => {
    if (user && user.fullName) {
      setFullName(user.fullName);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateCurrentUser({ fullName });

      // Invalidate and refetch current user
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      toastSuccess("Account settings updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update account:", error);
      toastError("Failed to update account settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFullName(user.fullName || "");
    }
    setIsEditing(false);
  };

  const getAuthProviderLabel = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "email":
        return "Email";
      case "google":
        return "Google";
      default:
        return provider;
    }
  };

  const getPlanBadgeStyles = (plan?: string) => {
    switch (plan?.toLowerCase()) {
      case "pro":
        return "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-800";
      case "enterprise":
        return "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
          <div className="flex-1" />
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
                    <p>Failed to load account information. Please try again.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && user && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
                  <p className="text-muted-foreground">Manage your account information and preferences</p>
                </div>

                {/* Profile Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Your personal information and account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Auth Provider
                        </Label>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                            {getAuthProviderLabel(user.authProvider)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Authentication method used to sign in
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Verified
                        </Label>
                        <div className="flex items-center gap-2">
                          {user.emailVerified ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm font-medium text-yellow-600">Not Verified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      {!isEditing ? (
                        <Button variant="secondary" className="text-white" onClick={() => setIsEditing(true)}>
                          <User className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                            Cancel
                          </Button>
                          <Button variant="secondary" className="text-white" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Account Status
                    </CardTitle>
                    <CardDescription>
                      Your account status and subscription information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Account Status</Label>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              user.isActive
                                ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-100"
                                : "bg-red-100 text-red-700 border-red-300 hover:bg-red-100"
                            }
                          >
                            {user.isActive ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      {user.plan && (
                        <div className="space-y-2">
                          <Label>Plan</Label>
                          <div className="flex items-center gap-2">
                            <Badge className={`font-semibold ${getPlanBadgeStyles(user.plan)}`}>
                              {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {user.role && (
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-medium capitalize">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Preferences
                    </CardTitle>
                    <CardDescription>
                      Your account preferences and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Recording Consent</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow call recordings and transcriptions
                        </p>
                      </div>
                      <Switch
                        checked={user.recordingConsent}
                        disabled
                        className="opacity-50"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recording consent cannot be changed here. Contact support if you need to update this setting.
                    </p>
                  </CardContent>
                </Card>

                {/* Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                    <CardDescription>
                      Account creation and terms acceptance dates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Account Created</Label>
                        <p className="text-sm text-muted-foreground">
                          {formatLongDate(user.createdAt)}
                        </p>
                      </div>
                      {user.termsAcceptedAt && (
                        <div className="space-y-2">
                          <Label>Terms Accepted</Label>
                          <p className="text-sm text-muted-foreground">
                            {formatLongDate(user.termsAcceptedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
