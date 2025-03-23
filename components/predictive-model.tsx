"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PatientData {
  id: string
  age: number
  gender: string
  cognitiveScores: number[]
  medicalHistory: string[]
}

export default function PredictiveModel({ patientData }: { patientData: PatientData }) {
  const [timeframe, setTimeframe] = useState("6")
  const [prediction, setPrediction] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePredict = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/predict-progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientData, timeframe: Number.parseInt(timeframe) }),
      })

      if (!response.ok) throw new Error("Failed to get prediction")

      const result = await response.json()
      setPrediction(result)
    } catch (error) {
      console.error("Error in predicting progression:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predictive Model for Cognitive Decline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {prediction && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Predicted Progression:</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prediction.progressionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cognitiveScore" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-4">{prediction.analysis}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handlePredict} disabled={isLoading}>
          {isLoading ? "Predicting..." : "Predict Progression"}
        </Button>
      </CardFooter>
    </Card>
  )
}

