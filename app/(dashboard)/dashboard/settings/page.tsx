"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, User, Server, Blocks, ChevronRight, CreditCard, Shield, LogOut } from "lucide-react";
import Link from "next/link";
import { SidebarInset } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { ROLES } from "@/lib/constants/roles";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();

  const sections = [
    {
      title: "Profile",
      description: "Manage your personal information and preferences.",
      icon: User,
      href: "/dashboard/settings/account",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER],
    },
    {
      title: "Account Security",
      description: "Update your password and security settings.",
      icon: Shield,
      href: "/dashboard/settings/account/security",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER],
    },
    {
      title: "Billing & Usage",
      description: "View your current credit balance and usage history.",
      icon: CreditCard,
      href: "/dashboard/settings/billing",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.USER],
    },
    {
      title: "Phone Management",
      description: "Manage your phone numbers and call handling rules.",
      icon: Phone,
      href: "/dashboard/settings/phone",
      color: "text-violet-500",
      bgColor: "bg-violet-50",
      // Only admins/super_admins usually manage phone numbers for the org
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    },
    {
      title: "System Administration",
      description: "Configure SIP trunks, credentials, and dispatch rules.",
      icon: Server,
      href: "/dashboard/settings/admin/telephony",
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      // Our mapped "Super Admin" is the backend "admin" role
      roles: [ROLES.ADMIN],
    },
    {
      title: "Integrations",
      description: "Connect with third-party services and manage API keys.",
      icon: Blocks,
      href: "/dashboard/settings/integrations",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      roles: [ROLES.ADMIN],
    },
  ];

  // Helper to check if user has access to a section
  const canAccess = (allowedRoles: string[]) => {
    if (!user?.role) return false;
    // Map backend 'admin' to both ADMIN and SUPER_ADMIN concepts for now
    if (user.role === "admin") return true;
    return allowedRoles.includes(user.role);
  };

  const visibleSections = sections.filter((section) => canAccess(section.roles));

  if (isLoading) {
    return (
      <SidebarInset>
        <PageHeader title="Settings" subtitle="Loading preferences..." />
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <PageHeader
        title="Settings"
        subtitle="Manage your workspace and personal preferences"
      />

      <div className="flex-1 overflow-auto bg-muted/30 p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
          {visibleSections.map((section) => (
            <Link key={section.title} href={section.href} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between group-hover:bg-muted/50">
                    Open
                    <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="max-w-6xl mx-auto border-t pt-8">
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Session</h3>
          <Button
            variant="destructive"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </SidebarInset>
  );
}