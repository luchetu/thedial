"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Phone, Route, Settings, GitBranch, Link2, Key } from "lucide-react";
import { cn } from "@/lib/utils";

const adminTelephonyMenuItems = [
  {
    title: "Twilio Configuration",
    href: "/dashboard/settings/admin/telephony/twilio",
    icon: Settings,
    description: "Configure Twilio API credentials",
  },
  {
    title: "Credential Lists",
    href: "/dashboard/settings/admin/telephony/credential-lists",
    icon: Key,
    description: "Manage Twilio credential lists and credentials",
  },
  {
    title: "Dispatch Rules",
    href: "/dashboard/settings/admin/telephony/dispatch-rules",
    icon: Route,
    description: "Configure call dispatch rules",
  },
  {
    title: "Trunks",
    href: "/dashboard/settings/admin/telephony/trunks",
    icon: Phone,
    description: "Manage all trunks (outbound, inbound, bidirectional)",
  },
  {
    title: "Routing Profiles",
    href: "/dashboard/settings/admin/telephony/routing-profiles",
    icon: GitBranch,
    description: "Configure call routing profiles",
  },
  {
    title: "Plans",
    href: "/dashboard/settings/admin/telephony/plans",
    icon: Layers,
    description: "Manage subscription plans",
  },
  {
    title: "Plan Mappings",
    href: "/dashboard/settings/admin/telephony/plan-routing-profiles",
    icon: Link2,
    description: "Map plans to routing profiles",
  },
];

export function AdminTelephonySecondaryMenu() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {adminTelephonyMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors border",
              "hover:bg-primary/10 hover:text-primary",
              isActive 
                ? "bg-primary/10 border-primary text-primary shadow-sm" 
                : "border-transparent text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

