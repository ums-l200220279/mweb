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
import { toast } from "@/components/ui/use-toast"
import { gameAnalytics } from "@/lib/game-analytics"

// Difficulty presets
const DIFFICULTY_PRESETS = {
  beginner: {
    trials: 10,
    minDelay: 1500, // ms
    maxDelay: 4000, // ms
    timeLimit: 60, // seconds
    falseStartPenalty: 500, // ms
    complexity: "simple",
  },
  easy: {
    trials: 15,
    minDelay: 1200,
    maxDelay: 3500,
    timeLimit: 90,
    falseStartPenalty: 750,
    complexity: "simple",
  },
  medium: {
    trials: 20,
    minDelay: 1000,
    maxDelay: 3000,
    timeLimit: 120,
    falseStartPenalty: 1000,
    complexity: "moderate",
  },
  hard: {
    trials: 25,
    minDelay: 800,
    maxDelay: 2500,
    timeLimit: 150,
    falseStartPenalty: 1500,
    complexity: "complex",
  },
  expert: {
    trials: 30,
    minDelay: 500,
    maxDelay: 2000,
    timeLimit: 180,
    falseStartPenalty: 2000,
    complexity: "complex",
  },
}

// Task types
const TASK_TYPES = {
  simple: {
    name: "Simple Reaction",
    description: "React as quickly as possible when the stimulus appears",
    instructions: "Press the button or spacebar as soon as you see the green screen.",
  },
  choice: {
    name: "Choice Reaction",
    description: "React differently based on the stimulus type",
    instructions: "Press the left arrow for blue stimuli and right arrow for red stimuli.",
  },
  go_nogo: {
    name: "Go/No-Go",
    description: "React to target stimuli but inhibit response to non-targets",
    instructions: "Press the button for green stimuli but do NOT press for red stimuli.",
  },
  discrimination: {
    name: "Discrimination",
    description: "React only to specific stimuli among distractors",
    instructions: "Press the button only when you see a circle, not for other shapes.",
  },
  anticipation: {
    name: "Anticipation Timing",
    description: "React at the precise moment a moving object reaches a target",
    instructions: "Press the button when the moving dot reaches the target line.",
  },
}

// Trial interface
interface Trial {
  id: number
  type: string
  stimulus: string
  requiresResponse: boolean
  correctResponse: string
  delay: number
  startTime: number | null
  responseTime: number | null
  responded: boolean
  responseCorrect: boolean | null
  falseStart: boolean
}

// Game settings interface
interface GameSettings {
  difficulty: string
  taskType: string
  enableSound: boolean
  enableVisualFeedback: boolean
  showProgressBar: boolean
}

export default function ReactionTimeGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState<"intro" | "ready" | "waiting" | "stimulus" | "feedback" | "results">(
    "intro",
  )
  const [trials, setTrials] = useState<Trial[]>([])
  const [currentTrialIndex, setCurrentTrialIndex] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(60)
  const [score, setScore] = useState<number>(0)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(false)
  const [averageReactionTime, setAverageReactionTime] = useState<number>(0)
  const [fastestReactionTime, setFastestReactionTime] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(100)
  const [falseStarts, setFalseStarts] = useState<number>(0)
  const [anticipating, setAnticipating] = useState<boolean>(false)
  const [movingObjectPosition, setMovingObjectPosition] = useState<number>(0)

  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    taskType: "simple",
    enableSound: true,
    enableVisualFeedback: true,
    showProgressBar: true,
  })

  // Refs
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)
  const trialTimerRef = useRef<NodeJS.Timeout | null>(null)
  const stimulusTimerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const gameStartTimeRef = useRef<number>(0)
  const trialStartTimeRef = useRef<number>(0)

  // Initialize game
  const initializeGame = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const taskType = settings.taskType

    // Generate trials
    const generatedTrials: Trial[] = []

    for (let i = 0; i < difficultySettings.trials; i++) {
      const trial: Trial = {
        id: i,
        type: taskType,
        stimulus: "",
        requiresResponse: true,
        correctResponse: "press",
        delay: getRandomDelay(difficultySettings.minDelay, difficultySettings.maxDelay),
        startTime: null,
        responseTime: null,
        responded: false,
        responseCorrect: null,
        falseStart: false,
      }

      switch (taskType) {
        case "simple":
          trial.stimulus = "green"
          break

        case "choice":
          // Randomly choose between blue and red
          const isBlue = Math.random() < 0.5
          trial.stimulus = isBlue ? "blue" : "red"
          trial.correctResponse = isBlue ? "left" : "right"
          break

        case "go_nogo":
          // 70% go trials, 30% no-go trials
          const isGo = Math.random() < 0.7
          trial.stimulus = isGo ? "green" : "red"
          trial.requiresResponse = isGo
          trial.correctResponse = isGo ? "press" : "none"
          break

        case "discrimination":
          // 40% targets (circles), 60% distractors (other shapes)
          const isTarget = Math.random() < 0.4
          if (isTarget) {
            trial.stimulus = "circle"
          } else {
            const distractors = ["square", "triangle", "diamond", "star"]
            trial.stimulus = distractors[Math.floor(Math.random() * distractors.length)]
          }
          trial.requiresResponse = isTarget
          trial.correctResponse = isTarget ? "press" : "none"
          break

        case "anticipation":
          trial.stimulus = "moving"
          break
      }

      generatedTrials.push(trial)
    }

    setTrials(generatedTrials)
    setCurrentTrialIndex(0)
    setTimeRemaining(difficultySettings.timeLimit)
    setScore(0)
    setAverageReactionTime(0)
    setFastestReactionTime(0)
    setAccuracy(100)
    setFalseStarts(0)
    setAnticipating(false)
    setMovingObjectPosition(0)

    // Clear any existing timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current)
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

    gameStartTimeRef.current = 0
    trialStartTimeRef.current = 0
  }

  // Get random delay
  const getRandomDelay = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Initialize game on mount and settings change
  useEffect(() => {
    initializeGame()
  }, [settings])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if ((gamePhase === "ready" || gamePhase === "waiting" || gamePhase === "stimulus") && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleGameOver()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      gameTimerRef.current = timer
    }

    return () => clearInterval(timer)
  }, [gamePhase, timeRemaining])

  // Start game
  const startGame = () => {
    setGamePhase("ready")
    gameStartTimeRef.current = Date.now()
    startNextTrial()
  }

  // Start next trial
  const startNextTrial = () => {
    if (currentTrialIndex >= trials.length) {
      endGame()
      return
    }

    setGamePhase("ready")

    // Wait for user to press to start trial
    // This is handled by the handleStartTrial function
  }

  // Handle start trial
  const handleStartTrial = () => {
    if (gamePhase !== "ready") return

    const trial = trials[currentTrialIndex]

    setGamePhase("waiting")

    // Start delay timer
    trialTimerRef.current = setTimeout(() => {
      // Show stimulus
      showStimulus()
    }, trial.delay)
  }

  // Show stimulus
  const showStimulus = () => {
    if (gamePhase !== "waiting") return

    setGamePhase("stimulus")

    const trial = trials[currentTrialIndex]
    const updatedTrials = [...trials]
    updatedTrials[currentTrialIndex] = {
      ...trial,
      startTime: Date.now(),
    }

    setTrials(updatedTrials)
    trialStartTimeRef.current = Date.now()

    // For anticipation timing task, start animation
    if (trial.type === "anticipation") {
      setMovingObjectPosition(0)
      startMovingObjectAnimation()
    }
  }

  // Start moving object animation
  const startMovingObjectAnimation = () => {
    let startTime: number | null = null
    const duration = 2000 // 2 seconds to reach target

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      setMovingObjectPosition(progress * 100)

      if (progress < 1 && gamePhase === "stimulus") {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        if (gamePhase === "stimulus") {
          // If user hasn't responded by the time animation completes
          handleResponse("press")
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }

  // Handle response
  const handleResponse = (responseType: string) => {
    // Cancel any pending timers
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current)
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

    const trial = trials[currentTrialIndex]

    // Handle false start (responding during waiting phase)
    if (gamePhase === "waiting") {
      const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]

      // Apply false start penalty
      const updatedTrials = [...trials]
      updatedTrials[currentTrialIndex] = {
        ...trial,
        falseStart: true,
        responded: true,
        responseCorrect: false,
        responseTime: difficultySettings.falseStartPenalty,
      }

      setTrials(updatedTrials)
      setFalseStarts(falseStarts + 1)

      // Update accuracy
      const correctTrials = updatedTrials.filter((t) => t.responseCorrect === true).length
      const respondedTrials = updatedTrials.filter((t) => t.responded).length
      if (respondedTrials > 0) {
        setAccuracy((correctTrials / respondedTrials) * 100)
      }

      // Show feedback
      setGamePhase("feedback")

      // Play sound if enabled
      if (settings.enableSound) {
        // Play error sound
        console.log("Playing error sound")
      }

      // Move to next trial after delay
      setTimeout(() => {
        setCurrentTrialIndex(currentTrialIndex + 1)
        startNextTrial()
      }, 1500)

      return
    }

    // Only process response if in stimulus phase
    if (gamePhase !== "stimulus") return

    // Calculate response time
    const responseTime = Date.now() - trialStartTimeRef.current

    // Determine if response is correct
    let isCorrect = false

    if (trial.type === "simple") {
      // Simple reaction: any response is correct
      isCorrect = true
    } else if (trial.type === "choice") {
      // Choice reaction: must match correct response
      isCorrect = responseType === trial.correctResponse
    } else if (trial.type === "go_nogo" || trial.type === "discrimination") {
      // Go/No-Go and Discrimination: must respond to targets only
      isCorrect = trial.requiresResponse ? responseType === "press" : responseType === "none"
    } else if (trial.type === "anticipation") {
      // Anticipation timing: response timing is important
      // Perfect timing is when moving object is at position 100
      const timingError = Math.abs(movingObjectPosition - 100)
      isCorrect = timingError < 15 // Allow 15% margin of error
    }

    // Update trial
    const updatedTrials = [...trials]
    updatedTrials[currentTrialIndex] = {
      ...trial,
      responded: true,
      responseTime,
      responseCorrect: isCorrect,
    }

    setTrials(updatedTrials)

    // Update average and fastest reaction times
    const validResponseTimes = updatedTrials
      .filter((t) => t.responded && t.responseCorrect && !t.falseStart)
      .map((t) => t.responseTime || 0)

    if (validResponseTimes.length > 0) {
      const avgTime = validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length
      setAverageReactionTime(avgTime)

      const fastest = Math.min(...validResponseTimes)
      setFastestReactionTime(fastest)
    }

    // Update accuracy
    const correctTrials = updatedTrials.filter((t) => t.responseCorrect === true).length
    const respondedTrials = updatedTrials.filter((t) => t.responded).length
    if (respondedTrials > 0) {
      setAccuracy((correctTrials / respondedTrials) * 100)
    }

    // Update score
    if (isCorrect) {
      // Base points for correct response
      const points = 100

      // Bonus for fast response (max 100 bonus points)
      const speedBonus = Math.max(0, 100 - Math.floor(responseTime / 5))

      // Add to score
      setScore((prev) => prev + points + speedBonus)

      // Play sound if enabled
      if (settings.enableSound) {
        // Play success sound
        console.log("Playing success sound")
      }
    } else {
      // Penalty for incorrect response
      setScore((prev) => Math.max(0, prev - 50))

      // Play sound if enabled
      if (settings.enableSound) {
        // Play error sound
        console.log("Playing error sound")
      }
    }

    // Show feedback
    setGamePhase("feedback")

    // Move to next trial after delay
    setTimeout(() => {
      setCurrentTrialIndex(currentTrialIndex + 1)
      startNextTrial()
    }, 1500)
  }

  // Handle no response for go/no-go and discrimination tasks
  const handleNoResponse = () => {
    const trial = trials[currentTrialIndex]

    // Only applicable for go/no-go and discrimination tasks
    if (trial.type !== "go_nogo" && trial.type !== "discrimination") return

    // Determine if no response is correct
    const isCorrect = !trial.requiresResponse

    // Update trial
    const updatedTrials = [...trials]
    updatedTrials[currentTrialIndex] = {
      ...trial,
      responded: true,
      responseTime: 0,
      responseCorrect: isCorrect,
    }

    setTrials(updatedTrials)

    // Update accuracy
    const correctTrials = updatedTrials.filter((t) => t.responseCorrect === true).length
    const respondedTrials = updatedTrials.filter((t) => t.responded).length
    if (respondedTrials > 0) {
      setAccuracy((correctTrials / respondedTrials) * 100)
    }

    // Update score
    if (isCorrect) {
      // Points for correct inhibition
      setScore((prev) => prev + 75)

      // Play sound if enabled
      if (settings.enableSound) {
        // Play success sound
        console.log("Playing success sound")
      }
    } else {
      // Penalty for missed response
      setScore((prev) => Math.max(0, prev - 25))

      // Play sound if enabled
      if (settings.enableSound) {
        // Play error sound
        console.log("Playing error sound")
      }
    }

    // Show feedback
    setGamePhase("feedback")

    // Move to next trial after delay
    setTimeout(() => {
      setCurrentTrialIndex(currentTrialIndex + 1)
      startNextTrial()
    }, 1500)
  }

  // End game
  const endGame = () => {
    setGamePhase("results")

    // Clear timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current)
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

    // Calculate final score
    const accuracyBonus = Math.floor(accuracy * 5)
    const speedBonus = Math.max(0, 1000 - Math.floor(averageReactionTime))
    const falseStartPenalty = falseStarts * 50

    const finalScore = score + accuracyBonus + speedBonus - falseStartPenalty
    setScore(Math.max(0, finalScore))

    // Record game session
    const gameSession = {
      id: `rt-${Date.now()}`,
      userId: "current-user", // This would be the actual user ID in a real implementation
      gameId: "reaction-time",
      gameName: "Reaction Time",
      startTime: new Date(gameStartTimeRef.current),
      endTime: new Date(),
      duration: Math.floor((Date.now() - gameStartTimeRef.current) / 1000),
      score: Math.max(0, finalScore),
      difficulty: settings.difficulty,
      completed: true,
      metrics: {
        accuracy: accuracy / 100,
        averageReactionTime,
        fastestReactionTime,
        falseStarts,
        correctResponses: trials.filter((t) => t.responseCorrect === true).length,
        incorrectResponses: trials.filter((t) => t.responseCorrect === false).length,
        totalTrials: trials.length,
      },
    }

    gameAnalytics.recordGameSession(gameSession)
  }

  // Handle game over (time ran out)
  const handleGameOver = () => {
    // Mark remaining trials as unanswered
    const updatedTrials = trials.map((trial, index) => {
      if (index >= currentTrialIndex && !trial.responded) {
        return {
          ...trial,
          responded: true,
          responseCorrect: false,
        }
      }
      return trial
    })

    setTrials(updatedTrials)

    // End game
    endGame()

    // Show toast
    toast({
      title: "Time's Up!",
      description: "You've run out of time.",
      variant: "destructive",
    })
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
      if (gamePhase === "ready") {
        if (e.code === "Space") {
          e.preventDefault()
          handleStartTrial()
        }
      } else if (gamePhase === "waiting" || gamePhase === "stimulus") {
        if (e.code === "Space") {
          e.preventDefault()
          handleResponse("press")
        } else if (e.code === "ArrowLeft") {
          e.preventDefault()
          handleResponse("left")
        } else if (e.code === "ArrowRight") {
          e.preventDefault()
          handleResponse("right")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gamePhase, currentTrialIndex])

  // Handle no-go stimulus timeout
  useEffect(() => {
    if (gamePhase === "stimulus") {
      const trial = trials[currentTrialIndex]

      if (trial.type === "go_nogo" || trial.type === "discrimination") {
        // Set timeout for no-go trials
        const timeout = setTimeout(() => {
          handleNoResponse()
        }, 1500) // 1.5 seconds to respond

        stimulusTimerRef.current = timeout

        return () => clearTimeout(timeout)
      }
    }
  }, [gamePhase, currentTrialIndex, trials])

  // Render stimulus based on trial type
  const renderStimulus = () => {
    if (currentTrialIndex >= trials.length) return null

    const trial = trials[currentTrialIndex]

    if (gamePhase === "waiting") {
      return (
        <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-2xl font-medium text-gray-500">Wait...</div>
        </div>
      )
    }

    if (gamePhase === "stimulus") {
      switch (trial.type) {
        case "simple":
          return (
            <div className="w-64 h-64 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="text-2xl font-medium text-white">React Now!</div>
            </div>
          )

        case "choice":
          return (
            <div
              className={`w-64 h-64 ${trial.stimulus === "blue" ? "bg-blue-500" : "bg-red-500"} rounded-lg flex items-center justify-center`}
            >
              <div className="text-2xl font-medium text-white">
                {trial.stimulus === "blue" ? "Press Left" : "Press Right"}
              </div>
            </div>
          )

        case "go_nogo":
          return (
            <div
              className={`w-64 h-64 ${trial.stimulus === "green" ? "bg-green-500" : "bg-red-500"} rounded-lg flex items-center justify-center`}
            >
              <div className="text-2xl font-medium text-white">{trial.stimulus === "green" ? "GO!" : "NO-GO!"}</div>
            </div>
          )

        case "discrimination":
          return (
            <div className="w-64 h-64 bg-indigo-100 rounded-lg flex items-center justify-center">
              {trial.stimulus === "circle" ? (
                <div className="w-32 h-32 bg-indigo-500 rounded-full"></div>
              ) : trial.stimulus === "square" ? (
                <div className="w-32 h-32 bg-indigo-500 rounded-md"></div>
              ) : trial.stimulus === "triangle" ? (
                <div className="w-0 h-0 border-l-[50px] border-r-[50px] border-b-[86px] border-l-transparent border-r-transparent border-b-indigo-500"></div>
              ) : trial.stimulus === "diamond" ? (
                <div className="w-32 h-32 bg-indigo-500 rounded-md transform rotate-45"></div>
              ) : (
                <div className="text-6xl text-indigo-500">★</div>
              )}
            </div>
          )

        case "anticipation":
          return (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-4">
              <div className="w-full h-4 bg-gray-200 rounded-full mb-8 relative">
                <div className="absolute top-0 left-0 w-full h-full flex items-center">
                  <div className="absolute right-0 w-1 h-8 bg-red-500 -top-2"></div>
                </div>
                <div
                  className="absolute top-0 left-0 w-4 h-4 bg-indigo-500 rounded-full transform -translate-y-1/2"
                  style={{ left: `${movingObjectPosition}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mb-4">Press when the dot reaches the red line</div>
              <Button
                className="w-full"
                onClick={() => handleResponse("press")}
                onMouseDown={() => setAnticipating(true)}
                onMouseUp={() => setAnticipating(false)}
                onMouseLeave={() => setAnticipating(false)}
              >
                {anticipating ? "Releasing..." : "Press & Hold"}
              </Button>
            </div>
          )

        default:
          return null
      }
    }

    if (gamePhase === "feedback") {
      const isCorrect = trial.responseCorrect

      if (trial.falseStart) {
        return (
          <div className="w-64 h-64 bg-amber-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600 mb-2">False Start!</div>
              <div className="text-gray-600">Wait for the stimulus before responding</div>
            </div>
          </div>
        )
      }

      return (
        <div
          className={`w-64 h-64 ${isCorrect ? "bg-green-100" : "bg-red-100"} rounded-lg flex items-center justify-center`}
        >
          <div className="text-center">
            {isCorrect ? (
              <>
                <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-600 mb-2">Correct!</div>
                {trial.responseTime && <div className="text-gray-600">{trial.responseTime} ms</div>}
              </>
            ) : (
              <>
                <X className="h-12 w-12 text-red-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-red-600 mb-2">Incorrect</div>
                {trial.type === "choice" && (
                  <div className="text-gray-600">Expected: {trial.correctResponse === "left" ? "Left" : "Right"}</div>
                )}
                {(trial.type === "go_nogo" || trial.type === "discrimination") && (
                  <div className="text-gray-600">
                    {trial.requiresResponse ? "Should respond" : "Should not respond"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  // Render game content based on phase
  const renderGameContent = () => {
    switch (gamePhase) {
      case "intro":
        return (
          <div className="flex flex-col items-center text-center p-8">
            <Zap className="h-16 w-16 text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Reaction Time</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Test and improve your reaction speed with various stimuli and response tasks.
            </p>
            <div className="space-y-2 mb-8 text-left w-full max-w-md">
              <div className="flex justify-between">
                <span>Task Type:</span>
                <span>{TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].name}</span>
              </div>
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
                <span>Trials:</span>
                <span>{DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].trials}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Limit:</span>
                <span>
                  {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].timeLimit} seconds
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].description}
              </p>
            </div>
            <Button onClick={startGame} className="w-full max-w-md">
              Start Game
            </Button>
          </div>
        )

      case "ready":
      case "waiting":
      case "stimulus":
      case "feedback":
        return (
          <div className="flex flex-col items-center p-8">
            <div className="flex items-center justify-between w-full max-w-2xl mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-amber-500" />
                  <span className={`font-medium ${timeRemaining < 10 ? "text-red-500" : ""}`}>
                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">Score: {score}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Trial {currentTrialIndex + 1} of {trials.length}
                </span>
              </div>
            </div>

            {settings.showProgressBar && (
              <div className="w-full max-w-2xl mb-6">
                <Progress value={(currentTrialIndex / trials.length) * 100} className="h-2" />
              </div>
            )}

            <div className="flex flex-col items-center justify-center mb-8">
              {gamePhase === "ready" ? (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-xl font-medium text-gray-600 mb-2">Ready?</div>
                    <div className="text-sm text-gray-500">Press spacebar or click below to start</div>
                  </div>
                </div>
              ) : (
                renderStimulus()
              )}

              {gamePhase === "ready" && (
                <Button className="mt-4 w-64" onClick={handleStartTrial}>
                  Start Trial
                </Button>
              )}
            </div>

            <div className="w-full max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {averageReactionTime > 0 ? `${averageReactionTime.toFixed(0)} ms` : "-"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Fastest Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {fastestReactionTime > 0 ? `${fastestReactionTime.toFixed(0)} ms` : "-"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
                  </CardContent>
                </Card>
              </div>
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
                    <Zap className="h-5 w-5 text-amber-500" />
                    Reaction Time
                  </CardTitle>
                  <CardDescription>Your response speed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {averageReactionTime > 0 ? `${averageReactionTime.toFixed(0)} ms` : "-"}
                  </div>
                  <div className="text-sm text-gray-500 text-center mt-2">
                    Fastest: {fastestReactionTime > 0 ? `${fastestReactionTime.toFixed(0)} ms` : "-"}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Very Fast</span>
                      <span>&lt; 200ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fast</span>
                      <span>200-300ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average</span>
                      <span>300-500ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Slow</span>
                      <span>&gt; 500ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Accuracy
                  </CardTitle>
                  <CardDescription>Your response precision</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{Math.round(accuracy)}%</div>
                  <Progress value={accuracy} className="h-2 mt-2" />
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div>
                      <div className="text-gray-500">Correct</div>
                      <div className="font-medium">{trials.filter((t) => t.responseCorrect === true).length}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Incorrect</div>
                      <div className="font-medium">{trials.filter((t) => t.responseCorrect === false).length}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">False Starts</div>
                      <div className="font-medium">{falseStarts}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Completed</div>
                      <div className="font-medium">
                        {trials.filter((t) => t.responded).length}/{trials.length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-500" />
                    Score Breakdown
                  </CardTitle>
                  <CardDescription>Points earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{score}</div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Base Score</span>
                      <span>{trials.filter((t) => t.responseCorrect === true).length * 100}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Accuracy Bonus</span>
                      <span>+{Math.floor(accuracy * 5)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Speed Bonus</span>
                      <span>+{Math.max(0, 1000 - Math.floor(averageReactionTime))}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-500">
                      <span>False Start Penalty</span>
                      <span>-{falseStarts * 50}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full max-w-4xl mb-8">
              <h3 className="text-xl font-bold mb-4">Cognitive Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Processing Speed</span>
                      <span>Primary</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Reaction Time</span>
                      <span>Primary</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Selective Attention</span>
                      <span>High</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Response Inhibition</span>
                      <span>Medium</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Decision Making</span>
                      <span>Medium</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "70%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Motor Control</span>
                      <span>Medium</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Reaction Time</h1>
          <p className="text-gray-600 mt-2">Test and improve your reaction speed and response accuracy</p>
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
                <DialogTitle>How to Play Reaction Time</DialogTitle>
                <DialogDescription>Train your reaction speed and response accuracy.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Task Instructions:</h4>
                  <p className="text-sm text-gray-600">
                    {TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].instructions}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Game Flow:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Press the spacebar or click the button to start each trial</li>
                    <li>Wait for the stimulus to appear (don't respond too early!)</li>
                    <li>Respond as quickly and accurately as possible</li>
                    <li>Complete as many trials as you can before time runs out</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cognitive Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Improves processing speed</li>
                    <li>Enhances reaction time</li>
                    <li>Develops response inhibition</li>
                    <li>Trains selective attention</li>
                    <li>Builds decision-making skills</li>
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
                <DialogDescription>Customize your Reaction Time experience</DialogDescription>
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
                      <TabsTrigger value="simple">Simple</TabsTrigger>
                      <TabsTrigger value="choice">Choice</TabsTrigger>
                      <TabsTrigger value="go_nogo">Go/No-Go</TabsTrigger>
                      <TabsTrigger value="discrimination">Discrimination</TabsTrigger>
                      <TabsTrigger value="anticipation">Anticipation</TabsTrigger>
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
                      <Label htmlFor="showProgressBar">Progress Bar</Label>
                      <p className="text-sm text-gray-500">Show progress bar during the game</p>
                    </div>
                    <Switch
                      id="showProgressBar"
                      checked={settings.showProgressBar}
                      onCheckedChange={(checked) => handleSettingsChange({ showProgressBar: checked })}
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
    </div>
  )
}

