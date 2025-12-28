"use client";

import { useMemo, useState } from "react";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { useMyAnalyticsSummary, useMyAnalyticsTimeseries } from "@/features/analytics/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Phone, PhoneIncoming, PhoneMissed, PhoneOff, Clock, Bot, FileText, CreditCard } from "lucide-react";
import { CallActivityBarChart } from "@/components/dashboard/Charts/CallActivityChart";
import { getDefaultRangeDays, secondsToMinutes } from "@/lib/utils";

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
    timeseries?.buckets?.map((b) => ({
      day: new Date(b.start).toLocaleDateString(),
      answered: b.callsAnswered,
      missed: b.callsMissed,
      failed: b.callsFailed,
    })) ?? [];

  return (
    <SidebarInset>
      <header className="flex h-12 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <PageBreadcrumb />
      </header>

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Call Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Detailed insights into your call activity and usage
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 md:p-8 pt-0">

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Calls - Spans 3 cols */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-sm bg-gradient-to-br from-card to-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                Call Volume
              </CardTitle>
              <CardDescription>Breakdown of all calls in period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-background border shadow-sm">
                  <span className="text-sm text-muted-foreground font-medium">Total Calls</span>
                  <span className="text-2xl font-bold">{summary?.calls?.total?.toLocaleString() ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-green-50/50 border border-green-100 dark:bg-green-900/10 dark:border-green-900/30">
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1.5">
                    <PhoneIncoming className="h-3.5 w-3.5" /> Answered
                  </span>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-300">{summary?.calls?.answered?.toLocaleString() ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-orange-50/50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/30">
                  <span className="text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5">
                    <PhoneMissed className="h-3.5 w-3.5" /> Missed
                  </span>
                  <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">{summary?.calls?.missed?.toLocaleString() ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-red-50/50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-1.5">
                    <PhoneOff className="h-3.5 w-3.5" /> Failed
                  </span>
                  <span className="text-2xl font-bold text-red-700 dark:text-red-300">{summary?.calls?.failed?.toLocaleString() ?? "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Minutes - Spans 2 cols */}
          <Card className="col-span-1 md:col-span-1 lg:col-span-2 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                Usage Minutes
              </CardTitle>
              <CardDescription>Duration by type</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 mt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">PSTN</span>
                </div>
                <span className="text-lg font-bold">{summary ? secondsToMinutes(summary.minutes.pstnSeconds) : "—"} m</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">AI Agent</span>
                </div>
                <span className="text-lg font-bold">{summary ? secondsToMinutes(summary.minutes.aiSeconds) : "—"} m</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">Transcript</span>
                </div>
                <span className="text-lg font-bold">{summary ? secondsToMinutes(summary.minutes.transcriptionSeconds) : "—"} m</span>
              </div>
            </CardContent>
          </Card>

          {/* Plan - Spans 2 cols */}
          <Card className="col-span-1 md:col-span-1 lg:col-span-2 border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                </div>
                Current Plan
              </CardTitle>
              <CardDescription>Included limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-2">
              <div className="text-center p-4 rounded-xl bg-muted/20 border border-dashed">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Plan</span>
                <div className="text-xl font-black text-foreground mt-1">{summary?.plan.code ?? "—"}</div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">PSTN Included</span>
                    <span className="font-medium">{summary?.plan.pstnIncludedSeconds?.toLocaleString() ?? "—"}s</span>
                  </div>
                  {/* Add progress bar later if we calculate percentage */}
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-full opacity-20" /> {/* Placeholder width */}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">AI Included</span>
                    <span className="font-medium">{summary?.plan.aiIncludedSeconds?.toLocaleString() ?? "—"}s</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-full opacity-20" /> {/* Placeholder width */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Call Activity</CardTitle>
            <CardDescription>Daily call volume trends</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <CallActivityBarChart
              data={chartData}
              isLoading={isTimeseriesLoading}
            />
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
