"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  icon: Icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={`flex h-16 shrink-0 items-center gap-2 px-4 ${className || ""}`}>
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5" />}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex-1" />
      {action}
    </header>
  );
}


