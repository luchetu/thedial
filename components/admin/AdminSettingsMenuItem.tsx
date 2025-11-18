"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AdminSettingsMenuItem() {
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const isAdmin = !isLoading && user?.role === "admin";

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        isActive={pathname.startsWith("/dashboard/settings/admin/telephony")}
      >
        <Link href="/dashboard/settings/admin/telephony">
          <Shield />
          <span>Admin Settings</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

