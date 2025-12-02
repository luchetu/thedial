"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useUserCalls } from "@/features/calls/hooks";

const chartConfig: ChartConfig = {
  incoming: {
    label: "Inbound",
    color: "#fd753e",
  },
  outgoing: {
    label: "Outbound",
    color: "#ea580c",
  },
  missed: {
    label: "Missed",
    color: "#c2410c",
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

export function CallActivityChart() {
  const { data, isLoading, isError } = useUserCalls({ limit: 200 });

  const chartData = useMemo(() => {
    const calls = data ?? [];
    const days = getLast7Days();
    const buckets = new Map(
      days.map((d) => [
        d.key,
        { day: d.label, incoming: 0, outgoing: 0, missed: 0 },
      ]),
    );

    calls.forEach((call) => {
      if (!call.startedAt) return;
      const d = new Date(call.startedAt);
      if (Number.isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) return;

      if (call.direction === "outbound") {
        bucket.outgoing += 1;
      } else {
        bucket.incoming += 1;
      }
      if (call.status === "missed") {
        bucket.missed += 1;
      }
    });

    return Array.from(buckets.values());
  }, [data]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading call activity…</p>;
  }

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load call activity.</p>;
  }

  if (!chartData.length) {
    return <p className="text-sm text-muted-foreground">No call activity in the last 7 days.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
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
          <Bar dataKey="incoming" fill="#fd753e" radius={4} />
          <Bar dataKey="outgoing" fill="#ea580c" radius={4} />
          <Bar dataKey="missed" fill="#c2410c" radius={4} />
        </BarChart> 
      </ResponsiveContainer>
    </ChartContainer>
  );
}
