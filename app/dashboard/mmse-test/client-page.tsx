"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Brain, Check, AlertTriangle, Info, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Full MMSE questions based on the standard test
const mmseQuestions = [
  // Orientation to Time - 5 points
  {
    id: "time-year",
    category: "Orientation to Time",
    question: "What year is it now?",
    type: "radio",
    options: [
      { value: "correct", label: "Correct" },
      { value: "incorrect", label: "Incorrect" }
    ],
    points: 1,
    instructions: "Score 1 point for the correct year."
  },
  {
    id: "time-season",
    category: "Orientation to Time",
    question: "What season is it now?",
    type: "radio",
    options: [
      { value: "correct", label: "Correct" },
      { value: "incorrect", label: "Incorrect" }
    ],
    points: 1,
    instructions: "Score 1 point for the correct season."
  },
  {
    id: "time-month",
    category: "Orientation to Time",
    question: "What month is it now?",
    type: "radio",
    options: [
      { value: "correct", label: "Correct" },
      { value: "incorrect", label: "Incorrect" }
    ],
    points: 1,
    instructions: "Score 1 point for the correct month."
  },
  {
    id: "time-date",
    category: "Orientation to Time",
    question: "What is today's date?",
    type: "radio",
    options: [
      { value: "correct", label: "Correct" },
      { value: "incorrect", label: "Incorrect" }
    ],
    points: 1,\
    instructions: "Score 1 point for the correct date (±1 day is acceptable  }
    ],
    points: 1,
    instructions: "Score 1 point for the correct date (±1 day is acceptable)."
},
{
  id: "time-day", category
  : "Orientation to Time",
    question: "What day of the week is it today?",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point for the correct day of the week."
}
,

// Orientation to Place - 5 points
{
  id: "place-country", category
  : "Orientation to Place",
    question: "What country are we in?",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point for the correct country."
}
,
{
  id: "place-state", category
  : "Orientation to Place",
    question: "What state/province are we in?",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point for the correct state/province."
}
,
{
  id: "place-city", category
  : "Orientation to Place",
    question: "What city/town are we in?",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point for the correct city/town."
}
,
{
  id: "place-building", category
  : "Orientation to Place",
    question: "What is the name of this place/building?",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point for the correct building or type of building."
}
,
{
  id: "place-floor", category
  : "Orientation to Place",
    question: "What floor are we on?",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point for the correct floor."
}
,

// Registration - 3 points
{
  id: "registration", category
  : "Registration",
    question: "I am going to name three objects. After I have said them, I want you to repeat them back to me. Remember what they are because I will ask you to name them again in a few minutes. The objects are: APPLE, TABLE, PENNY.",
  type: "checkbox", options
  : [
  value: "apple", label
  : "APPLE"
  ,
  value: "table", label
  : "TABLE"
  ,
  value: "penny", label
  : "PENNY"
  ],
    points: 3,
    instructions: "Score 1 point for each item correctly repeated on the first attempt. If needed, repeat the words up to 3 times until all are learned, but only score the first attempt."
}
,

// Attention and Calculation - 5 points
{
  id: "serial-sevens", category
  : "Attention and Calculation",
    question: "I would like you to count backward from 100 by sevens. For example: 100, 93, 86, and so on.",
  type: "checkbox", options
  : [
  value: "93", label
  : "93"
  ,
  value: "86", label
  : "86"
  ,
  value: "79", label
  : "79"
  ,
  value: "72", label
  : "72"
  ,
  value: "65", label
  : "65"
  ],
    points: 5,
    instructions: "Score 1 point for each correct subtraction. Stop after 5 subtractions."
}
,
{
  id: "spell-world", category
  : "Attention and Calculation (Alternative)",
    question: "Spell the word 'WORLD' backwards.",
  type: "text", correctAnswer
  : "DLROW",
    points: 5,
    instructions: "Score 1 point for each correct letter in the right position. This is an alternative to Serial Sevens."
}
,

// Recall - 3 points
{
  id: "recall", category
  : "Recall",
    question: "Earlier I told you the names of three objects. Can you tell me what those objects were?",
  type: "checkbox", options
  : [
  value: "apple", label
  : "APPLE"
  ,
  value: "table", label
  : "TABLE"
  ,
  value: "penny", label
  : "PENNY"
  ],
    points: 3,
    instructions: "Score 1 point for each item correctly recalled without any cues."
}
,

// Language - 2 points
{
  id: "naming", category
  : "Language - Naming",
    question: "What is this called? (Show a wristwatch) And what is this called? (Show a pencil)",
  type: "checkbox", options
  : [
  value: "watch", label
  : "Watch/Wristwatch"
  ,
  value: "pencil", label
  : "Pencil"
  ],
    points: 2,
    instructions: "Score 1 point for each item correctly named."
}
,

// Repetition - 1 point
{
  id: "repetition", category
  : "Language - Repetition",
    question: "Now I am going to ask you to repeat what I say. 'No ifs, ands, or buts.'",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point for correct repetition on the first attempt."
}
,

// 3-Stage Command - 3 points
{
  id: "command", category
  : "Language - 3-Stage Command",
    question: "Listen carefully. I am going to give you a piece of paper. Take the paper in your right hand, fold it in half, and put it on the floor.",
  type: "checkbox", options
  : [
  value: "right-hand", label
  : "Takes paper in right hand"
  ,
  value: "folds", label
  : "Folds paper in half"
  ,
  value: "floor", label
  : "Puts paper on floor"
  ],
    points: 3,
    instructions: "Score 1 point for each part correctly executed."
}
,

// Reading - 1 point
{
  id: "reading", category
  : "Language - Reading",
    question: "Please read this and do what it says: 'CLOSE YOUR EYES'",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct (closes eyes)"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point if the subject closes their eyes."
}
,

// Writing - 1 point
{
  id: "writing", category
  : "Language - Writing",
    question: "Please write a complete sentence on the paper provided.",
  type: "textarea", points
  : 1,
    instructions: "Score 1 point if the sentence contains a subject and a verb and makes sense. Ignore spelling errors."
}
,

// Visuospatial - 1 point
{
  id: "drawing", category
  : "Visuospatial",
    question: "Please copy this design (show intersecting pentagons).",
  type: "radio", options
  : [
  value: "correct", label
  : "Correct"
  ,
  value: "incorrect", label
  : "Incorrect"
  ],
    points: 1,
    instructions: "Score 1 point if all 10 angles are present and the two shapes intersect to form a four-sided figure."
}
]

export default function MMSETestClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [testCompleted, setTestCompleted] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const currentQuestion = mmseQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / mmseQuestions.length) * 100

  const handleRadioChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const currentValues = answers[currentQuestion.id] || []
    const newValues = checked ? [...currentValues, value] : currentValues.filter((v: string) => v !== value)

    setAnswers({ ...answers, [currentQuestion.id]: newValues })
  }

  const handleTextChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const handleNext = () => {
    if (currentQuestionIndex < mmseQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowConfirmDialog(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    let score = 0

    mmseQuestions.forEach((question) => {
      const answer = answers[question.id]

      if (!answer) return

      switch (question.type) {
        case "radio":
          if (answer === "correct") {
            score += question.points
          }
          break
        case "checkbox":
          if (Array.isArray(answer)) {
            score += Math.min(answer.length, question.points)
          }
          break
        case "text":
          if (question.correctAnswer) {
            const userAnswer = answer.toUpperCase()
            const correctAnswer = question.correctAnswer

            for (let i = 0; i < Math.min(userAnswer.length, correctAnswer.length); i++) {
              if (userAnswer[i] === correctAnswer[i]) {
                score += 1
              }
            }
          }
          break
        case "textarea":
          // Simple check for a complete sentence
          const text = answer.trim()
          if (text && text.length > 0 && /[.!?]$/.test(text)) {
            score += question.points
          }
          break
      }
    })

    return score
  }

  const completeTest = () => {
    const finalScore = calculateScore()
    setTotalScore(finalScore)
    setTestCompleted(true)
    setShowConfirmDialog(false)

    // Save results to backend (would be implemented in a real app)
    saveTestResults(finalScore)
      .then(() => {
        toast({
          title: "Test Results Saved",
          description: "Your MMSE test results have been saved successfully.",
        })
      })
      .catch((error) => {
        console.error("Error saving results:", error)
        toast({
          title: "Error Saving Results",
          description: "There was a problem saving your results. Please try again.",
          variant: "destructive",
        })
      })
  }

  const saveTestResults = async (score: number) => {
    // This would be implemented to save results to your backend
    // For now, we'll just simulate a successful save
    return new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const getScoreInterpretation = (score: number) => {
    if (score >= 24) {
      return {
        level: "Normal Cognition",
        description: "No significant cognitive impairment detected.",
        color: "text-green-500",
        recommendations: [
          "Continue with regular cognitive assessments every 6-12 months",
          "Maintain a healthy lifestyle with regular physical exercise",
          "Engage in cognitively stimulating activities",
          "Maintain social connections and activities",
        ],
      }
    } else if (score >= 19) {
      return {
        level: "Mild Cognitive Impairment",
        description: "Some cognitive decline that may require further assessment.",
        color: "text-yellow-500",
        recommendations: [
          "Schedule a follow-up assessment with a healthcare provider",
          "Consider more frequent cognitive assessments (every 3-6 months)",
          "Engage in targeted cognitive training exercises",
          "Review medications that might affect cognition",
          "Ensure adequate sleep and nutrition",
        ],
      }
    } else if (score >= 10) {
      return {
        level: "Moderate Cognitive Impairment",
        description: "Significant cognitive decline that requires medical attention.",
        color: "text-orange-500",
        recommendations: [
          "Consult with a neurologist or geriatrician as soon as possible",
          "Consider comprehensive neuropsychological testing",
          "Evaluate for treatable causes of cognitive impairment",
          "Develop a care plan with healthcare providers",
          "Consider safety measures at home",
        ],
      }
    } else {
      return {
        level: "Severe Cognitive Impairment",
        description: "Severe cognitive decline that requires immediate medical attention.",
        color: "text-red-500",
        recommendations: [
          "Seek immediate medical evaluation",
          "Comprehensive medical workup including brain imaging",
          "Develop a comprehensive care plan with healthcare providers",
          "Consider safety and supervision needs",
          "Evaluate for appropriate support services and care options",
        ],
      }
    }
  }

  const interpretation = getScoreInterpretation(totalScore)

  const isQuestionAnswered = () => {
    const answer = answers[currentQuestion.id]

    if (!answer) return false

    switch (currentQuestion.type) {
      case "radio":
        return !!answer
      case "checkbox":
        return Array.isArray(answer) && answer.length > 0
      case "text":
      case "textarea":
        return answer.trim().length > 0
      default:
        return false
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Mini-Mental State Examination (MMSE)</h1>
        </div>
      </div>

      {showInstructions && !testCompleted && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              About This Test
            </CardTitle>
            <CardDescription>
              The Mini-Mental State Examination (MMSE) is a widely used test of cognitive function among older adults.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This test includes questions that assess various aspects of cognition, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Orientation to time and place</li>
                <li>Registration and recall of information</li>
                <li>Attention and calculation</li>
                <li>Language abilities</li>
                <li>Visual-spatial skills</li>
              </ul>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-2">Instructions</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>The test consists of 30 questions worth a total of 30 points</li>
                  <li>Answer each question to the best of your ability</li>
                  <li>Some questions may be challenging, which is normal</li>
                  <li>The test takes approximately 10-15 minutes to complete</li>
                  <li>Your results will be saved and can be reviewed by your healthcare provider</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Important Note</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      This digital version of the MMSE is for screening purposes only and should not replace a
                      professional medical evaluation. Please consult with a healthcare provider for a complete
                      assessment and diagnosis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowInstructions(false)} className="w-full">
              Begin Test
            </Button>
          </CardFooter>
        </Card>
      )}

      {!showInstructions && !testCompleted && (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {mmseQuestions.length}
              </span>
              <span>Category: {currentQuestion.category}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{currentQuestion.question}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <FileText className="h-4 w-4" />
                <span>{currentQuestion.instructions}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentQuestion.type === "radio" && (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={handleRadioChange}
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${currentQuestion.id}-${option.value}`} />
                      <Label htmlFor={`${currentQuestion.id}-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === "checkbox" && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${currentQuestion.id}-${option.value}`}
                        checked={(answers[currentQuestion.id] || []).includes(option.value)}
                        onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`${currentQuestion.id}-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === "text" && (
                <Input
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Type your answer here"
                  className="w-full"
                />
              )}

              {currentQuestion.type === "textarea" && (
                <Textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Type your answer here"
                  className="w-full min-h-[100px]"
                />
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                Previous
              </Button>
              <Button onClick={handleNext} disabled={!isQuestionAnswered()}>
                {currentQuestionIndex < mmseQuestions.length - 1 ? "Next" : "Complete Test"}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {testCompleted && (
        <Card>
          <CardHeader>
            <CardTitle>MMSE Test Results</CardTitle>
            <CardDescription>Your test has been completed and the results are shown below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-2">Your Score</h3>
                <div className="text-5xl font-bold">
                  {totalScore}
                  <span className="text-2xl text-muted-foreground">/30</span>
                </div>
                <p className={`mt-2 font-medium ${interpretation.color}`}>{interpretation.level}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Interpretation</h3>
                <p className="text-muted-foreground mb-4">{interpretation.description}</p>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Score Breakdown by Category</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Orientation</p>
                        <p className="font-medium">
                          {calculateCategoryScore("Orientation to Time") +
                            calculateCategoryScore("Orientation to Place")}
                          /10
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Registration</p>
                        <p className="font-medium">{calculateCategoryScore("Registration")}/3</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Attention & Calculation</p>
                        <p className="font-medium">{calculateCategoryScore("Attention and Calculation")}/5</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Recall</p>
                        <p className="font-medium">{calculateCategoryScore("Recall")}/3</p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Language</p>
                        <p className="font-medium">
                          {calculateCategoryScore("Language - Naming") +
                            calculateCategoryScore("Language - Repetition") +
                            calculateCategoryScore("Language - 3-Stage Command") +
                            calculateCategoryScore("Language - Reading") +
                            calculateCategoryScore("Language - Writing")}
                          /8
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded">
                        <p className="text-xs text-muted-foreground">Visuospatial</p>
                        <p className="font-medium">{calculateCategoryScore("Visuospatial")}/1</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {interpretation.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium mb-1">Next Steps</h4>
                        <p className="text-sm text-muted-foreground">
                          We recommend discussing these results with your healthcare provider. Regular cognitive
                          assessments can help track changes over time and guide appropriate interventions if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBackToDashboard} className="w-full">
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete the MMSE Test?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered all questions. Are you ready to submit your answers and complete the test?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={completeTest}>
              <Check className="mr-2 h-4 w-4" />
              Complete Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  // Helper function to calculate score for a specific category
  function calculateCategoryScore(category: string) {
    let score = 0

    mmseQuestions.forEach((question) => {
      if (question.category.includes(category)) {
        const answer = answers[question.id]

        if (!answer) return

        switch (question.type) {
          case "radio":
            if (answer === "correct") {
              score += question.points
            }
            break
          case "checkbox":
            if (Array.isArray(answer)) {
              score += Math.min(answer.length, question.points)
            }
            break
          case "text":
            if (question.correctAnswer) {
              const userAnswer = answer.toUpperCase()
              const correctAnswer = question.correctAnswer

              for (let i = 0; i < Math.min(userAnswer.length, correctAnswer.length); i++) {
                if (userAnswer[i] === correctAnswer[i]) {
                  score += 1
                }
              }
            }
            break
          case "textarea":
            // Simple check for a complete sentence
            const text = answer.trim()
            if (text && text.length > 0 && /[.!?]$/.test(text)) {
              score += question.points
            }
            break
        }
      }
    })

    return score
  }
}

