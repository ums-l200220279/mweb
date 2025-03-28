"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

// Mock MMSE questions
const mmseQuestions = [
  {
    id: 1,
    category: "Orientation to Time",
    question: "What year is it now?",
    options: ["2024", "2023", "2022", "Not sure"],
    correctAnswer: "2024",
    points: 1,
    hint: "Consider recent events or holidays to help orient the patient to the current year.",
  },
  {
    id: 2,
    category: "Orientation to Time",
    question: "What season is it?",
    options: ["Spring", "Summer", "Fall", "Winter"],
    correctAnswer: "Spring",
    points: 1,
    hint: "Discuss recent weather patterns or upcoming holidays to help the patient identify the current season.",
  },
  {
    id: 3,
    category: "Orientation to Time",
    question: "What month is it?",
    options: ["April", "May", "June", "July"],
    correctAnswer: "May",
    points: 1,
    hint: "Reference recent events or upcoming celebrations to assist the patient in determining the current month.",
  },
  {
    id: 4,
    category: "Orientation to Time",
    question: "What is today's date?",
    options: ["10th", "11th", "12th", "13th"],
    correctAnswer: "12th",
    points: 1,
    hint: "If the patient is unsure, ask about recent activities or appointments to help narrow down the date.",
  },
  {
    id: 5,
    category: "Orientation to Time",
    question: "What day of the week is it?",
    options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    correctAnswer: "Wednesday",
    points: 1,
    hint: "Discuss the patient's routine or recent activities to help them identify the current day of the week.",
  },
  {
    id: 6,
    category: "Orientation to Place",
    question: "What country are we in?",
    options: ["United States", "Canada", "United Kingdom", "Australia"],
    correctAnswer: "United States",
    points: 1,
    hint: "If the patient is struggling, discuss familiar landmarks or cultural aspects of the country.",
  },
  {
    id: 7,
    category: "Orientation to Place",
    question: "What state are we in?",
    options: ["California", "Texas", "New York", "Florida"],
    correctAnswer: "California",
    points: 1,
    hint: "Mention well-known features or cities within the state to help the patient recall.",
  },
  {
    id: 8,
    category: "Registration",
    question:
      "I am going to name three objects. After I have said them, I want you to repeat them back to me. Remember what they are because I will ask you to name them again in a few minutes. The objects are: Apple, Table, Penny. Please repeat them for me.",
    options: [
      "Remembered all 3 correctly",
      "Remembered 2 correctly",
      "Remembered 1 correctly",
      "Could not remember any",
    ],
    correctAnswer: "Remembered all 3 correctly",
    points: 3,
    hint: "If the patient struggles, repeat the words slowly and clearly. You can also use visual cues or ask the patient to associate each word with a personal memory.",
  },
  {
    id: 9,
    category: "Attention and Calculation",
    question: "I would like you to count backward from 100 by sevens. So you would say 100, 93, ...",
    options: [
      "93, 86, 79, 72, 65 (all correct)",
      "4 correct subtractions",
      "3 correct subtractions",
      "2 or fewer correct subtractions",
    ],
    correctAnswer: "93, 86, 79, 72, 65 (all correct)",
    points: 5,
    hint: "If the patient struggles, you can offer an alternative: spelling 'WORLD' backwards (D-L-R-O-W).",
  },
  {
    id: 10,
    category: "Recall",
    question: "Earlier I told you the names of three objects. Can you tell me what those objects were?",
    options: ["Recalled all 3 objects", "Recalled 2 objects", "Recalled 1 object", "Could not recall any objects"],
    correctAnswer: "Recalled all 3 objects",
    points: 3,
    hint: "If the patient has difficulty, you can provide category cues (e.g., 'One was a fruit' for Apple).",
  },
]

export default function NewAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [doctorNotes, setDoctorNotes] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(1800) // 30 minutes in seconds

  // Mock patient data
  const patient = {
    id: "P-12345",
    name: "John Doe",
    age: 72,
    gender: "Male",
    avatar: "/placeholder.svg",
    lastScore: 24,
    lastAssessmentDate: "April 10, 2024",
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [mmseQuestions[currentStep].id]: answer,
    })
  }

  const handleNext = () => {
    if (currentStep < mmseQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setAssessmentCompleted(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const calculateScore = () => {
    let score = 0
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = mmseQuestions.find((q) => q.id === Number.parseInt(questionId))
      if (question) {
        if (answer === question.correctAnswer) {
          score += question.points
        } else if (answer === "Remembered 2 correctly" && question.id === 8) {
          score += 2
        } else if (answer === "Remembered 1 correctly" && question.id === 8) {
          score += 1
        } else if (answer === "Recalled 2 objects" && question.id === 10) {
          score += 2
        } else if (answer === "Recalled 1 object" && question.id === 10) {
          score += 1
        } else if (answer === "4 correct subtractions" && question.id === 9) {
          score += 4
        } else if (answer === "3 correct subtractions" && question.id === 9) {
          score += 3
        } else if (answer === "2 or fewer correct subtractions" && question.id === 9) {
          score += 2
        }
      }
    })
    return score
  }

  const totalScore = calculateScore()
  const maxPossibleScore = mmseQuestions.reduce((acc, q) => acc + q.points, 0)
  const progress = ((currentStep + 1) / mmseQuestions.length) * 100

  const getRiskLevel = (score: number) => {
    if (score >= 24) return { level: "low", label: "Low Risk", color: "bg-green-500" }
    if (score >= 18) return { level: "medium", label: "Medium Risk", color: "bg-orange-500" }
    return { level: "high", label: "High Risk", color: "bg-red-500" }
  }

  const risk = getRiskLevel(totalScore)

  if (assessmentCompleted) {
    return (
      <div className="container max-w-3xl py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Assessment Completed</CardTitle>
                <CardDescription>MMSE Assessment for {patient.name}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                  <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{patient.name}</div>
                  <div className="text-xs text-muted-foreground">{patient.id}</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2 py-6">
              <div className={`rounded-full ${risk.color} p-4`}>
                {risk.level === "high" ? (
                  <AlertTriangle className="h-8 w-8 text-white" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-white" />
                )}
              </div>
              <h3 className="text-2xl font-medium">
                Score: {totalScore}/{maxPossibleScore}
              </h3>
              <Badge
                className={
                  risk.level === "high" ? "bg-red-500" : risk.level === "medium" ? "bg-orange-500" : "bg-green-500"
                }
              >
                {risk.label}
              </Badge>
              <p className="text-center text-muted-foreground max-w-md">
                {risk.level === "high"
                  ? "Patient shows significant cognitive impairment. Immediate intervention recommended."
                  : risk.level === "medium"
                    ? "Patient shows moderate cognitive impairment. Regular monitoring and cognitive therapy recommended."
                    : "Patient's cognitive function is within normal range. Preventive measures recommended."}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Assessment Summary</h4>
              <div className="rounded-lg border p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">May 12, 2024</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Time</div>
                    <div className="font-medium">10:30 AM</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Previous Score</div>
                    <div className="font-medium">
                      {patient.lastScore}/30 ({patient.lastAssessmentDate})
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Score Change</div>
                    <div
                      className={`font-medium ${totalScore > patient.lastScore ? "text-green-600" : totalScore < patient.lastScore ? "text-red-600" : ""}`}
                    >
                      {totalScore > patient.lastScore
                        ? `+${totalScore - patient.lastScore}`
                        : totalScore < patient.lastScore
                          ? `-${patient.lastScore - totalScore}`
                          : "No change"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Doctor's Notes</h4>
              <Textarea
                placeholder="Add your clinical observations and recommendations here..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={5}
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="font-medium text-blue-700">AI Recommendations</h4>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-blue-700">
                {risk.level === "high" ? (
                  <>
                    <li>Schedule follow-up neurological examination</li>
                    <li>Consider medication adjustment (Donepezil or Memantine)</li>
                    <li>Recommend daily cognitive exercises focusing on memory and orientation</li>
                    <li>Caregiver education on managing cognitive decline</li>
                    <li>Safety assessment of home environment</li>
                  </>
                ) : risk.level === "medium" ? (
                  <>
                    <li>Schedule follow-up assessment in 1 month</li>
                    <li>Recommend cognitive therapy 3 times per week</li>
                    <li>Consider memory enhancement supplements</li>
                    <li>Encourage social engagement activities</li>
                    <li>Monitor for changes in daily functioning</li>
                  </>
                ) : (
                  <>
                    <li>Schedule routine follow-up in 3 months</li>
                    <li>Recommend preventive cognitive exercises</li>
                    <li>Encourage physical activity and healthy diet</li>
                    <li>Suggest brain-stimulating hobbies and activities</li>
                    <li>Monitor for any changes in memory or cognitive function</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/doctor/assessments">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Assessments
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Save Draft</Button>
              <Button>Save & Generate Report</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">MMSE Assessment</CardTitle>
              <CardDescription>Mini-Mental State Examination for {patient.name}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{patient.name}</div>
                <div className="text-xs text-muted-foreground">{patient.id}</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Question {currentStep + 1} of {mmseQuestions.length}
              </div>
              <Progress value={progress} className="w-[60%]" />
            </div>
            <div className="text-sm font-medium">Time Remaining: {formatTime(timeRemaining)}</div>
          </div>

          <Separator />

          <div className="py-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">{mmseQuestions[currentStep].category}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{mmseQuestions[currentStep].hint}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-lg mb-4">{mmseQuestions[currentStep].question}</p>

            <RadioGroup value={answers[mmseQuestions[currentStep].id]} onValueChange={handleAnswer}>
              {mmseQuestions[currentStep].options.map((option) => (
                <div key={option} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!answers[mmseQuestions[currentStep].id]}>
            {currentStep < mmseQuestions.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Complete Assessment"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

