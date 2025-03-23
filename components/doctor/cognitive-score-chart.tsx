"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { month: "Jan", avgScore: 22, highRisk: 18, lowRisk: 26 },
  { month: "Feb", avgScore: 22.5, highRisk: 18.5, lowRisk: 26.2 },
  { month: "Mar", avgScore: 23, highRisk: 19, lowRisk: 26.5 },
  { month: "Apr", avgScore: 23.2, highRisk: 19.2, lowRisk: 26.8 },
  { month: "May", avgScore: 23.5, highRisk: 19.5, lowRisk: 27 },
  { month: "Jun", avgScore: 24, highRisk: 20, lowRisk: 27.5 },
]

export default function CognitiveScoreChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 30]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgScore"
            name="Average MMSE Score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="highRisk"
            name="High Risk Patients"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="lowRisk"
            name="Low Risk Patients"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

