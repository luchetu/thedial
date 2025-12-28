"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Phone, Brain, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMyAnalyticsSummary } from "@/features/analytics/hooks";
import { useUserPhoneNumbers } from "@/features/phone-numbers/hooks/useUserPhoneNumbers";
import { CallActivityChart } from "@/components/dashboard/Charts/CallActivityChart";
import { getDefaultRangeDays } from "@/lib/utils";
import { secondsToMinutes } from "date-fns";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

export default function DashboardPage() {
  const { from, to } = useMemo(() => getDefaultRangeDays(7), []);

  const analyticsParams = useMemo(
    () => ({
      from,
      to,
      bucket: "day" as const,
    }),
    [from, to],
  );

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useMyAnalyticsSummary(analyticsParams);
  const {
    data: phoneNumbers,
    isLoading: isNumbersLoading,
    error: numbersError,
  } = useUserPhoneNumbers();

  const outcomeData = useMemo(
    () =>
      summary
        ? [
          { name: "Answered", value: summary.calls.answered, color: "#22c55e" },
          { name: "Missed", value: summary.calls.missed, color: "#ef4444" },
          { name: "Failed", value: summary.calls.failed, color: "#f97316" },
        ].filter((d) => d.value > 0)
        : [],
    [summary],
  );

  const kpis = useMemo(() => {
    if (!summary) {
      return {
        missedRate: null as number | null,
        avgCallMinutes: null as number | null,
      };
    }
    const total = summary.calls.total || 0;
    const missed = summary.calls.missed || 0;
    const missedRate = total > 0 ? (missed / total) * 100 : null;
    const avgCallMinutes =
      total > 0 ? summary.minutes.pstnSeconds / total / 60 : null;
    return { missedRate, avgCallMinutes };
  }, [summary]);

  if (isSummaryLoading || isNumbersLoading) {
    return (
      <SidebarInset>
        <DashboardSkeleton />
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      {/* Breadcrumb Header Bar */}
      <header className="flex h-12 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <PageBreadcrumb />
      </header>

      {/* Page Title Section */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">TheDial</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of your call activity for the last 7 days.
          </p>
        </div>
        <Link href="/dashboard/analytics">
          <Button variant="outline" size="sm">
            Open detailed analytics
          </Button>
        </Link>
      </div>

      {/* Floating AI Assistant Button */}
      <Link href="/dashboard/calls/ai-assistant">
        <Button
          variant="secondary"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 text-white"
          size="lg"
        >
          <Sparkles className="h-6 w-6" />
          <span className="sr-only">AI Assistant</span>
        </Button>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
                <Card className="border-none shadow-sm bg-gradient-to-br from-card to-muted/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls (7d)</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isSummaryLoading
                        ? "…"
                        : summary?.calls.total.toLocaleString() ?? "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      In the last 7 days
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Answered Rate</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {summary && summary.calls.total > 0
                        ? `${((summary.calls.answered / summary.calls.total) * 100).toFixed(0)}%`
                        : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(summary?.calls?.answered ?? 0).toLocaleString()} answered calls
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">PSTN Usage</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isSummaryLoading
                        ? "…"
                        : summary
                          ? `${secondsToMinutes(summary.minutes.pstnSeconds)}m`
                          : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Standard network minutes
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">AI Agent Usage</CardTitle>
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isSummaryLoading
                        ? "…"
                        : summary
                          ? `${secondsToMinutes(summary.minutes.aiSeconds)}m`
                          : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Autonomous agent minutes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8 mb-8">
                {/* Call Activity Graph */}
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Call Activity</CardTitle>
                    <CardDescription>Your call activity over the last 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CallActivityChart />
                  </CardContent>
                </Card>

                {/* Call outcomes breakdown */}
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Call Outcomes</CardTitle>
                    <CardDescription>Answered vs missed vs failed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSummaryLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading call outcomes…
                      </p>
                    ) : !outcomeData.length ? (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        <div className="h-8 w-8 rounded-full border-4 border-muted/20 mb-2" />
                        <p className="text-sm font-medium">No outcomes yet</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="h-40 w-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={outcomeData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={4}
                              >
                                {outcomeData.map((entry, index) => (
                                  <Cell key={entry.name} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 text-sm">
                          {outcomeData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-muted-foreground">{item.name}</span>
                              </div>
                              <span className="font-medium">
                                {item.value.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Connected Number Card */}
                <Card className="col-span-7">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Your Connected Number
                    </CardTitle>
                    <CardDescription>Manage your phone number settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isNumbersLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading your phone numbers…
                      </p>
                    ) : numbersError ? (
                      <p className="text-sm text-destructive">
                        Failed to load your phone numbers.
                      </p>
                    ) : (
                      <>
                        {phoneNumbers && phoneNumbers.length > 0 ? (
                          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">
                                {phoneNumbers[0].friendlyName ||
                                  phoneNumbers[0].phoneNumber}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {phoneNumbers[0].status}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            You don&apos;t have a connected number yet.
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Link href="/dashboard/settings/phone/numbers" className="w-full">
                            <Button variant="secondary" className="w-full" size="sm">
                              Manage Numbers
                            </Button>
                          </Link>
                          <Link href="/dashboard/settings/phone/buy" className="w-full">
                            <Button variant="outline" className="w-full" size="sm">
                              Buy Number
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}