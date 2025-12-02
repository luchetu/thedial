"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header className={`flex h-16 shrink-0 items-center gap-2 px-4 ${className || ""}`}>
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <>
              <span className="text-muted-foreground">|</span>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}




