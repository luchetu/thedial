"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
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
    <div className={className}>
      {/* Breadcrumb Header Bar */}
      <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b">
        <SidebarTrigger className="-ml-1" />
        <PageBreadcrumb />
      </header>

      {/* Page Title Section */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
