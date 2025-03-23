"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Low Risk", value: 65 },
  { name: "Medium Risk", value: 25 },
  { name: "High Risk", value: 10 },
]

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"]

export default function DementiaCategoryChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} patients`, "Count"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

