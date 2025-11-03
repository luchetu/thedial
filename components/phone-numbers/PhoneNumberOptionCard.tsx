"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PhoneNumberOptionCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isSelected: boolean;
  onSelect: () => void;
  badge?: string;
}

export function PhoneNumberOptionCard({
  title,
  description,
  icon: Icon,
  isSelected,
  onSelect,
  badge,
}: PhoneNumberOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-lg border-2 transition-all",
        "hover:border-primary/50 hover:bg-accent/50",
        isSelected
          ? "border-primary bg-primary/5 dark:bg-primary/10"
          : "border-muted bg-background"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border",
            isSelected
              ? "border-primary bg-primary/10"
              : "border-muted bg-muted"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{title}</h4>
                {badge && (
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
      </div>
    </button>
  );
}

