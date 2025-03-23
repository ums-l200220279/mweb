"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

const data = [
  { date: "Jan 1", mmseScore: 22, sleepQuality: 6, dailyActivity: 4 },
  { date: "Feb 1", mmseScore: 23, sleepQuality: 7, dailyActivity: 5 },
  { date: "Mar 1", mmseScore: 24, sleepQuality: 7, dailyActivity: 6 },
  { date: "Apr 1", mmseScore: 24, sleepQuality: 8, dailyActivity: 7 },
  { date: "May 1", mmseScore: 25, sleepQuality: 8, dailyActivity: 8 },
  { date: "Jun 1", mmseScore: 26, sleepQuality: 9, dailyActivity: 8 },
]

export default function CognitiveChart() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle>Cognitive Health Trends</CardTitle>
          <CardDescription>Your MMSE score, sleep quality, and daily activity over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" domain={[0, 30]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mmseScore"
                  name="MMSE Score"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line yAxisId="right" type="monotone" dataKey="sleepQuality" name="Sleep Quality" stroke="#82ca9d" />
                <Line yAxisId="right" type="monotone" dataKey="dailyActivity" name="Daily Activity" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

