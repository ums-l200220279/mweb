"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "Jan 1", score: 65 },
  { date: "Feb 1", score: 68 },
  { date: "Mar 1", score: 72 },
  { date: "Apr 1", score: 75 },
  { date: "May 1", score: 80 },
  { date: "Jun 1", score: 85 },
]

export default function CognitiveScoreChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#00CFC1" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

