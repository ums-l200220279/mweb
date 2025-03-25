"use client"

import { useState, useEffect, useRef } from "react"
import { Timer, Brain, Award, RotateCcw, HelpCircle, Settings, Zap, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { gameAnalytics } from "@/lib/game-analytics"

// Difficulty presets
const DIFFICULTY_PRESETS = {
  beginner: {
    stimuliCount: 20,
    stimuliDuration: 2000, // ms
    interStimuliInterval: 1000, // ms
    complexity: "low",
    distractors: false,
  },
  easy: {
    stimuliCount: 30,
    stimuliDuration: 1500, // ms
    interStimuliInterval: 800, // ms
    complexity: "low",
    distractors: false,
  },
  medium: {
    stimuliCount: 40,
    stimuliDuration: 1200, // ms
    interStimuliInterval: 600, // ms
    complexity: "medium",
    distractors: true,
  },
  hard: {
    stimuliCount: 50,
    stimuliDuration: 1000, // ms
    interStimuliInterval: 500, // ms
    complexity: "high",
    distractors: true,
  },
  expert: {
    stimuliCount: 60,
    stimuliDuration: 800, // ms
    interStimuliInterval: 400, // ms
    complexity: "high",
    distractors: true,
  },
}

// Task types
const TASK_TYPES = {
  colorMatch: {
    name: "Color Match",
    description: "Press when the color matches the previous color",
    instructions: "Press the spacebar or click the button when the current color matches the previous color.",
  },
  shapeMatch: {
    name: "Shape Match",
    description: "Press when the shape matches the previous shape",
    instructions: "Press the spacebar or click the button when the current shape matches the previous shape.",
  },
  oddEven: {
    name: "Odd/Even",
    description: "Press for odd numbers, hold for even numbers",
    instructions:
      "Press the spacebar or click the button for odd numbers. Hold the spacebar or click and hold the button for even numbers.",
  },
  greaterLess: {
    name: "Greater/Less",
    description: "Press if number is greater than 5, hold if less",
    instructions:
      "Press the spacebar or click the button if the number is greater than 5. Hold the spacebar or click and hold the button if the number is less than or equal to 5.",
  },
  categoryMatch: {
    name: "Category Match",
    description: "Press when the item belongs to the target category",
    instructions:
      "Press the spacebar or click the button when the item belongs to the target category shown at the top.",
  },
}

// Stimulus interface
interface Stimulus {
  id: number
  type: string
  content: string
  color?: string
  shape?: string
  category?: string
  requiresResponse: boolean
  correctResponse: "press" | "hold" | "none"
  duration: number
}

// Response interface
interface Response {
  stimulusId: number
  responseTime: number // ms
  responseType: "press" | "hold" | "none"
  correct: boolean
}

// Game settings interface
interface GameSettings {
  difficulty: string
  taskType: string
  enableSound: boolean
  enableVisualFeedback: boolean
  enableProgressBar: boolean
}

export default function SpeedProcessingGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState<"intro" | "countdown" | "playing" | "results">("intro")
  const [stimuli, setStimuli] = useState<Stimulus[]>([])
  const [currentStimulusIndex, setCurrentStimulusIndex] = useState<number>(-1)
  const [responses, setResponses] = useState<Response[]>([])
  const [score, setScore] = useState<number>(0)
  const [countdown, setCountdown] = useState<number>(3)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [lastResponseTime, setLastResponseTime] = useState<number>(0)
  const [averageResponseTime, setAverageResponseTime] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(100)
  const [isHolding, setIsHolding] = useState<boolean>(false)
  const [holdStartTime, setHoldStartTime] = useState<number | null>(null)
  const [currentCategory, setCurrentCategory] = useState<string>("")
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "correct" | "incorrect" | "none"; show: boolean }>({
    type: "none",
    show: false,
  })

  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    taskType: "colorMatch",
    enableSound: true,
    enableVisualFeedback: true,
    enableProgressBar: true,
  })

  // Refs
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)
  const stimulusTimerRef = useRef<NodeJS.Timeout | null>(null)
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gameStartTimeRef = useRef<number>(0)
  const stimulusStartTimeRef = useRef<number>(0)

  // Colors, shapes, and categories for stimuli
  const colors = ["red", "blue", "green", "purple", "orange", "pink", "teal", "yellow"]
  const shapes = ["circle", "square", "triangle", "diamond", "hexagon", "star", "heart", "cross"]
  const categories = {
    animals: ["dog", "cat", "lion", "tiger", "elephant", "giraffe", "zebra", "monkey"],
    fruits: ["apple", "banana", "orange", "grape", "strawberry", "pineapple", "watermelon", "kiwi"],
    vehicles: ["car", "bus", "train", "airplane", "bicycle", "motorcycle", "boat", "helicopter"],
    furniture: ["chair", "table", "bed", "sofa", "desk", "bookshelf", "cabinet", "dresser"],
  }

  // Initialize game
  const initializeGame = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const taskType = settings.taskType

    // Generate stimuli based on task type
    const generatedStimuli: Stimulus[] = []

    // Set current category for category match task
    if (taskType === "categoryMatch") {
      const categoryKeys = Object.keys(categories)
      const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)]
      setCurrentCategory(randomCategory)
    }

    for (let i = 0; i < difficultySettings.stimuliCount; i++) {
      const stimulus: Stimulus = {
        id: i,
        type: taskType,
        content: "",
        requiresResponse: false,
        correctResponse: "none",
        duration: difficultySettings.stimuliDuration,
      }

      switch (taskType) {
        case "colorMatch":
          const color = colors[Math.floor(Math.random() * colors.length)]
          stimulus.content = "●"
          stimulus.color = color

          // First stimulus never requires a response
          if (i > 0) {
            // 40% chance of color match (requiring response)
            const shouldMatch = Math.random() < 0.4
            if (shouldMatch) {
              stimulus.color = generatedStimuli[i - 1].color
              stimulus.requiresResponse = true
              stimulus.correctResponse = "press"
            }
          }
          break

        case "shapeMatch":
          const shape = shapes[Math.floor(Math.random() * shapes.length)]
          stimulus.content = getShapeSymbol(shape)
          stimulus.shape = shape

          // First stimulus never requires a response
          if (i > 0) {
            // 40% chance of shape match (requiring response)
            const shouldMatch = Math.random() < 0.4
            if (shouldMatch) {
              stimulus.shape = generatedStimuli[i - 1].shape
              stimulus.content = getShapeSymbol(stimulus.shape)
              stimulus.requiresResponse = true
              stimulus.correctResponse = "press"
            }
          }
          break

        case "oddEven":
          const number = Math.floor(Math.random() * 9) + 1 // 1-9
          stimulus.content = number.toString()

          // Odd numbers require press, even numbers require hold
          if (number % 2 === 1) {
            stimulus.requiresResponse = true
            stimulus.correctResponse = "press"
          } else {
            stimulus.requiresResponse = true
            stimulus.correctResponse = "hold"
          }
          break

        case "greaterLess":
          const num = Math.floor(Math.random() * 9) + 1 // 1-9
          stimulus.content = num.toString()

          // Numbers > 5 require press, <= 5 require hold
          if (num > 5) {
            stimulus.requiresResponse = true
            stimulus.correctResponse = "press"
          } else {
            stimulus.requiresResponse = true
            stimulus.correctResponse = "hold"
          }
          break

        case "categoryMatch":
          // Select random category item
          const allCategories = Object.keys(categories)
          const randomCategoryKey = allCategories[Math.floor(Math.random() * allCategories.length)]
          const categoryItems = categories[randomCategoryKey as keyof typeof categories]
          const item = categoryItems[Math.floor(Math.random() * categoryItems.length)]

          stimulus.content = item
          stimulus.category = randomCategoryKey

          // Items in the target category require response
          if (randomCategoryKey === currentCategory) {
            stimulus.requiresResponse = true
            stimulus.correctResponse = "press"
          }
          break
      }

      generatedStimuli.push(stimulus)
    }

    setStimuli(generatedStimuli)
    setCurrentStimulusIndex(-1)
    setResponses([])
    setScore(0)
    setProgress(0)
    setLastResponseTime(0)
    setAverageResponseTime(0)
    setAccuracy(100)
    setIsHolding(false)
    setHoldStartTime(null)
    setFeedbackMessage({ type: "none", show: false })

    // Clear any existing timers
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current)
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current)
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
  }

  // Initialize game on mount and settings change
  useEffect(() => {
    initializeGame()
  }, [settings])

  // Start game
  const startGame = () => {
    setGamePhase("countdown")
    setCountdown(3)

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setGamePhase("playing")
          gameStartTimeRef.current = Date.now()
          showNextStimulus()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Show next stimulus
  const showNextStimulus = () => {
    const nextIndex = currentStimulusIndex + 1

    if (nextIndex >= stimuli.length) {
      // Game complete
      endGame()
      return
    }

    // Update progress
    const newProgress = ((nextIndex + 1) / stimuli.length) * 100
    setProgress(newProgress)

    // Show next stimulus
    setCurrentStimulusIndex(nextIndex)
    stimulusStartTimeRef.current = Date.now()

    // Set timer for stimulus duration
    const stimulus = stimuli[nextIndex]
    stimulusTimerRef.current = setTimeout(() => {
      // If no response was given but one was required
      if (stimulus.requiresResponse) {
        const responseType = "none"
        const correct = responseType === stimulus.correctResponse

        // Record response
        const newResponse: Response = {
          stimulusId: stimulus.id,
          responseTime: stimulus.duration,
          responseType,
          correct,
        }

        setResponses((prev) => [...prev, newResponse])

        // Update accuracy
        updateAccuracy((prev) => [...prev, newResponse])

        // Show feedback
        if (settings.enableVisualFeedback) {
          setFeedbackMessage({
            type: "incorrect",
            show: true,
          })

          feedbackTimerRef.current = setTimeout(() => {
            setFeedbackMessage({
              type: "none",
              show: false,
            })
          }, 500)
        }
      }

      // Wait for inter-stimulus interval before showing next
      const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
      setTimeout(showNextStimulus, difficultySettings.interStimuliInterval)
    }, stimulus.duration)
  }

  // Handle response
  const handleResponse = (responseType: "press" | "hold") => {
    if (currentStimulusIndex < 0 || currentStimulusIndex >= stimuli.length) return

    const stimulus = stimuli[currentStimulusIndex]
    const responseTime = Date.now() - stimulusStartTimeRef.current
    const correct = responseType === stimulus.correctResponse

    // Record response
    const newResponse: Response = {
      stimulusId: stimulus.id,
      responseTime,
      responseType,
      correct,
    }

    setResponses((prev) => [...prev, newResponse])

    // Update last response time
    setLastResponseTime(responseTime)

    // Update average response time
    const newResponses = [...responses, newResponse]
    const validResponseTimes = newResponses
      .filter((r) => r.responseType !== "none" && r.correct)
      .map((r) => r.responseTime)

    if (validResponseTimes.length > 0) {
      const avgTime = validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length
      setAverageResponseTime(avgTime)
    }

    // Update accuracy
    updateAccuracy([...responses, newResponse])

    // Update score
    if (correct) {
      // Base points for correct response
      const points = 100

      // Bonus for fast response (max 100 bonus points)
      const speedBonus = Math.max(0, 100 - Math.floor(responseTime / 10))

      // Add to score
      setScore((prev) => prev + points + speedBonus)

      // Show feedback
      if (settings.enableVisualFeedback) {
        setFeedbackMessage({
          type: "correct",
          show: true,
        })

        feedbackTimerRef.current = setTimeout(() => {
          setFeedbackMessage({
            type: "none",
            show: false,
          })
        }, 500)
      }

      // Play sound if enabled
      if (settings.enableSound) {
        // Play success sound
        console.log("Playing success sound")
      }
    } else {
      // Penalty for incorrect response
      setScore((prev) => Math.max(0, prev - 50))

      // Show feedback
      if (settings.enableVisualFeedback) {
        setFeedbackMessage({
          type: "incorrect",
          show: true,
        })

        feedbackTimerRef.current = setTimeout(() => {
          setFeedbackMessage({
            type: "none",
            show: false,
          })
        }, 500)
      }

      // Play sound if enabled
      if (settings.enableSound) {
        // Play error sound
        console.log("Playing error sound")
      }
    }

    // Clear stimulus timer to prevent automatic progression
    if (stimulusTimerRef.current) {
      clearTimeout(stimulusTimerRef.current)
    }

    // Wait for inter-stimulus interval before showing next
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    setTimeout(showNextStimulus, difficultySettings.interStimuliInterval)
  }

  // Update accuracy calculation
  const updateAccuracy = (newResponses: Response[]) => {
    const responsesForRequiredStimuli = newResponses.filter((r) => {
      const stimulus = stimuli.find((s) => s.id === r.stimulusId)
      return stimulus && stimulus.requiresResponse
    })

    if (responsesForRequiredStimuli.length > 0) {
      const correctResponses = responsesForRequiredStimuli.filter((r) => r.correct)
      const newAccuracy = (correctResponses.length / responsesForRequiredStimuli.length) * 100
      setAccuracy(newAccuracy)
    }
  }

  // End game
  const endGame = () => {
    setGamePhase("results")

    // Calculate final score
    const accuracyBonus = Math.floor(accuracy * 10)
    const speedBonus = Math.max(0, 1000 - Math.floor(averageResponseTime))
    const finalScore = score + accuracyBonus + speedBonus

    setScore(finalScore)

    // Record game session
    const gameSession = {
      id: `sp-${Date.now()}`,
      userId: "current-user", // This would be the actual user ID in a real implementation
      gameId: "speed-processing",
      gameName: "Speed Processing",
      startTime: new Date(gameStartTimeRef.current),
      endTime: new Date(),
      duration: Math.floor((Date.now() - gameStartTimeRef.current) / 1000),
      score: finalScore,
      difficulty: settings.difficulty,
      completed: true,
      metrics: {
        accuracy: accuracy / 100,
        responseTime: averageResponseTime,
        correctAnswers: responses.filter((r) => r.correct).length,
        incorrectAnswers: responses.filter((r) => !r.correct).length,
        totalItems: stimuli.filter((s) => s.requiresResponse).length,
      },
    }

    gameAnalytics.recordGameSession(gameSession)
  }

  // Restart game
  const handleRestart = () => {
    initializeGame()
    setGamePhase("intro")
  }

  // Update settings
  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    setSettings({ ...settings, ...newSettings })
  }

  // Handle key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && gamePhase === "playing" && !isHolding) {
        e.preventDefault()
        setIsHolding(true)
        setHoldStartTime(Date.now())
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && gamePhase === "playing" && isHolding) {
        e.preventDefault()
        setIsHolding(false)

        // Determine if it was a press or hold
        const holdDuration = holdStartTime ? Date.now() - holdStartTime : 0
        const responseType = holdDuration < 300 ? "press" : "hold"

        handleResponse(responseType)
        setHoldStartTime(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [gamePhase, isHolding, holdStartTime])

  // Handle mouse press
  const handleMouseDown = () => {
    if (gamePhase === "playing" && !isHolding) {
      setIsHolding(true)
      setHoldStartTime(Date.now())
    }
  }

  const handleMouseUp = () => {
    if (gamePhase === "playing" && isHolding) {
      setIsHolding(false)

      // Determine if it was a press or hold
      const holdDuration = holdStartTime ? Date.now() - holdStartTime : 0
      const responseType = holdDuration < 300 ? "press" : "hold"

      handleResponse(responseType)
      setHoldStartTime(null)
    }
  }

  // Get shape symbol
  const getShapeSymbol = (shape: string) => {
    switch (shape) {
      case "circle":
        return "●"
      case "square":
        return "■"
      case "triangle":
        return "▲"
      case "diamond":
        return "◆"
      case "hexagon":
        return "⬡"
      case "star":
        return "★"
      case "heart":
        return "♥"
      case "cross":
        return "✚"
      default:
        return "●"
    }
  }

  // Render current stimulus
  const renderStimulus = () => {
    if (currentStimulusIndex < 0 || currentStimulusIndex >= stimuli.length) {
      return null
    }

    const stimulus = stimuli[currentStimulusIndex]

    switch (stimulus.type) {
      case "colorMatch":
        return (
          <div className="text-8xl" style={{ color: stimulus.color }}>
            {stimulus.content}
          </div>
        )

      case "shapeMatch":
        return <div className="text-8xl text-indigo-600">{stimulus.content}</div>

      case "oddEven":
      case "greaterLess":
        return <div className="text-8xl font-bold text-indigo-600">{stimulus.content}</div>

      case "categoryMatch":
        return (
          <div className="flex flex-col items-center">
            <div className="mb-4 text-xl font-medium text-indigo-600">
              Category: {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}
            </div>
            <div className="text-4xl font-bold">{stimulus.content}</div>
          </div>
        )

      default:
        return null
    }
  }

  // Render game content based on phase
  const renderGameContent = () => {
    switch (gamePhase) {
      case "intro":
        return (
          <div className="flex flex-col items-center text-center p-8">
            <Zap className="h-16 w-16 text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].name}</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              {TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].description}
            </p>
            <div className="space-y-2 mb-8 text-left w-full max-w-md">
              <div className="flex justify-between">
                <span>Difficulty:</span>
                <Badge
                  className={`
                  ${settings.difficulty === "beginner" ? "bg-green-100 text-green-800" : ""}
                  ${settings.difficulty === "easy" ? "bg-blue-100 text-blue-800" : ""}
                  ${settings.difficulty === "medium" ? "bg-amber-100 text-amber-800" : ""}
                  ${settings.difficulty === "hard" ? "bg-orange-100 text-orange-800" : ""}
                  ${settings.difficulty === "expert" ? "bg-red-100 text-red-800" : ""}
                `}
                >
                  {settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Stimuli Count:</span>
                <span>{DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].stimuliCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Stimulus Duration:</span>
                <span>
                  {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].stimuliDuration / 1000}s
                </span>
              </div>
              <div className="flex justify-between">
                <span>Task Type:</span>
                <span>{TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].name}</span>
              </div>
            </div>
            <Button onClick={startGame} className="w-full max-w-md">
              Start Game
            </Button>
          </div>
        )

      case "countdown":
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-8xl font-bold text-indigo-600 animate-pulse">{countdown}</div>
            <p className="text-gray-600 mt-4">Get ready...</p>
          </div>
        )

      case "playing":
        return (
          <div className="flex flex-col items-center">
            {settings.enableProgressBar && (
              <div className="w-full mb-8">
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="flex flex-col items-center justify-center h-64 relative">
              {renderStimulus()}

              {feedbackMessage.show && (
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-opacity-70 rounded-lg ${
                    feedbackMessage.type === "correct"
                      ? "bg-green-100"
                      : feedbackMessage.type === "incorrect"
                        ? "bg-red-100"
                        : "bg-transparent"
                  }`}
                >
                  {feedbackMessage.type === "correct" && <Check className="h-16 w-16 text-green-600" />}
                  {feedbackMessage.type === "incorrect" && <X className="h-16 w-16 text-red-600" />}
                </div>
              )}
            </div>

            <div className="mt-8 w-full max-w-md">
              <Button
                className="w-full h-16 text-lg"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => isHolding && handleMouseUp()}
              >
                {isHolding ? "Holding..." : "Press / Hold"}
              </Button>

              <p className="text-center text-gray-500 mt-2 text-sm">Or use the spacebar</p>
            </div>
          </div>
        )

      case "results":
        return (
          <div className="flex flex-col items-center p-8">
            <Award className="h-16 w-16 text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Results</h2>
            <p className="text-gray-600 mb-6">
              You scored <span className="font-bold">{score}</span> points!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Accuracy
                  </CardTitle>
                  <CardDescription>Percentage of correct responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{Math.round(accuracy)}%</div>
                  <Progress value={accuracy} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-amber-500" />
                    Response Time
                  </CardTitle>
                  <CardDescription>Average time to respond</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {averageResponseTime > 0 ? `${(averageResponseTime / 1000).toFixed(2)}s` : "-"}
                  </div>
                  <div className="h-2 mt-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-amber-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (1 - averageResponseTime / 2000) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-500" />
                    Score
                  </CardTitle>
                  <CardDescription>Total points earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{score}</div>
                  <div className="text-sm text-gray-500 text-center mt-2">
                    {responses.filter((r) => r.correct).length} correct responses
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleRestart}>Play Again</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/games")}>
                Back to Games
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speed Processing</h1>
          <p className="text-gray-600 mt-2">
            Enhance cognitive processing speed with timed visual identification tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Instructions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How to Play Speed Processing</DialogTitle>
                <DialogDescription>Train your cognitive processing speed with quick decision tasks.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Task Instructions:</h4>
                  <p className="text-sm text-gray-600">
                    {TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].instructions}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Controls:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Press the spacebar or click the button for a quick press</li>
                    <li>Hold the spacebar or button for a hold response</li>
                    <li>Respond as quickly and accurately as possible</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cognitive Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Improves processing speed</li>
                    <li>Enhances reaction time</li>
                    <li>Develops decision-making skills</li>
                    <li>Trains sustained attention</li>
                    <li>Builds cognitive flexibility</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowInstructions(false)}>Got it</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Game Settings</DialogTitle>
                <DialogDescription>Customize your Speed Processing experience</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Difficulty</h4>
                  <Tabs
                    defaultValue={settings.difficulty}
                    onValueChange={(value) => handleSettingsChange({ difficulty: value })}
                  >
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="beginner">Beginner</TabsTrigger>
                      <TabsTrigger value="easy">Easy</TabsTrigger>
                      <TabsTrigger value="medium">Medium</TabsTrigger>
                      <TabsTrigger value="hard">Hard</TabsTrigger>
                      <TabsTrigger value="expert">Expert</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Task Type</h4>
                  <Tabs
                    defaultValue={settings.taskType}
                    onValueChange={(value) => handleSettingsChange({ taskType: value })}
                  >
                    <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
                      <TabsTrigger value="colorMatch">Color Match</TabsTrigger>
                      <TabsTrigger value="shapeMatch">Shape Match</TabsTrigger>
                      <TabsTrigger value="oddEven">Odd/Even</TabsTrigger>
                      <TabsTrigger value="greaterLess">Greater/Less</TabsTrigger>
                      <TabsTrigger value="categoryMatch">Category Match</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableSound">Enable Sound</Label>
                      <p className="text-sm text-gray-500">Play sound effects during the game</p>
                    </div>
                    <Switch
                      id="enableSound"
                      checked={settings.enableSound}
                      onCheckedChange={(checked) => handleSettingsChange({ enableSound: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableVisualFeedback">Visual Feedback</Label>
                      <p className="text-sm text-gray-500">Show visual feedback for responses</p>
                    </div>
                    <Switch
                      id="enableVisualFeedback"
                      checked={settings.enableVisualFeedback}
                      onCheckedChange={(checked) => handleSettingsChange({ enableVisualFeedback: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableProgressBar">Progress Bar</Label>
                      <p className="text-sm text-gray-500">Show progress through the game</p>
                    </div>
                    <Switch
                      id="enableProgressBar"
                      checked={settings.enableProgressBar}
                      onCheckedChange={(checked) => handleSettingsChange({ enableProgressBar: checked })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowSettings(false)}>Save Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {gamePhase !== "intro" && (
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">{renderGameContent()}</div>

      {gamePhase === "playing" && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Accuracy</CardTitle>
              <CardDescription>Correct responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
                <div className="text-sm text-gray-500">
                  {responses.filter((r) => r.correct).length} / {responses.length}
                </div>
              </div>
              <Progress value={accuracy} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Response Time</CardTitle>
              <CardDescription>Average time to respond</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {averageResponseTime > 0 ? `${(averageResponseTime / 1000).toFixed(2)}s` : "-"}
                </div>
                <div className="text-sm text-gray-500">
                  Last: {lastResponseTime > 0 ? `${(lastResponseTime / 1000).toFixed(2)}s` : "-"}
                </div>
              </div>
              <div className="h-2 mt-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-amber-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (1 - averageResponseTime / 2000) * 100)}%`,
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Score</CardTitle>
              <CardDescription>Current points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-sm text-gray-500 mt-2">
                {responses.filter((r) => r.correct).length} correct responses
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

