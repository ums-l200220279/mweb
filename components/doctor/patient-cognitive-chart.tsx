"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface Assessment {
  date: string
  score: number
  type: string
  notes: string
}

export default function PatientCognitiveChart({ assessments }: { assessments: Assessment[] }) {
  // Transform assessments for the chart (reverse to show chronological order)
  const chartData = [...assessments].reverse().map((assessment) => ({
    date: assessment.date,
    score: assessment.score,
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 30]} />
          <Tooltip />
          <ReferenceLine
            y={24}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{ value: "MCI Threshold", position: "insideBottomRight", fill: "#f59e0b", fontSize: 12 }}
          />
          <ReferenceLine
            y={18}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ value: "Dementia Threshold", position: "insideBottomRight", fill: "#ef4444", fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="MMSE Score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

