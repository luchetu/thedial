"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, PhoneForwarded, Plug, User } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsMenuItems = [
  {
    title: "Phone Number",
    href: "/dashboard/settings/phone",
    icon: Phone,
  },
  {
    title: "Forwarding",
    href: "/dashboard/settings/forwarding",
    icon: PhoneForwarded,
  },
  {
    title: "Integrations",
    href: "/dashboard/settings/integrations",
    icon: Plug,
  },
  {
    title: "Account",
    href: "/dashboard/settings/account",
    icon: User,
  },
];

export function SettingsSecondaryMenu() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {settingsMenuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              "hover:bg-orange-100 hover:text-orange-800",
              isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground"
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
