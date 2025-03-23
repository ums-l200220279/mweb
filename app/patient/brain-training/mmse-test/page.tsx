"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

const questions = [
  {
    id: 1,
    question: "What year is it now?",
    options: ["2023", "2024", "2025", "2026"],
  },
  {
    id: 2,
    question: "What season is it?",
    options: ["Spring", "Summer", "Fall", "Winter"],
  },
  // Add more questions here
]

export default function MMSETestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitAssessment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/cognitive-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) throw new Error("Failed to submit assessment")

      const result = await response.json()
      router.push(`/patient/brain-training/mmse-test/results?score=${result.score}`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>MMSE Test</CardTitle>
          <CardDescription>Answer the following questions to the best of your ability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="py-4">
            <h3 className="text-lg font-medium mb-2">{questions[currentQuestion].question}</h3>
            <RadioGroup onValueChange={handleAnswer} value={answers[questions[currentQuestion].id]}>
              {questions[currentQuestion].options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!answers[questions[currentQuestion].id] || isLoading}>
            {currentQuestion < questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

