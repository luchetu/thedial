import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex h-12 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <PageBreadcrumb />
        <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
      </header>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-4">
            <p className="text-muted-foreground">Profile management coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
