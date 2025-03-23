"use client"

import React, { useMemo } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import OptimizedChart from "@/components/optimized-chart"
import { ErrorBoundary } from "@/components/error-boundary"
import { usePatientStore } from "@/lib/state/store"

interface CognitiveChartProps {
  className?: string
}

/**
 * CognitiveChart component displays cognitive scores over time with different views
 */
export function CognitiveChart({ className }: CognitiveChartProps) {
  // Get data from the store
  const { filteredCognitiveScores, isLoading, error } = usePatientStore()

  const scores = filteredCognitiveScores()

  // Memoize the chart data to prevent unnecessary re-renders
  const mmseChartData = useMemo(() => {
    return scores.map((score) => ({
      date: format(new Date(score.date), "MMM d, yyyy"),
      score: score.mmseScore,
    }))
  }, [scores])

  // Memoize the domain chart data to prevent unnecessary re-renders
  const domainChartData = useMemo(() => {
    return scores.map((score) => ({
      date: format(new Date(score.date), "MMM d, yyyy"),
      memory: score.memoryScore,
      attention: score.attentionScore,
      language: score.languageScore,
      visuospatial: score.visuospatialScore,
      executiveFunction: score.executiveFunctionScore,
    }))
  }, [scores])

  // Format functions for the charts
  const formatYAxis = (value: number) => `${value}`
  const formatTooltip = (value: number) => `Score: ${value}`

  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading cognitive data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // Handle empty state
  if (scores.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cognitive Performance</CardTitle>
          <CardDescription>No cognitive data available for the selected time period.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data to display
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundary>
      <Card className={className}>
        <CardHeader>
          <CardTitle>Cognitive Performance</CardTitle>
          <CardDescription>Track cognitive performance over time across different domains</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mmse">
            <TabsList className="mb-4">
              <TabsTrigger value="mmse">MMSE Score</TabsTrigger>
              <TabsTrigger value="domains">Cognitive Domains</TabsTrigger>
            </TabsList>

            <TabsContent value="mmse">
              <OptimizedChart
                data={mmseChartData}
                type="line"
                xAxisKey="date"
                yAxisKeys={["score"]}
                colors={["#2563eb"]}
                height={300}
                formatYAxis={formatYAxis}
                formatTooltip={formatTooltip}
              />
            </TabsContent>

            <TabsContent value="domains">
              <OptimizedChart
                data={domainChartData}
                type="line"
                xAxisKey="date"
                yAxisKeys={["memory", "attention", "language", "visuospatial", "executiveFunction"]}
                colors={["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b"]}
                height={300}
                formatYAxis={formatYAxis}
                formatTooltip={formatTooltip}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}

export default React.memo(CognitiveChart)

