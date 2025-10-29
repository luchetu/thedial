"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"

const callActivityData = [
  { day: "Mon", incoming: 12, outgoing: 8, missed: 3 },
  { day: "Tue", incoming: 15, outgoing: 10, missed: 2 },
  { day: "Wed", incoming: 18, outgoing: 12, missed: 4 },
  { day: "Thu", incoming: 14, outgoing: 9, missed: 1 },
  { day: "Fri", incoming: 20, outgoing: 15, missed: 5 },
  { day: "Sat", incoming: 8, outgoing: 6, missed: 2 },
  { day: "Sun", incoming: 6, outgoing: 4, missed: 1 },
]

const chartConfig = {
  incoming: {
    label: "Incoming",
    color: "#fd753e",
  },
  outgoing: {
    label: "Outgoing", 
    color: "#ea580c",
  },
  missed: {
    label: "Missed",
    color: "#c2410c",
  },
} satisfies ChartConfig

export function CallActivityChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={callActivityData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="incoming" fill="#fd753e" radius={4} />
          <Bar dataKey="outgoing" fill="#ea580c" radius={4} />
          <Bar dataKey="missed" fill="#c2410c" radius={4} />
        </BarChart> 
      </ResponsiveContainer>
    </ChartContainer>
  )
}
