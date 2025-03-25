"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  type: "multiple-choice" | "text-input" | "image-recognition" | "memory-recall" | "drawing"
  question: string
  options?: string[]
  correctAnswer?: string
  timeLimit?: number
  imageUrl?: string
}

interface TestInterfaceProps {
  testId: string
  testName: string
  questions: Question[]
  onComplete: (results: any) => void
}

export default function TestInterface({ testId, testName, questions, onComplete }: TestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  useEffect(() => {
    if (currentQuestion.timeLimit && !showInstructions) {
      setTimeRemaining(currentQuestion.timeLimit)
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            // Auto-advance if time runs out
            if (currentQuestionIndex < questions.length - 1) {
              setCurrentQuestionIndex(currentQuestionIndex + 1)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentQuestion, currentQuestionIndex, showInstructions])

  const handleAnswer = (value: any) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // In a real app, you would send the answers to your API
      // const response = await fetch(`/api/cognitive-tests/${testId}/submit`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ answers }),
      // })
      // const results = await response.json()

      // For demo purposes, we'll simulate a response
      setTimeout(() => {
        const results = {
          testId,
          score: 85,
          maxScore: 100,
          completedAt: new Date().toISOString(),
          answers,
          feedback: "Great job! Your cognitive abilities are above average.",
        }
        onComplete(results)
        setIsSubmitting(false)
      }, 1500)
    } catch (error) {
      console.error("Error submitting test:", error)
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (showInstructions) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{testName}</CardTitle>
          <CardDescription>Please read the instructions carefully before starting the test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h3 className="font-semibold text-lg mb-2">Instructions</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>This test contains {questions.length} questions to assess different cognitive abilities.</li>
              <li>Some questions may have time limits. Answer as quickly and accurately as possible.</li>
              <li>You can navigate between questions using the previous and next buttons.</li>
              <li>Your results will be analyzed to provide personalized cognitive insights.</li>
              <li>The test takes approximately {Math.ceil(questions.length * 1.5)} minutes to complete.</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Important Note</h3>
                <p className="text-amber-700">
                  This test is designed for screening purposes only and is not a diagnostic tool. Please consult with a
                  healthcare professional for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => setShowInstructions(false)} className="bg-primary-600 hover:bg-primary-700">
            Start Test
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          {timeRemaining !== null && (
            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                timeRemaining < 10 ? "bg-red-100 text-red-700" : "bg-primary-100 text-primary-700",
              )}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion.type === "multiple-choice" && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "text-input" && (
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="min-h-[100px]"
                />
              )}

              {currentQuestion.type === "image-recognition" && (
                <div className="space-y-4">
                  {currentQuestion.imageUrl && (
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={currentQuestion.imageUrl || "/placeholder.svg"}
                        alt="Recognition task"
                        className="w-full object-contain max-h-[300px]"
                      />
                    </div>
                  )}
                  <Input
                    placeholder="What do you see in this image?"
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    {isSubmitting ? "Submitting..." : "Complete Test"}
                    {!isSubmitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

