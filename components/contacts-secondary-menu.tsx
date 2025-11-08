"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const contactsMenuItems = [
  {
    title: "My Contacts",
    href: "/dashboard/contacts/list",
    icon: Users,
  },
  {
    title: "Upload Contacts",
    href: "/dashboard/contacts/import",
    icon: Upload,
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
