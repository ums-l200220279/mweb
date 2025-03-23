"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for the heatmap
const generateHeatmapData = () => {
  const data = []
  const categories = ["Memory", "Attention", "Language", "Visuospatial", "Executive"]
  const ageGroups = ["60-65", "66-70", "71-75", "76-80", "81+"]

  for (let i = 0; i < categories.length; i++) {
    const row = []
    for (let j = 0; j < ageGroups.length; j++) {
      // Generate a random score between 0 and 100
      const score = Math.floor(Math.random() * 100)
      row.push(score)
    }
    data.push({
      category: categories[i],
      scores: row,
    })
  }

  return { data, ageGroups }
}

const { data, ageGroups } = generateHeatmapData()

// Function to determine cell color based on score
const getCellColor = (score: number) => {
  if (score >= 80) return "bg-green-500"
  if (score >= 60) return "bg-green-300"
  if (score >= 40) return "bg-yellow-300"
  if (score >= 20) return "bg-orange-300"
  return "bg-red-500"
}

export default function PatientHeatmap() {
  const [filter, setFilter] = useState("all")

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            <SelectItem value="male">Male Patients</SelectItem>
            <SelectItem value="female">Female Patients</SelectItem>
            <SelectItem value="high-risk">High Risk Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left">Cognitive Function</th>
              {ageGroups.map((age) => (
                <th key={age} className="p-2 text-center">
                  {age} years
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border p-2 font-medium">{row.category}</td>
                {row.scores.map((score, colIndex) => (
                  <td
                    key={colIndex}
                    className={`border p-2 text-center ${getCellColor(score)}`}
                    title={`${row.category} score for ${ageGroups[colIndex]} age group: ${score}`}
                  >
                    {score}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <div>Lower scores indicate potential cognitive impairment</div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 bg-red-500"></span>
          <span>Severe</span>
          <span className="inline-block h-3 w-3 bg-orange-300"></span>
          <span>Moderate</span>
          <span className="inline-block h-3 w-3 bg-yellow-300"></span>
          <span>Mild</span>
          <span className="inline-block h-3 w-3 bg-green-300"></span>
          <span>Normal</span>
          <span className="inline-block h-3 w-3 bg-green-500"></span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  )
}

