"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, PhoneForwarded, ArrowRight, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

const phoneMenuItems = [
  {
    title: "All Numbers",
    href: "/dashboard/settings/phone",
    icon: Phone,
    description: "Manage all numbers and settings",
  },
  {
    title: "Dial Numbers",
    href: "/dashboard/settings/phone/dial-numbers",
    icon: PhoneCall,
    description: "Numbers you can dial from",
  },
  {
    title: "Caller ID Numbers",
    href: "/dashboard/settings/phone/caller-id",
    icon: PhoneForwarded,
    description: "External numbers used as caller ID",
  },
  {
    title: "Port Numbers",
    href: "/dashboard/settings/phone/porting",
    icon: ArrowRight,
    description: "Bring existing numbers into Dial",
  },
];

export function PhoneSettingsSecondaryMenu() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {phoneMenuItems.map((item) => {
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
            <div className="flex flex-col">
              <span>{item.title}</span>
              {item.description && (
                <span className="text-[11px] font-normal text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

