"use client"

import React from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface UsageChartProps {
  data: Array<{ date: string; minutes: number }>
}

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function UsageChart({ data }: UsageChartProps) {
  // Format data for the chart - format dates to be more readable
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    minutes: item.minutes,
    fullDate: item.date,
  }))

  // Calculate max value for better Y-axis scaling
  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 0)
  const yAxisDomain = [0, Math.max(maxMinutes * 1.1, 10)] // Add 10% padding, minimum 10

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart 
        data={chartData}
        margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
        barCategoryGap="10%"
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          angle={chartData.length > 7 ? -45 : 0}
          textAnchor={chartData.length > 7 ? "end" : "middle"}
          height={chartData.length > 7 ? 60 : 40}
          interval={0}
          type="category"
          padding={{ left: 0, right: 0 }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          domain={yAxisDomain}
          width={60}
          label={{ 
            value: "Minutes", 
            angle: 0, 
            position: "left",
            style: { textAnchor: "middle", fontSize: 11, fill: "hsl(var(--muted-foreground))" },
            offset: -5
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => [
                `${Number(value).toFixed(2)} minutes`,
                "Usage",
              ]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const fullDate = payload[0].payload.fullDate
                  return new Date(fullDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }
                return label
              }}
            />
          }
        />
        <Bar
          dataKey="minutes"
          fill="var(--color-minutes)"
          radius={[4, 4, 0, 0]}
          maxBarSize={chartData.length <= 7 ? 60 : 40}
        />
      </BarChart>
    </ChartContainer>
  )
}




