"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhoneOutgoing, PhoneIncoming, Route, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const adminTelephonyMenuItems = [
  {
    title: "Outbound Trunks",
    href: "/dashboard/settings/admin/telephony/outbound",
    icon: PhoneOutgoing,
  },
  {
    title: "Inbound Trunks",
    href: "/dashboard/settings/admin/telephony/inbound",
    icon: PhoneIncoming,
  },
  {
    title: "Dispatch Rules",
    href: "/dashboard/settings/admin/telephony/dispatch-rules",
    icon: Route,
  },
  {
    title: "Twilio Configuration",
    href: "/dashboard/settings/admin/telephony/twilio",
    icon: Settings,
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

