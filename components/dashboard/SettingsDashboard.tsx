"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { User, Phone, Bell, Globe, Save, Edit } from "lucide-react"

// Sample user data
const initialUserData = {
  name: "John Doe",
  email: "john.doe@example.com",
  timezone: "America/New_York"
}

const initialCallPreferences = {
  autoRecord: true,
  autoTranscribe: true,
  defaultSummaryLanguage: "en",
  recordingQuality: "high"
}

const initialNotificationPreferences = {
  emailSummaries: true,
  emailMissedCalls: true,
  emailFollowUpReminders: false,
  smsUrgentCalls: true,
  pushNotifications: true
}

const languageOptions = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" }
]

const timezoneOptions = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" }
]

const recordingQualityOptions = [
  { value: "low", label: "Low (8kHz)" },
  { value: "medium", label: "Medium (16kHz)" },
  { value: "high", label: "High (32kHz)" }
]

export function SettingsDashboard() {
  const [userData, setUserData] = useState(initialUserData)
  const [callPreferences, setCallPreferences] = useState(initialCallPreferences)
  const [notificationPreferences, setNotificationPreferences] = useState(initialNotificationPreferences)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving settings:", { userData, callPreferences, notificationPreferences })
    setIsEditing(false)
  }

  const handleUserDataChange = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }))
  }

  const handleCallPreferenceChange = (field: string, value: boolean | string) => {
    setCallPreferences(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationPreferenceChange = (field: string, value: boolean) => {
    setNotificationPreferences(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => handleUserDataChange("name", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => handleUserDataChange("email", e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={userData.timezone}
              onValueChange={(value) => handleUserDataChange("timezone", value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            {isEditing ? (
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call Preferences
          </CardTitle>
          <CardDescription>
            Configure how calls are handled and processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-record Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-record">Auto-record Calls</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically record all incoming and outgoing calls
                </p>
              </div>
              <Switch
                id="auto-record"
                checked={callPreferences.autoRecord}
                onCheckedChange={(checked) => handleCallPreferenceChange("autoRecord", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-transcribe">Auto-transcribe Calls</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate transcripts for recorded calls
                </p>
              </div>
              <Switch
                id="auto-transcribe"
                checked={callPreferences.autoTranscribe}
                onCheckedChange={(checked) => handleCallPreferenceChange("autoTranscribe", checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Language and Quality Settings */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="summary-language">Default Summary Language</Label>
              <Select
                value={callPreferences.defaultSummaryLanguage}
                onValueChange={(value) => handleCallPreferenceChange("defaultSummaryLanguage", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recording-quality">Recording Quality</Label>
              <Select
                value={callPreferences.recordingQuality}
                onValueChange={(value) => handleCallPreferenceChange("recordingQuality", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {recordingQualityOptions.map((quality) => (
                    <SelectItem key={quality.value} value={quality.value}>
                      {quality.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how and when you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Email Notifications</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-summaries">Email me call summaries</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily summaries of your call activity
                </p>
              </div>
              <Switch
                id="email-summaries"
                checked={notificationPreferences.emailSummaries}
                onCheckedChange={(checked) => handleNotificationPreferenceChange("emailSummaries", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-missed-calls">Email me missed calls</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified immediately when you miss a call
                </p>
              </div>
              <Switch
                id="email-missed-calls"
                checked={notificationPreferences.emailMissedCalls}
                onCheckedChange={(checked) => handleNotificationPreferenceChange("emailMissedCalls", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-follow-up">Email follow-up reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Remind me about calls that need follow-up actions
                </p>
              </div>
              <Switch
                id="email-follow-up"
                checked={notificationPreferences.emailFollowUpReminders}
                onCheckedChange={(checked) => handleNotificationPreferenceChange("emailFollowUpReminders", checked)}
              />
            </div>
          </div>

          <Separator />

          {/* SMS and Push Notifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">SMS & Push Notifications</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-urgent">SMS for urgent calls</Label>
                <p className="text-sm text-muted-foreground">
                  Send SMS alerts for high-priority calls
                </p>
              </div>
              <Switch
                id="sms-urgent"
                checked={notificationPreferences.smsUrgentCalls}
                onCheckedChange={(checked) => handleNotificationPreferenceChange("smsUrgentCalls", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable browser push notifications
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notificationPreferences.pushNotifications}
                onCheckedChange={(checked) => handleNotificationPreferenceChange("pushNotifications", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
