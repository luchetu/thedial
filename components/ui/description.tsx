"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DescriptionItem {
  label: string;
  value: ReactNode;
}

interface DescriptionProps {
  items: DescriptionItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}

/**
 * Description
 *
 * A simple three-column (responsive) description layout for showing
 * label/value pairs, similar to a vertical table in billing consoles.
 */
export function Description({ items, columns = 3, className }: DescriptionProps) {
  const columnClasses =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <dl
      className={cn(
        "grid gap-3 md:gap-4",
        columnClasses,
        "text-sm",
        className,
      )}
    >
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="rounded-md border bg-muted/10 px-4 py-3"
        >
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 wrap-break-word">
            {item.value === undefined || item.value === null || item.value === ""
              ? "—"
              : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}


