"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useUserCalls } from "@/features/calls/hooks";

const chartConfig: ChartConfig = {
  answered: {
    label: "Answered",
    color: "#10b981", // Emerald 500
  },
  missed: {
    label: "Missed",
    color: "#f43f5e", // Rose 500
  },
  failed: {
    label: "Failed",
    color: "#ef4444", // Red 500
  },
  busy: {
    label: "Busy",
    color: "#f59e0b", // Amber 500
  },
};

function getLast7Days() {
  const days: { key: string; label: string }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const label = d.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
    days.push({ key, label });
  }
  return days;
}

export interface CallActivityBarChartProps {
  data: Array<{
    day: string;
    answered: number;
    missed: number;
    failed: number;
    busy?: number;
  }>;
  isLoading?: boolean;
  isError?: boolean;
}

export function CallActivityBarChart({ data, isLoading, isError }: CallActivityBarChartProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading call activity…</p>;
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load call activity.</p>;
  }

  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No call activity in the selected period.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={8}
            axisLine={false}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="answered" fill="var(--color-answered)" radius={4} />
          <Bar dataKey="missed" fill="var(--color-missed)" radius={4} />
          <Bar dataKey="failed" fill="var(--color-failed)" radius={4} />
          <Bar dataKey="busy" fill="var(--color-busy)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function CallActivityChart() {
  const { data, isLoading, isError } = useUserCalls({ limit: 500 }); // Increased limit for better stats

  const chartData = useMemo(() => {
    const calls = data ?? [];
    const days = getLast7Days();
    const buckets = new Map(
      days.map((d) => [
        d.key,
        { day: d.label, answered: 0, missed: 0, failed: 0, busy: 0 },
      ]),
    );

    calls.forEach((call) => {
      if (!call.startedAt) return;
      const d = new Date(call.startedAt);
      if (Number.isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) return;

      const status = (call.status || "").toLowerCase();
      if (status === "completed" || status === "answered") {
        bucket.answered += 1;
      } else if (status === "missed") {
        bucket.missed += 1;
      } else if (status === "failed") {
        bucket.failed += 1;
      } else if (status === "busy") {
        bucket.busy += 1;
      }
    });

    return Array.from(buckets.values());
  }, [data]);

  return <CallActivityBarChart data={chartData} isLoading={isLoading} isError={isError} />;
}
