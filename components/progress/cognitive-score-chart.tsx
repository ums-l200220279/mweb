"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getCognitiveScores } from "@/lib/api/game-api"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CognitiveScoreData {
  date: string
  MEMORY?: number
  ATTENTION?: number
  VISUAL_SPATIAL?: number
  EXECUTIVE_FUNCTION?: number
  PROCESSING_SPEED?: number
  LANGUAGE?: number
}

export function CognitiveScoreChart() {
  const [data, setData] = useState<CognitiveScoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const response = await getCognitiveScores(timeRange)

        // Process the data for the chart
        const processedData: CognitiveScoreData[] = []
        const dateMap: Record<string, CognitiveScoreData> = {}

        // Create a map of dates to data points
        for (const [category, scores] of Object.entries(response.scores)) {
          for (const score of scores) {
            const dateStr = new Date(score.date).toLocaleDateString()

            if (!dateMap[dateStr]) {
              dateMap[dateStr] = { date: dateStr }
            }

            dateMap[dateStr][category] = score.score
          }
        }

        // Convert the map to an array and sort by date
        const sortedData = Object.values(dateMap).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        setData(sortedData)
      } catch (error) {
        console.error("Error loading cognitive scores:", error)
        toast({
          title: "Error",
          description: "Failed to load cognitive scores. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [timeRange, toast])

  if (loading) {
    return <Skeleton className="h-80 w-full" />
  }

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center">
        <p className="text-muted-foreground mb-2">No cognitive score data available.</p>
        <p className="text-sm text-muted-foreground">
          Complete brain training games to start tracking your cognitive performance.
        </p>
      </div>
    )
  }

  // Colors for each cognitive area
  const colors = {
    MEMORY: "#4f46e5", // indigo
    ATTENTION: "#0ea5e9", // sky
    VISUAL_SPATIAL: "#10b981", // emerald
    EXECUTIVE_FUNCTION: "#f59e0b", // amber
    PROCESSING_SPEED: "#ef4444", // red
    LANGUAGE: "#8b5cf6", // violet
  }

  // Labels for each cognitive area
  const labels = {
    MEMORY: "Memory",
    ATTENTION: "Attention",
    VISUAL_SPATIAL: "Visual Spatial",
    EXECUTIVE_FUNCTION: "Executive Function",
    PROCESSING_SPEED: "Processing Speed",
    LANGUAGE: "Language",
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickMargin={10} />
          <YAxis stroke="#6b7280" fontSize={12} domain={[0, 100]} tickMargin={10} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(17, 24, 39, 0.8)",
              border: "none",
              borderRadius: "4px",
              color: "#f3f4f6",
            }}
          />
          <Legend />
          {Object.entries(labels).map(([key, label]) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={colors[key as keyof typeof colors]}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

