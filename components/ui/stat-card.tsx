import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, LucideIcon } from "lucide-react";
import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  valueColorClassName?: string;
  customValue?: ReactNode;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon = Info,
  iconClassName = "h-4 w-4 text-blue-600",
  valueClassName = "text-2xl font-bold",
  valueColorClassName,
  customValue
}: StatCardProps) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const computedValueClass = cn(
    valueClassName,
    valueColorClassName ?? (Number.isFinite(numericValue)
      ? numericValue >= 2
        ? "text-green-600"
        : numericValue <= 0
        ? "text-red-600"
        : "text-muted-foreground"
      : undefined)
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 px-3 pt-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={iconClassName} />
      </CardHeader>
      <CardContent className="px-3 pb-2 pt-1">
        {customValue || <div className={computedValueClass}>{value}</div>}
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  stats: Array<{
    title: string;
    value: string | number;
    icon?: LucideIcon;
    iconClassName?: string;
    valueClassName?: string;
    valueColorClassName?: string;
    customValue?: ReactNode;
    description?: ReactNode;
  }>;
  columns?: 3 | 4;
  className?: string;
  cardClassName?: string;
  gridTemplate?: CSSProperties;
  maxWidth?: number | string;
}

export function StatsGrid({ stats, columns = 3, className, cardClassName, gridTemplate, maxWidth }: StatsGridProps) {
  const computedTemplate: CSSProperties = {
    gridTemplateColumns: `repeat(${columns}, minmax(160px, 1fr))`,
    ...gridTemplate,
  };

  return (
    <div
      className={cn(
        "grid gap-1 mb-4 pb-2",
        className
      )}
      style={computedTemplate}
      data-maxwidth={maxWidth}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            "rounded-md border bg-card/50 px-2 py-1.5 shadow-sm transition-transform hover:scale-[1.005] h-[88px] flex flex-col justify-between",
            cardClassName
          )}
        >
          <div className="space-y-1">
            <h3 className="text-[0.65rem] font-medium text-muted-foreground tracking-wide uppercase">
              {stat.title}
            </h3>
            <div className={cn("text-xs font-semibold", stat.valueColorClassName)}>{stat.value}</div>
          </div>
          {stat.customValue ? (
            <div className="mt-1 text-xs text-muted-foreground">
              {stat.customValue}
            </div>
          ) : stat.description ? (
            <p className="mt-1 text-[0.65rem] text-muted-foreground">{stat.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

