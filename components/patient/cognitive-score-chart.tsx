"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "Jan 1", score: 22 },
  { date: "Feb 1", score: 23 },
  { date: "Mar 1", score: 24 },
  { date: "Apr 1", score: 24 },
  { date: "May 1", score: 25 },
  { date: "Jun 1", score: 26 },
]

export default function CognitiveScoreChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 30]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

