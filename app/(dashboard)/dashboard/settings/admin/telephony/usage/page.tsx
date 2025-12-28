"use client";

import { useMemo, useState } from "react";
import { AdminTelephonySecondaryMenu } from "@/features/admin/telephony/components/AdminTelephonySecondaryMenu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePlanUsage, useNumberUsage } from "@/features/admin/usage/hooks";
import { useAdminCallsTimeseries, useAdminTopNumbers } from "@/features/admin/analytics/hooks";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart3 } from "lucide-react";
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

export default function AdminUsagePage() {
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);
  const [{ from, to }, setRange] = useState(() => getDefaultRangeDays(7));
  const [planCodeFilter, setPlanCodeFilter] = useState("");

  const [userIdInput, setUserIdInput] = useState("");
  const [userIdFilter, setUserIdFilter] = useState<string | null>(null);
  const [numberPlanFilter, setNumberPlanFilter] = useState("");
  const [topNumbersLimit, setTopNumbersLimit] = useState(10);

  const planParams = useMemo(
    () => ({
      from,
      to,
      planCode: planCodeFilter || undefined,
    }),
    [from, to, planCodeFilter]
  );

  const { data: planUsage, isLoading: isPlanLoading, error: planError } = usePlanUsage(planParams);

  const numberParams = useMemo(
    () =>
      userIdFilter
        ? {
          userId: userIdFilter,
          planCode: numberPlanFilter || undefined,
        }
        : null,
    [userIdFilter, numberPlanFilter]
  );

  const {
    data: numberUsage,
    isLoading: isNumberLoading,
    error: numberError,
  } = useNumberUsage(numberParams);

  const analyticsParams = useMemo(
    () => ({
      from,
      to,
      bucket: "day" as const,
      planCode: planCodeFilter || undefined,
    }),
    [from, to, planCodeFilter],
  );

  const { data: callsTimeseries, isLoading: isCallsTimeseriesLoading } =
    useAdminCallsTimeseries(analyticsParams);

  const topNumbersParams = useMemo(
    () =>
      from && to
        ? {
          from,
          to,
          limit: topNumbersLimit,
          planCode: numberPlanFilter || undefined,
          userId: userIdFilter || undefined,
        }
        : null,
    [from, to, topNumbersLimit, numberPlanFilter, userIdFilter],
  );

  const { data: topNumbers } = useAdminTopNumbers(topNumbersParams);

  const kpi = useMemo(() => {
    if (!callsTimeseries?.buckets?.length) {
      return {
        totalCalls: 0,
        pstnSeconds: 0,
        aiSeconds: 0,
      };
    }
    return callsTimeseries.buckets.reduce(
      (acc, b) => {
        acc.totalCalls += b.callsTotal;
        acc.pstnSeconds += b.pstnSeconds;
        acc.aiSeconds += b.aiSeconds;
        return acc;
      },
      { totalCalls: 0, pstnSeconds: 0, aiSeconds: 0 },
    );
  }, [callsTimeseries]);

  const callsChartData =
    callsTimeseries?.buckets.map((b) => ({
      date: new Date(b.start).toLocaleDateString(),
      callsTotal: b.callsTotal,
      callsAnswered: b.callsAnswered,
      callsMissed: b.callsMissed,
    })) ?? [];

  const handleRangeChange = (days: 7 | 30) => {
    setRangeDays(days);
    setRange(getDefaultRangeDays(days));
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 shrink-0 border-r bg-muted/10 flex flex-col">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-lg font-semibold mb-2">Telephony Settings</h1>
        </div>
        <Separator className="mb-2" />
        <div className="flex-1 px-6 pb-6">
          <AdminTelephonySecondaryMenu />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <PageBreadcrumb />
        </header>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Usage
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={rangeDays === 7 ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleRangeChange(7)}
                >
                  Last 7 days
                </Button>
                <Button
                  type="button"
                  variant={rangeDays === 30 ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleRangeChange(30)}
                >
                  Last 30 days
                </Button>
              </div>
            </div>
            {/* KPI strip */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total calls</CardTitle>
                  <CardDescription>All plans and numbers in range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpi.totalCalls.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>PSTN minutes</CardTitle>
                  <CardDescription>Billable carrier time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {secondsToMinutes(kpi.pstnSeconds)}m
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AI minutes</CardTitle>
                  <CardDescription>Agent speaking time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {secondsToMinutes(kpi.aiSeconds)}m
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend chart */}
            <Card>
              <CardHeader>
                <CardTitle>Call volume over time</CardTitle>
                <CardDescription>Daily call activity for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {isCallsTimeseriesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading call trends…</p>
                ) : callsChartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No call activity for this period.
                  </p>
                ) : (
                  <ChartContainer config={{}}>
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={callsChartData}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="callsTotal" name="Total" fill="#0f172a" radius={4} />
                          <Bar
                            dataKey="callsAnswered"
                            name="Answered"
                            fill="#22c55e"
                            radius={4}
                          />
                          <Bar
                            dataKey="callsMissed"
                            name="Missed"
                            fill="#ef4444"
                            radius={4}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="plans">By Plan</TabsTrigger>
                <TabsTrigger value="numbers">By Number</TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan usage</CardTitle>
                    <CardDescription>
                      Aggregated call usage by plan for the selected time range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">
                          Time range (UTC)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          From: {new Date(from).toLocaleString()} – To:{" "}
                          {new Date(to).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex-1" />
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Filter by plan code (optional)"
                          value={planCodeFilter}
                          onChange={(e) => setPlanCodeFilter(e.target.value)}
                          className="h-8 w-56"
                        />
                      </div>
                    </div>

                    {planError && (
                      <p className="text-sm text-destructive">
                        {planError.message || "Failed to load plan usage."}
                      </p>
                    )}

                    {isPlanLoading && !planError && (
                      <p className="text-sm text-muted-foreground">Loading plan usage…</p>
                    )}

                    {!isPlanLoading && !planError && (planUsage?.length ?? 0) === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No usage found for this period.
                      </p>
                    )}

                    {!isPlanLoading && !planError && (planUsage?.length ?? 0) > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">Plan</th>
                              <th className="px-3 py-2 text-right font-medium">Total calls</th>
                              <th className="px-3 py-2 text-right font-medium">Answered</th>
                              <th className="px-3 py-2 text-right font-medium">Missed</th>
                              <th className="px-3 py-2 text-right font-medium">Failed</th>
                              <th className="px-3 py-2 text-right font-medium">
                                PSTN minutes
                              </th>
                              <th className="px-3 py-2 text-right font-medium">AI minutes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {planUsage!.map((row) => (
                              <tr key={row.planCode} className="border-t">
                                <td className="px-3 py-2">
                                  <Badge variant="outline" className="text-xs">
                                    {row.planCode || "unassigned"}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {row.totalCalls.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {row.answeredCalls.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {row.missedCalls.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {row.failedCalls.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {secondsToMinutes(row.totalPstnSeconds)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {secondsToMinutes(row.totalAiSeconds)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="numbers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Number usage</CardTitle>
                    <CardDescription>
                      Aggregated usage per phone number for a specific user.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form
                      className="flex flex-wrap items-end gap-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setUserIdFilter(userIdInput.trim() || null);
                      }}
                    >
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          User ID
                        </label>
                        <Input
                          placeholder="Paste user ID (UUID)"
                          value={userIdInput}
                          onChange={(e) => setUserIdInput(e.target.value)}
                          className="h-8 w-80"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Plan code (optional)
                        </label>
                        <Input
                          placeholder="Filter by plan code"
                          value={numberPlanFilter}
                          onChange={(e) => setNumberPlanFilter(e.target.value)}
                          className="h-8 w-48"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Top N (optional)
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={topNumbersLimit}
                          onChange={(e) =>
                            setTopNumbersLimit(
                              Math.min(100, Math.max(1, Number(e.target.value) || 10)),
                            )
                          }
                          className="h-8 w-32"
                        />
                      </div>
                      <Button type="submit" variant="secondary" className="h-8">
                        Load usage
                      </Button>
                    </form>

                    {numberError && (
                      <p className="text-sm text-destructive">
                        {numberError.message || "Failed to load number usage."}
                      </p>
                    )}

                    {isNumberLoading && !numberError && userIdFilter && (
                      <p className="text-sm text-muted-foreground">Loading number usage…</p>
                    )}

                    {!isNumberLoading &&
                      !numberError &&
                      userIdFilter &&
                      (numberUsage?.length ?? 0) === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No number usage found for this user.
                        </p>
                      )}

                    {!isNumberLoading &&
                      !numberError &&
                      userIdFilter &&
                      (numberUsage?.length ?? 0) > 0 && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                            <thead className="bg-muted">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium">
                                  Phone number
                                </th>
                                <th className="px-3 py-2 text-right font-medium">
                                  Call count
                                </th>
                                <th className="px-3 py-2 text-right font-medium">
                                  PSTN minutes
                                </th>
                                <th className="px-3 py-2 text-right font-medium">
                                  AI minutes
                                </th>
                                <th className="px-3 py-2 text-left font-medium">
                                  Last call at
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {numberUsage!.map((row) => (
                                <tr key={row.phoneNumberId} className="border-t">
                                  <td className="px-3 py-2">
                                    <span className="font-mono text-xs">
                                      {row.phoneNumber}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {row.callCount.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {secondsToMinutes(row.totalPstnSeconds)}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {secondsToMinutes(row.totalAiSeconds)}
                                  </td>
                                  <td className="px-3 py-2">
                                    {row.lastCallAt
                                      ? new Date(row.lastCallAt).toLocaleString()
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Top numbers table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top numbers</CardTitle>
                    <CardDescription>
                      Highest-usage numbers for this period (optionally filtered).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topNumbers && topNumbers.rows.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No top numbers found for this period.
                      </p>
                    ) : null}

                    {topNumbers && topNumbers.rows.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">Phone number</th>
                              <th className="px-3 py-2 text-right font-medium">Calls</th>
                              <th className="px-3 py-2 text-right font-medium">PSTN minutes</th>
                              <th className="px-3 py-2 text-right font-medium">AI minutes</th>
                              <th className="px-3 py-2 text-left font-medium">User ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topNumbers.rows.map((row) => (
                              <tr key={row.phoneNumberId} className="border-t">
                                <td className="px-3 py-2">
                                  <span className="font-mono text-xs">{row.phoneNumber}</span>
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {row.callsTotal.toLocaleString()}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {secondsToMinutes(row.pstnSeconds)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {secondsToMinutes(row.aiSeconds)}
                                </td>
                                <td className="px-3 py-2">
                                  <span className="font-mono text-xs">{row.userId}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}


