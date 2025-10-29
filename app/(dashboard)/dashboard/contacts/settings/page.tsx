import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactsSecondaryMenu } from "@/components/contacts-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, User, Bell, Shield, Trash2 } from "lucide-react";

export default function ContactSettingsPage() {
  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Contacts</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <ContactsSecondaryMenu />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Contact Settings</h2>
                <p className="text-muted-foreground">Configure how contacts are managed and displayed</p>
              </div>
              
              {/* Contact Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Display Settings
                  </CardTitle>
                  <CardDescription>Customize how contacts are shown in your list</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-avatars">Show contact avatars</Label>
                      <p className="text-sm text-muted-foreground">
                        Display profile pictures or initials for contacts
                      </p>
                    </div>
                    <Switch id="show-avatars" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-last-call">Show last call date</Label>
                      <p className="text-sm text-muted-foreground">
                        Display when you last spoke with each contact
                      </p>
                    </div>
                    <Switch id="show-last-call" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-tags">Show contact tags</Label>
                      <p className="text-sm text-muted-foreground">
                        Display tags and labels for each contact
                      </p>
                    </div>
                    <Switch id="show-tags" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-contacts">Sort contacts by</Label>
                    <Select defaultValue="name">
                      <SelectTrigger>
                        <SelectValue placeholder="Select sorting option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="last-call">Last Call Date</SelectItem>
                        <SelectItem value="created">Date Added</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Settings
                  </CardTitle>
                  <CardDescription>Manage contact-related notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="follow-up-reminders">Follow-up reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when contacts need follow-up
                      </p>
                    </div>
                    <Switch id="follow-up-reminders" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="birthday-reminders">Birthday reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for contact birthdays
                      </p>
                    </div>
                    <Switch id="birthday-reminders" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-contact-alerts">New contact alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new contacts are added
                      </p>
                    </div>
                    <Switch id="new-contact-alerts" />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy & Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>Control how your contact data is handled</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-sync">Auto-sync with external services</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically sync contacts with Google, Outlook, etc.
                      </p>
                    </div>
                    <Switch id="auto-sync" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="backup-contacts">Backup contacts</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup your contacts to cloud storage
                      </p>
                    </div>
                    <Switch id="backup-contacts" defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data-retention">Data retention period</Label>
                    <Select defaultValue="forever">
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-year">1 Year</SelectItem>
                        <SelectItem value="2-years">2 Years</SelectItem>
                        <SelectItem value="5-years">5 Years</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Irreversible actions that affect your contact data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-600">Delete All Contacts</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete all contacts and contact history
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete All
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-600">Export & Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Export all data and permanently delete your account
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Export & Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
