"use client"

import React, { useMemo } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type ChartData = {
  [key: string]: string | number | Date
}

type ChartType = "line" | "bar"

interface OptimizedChartProps {
  data: ChartData[]
  type?: ChartType
  title?: string
  description?: string
  xAxisKey: string
  yAxisKeys: string[]
  colors?: string[]
  height?: number
  className?: string
  isLoading?: boolean
  formatXAxis?: (value: any) => string
  formatYAxis?: (value: any) => string
  formatTooltip?: (value: any, name: string) => string
}

/**
 * OptimizedChart component with memoization for better performance
 */
export function OptimizedChart({
  data,
  type = "line",
  title,
  description,
  xAxisKey,
  yAxisKeys,
  colors = ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b"],
  height = 300,
  className,
  isLoading = false,
  formatXAxis,
  formatYAxis,
  formatTooltip,
}: OptimizedChartProps) {
  // Memoize the chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => data, [data])

  // Memoize the chart components to prevent unnecessary re-renders
  const chartLines = useMemo(() => {
    return yAxisKeys.map((key, index) => {
      const color = colors[index % colors.length]

      if (type === "line") {
        return <Line key={key} type="monotone" dataKey={key} stroke={color} activeDot={{ r: 8 }} strokeWidth={2} />
      }

      return <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} />
    })
  }, [yAxisKeys, colors, type])

  // Render loading skeleton if data is loading
  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <Skeleton className="h-4 w-2/3" />}
          </CardHeader>
        )}
        <CardContent>
          <Skeleton className={`w-full h-[${height}px]`} />
        </CardContent>
      </Card>
    )
  }

  // Render chart with data
  return (
    <Card className={cn("w-full", className)}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {type === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} tickMargin={10} />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              {chartLines}
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey={xAxisKey} tickFormatter={formatXAxis} tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} tickMargin={10} />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              {chartLines}
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Export a memoized version of the component for even better performance
export default React.memo(OptimizedChart)

