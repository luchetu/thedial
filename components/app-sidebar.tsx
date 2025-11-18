"use client";

import { useState } from "react";
import {
  Home,
  Phone,
  Users,
  LogOut,
  User,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogout } from "@/features/auth/hooks/useLogout";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AddPhoneNumberDialog } from "@/components/phone-numbers/AddPhoneNumberDialog";

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
    title: "My Phone Numbers",
    url: "/dashboard/settings/phone",
    icon: Phone,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const [isAddPhoneNumberDialogOpen, setIsAddPhoneNumberDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"call" | "buy" | null>(null);

  const handleMakeCall = () => {
    setSelectedAction("call");
    setPopoverOpen(false);
    router.push("/dashboard/calls/dial");
  };

  const handleBuyNumber = () => {
    setSelectedAction("buy");
    setPopoverOpen(false);
    setIsAddPhoneNumberDialogOpen(true);
  };

  const getButtonLabel = () => {
    if (selectedAction === "call") return "Make a Call";
    if (selectedAction === "buy") return "Buy Number";
    return "Quick Actions";
  };

  return (
    <>
      <Sidebar collapsible="icon">
      <SidebarHeader className="min-w-0">
        <div className="flex items-center min-w-0">
          <Logo size={35} className="text-primary shrink-0" />
          <span className="text-l md:text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden leading-none truncate ml-2">thedial</span>
        </div>
        <div className="w-full min-w-0">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full min-w-0 justify-center gap-2 text-sm font-semibold group-data-[collapsible=icon]:h-11 group-data-[collapsible=icon]:w-11 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
              >
                {selectedAction === "buy" ? (
                  <ShoppingCart className="h-4 w-4 shrink-0" />
                ) : (
                  <Phone className="h-4 w-4 shrink-0" />
                )}
                <span className="group-data-[collapsible=icon]:hidden truncate min-w-0">{getButtonLabel()}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 group-data-[collapsible=icon]:hidden" />
              </Button>
            </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            className="w-52 p-1"
          >
            <button
              type="button"
              onClick={handleMakeCall}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>Make a Call</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNumber}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Buy Number</span>
            </button>
          </PopoverContent>
        </Popover>
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
                } else if (item.url === "/dashboard/settings/phone") {
                  isActive = pathname === item.url;
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
              <AdminSettingsMenuItem />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/settings/account">
                <User />
                <span>Account</span>
              </Link>
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

    <AddPhoneNumberDialog
      open={isAddPhoneNumberDialogOpen}
      onOpenChange={setIsAddPhoneNumberDialogOpen}
    />
    </>
  );
}
