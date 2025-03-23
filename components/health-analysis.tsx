"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface PatientData {
  id: string
  age: number
  gender: string
  cognitiveScores: number[]
  medicalHistory: string[]
}

export default function HealthAnalysis({ patientData }: { patientData: PatientData }) {
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/health-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientData }),
      })

      if (!response.ok) throw new Error("Failed to get health analysis")

      const result = await response.json()
      setAnalysis(result)
    } catch (error) {
      console.error("Error in fetching health analysis:", error)
    } finally {
      setIsLoading(false)
    }
  }, [patientData])

  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Analysis & Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading analysis...</p>
        ) : analysis ? (
          <>
            <h3 className="font-semibold mb-2">Analysis:</h3>
            <p>{analysis.analysis}</p>
            <h3 className="font-semibold mt-4 mb-2">Recommendations:</h3>
            <ul className="list-disc pl-5">
              {analysis.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </>
        ) : (
          <p>No analysis available.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={fetchAnalysis} disabled={isLoading}>
          Refresh Analysis
        </Button>
      </CardFooter>
    </Card>
  )
}

