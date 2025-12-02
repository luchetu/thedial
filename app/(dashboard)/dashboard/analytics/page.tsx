"use client";

import { useMemo, useState } from "react";
import { useMyAnalyticsSummary, useMyAnalyticsTimeseries } from "@/features/analytics/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { BarChart3 } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

function getDefaultRangeDays(days: number): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();
  const fromDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const from = fromDate.toISOString();
  return { from, to };
}

function secondsToMinutes(seconds: number): string {
  if (!seconds) return "0";
  const mins = seconds / 60;
  return mins.toFixed(1);
}

export default function AnalyticsPage() {
  const [{ from, to }] = useState(() => getDefaultRangeDays(30));

  const params = useMemo(
    () => ({
      from,
      to,
      bucket: "day" as const,
    }),
    [from, to],
  );

  const { data: summary } = useMyAnalyticsSummary(params);
  const { data: timeseries, isLoading: isTimeseriesLoading } = useMyAnalyticsTimeseries(params);

  const chartData =
    timeseries?.buckets.map((b) => ({
      date: new Date(b.start).toLocaleDateString(),
      callsTotal: b.callsTotal,
      callsAnswered: b.callsAnswered,
      callsMissed: b.callsMissed,
    })) ?? [];

  return (
    <div className="space-y-4 p-4 md:p-8 pt-6">
      <PageHeader 
        title="Call Analytics" 
        subtitle="Detailed insights into your call activity and usage"
        icon={BarChart3} 
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Calls</CardTitle>
            <CardDescription>Total / answered / missed / failed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{summary?.calls.total.toLocaleString() ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Answered</span>
              <span className="font-medium">{summary?.calls.answered.toLocaleString() ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Missed</span>
              <span className="font-medium">{summary?.calls.missed.toLocaleString() ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Failed</span>
              <span className="font-medium">{summary?.calls.failed.toLocaleString() ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minutes used</CardTitle>
            <CardDescription>PSTN / AI / transcription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">PSTN</span>
              <span className="font-medium">
                {summary ? secondsToMinutes(summary.minutes.pstnSeconds) : "—"} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI</span>
              <span className="font-medium">
                {summary ? secondsToMinutes(summary.minutes.aiSeconds) : "—"} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transcription</span>
              <span className="font-medium">
                {summary ? secondsToMinutes(summary.minutes.transcriptionSeconds) : "—"} min
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Included vs used (seconds)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan code</span>
              <span className="font-medium">{summary?.plan.code ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PSTN included</span>
              <span className="font-medium">
                {summary?.plan.pstnIncludedSeconds?.toLocaleString() ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI included</span>
              <span className="font-medium">
                {summary?.plan.aiIncludedSeconds?.toLocaleString() ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Call activity</CardTitle>
          <CardDescription>Daily call volume for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {isTimeseriesLoading ? (
            <p className="text-sm text-muted-foreground">Loading activity…</p>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No call activity in this period.</p>
          ) : (
            <ChartContainer config={{}} className="aspect-auto">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="callsTotal" name="Total" fill="#0f172a" radius={4} />
                    <Bar dataKey="callsAnswered" name="Answered" fill="#22c55e" radius={4} />
                    <Bar dataKey="callsMissed" name="Missed" fill="#ef4444" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
