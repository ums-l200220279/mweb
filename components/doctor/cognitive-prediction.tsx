"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Brain, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"
import type { PredictionResult } from "@/types/ml"

interface CognitivePredictionProps {
  patientId: string
  currentMMSE: number
}

export default function CognitivePrediction({ patientId, currentMMSE }: CognitivePredictionProps) {
  const [timeframe, setTimeframe] = useState("6")
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ml/predict-progression", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          timeframe: Number.parseInt(timeframe),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get prediction")
      }

      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Generate chart data
  const generateChartData = () => {
    if (!prediction) return []

    const months = Number.parseInt(timeframe)
    const data = []

    // Add current point
    data.push({
      month: "Current",
      score: currentMMSE,
      predicted: null,
      upperBound: null,
      lowerBound: null,
    })

    // Add prediction point
    data.push({
      month: `Month ${months}`,
      score: null,
      predicted: prediction.predictedMMSEScore,
      upperBound: prediction.confidenceInterval[1],
      lowerBound: prediction.confidenceInterval[0],
    })

    return data
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          Cognitive Decline Prediction
        </CardTitle>
        <CardDescription>Predict cognitive function over time based on patient data and ML analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end space-x-4 mb-6">
          <div className="space-y-1 flex-1">
            <label htmlFor="timeframe" className="text-sm font-medium">
              Prediction Timeframe
            </label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="timeframe">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePredict} disabled={loading}>
            {loading ? "Predicting..." : "Generate Prediction"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {prediction ? (
          <div className="space-y-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 30]} label={{ value: "MMSE Score", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    name="Current Score"
                    strokeWidth={2}
                    dot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#82ca9d"
                    name="Predicted Score"
                    strokeWidth={2}
                    dot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="upperBound"
                    stroke="#82ca9d"
                    strokeDasharray="5 5"
                    name="Upper Bound"
                    strokeWidth={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="#82ca9d"
                    strokeDasharray="5 5"
                    name="Lower Bound"
                    strokeWidth={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium flex items-center">
                    {prediction.riskLevel === "high" ? (
                      <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                    ) : prediction.riskLevel === "medium" ? (
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                    ) : (
                      <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                    )}
                    Risk Level: {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)}
                  </CardTitle>
                  <CardDescription className="text-xs">Based on cognitive trends and risk factors</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Predicted MMSE: {prediction.predictedMMSEScore}</CardTitle>
                  <CardDescription className="text-xs">
                    Range: {prediction.confidenceInterval[0]} - {prediction.confidenceInterval[1]}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">
                    Change: {(prediction.predictedMMSEScore - currentMMSE).toFixed(1)} points
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {Math.abs(((prediction.predictedMMSEScore - currentMMSE) / currentMMSE) * 100).toFixed(1)}%{" "}
                    {prediction.predictedMMSEScore >= currentMMSE ? "improvement" : "decline"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Key Contributing Factors</h4>
              <ul className="list-disc pl-5 space-y-1">
                {prediction.keyFactors.map((factor, index) => (
                  <li key={index} className="text-sm">
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1">
                {prediction.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center border rounded-md bg-muted/20">
            <p className="text-muted-foreground">Select a timeframe and generate a prediction to see results</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled={!prediction}>
          Download Report
        </Button>
        <Button disabled={!prediction}>Share with Care Team</Button>
      </CardFooter>
    </Card>
  )
}

