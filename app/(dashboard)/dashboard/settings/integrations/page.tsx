import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsSecondaryMenu } from "@/components/settings-secondary-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function IntegrationsSettingsPage() {
  return (
    <div className="flex h-screen">
      {/* Secondary Menu */}
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Settings</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <SettingsSecondaryMenu />
        </div>
      </div>

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
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Integrations</h2>
                <p className="text-muted-foreground">Connect with external services and apps</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations Settings</CardTitle>
                  <CardDescription>Manage your connected services and API integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Integrations settings coming soon...</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}