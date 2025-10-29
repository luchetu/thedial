"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Users, Clock, AlertTriangle, TrendingUp, MessageSquare, Star } from "lucide-react"

// Sample analytics data
const topClientsData = [
  { name: "Acme Corp", calls: 12, duration: "2h 34m", lastCall: "2024-01-15" },
  { name: "TechStart Inc", calls: 8, duration: "1h 45m", lastCall: "2024-01-14" },
  { name: "Global Solutions", calls: 6, duration: "1h 20m", lastCall: "2024-01-13" },
  { name: "Innovation Labs", calls: 5, duration: "1h 15m", lastCall: "2024-01-12" },
  { name: "Future Systems", calls: 4, duration: "45m", lastCall: "2024-01-11" }
]

const dailyTalkTimeData = [
  { day: "Mon", duration: 45 },
  { day: "Tue", duration: 67 },
  { day: "Wed", duration: 89 },
  { day: "Thu", duration: 56 },
  { day: "Fri", duration: 78 },
  { day: "Sat", duration: 23 },
  { day: "Sun", duration: 12 }
]

const followUpData = [
  { id: "1", client: "Acme Corp", callDate: "2024-01-15", urgency: "high", daysOverdue: 2 },
  { id: "2", client: "TechStart Inc", callDate: "2024-01-14", urgency: "medium", daysOverdue: 1 },
  { id: "3", client: "Global Solutions", callDate: "2024-01-13", urgency: "low", daysOverdue: 0 },
  { id: "4", client: "Innovation Labs", callDate: "2024-01-12", urgency: "high", daysOverdue: 3 }
]

const sentimentData = [
  { name: "Positive", value: 65, color: "#22c55e" },
  { name: "Neutral", value: 25, color: "#6b7280" },
  { name: "Negative", value: 10, color: "#ef4444" }
]

const keywordAnalysisData = [
  { keyword: "project", count: 23, sentiment: "positive" },
  { keyword: "timeline", count: 18, sentiment: "neutral" },
  { keyword: "budget", count: 15, sentiment: "neutral" },
  { keyword: "deadline", count: 12, sentiment: "negative" },
  { keyword: "meeting", count: 20, sentiment: "positive" }
]

const chartConfig = {
  duration: {
    label: "Duration (min)",
    color: "#fd753e",
  },
} satisfies ChartConfig

const urgencyConfig: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "bg-red-100 text-red-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  low: { label: "Low", color: "bg-green-100 text-green-800" }
}

const sentimentConfig: Record<string, { label: string; color: string }> = {
  positive: { label: "Positive", color: "text-green-600" },
  neutral: { label: "Neutral", color: "text-gray-600" },
  negative: { label: "Negative", color: "text-red-600" }
}

export function InsightsDashboard() {
  const averageTalkTime = dailyTalkTimeData.reduce((sum, day) => sum + day.duration, 0) / dailyTalkTimeData.length
  const totalCallsWithoutFollowUp = followUpData.length
  const overdueFollowUps = followUpData.filter(item => item.daysOverdue > 0).length

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Talk Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageTalkTime)}m</div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topClientsData.length}</div>
            <p className="text-xs text-muted-foreground">active clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Without Follow-up</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCallsWithoutFollowUp}</div>
            <p className="text-xs text-muted-foreground">{overdueFollowUps} overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-green-600">+5% from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Clients You Spoke With
            </CardTitle>
            <CardDescription>Most frequent contacts this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClientsData.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">Last call: {client.lastCall}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{client.calls} calls</p>
                    <p className="text-sm text-muted-foreground">{client.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Talk Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Average Talk Time Per Day
            </CardTitle>
            <CardDescription>Daily call duration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTalkTimeData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <Bar dataKey="duration" fill="#fd753e" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Calls Without Follow-up */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Calls Without Follow-up Tasks
            </CardTitle>
            <CardDescription>Requires immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {followUpData.map((item) => {
                const urgencyInfo = urgencyConfig[item.urgency]
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.client}</p>
                      <p className="text-sm text-muted-foreground">Call: {item.callDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={urgencyInfo.color}>
                        {urgencyInfo.label}
                      </Badge>
                      {item.daysOverdue > 0 && (
                        <Badge variant="destructive">
                          {item.daysOverdue}d overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sentiment Analysis
            </CardTitle>
            <CardDescription>Call sentiment distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Keyword Analysis
          </CardTitle>
          <CardDescription>Most mentioned terms with sentiment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {keywordAnalysisData.map((item) => {
              const sentimentInfo = sentimentConfig[item.sentiment]
              return (
                <div key={item.keyword} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{item.keyword}</Badge>
                    <Badge className={sentimentInfo.color}>
                      {sentimentInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.count} mentions</span>
                    <Progress value={(item.count / 25) * 100} className="w-20" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
