"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserCheck, Download, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const contactsMenuItems = [
  {
    title: "My Contacts",
    href: "/dashboard/contacts/list",
    icon: Users,
  },
  {
    title: "Contact Groups",
    href: "/dashboard/contacts/groups",
    icon: UserCheck,
  },
  {
    title: "Import / Sync",
    href: "/dashboard/contacts/import",
    icon: Download,
  },
  {
    title: "Contact Settings",
    href: "/dashboard/contacts/settings",
    icon: Settings,
  },
];

export function ContactsSecondaryMenu() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {contactsMenuItems.map((item) => {
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
