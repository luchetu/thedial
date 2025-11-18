"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, PhoneOff, Mic, PhoneCall, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const callsMenuItems = [
  {
    title: "Dial",
    href: "/dashboard/calls/dial",
    icon: PhoneCall,
  },
  {
    title: "All Calls",
    href: "/dashboard/calls",
    icon: Phone,
  },
  {
    title: "Missed Calls",
    href: "/dashboard/calls/missed",
    icon: PhoneOff,
  },
  {
    title: "Recordings",
    href: "/dashboard/calls/recordings",
    icon: Mic,
  },
  {
    title: "AI Assistant",
    href: "/dashboard/calls/ai-assistant",
    icon: Sparkles,
  },
];

export function CallsSecondaryMenu() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {callsMenuItems.map((item) => {
        const Icon = item.icon;
        // For "All Calls" (/dashboard/calls), match exactly or when no sub-route
        // For other items, match exact path
        const isActive = item.href === "/dashboard/calls" 
          ? pathname === "/dashboard/calls"
          : pathname === item.href;
        
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

