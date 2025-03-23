"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface PatientData {
  id: string
  age: number
  gender: string
  cognitiveScores: number[]
  medicalHistory: string[]
}

export default function DecisionSupportSystem({ patientData }: { patientData: PatientData }) {
  const [currentDiagnosis, setCurrentDiagnosis] = useState("")
  const [proposedTreatment, setProposedTreatment] = useState("")
  const [decisionSupport, setDecisionSupport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/decision-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientData, currentDiagnosis, proposedTreatment }),
      })

      if (!response.ok) throw new Error("Failed to get decision support")

      const result = await response.json()
      setDecisionSupport(result)
    } catch (error) {
      console.error("Error in decision support system:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automated Decision Support System</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentDiagnosis">Current Diagnosis</Label>
            <Textarea
              id="currentDiagnosis"
              value={currentDiagnosis}
              onChange={(e) => setCurrentDiagnosis(e.target.value)}
              placeholder="Enter the current diagnosis"
            />
          </div>
          <div>
            <Label htmlFor="proposedTreatment">Proposed Treatment</Label>
            <Textarea
              id="proposedTreatment"
              value={proposedTreatment}
              onChange={(e) => setProposedTreatment(e.target.value)}
              placeholder="Enter the proposed treatment"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Get Decision Support
          </Button>
        </form>
        {decisionSupport && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Decision Support:</h3>
            <p>{decisionSupport.recommendation}</p>
            <h4 className="font-semibold mt-4 mb-2">Considerations:</h4>
            <ul className="list-disc pl-5">
              {decisionSupport.considerations.map((consideration: string, index: number) => (
                <li key={index}>{consideration}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

