"use client"

import { useState } from "react"
import { useFormValidation } from "@/hooks/use-form-validation"
import { schemas } from "@/lib/validation"
import { useApi } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

/**
 * Form penilaian kognitif dengan validasi terpadu
 */
export function AssessmentForm({ patientId }: { patientId: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Array<{ questionId: string; response: any }>>([])

  const { errors, isSubmitting, handleSubmit } = useFormValidation(schemas.cognitiveAssessment, {
    onSuccess: (data) => {
      // Reset form setelah berhasil
      setCurrentStep(0)
      setResponses([])
    },
    onError: (errors) => {
      console.error("Validation errors:", errors)
    },
  })

  const api = useApi()

  // Contoh pertanyaan MMSE
  const questions = [
    {
      id: "orientation_time",
      category: "Orientation",
      question: "What is today's date?",
      type: "date",
    },
    {
      id: "orientation_place",
      category: "Orientation",
      question: "Where are we right now?",
      type: "text",
    },
    {
      id: "registration",
      category: "Registration",
      question: "I will name three objects. After I have said them, I want you to repeat them back to me.",
      type: "checkbox",
      options: ["Apple", "Table", "Penny"],
    },
    // Tambahkan pertanyaan lain sesuai kebutuhan
  ]

  const currentQuestion = questions[currentStep]

  const handleResponse = (questionId: string, response: any) => {
    const existingIndex = responses.findIndex((r) => r.questionId === questionId)

    if (existingIndex >= 0) {
      const newResponses = [...responses]
      newResponses[existingIndex] = { questionId, response }
      setResponses(newResponses)
    } else {
      setResponses([...responses, { questionId, response }])
    }
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFormSubmit = async () => {
    const assessmentData = {
      patientId,
      assessmentType: "MMSE",
      responses,
      metadata: {
        completedAt: new Date().toISOString(),
      },
    }

    await api.execute(
      () =>
        fetch("/api/cognitive-assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assessmentData),
        }).then((res) => {
          if (!res.ok) throw res
          return res.json()
        }),
      {
        successMessage: "Assessment submitted successfully",
        onSuccess: (data) => {
          // Navigasi ke halaman hasil
          window.location.href = `/assessments/results/${data.assessmentId}`
        },
      },
    )
  }

  // Render pertanyaan berdasarkan tipe
  const renderQuestion = () => {
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={currentQuestion.id}>{currentQuestion.question}</Label>
            <Input
              id={currentQuestion.id}
              value={responses.find((r) => r.questionId === currentQuestion.id)?.response || ""}
              onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
              className="w-full"
            />
            {errors[`responses.${currentQuestion.id}`] && (
              <p className="text-sm text-destructive">{errors[`responses.${currentQuestion.id}`]}</p>
            )}
          </div>
        )

      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={currentQuestion.id}>{currentQuestion.question}</Label>
            <Input
              id={currentQuestion.id}
              type="date"
              value={responses.find((r) => r.questionId === currentQuestion.id)?.response || ""}
              onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
              className="w-full"
            />
            {errors[`responses.${currentQuestion.id}`] && (
              <p className="text-sm text-destructive">{errors[`responses.${currentQuestion.id}`]}</p>
            )}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            <Label>{currentQuestion.question}</Label>
            <div className="space-y-2">
              {currentQuestion.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${currentQuestion.id}_${option}`}
                    checked={
                      responses.find((r) => r.questionId === currentQuestion.id)?.response?.includes(option) || false
                    }
                    onChange={(e) => {
                      const currentResponse = responses.find((r) => r.questionId === currentQuestion.id)?.response || []
                      const newResponse = e.target.checked
                        ? [...currentResponse, option]
                        : currentResponse.filter((item: string) => item !== option)
                      handleResponse(currentQuestion.id, newResponse)
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor={`${currentQuestion.id}_${option}`}>{option}</Label>
                </div>
              ))}
            </div>
            {errors[`responses.${currentQuestion.id}`] && (
              <p className="text-sm text-destructive">{errors[`responses.${currentQuestion.id}`]}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cognitive Assessment</CardTitle>
        <CardDescription>MMSE (Mini-Mental State Examination)</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Progress indicator */}
        <div className="w-full bg-secondary h-2 rounded-full mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question category */}
        <div className="mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            {currentQuestion?.category} ({currentStep + 1}/{questions.length})
          </span>
        </div>

        {/* Current question */}
        {renderQuestion()}

        {/* Error alert */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please correct the errors before proceeding.</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
          Previous
        </Button>

        {currentStep < questions.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleFormSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Complete Assessment"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

