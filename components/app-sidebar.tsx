"use client";

import { 
  Home, 
  Phone, 
  Users, 
  Settings, 
  LogOut,
  User
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth/hooks/useLogout";
import dynamic from "next/dynamic";

// Dynamically import admin menu item with SSR disabled to avoid hydration errors
const AdminSettingsMenuItem = dynamic(
  () => import("@/components/admin/AdminSettingsMenuItem").then((mod) => ({ default: mod.AdminSettingsMenuItem })),
  { ssr: false }
);
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";

// Main menu items - flat structure
const mainItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Calls",
    url: "/dashboard/calls",
    icon: Phone,
  },
  {
    title: "Contacts",
    url: "/dashboard/contacts",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center">
          <Logo size={48} className="text-primary" />
          <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden ml-0 leading-none" style={{ transform: 'translateY(-6px)' }}>thedial</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                let isActive = false;
                
                if (item.url === "/dashboard") {
                  isActive = pathname === item.url;
                } else if (item.url === "/dashboard/settings") {
                  isActive = pathname === item.url || 
                    (pathname.startsWith("/dashboard/settings/") && 
                     !pathname.startsWith("/dashboard/settings/admin"));
                } else {
                  isActive = pathname === item.url || 
                    (item.url !== "/dashboard" && pathname.startsWith(item.url));
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {/* Admin Settings - dynamically imported with SSR disabled */}
              <AdminSettingsMenuItem />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User />
              <span>Account</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="cursor-pointer"
            >
              <LogOut />
              <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
