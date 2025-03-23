"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const questions = [
  {
    id: 1,
    question: "What year is it now?",
    options: ["2023", "2024", "2025", "2026"],
  },
  // Add more questions here
]

export default function MMSETest() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [assessment, setAssessment] = useState(null)

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: answer })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitAssessment()
    }
  }

  const submitAssessment = async () => {
    try {
      const response = await fetch("/api/cognitive-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) throw new Error("Failed to get assessment")

      const result = await response.json()
      setAssessment(result)
    } catch (error) {
      console.error("Error in submitting assessment:", error)
    }
  }

  if (assessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MMSE Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Score: {assessment.score}/30</p>
          <p>Assessment: {assessment.interpretation}</p>
          <p>Recommendations: {assessment.recommendations}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MMSE Test</CardTitle>
      </CardHeader>
      <CardContent>
        <h2 className="text-lg font-semibold mb-4">{questions[currentQuestion].question}</h2>
        <RadioGroup onValueChange={handleAnswer} value={answers[questions[currentQuestion].id]}>
          {questions[currentQuestion].options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext}>{currentQuestion < questions.length - 1 ? "Next" : "Submit"}</Button>
      </CardFooter>
    </Card>
  )
}

