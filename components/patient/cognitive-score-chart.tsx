"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface CognitiveScore {
  id: string
  patientId: string
  date: string
  score: number
}

interface CognitiveScoreChartProps {
  patientId: string
}

export default function CognitiveScoreChart({ patientId }: CognitiveScoreChartProps) {
  const [scores, setScores] = useState<CognitiveScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/patients/${patientId}/cognitive-scores`)

        if (!response.ok) {
          throw new Error("Failed to fetch cognitive scores")
        }

        const data = await response.json()
        setScores(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (patientId) {
      fetchScores()
    }
  }, [patientId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  const chartData = scores.map((score) => ({
    date: formatDate(score.date),
    score: score.score,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cognitive Score Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : scores.length === 0 ? (
          <div className="text-center text-gray-500 p-4">No cognitive scores available</div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 30]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

