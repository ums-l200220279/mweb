"use client"

import { useState, useEffect, useRef } from "react"
import { Timer, Brain, Award, RotateCcw, HelpCircle, Settings, Bell, Eye, Ear, Check, X } from "lucide-react"
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
    duration: 120, // seconds
    primaryTaskRate: 3000, // ms between stimuli
    secondaryTaskRate: 5000, // ms between stimuli
    targetProbability: 0.4, // probability of target vs distractor
    distractorVariety: 3, // number of different distractor types
    assistanceLevel: 3, // number of hints available
  },
  easy: {
    duration: 120,
    primaryTaskRate: 2500,
    secondaryTaskRate: 4000,
    targetProbability: 0.35,
    distractorVariety: 4,
    assistanceLevel: 2,
  },
  medium: {
    duration: 150,
    primaryTaskRate: 2000,
    secondaryTaskRate: 3000,
    targetProbability: 0.3,
    distractorVariety: 5,
    assistanceLevel: 1,
  },
  hard: {
    duration: 180,
    primaryTaskRate: 1500,
    secondaryTaskRate: 2500,
    targetProbability: 0.25,
    distractorVariety: 6,
    assistanceLevel: 0,
  },
  expert: {
    duration: 210,
    primaryTaskRate: 1200,
    secondaryTaskRate: 2000,
    targetProbability: 0.2,
    distractorVariety: 8,
    assistanceLevel: 0,
  },
}

// Task types
const TASK_TYPES = {
  visualAuditory: {
    name: "Visual & Auditory",
    description: "Monitor visual shapes and auditory tones simultaneously",
    primaryTask: "visual",
    secondaryTask: "auditory",
  },
  dualVisual: {
    name: "Dual Visual",
    description: "Monitor shapes on left and numbers on right simultaneously",
    primaryTask: "visual-shapes",
    secondaryTask: "visual-numbers",
  },
  visualNumerical: {
    name: "Visual & Numerical",
    description: "Monitor shapes while solving simple math problems",
    primaryTask: "visual",
    secondaryTask: "numerical",
  },
  spatialVerbal: {
    name: "Spatial & Verbal",
    description: "Monitor positions while identifying word categories",
    primaryTask: "spatial",
    secondaryTask: "verbal",
  },
  colorPosition: {
    name: "Color & Position",
    description: "Monitor colors in one area and positions in another",
    primaryTask: "color",
    secondaryTask: "position",
  },
}

// Stimulus interface
interface Stimulus {
  id: number
  task: "primary" | "secondary"
  type: string
  content: string | number
  isTarget: boolean
  timestamp: number
  expiresAt: number
  responded: boolean
  responseCorrect: boolean | null
  responseTime: number | null
}

// Response interface
interface Response {
  stimulusId: number
  task: "primary" | "secondary"
  correct: boolean
  responseTime: number
}

// Game settings interface
interface GameSettings {
  difficulty: string
  taskType: string
  enableSound: boolean
  enableVisualFeedback: boolean
  showPerformanceMetrics: boolean
}

export default function DividedAttentionGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState<"intro" | "countdown" | "playing" | "results">("intro")
  const [primaryStimuli, setPrimaryStimuli] = useState<Stimulus[]>([])
  const [secondaryStimuli, setSecondaryStimuli] = useState<Stimulus[]>([])
  const [activeStimuli, setActiveStimuli] = useState<{ primary: Stimulus | null; secondary: Stimulus | null }>({
    primary: null,
    secondary: null,
  })
  const [responses, setResponses] = useState<Response[]>([])
  const [score, setScore] = useState<number>(0)
  const [countdown, setCountdown] = useState<number>(3)
  const [timeRemaining, setTimeRemaining] = useState<number>(120)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(false)
  const [hintsRemaining, setHintsRemaining] = useState<number>(3)
  const [primaryTargetSymbol, setPrimaryTargetSymbol] = useState<string>("●")
  const [secondaryTargetSymbol, setSecondaryTargetSymbol] = useState<string>("▲")
  const [primaryAccuracy, setPrimaryAccuracy] = useState<number>(100)
  const [secondaryAccuracy, setSecondaryAccuracy] = useState<number>(100)
  const [missedStimuli, setMissedStimuli] = useState<{ primary: number; secondary: number }>({
    primary: 0,
    secondary: 0,
  })
  const [averageResponseTime, setAverageResponseTime] = useState<{ primary: number; secondary: number }>({
    primary: 0,
    secondary: 0,
  })
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "correct" | "incorrect" | "missed" | "none"
    task: "primary" | "secondary" | "none"
    show: boolean
  }>({
    type: "none",
    task: "none",
    show: false,
  })

  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    taskType: "visualAuditory",
    enableSound: true,
    enableVisualFeedback: true,
    showPerformanceMetrics: true,
  })

  // Refs
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)
  const primaryTaskTimerRef = useRef<NodeJS.Timeout | null>(null)
  const secondaryTaskTimerRef = useRef<NodeJS.Timeout | null>(null)
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gameStartTimeRef = useRef<number>(0)

  // Visual stimuli options
  const shapes = ["●", "■", "▲", "◆", "★", "✚", "◯", "□", "△", "◇", "☆", "✖"]
  const colors = ["red", "blue", "green", "purple", "orange", "teal", "pink", "indigo"]
  const positions = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "center",
    "top-center",
    "bottom-center",
    "left-center",
    "right-center",
  ]
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const words = {
    animals: ["dog", "cat", "lion", "tiger", "elephant", "giraffe", "zebra", "monkey"],
    fruits: ["apple", "banana", "orange", "grape", "strawberry", "pineapple", "watermelon", "kiwi"],
    vehicles: ["car", "bus", "train", "airplane", "bicycle", "motorcycle", "boat", "helicopter"],
    furniture: ["chair", "table", "bed", "sofa", "desk", "bookshelf", "cabinet", "dresser"],
  }

  // Initialize game
  const initializeGame = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const taskType = TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES]

    // Set target symbols based on task type
    if (taskType.primaryTask.includes("visual")) {
      setPrimaryTargetSymbol(shapes[Math.floor(Math.random() * 3)])
    } else if (taskType.primaryTask === "color") {
      setPrimaryTargetSymbol(colors[Math.floor(Math.random() * 3)])
    } else if (taskType.primaryTask === "spatial") {
      setPrimaryTargetSymbol(positions[Math.floor(Math.random() * 3)])
    }

    if (taskType.secondaryTask.includes("visual")) {
      setSecondaryTargetSymbol(shapes[Math.floor(Math.random() * 3) + 3])
    } else if (taskType.secondaryTask === "auditory") {
      setSecondaryTargetSymbol("high tone")
    } else if (taskType.secondaryTask === "numerical") {
      setSecondaryTargetSymbol("even number")
    } else if (taskType.secondaryTask === "verbal") {
      const categories = Object.keys(words)
      setSecondaryTargetSymbol(categories[Math.floor(Math.random() * categories.length)])
    } else if (taskType.secondaryTask === "position") {
      setSecondaryTargetSymbol(positions[Math.floor(Math.random() * 3) + 3])
    }

    // Reset game state
    setPrimaryStimuli([])
    setSecondaryStimuli([])
    setActiveStimuli({ primary: null, secondary: null })
    setResponses([])
    setScore(0)
    setTimeRemaining(difficultySettings.duration)
    setHintsRemaining(difficultySettings.assistanceLevel)
    setPrimaryAccuracy(100)
    setSecondaryAccuracy(100)
    setMissedStimuli({ primary: 0, secondary: 0 })
    setAverageResponseTime({ primary: 0, secondary: 0 })
    setFeedbackMessage({ type: "none", task: "none", show: false })

    // Clear any existing timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    if (primaryTaskTimerRef.current) clearTimeout(primaryTaskTimerRef.current)
    if (secondaryTaskTimerRef.current) clearTimeout(secondaryTaskTimerRef.current)
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)

    gameStartTimeRef.current = 0
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
          startGameTimers()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Start game timers
  const startGameTimers = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]

    // Start main game timer
    gameTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Schedule first primary stimulus
    schedulePrimaryStimulus(difficultySettings.primaryTaskRate)

    // Schedule first secondary stimulus (with a slight delay to avoid both appearing simultaneously)
    setTimeout(() => {
      scheduleSecondaryStimulus(difficultySettings.secondaryTaskRate)
    }, difficultySettings.primaryTaskRate / 2)
  }

  // Schedule primary stimulus
  const schedulePrimaryStimulus = (rate: number) => {
    if (gamePhase !== "playing") return

    primaryTaskTimerRef.current = setTimeout(() => {
      generateStimulus("primary")
      schedulePrimaryStimulus(rate)
    }, rate)
  }

  // Schedule secondary stimulus
  const scheduleSecondaryStimulus = (rate: number) => {
    if (gamePhase !== "playing") return

    secondaryTaskTimerRef.current = setTimeout(() => {
      generateStimulus("secondary")
      scheduleSecondaryStimulus(rate)
    }, rate)
  }

  // Generate stimulus
  const generateStimulus = (task: "primary" | "secondary") => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const taskType = TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES]

    // Determine if this stimulus is a target (based on target probability)
    const isTarget = Math.random() < difficultySettings.targetProbability

    // Create stimulus based on task type
    const stimulus: Stimulus = {
      id: Date.now() + Math.random(),
      task,
      type: "",
      content: "",
      isTarget,
      timestamp: Date.now(),
      expiresAt:
        Date.now() + (task === "primary" ? difficultySettings.primaryTaskRate : difficultySettings.secondaryTaskRate),
      responded: false,
      responseCorrect: null,
      responseTime: null,
    }

    if (task === "primary") {
      switch (taskType.primaryTask) {
        case "visual":
        case "visual-shapes":
          stimulus.type = "shape"
          stimulus.content = isTarget
            ? primaryTargetSymbol
            : getRandomDistractor(shapes, primaryTargetSymbol, difficultySettings.distractorVariety)
          break
        case "color":
          stimulus.type = "color"
          stimulus.content = isTarget
            ? primaryTargetSymbol
            : getRandomDistractor(colors, primaryTargetSymbol, difficultySettings.distractorVariety)
          break
        case "spatial":
          stimulus.type = "position"
          stimulus.content = isTarget
            ? primaryTargetSymbol
            : getRandomDistractor(positions, primaryTargetSymbol, difficultySettings.distractorVariety)
          break
      }

      // Add to primary stimuli and set as active
      setPrimaryStimuli((prev) => [...prev, stimulus])
      setActiveStimuli((prev) => ({ ...prev, primary: stimulus }))

      // Schedule expiration
      setTimeout(() => {
        handleStimulusExpiration(stimulus)
      }, difficultySettings.primaryTaskRate)
    } else {
      switch (taskType.secondaryTask) {
        case "auditory":
          stimulus.type = "tone"
          stimulus.content = isTarget ? "high" : "low"
          // Play tone
          if (settings.enableSound) {
            playTone(stimulus.content as string)
          }
          break
        case "visual-numbers":
          stimulus.type = "number"
          stimulus.content = isTarget ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 5) + 5
          break
        case "numerical":
          stimulus.type = "math"
          if (isTarget) {
            // Generate even result
            const result = Math.floor(Math.random() * 5) * 2
            stimulus.content = `${result / 2} + ${result / 2}`
          } else {
            // Generate odd result
            const result = Math.floor(Math.random() * 5) * 2 + 1
            stimulus.content = `${(result - 1) / 2} + ${(result + 1) / 2}`
          }
          break
        case "verbal":
          stimulus.type = "word"
          const targetCategory = secondaryTargetSymbol
          if (isTarget) {
            // Get word from target category
            const categoryWords = words[targetCategory as keyof typeof words]
            stimulus.content = categoryWords[Math.floor(Math.random() * categoryWords.length)]
          } else {
            // Get word from different category
            const categories = Object.keys(words).filter((cat) => cat !== targetCategory)
            const randomCategory = categories[Math.floor(Math.random() * categories.length)]
            const categoryWords = words[randomCategory as keyof typeof words]
            stimulus.content = categoryWords[Math.floor(Math.random() * categoryWords.length)]
          }
          break
        case "position":
          stimulus.type = "position"
          stimulus.content = isTarget
            ? secondaryTargetSymbol
            : getRandomDistractor(positions, secondaryTargetSymbol, difficultySettings.distractorVariety)
          break
      }

      // Add to secondary stimuli and set as active
      setSecondaryStimuli((prev) => [...prev, stimulus])
      setActiveStimuli((prev) => ({ ...prev, secondary: stimulus }))

      // Schedule expiration
      setTimeout(() => {
        handleStimulusExpiration(stimulus)
      }, difficultySettings.secondaryTaskRate)
    }
  }

  // Get random distractor
  const getRandomDistractor = (options: any[], targetValue: string | number, variety: number) => {
    const distractors = options.filter((option) => option !== targetValue).slice(0, variety)
    return distractors[Math.floor(Math.random() * distractors.length)]
  }

  // Play tone
  const playTone = (type: string) => {
    // In a real implementation, this would play a tone
    console.log(`Playing ${type} tone`)
  }

  // Handle stimulus expiration
  const handleStimulusExpiration = (stimulus: Stimulus) => {
    if (gamePhase !== "playing") return

    // Check if stimulus was responded to
    if (!stimulus.responded) {
      // Mark as missed
      if (stimulus.isTarget) {
        // Missed target (false negative)
        setMissedStimuli((prev) => ({
          ...prev,
          [stimulus.task]: prev[stimulus.task as keyof typeof prev] + 1,
        }))

        // Update accuracy
        if (stimulus.task === "primary") {
          updatePrimaryAccuracy(false)
        } else {
          updateSecondaryAccuracy(false)
        }

        // Show feedback
        if (settings.enableVisualFeedback) {
          setFeedbackMessage({
            type: "missed",
            task: stimulus.task,
            show: true,
          })

          feedbackTimerRef.current = setTimeout(() => {
            setFeedbackMessage({
              type: "none",
              task: "none",
              show: false,
            })
          }, 500)
        }

        // Penalty for missed target
        setScore((prev) => Math.max(0, prev - 25))
      }

      // Remove from active stimuli
      setActiveStimuli((prev) => ({
        ...prev,
        [stimulus.task]: null,
      }))
    }
  }

  // Handle response
  const handleResponse = (task: "primary" | "secondary") => {
    if (gamePhase !== "playing") return

    const stimulus = task === "primary" ? activeStimuli.primary : activeStimuli.secondary

    if (!stimulus) return

    // Calculate response time
    const responseTime = Date.now() - stimulus.timestamp

    // Determine if response is correct
    const correct = stimulus.isTarget

    // Update stimulus
    const updatedStimulus = {
      ...stimulus,
      responded: true,
      responseCorrect: correct,
      responseTime,
    }

    // Update stimuli list
    if (task === "primary") {
      setPrimaryStimuli((prev) => prev.map((s) => (s.id === stimulus.id ? updatedStimulus : s)))
    } else {
      setSecondaryStimuli((prev) => prev.map((s) => (s.id === stimulus.id ? updatedStimulus : s)))
    }

    // Record response
    const newResponse: Response = {
      stimulusId: stimulus.id,
      task,
      correct,
      responseTime,
    }

    setResponses((prev) => [...prev, newResponse])

    // Update average response time
    const newResponses = [...responses, newResponse]
    const taskResponses = newResponses.filter((r) => r.task === task && r.correct)

    if (taskResponses.length > 0) {
      const avgTime = taskResponses.reduce((sum, r) => sum + r.responseTime, 0) / taskResponses.length
      setAverageResponseTime((prev) => ({
        ...prev,
        [task]: avgTime,
      }))
    }

    // Update accuracy
    if (task === "primary") {
      updatePrimaryAccuracy(correct)
    } else {
      updateSecondaryAccuracy(correct)
    }

    // Update score
    if (correct) {
      // Base points for correct response
      const points = 50

      // Bonus for fast response (max 50 bonus points)
      const speedBonus = Math.max(0, 50 - Math.floor(responseTime / 20))

      // Add to score
      setScore((prev) => prev + points + speedBonus)

      // Show feedback
      if (settings.enableVisualFeedback) {
        setFeedbackMessage({
          type: "correct",
          task,
          show: true,
        })

        feedbackTimerRef.current = setTimeout(() => {
          setFeedbackMessage({
            type: "none",
            task: "none",
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
      // Penalty for incorrect response (false positive)
      setScore((prev) => Math.max(0, prev - 25))

      // Show feedback
      if (settings.enableVisualFeedback) {
        setFeedbackMessage({
          type: "incorrect",
          task,
          show: true,
        })

        feedbackTimerRef.current = setTimeout(() => {
          setFeedbackMessage({
            type: "none",
            task: "none",
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

    // Remove from active stimuli
    setActiveStimuli((prev) => ({
      ...prev,
      [task]: null,
    }))
  }

  // Update primary accuracy
  const updatePrimaryAccuracy = (correct: boolean) => {
    const primaryResponses = [
      ...responses.filter((r) => r.task === "primary"),
      { task: "primary", correct, responseTime: 0, stimulusId: 0 },
    ]
    const correctPrimary = primaryResponses.filter((r) => r.correct).length
    const newAccuracy = (correctPrimary / primaryResponses.length) * 100
    setPrimaryAccuracy(newAccuracy)
  }

  // Update secondary accuracy
  const updateSecondaryAccuracy = (correct: boolean) => {
    const secondaryResponses = [
      ...responses.filter((r) => r.task === "secondary"),
      { task: "secondary", correct, responseTime: 0, stimulusId: 0 },
    ]
    const correctSecondary = secondaryResponses.filter((r) => r.correct).length
    const newAccuracy = (correctSecondary / secondaryResponses.length) * 100
    setSecondaryAccuracy(newAccuracy)
  }

  // Handle hint request
  const handleHint = () => {
    if (hintsRemaining <= 0) return

    setHintsRemaining(hintsRemaining - 1)

    // Pause game briefly
    if (primaryTaskTimerRef.current) clearTimeout(primaryTaskTimerRef.current)
    if (secondaryTaskTimerRef.current) clearTimeout(secondaryTaskTimerRef.current)

    // Show hint toast
    toast({
      title: "Hint",
      description: `Primary target: ${primaryTargetSymbol}, Secondary target: ${secondaryTargetSymbol}`,
      duration: 3000,
    })

    // Resume game after a short pause
    setTimeout(() => {
      if (gamePhase === "playing") {
        const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
        schedulePrimaryStimulus(difficultySettings.primaryTaskRate)
        scheduleSecondaryStimulus(difficultySettings.secondaryTaskRate)
      }
    }, 3000)
  }

  // End game
  const endGame = () => {
    setGamePhase("results")

    // Clear timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    if (primaryTaskTimerRef.current) clearTimeout(primaryTaskTimerRef.current)
    if (secondaryTaskTimerRef.current) clearTimeout(secondaryTaskTimerRef.current)

    // Calculate final score
    const primaryBonus = Math.floor(primaryAccuracy * 2)
    const secondaryBonus = Math.floor(secondaryAccuracy * 2)
    const balanceBonus = Math.floor(Math.min(primaryAccuracy, secondaryAccuracy) * 3)

    const finalScore = score + primaryBonus + secondaryBonus + balanceBonus
    setScore(finalScore)

    // Record game session
    const gameSession = {
      id: `da-${Date.now()}`,
      userId: "current-user", // This would be the actual user ID in a real implementation
      gameId: "divided-attention",
      gameName: "Divided Attention",
      startTime: new Date(gameStartTimeRef.current),
      endTime: new Date(),
      duration: Math.floor((Date.now() - gameStartTimeRef.current) / 1000),
      score: finalScore,
      difficulty: settings.difficulty,
      completed: true,
      metrics: {
        primaryAccuracy: primaryAccuracy / 100,
        secondaryAccuracy: secondaryAccuracy / 100,
        primaryResponseTime: averageResponseTime.primary,
        secondaryResponseTime: averageResponseTime.secondary,
        missedPrimary: missedStimuli.primary,
        missedSecondary: missedStimuli.secondary,
        correctPrimary: responses.filter((r) => r.task === "primary" && r.correct).length,
        incorrectPrimary: responses.filter((r) => r.task === "primary" && !r.correct).length,
        correctSecondary: responses.filter((r) => r.task === "secondary" && r.correct).length,
        incorrectSecondary: responses.filter((r) => r.task === "secondary" && !r.correct).length,
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
      if (gamePhase !== "playing") return

      if (e.code === "KeyZ") {
        // Z key for primary task
        e.preventDefault()
        handleResponse("primary")
      } else if (e.code === "KeyM") {
        // M key for secondary task
        e.preventDefault()
        handleResponse("secondary")
      } else if (e.code === "KeyH" && hintsRemaining > 0) {
        // H key for hint
        e.preventDefault()
        handleHint()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gamePhase, activeStimuli, hintsRemaining])

  // Render primary stimulus
  const renderPrimaryStimulus = () => {
    if (!activeStimuli.primary) return null

    const stimulus = activeStimuli.primary
    const taskType = TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES]

    switch (taskType.primaryTask) {
      case "visual":
      case "visual-shapes":
        return <div className="text-6xl">{stimulus.content}</div>
      case "color":
        return <div className="w-16 h-16 rounded-full" style={{ backgroundColor: stimulus.content as string }}></div>
      case "spatial":
        return (
          <div className="relative w-32 h-32 border border-gray-300 rounded-lg">
            <div
              className={`absolute w-4 h-4 bg-indigo-600 rounded-full ${getPositionClass(stimulus.content as string)}`}
            ></div>
          </div>
        )
      default:
        return null
    }
  }

  // Render secondary stimulus
  const renderSecondaryStimulus = () => {
    if (!activeStimuli.secondary) return null

    const stimulus = activeStimuli.secondary
    const taskType = TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES]

    switch (taskType.secondaryTask) {
      case "auditory":
        return (
          <div className="flex items-center justify-center">
            <Bell className="h-12 w-12 text-amber-500" />
            <span className="sr-only">{stimulus.content} tone</span>
          </div>
        )
      case "visual-numbers":
        return <div className="text-6xl font-bold">{stimulus.content}</div>
      case "numerical":
        return <div className="text-3xl font-medium">{stimulus.content}</div>
      case "verbal":
        return <div className="text-3xl">{stimulus.content}</div>
      case "position":
        return (
          <div className="relative w-32 h-32 border border-gray-300 rounded-lg">
            <div
              className={`absolute w-4 h-4 bg-amber-500 rounded-full ${getPositionClass(stimulus.content as string)}`}
            ></div>
          </div>
        )
      default:
        return null
    }
  }

  // Get position class
  const getPositionClass = (position: string): string => {
    switch (position) {
      case "top-left":
        return "top-2 left-2"
      case "top-right":
        return "top-2 right-2"
      case "bottom-left":
        return "bottom-2 left-2"
      case "bottom-right":
        return "bottom-2 right-2"
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      case "top-center":
        return "top-2 left-1/2 -translate-x-1/2"
      case "bottom-center":
        return "bottom-2 left-1/2 -translate-x-1/2"
      case "left-center":
        return "left-2 top-1/2 -translate-y-1/2"
      case "right-center":
        return "right-2 top-1/2 -translate-y-1/2"
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    }
  }

  // Render game content based on phase
  const renderGameContent = () => {
    switch (gamePhase) {
      case "intro":
        return (
          <div className="flex flex-col items-center text-center p-8">
            <Brain className="h-16 w-16 text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Divided Attention</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Train your ability to focus on multiple tasks simultaneously by monitoring and responding to different
              stimuli.
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
                <span>Duration:</span>
                <span>
                  {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].duration} seconds
                </span>
              </div>
              <div className="flex justify-between">
                <span>Description:</span>
              </div>
              <p className="text-sm text-gray-600">
                {TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].description}
              </p>
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
          <div className="flex flex-col items-center p-8">
            <div className="flex items-center justify-between w-full max-w-4xl mb-6">
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

              <Button
                variant="outline"
                size="sm"
                onClick={handleHint}
                disabled={hintsRemaining <= 0}
                className="flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Hint ({hintsRemaining})
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-8">
              <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-medium">Primary Task</h3>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-[200px] w-full relative">
                  {renderPrimaryStimulus()}

                  {feedbackMessage.show && feedbackMessage.task === "primary" && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-opacity-70 rounded-lg ${
                        feedbackMessage.type === "correct"
                          ? "bg-green-100"
                          : feedbackMessage.type === "incorrect"
                            ? "bg-red-100"
                            : feedbackMessage.type === "missed"
                              ? "bg-amber-100"
                              : "bg-transparent"
                      }`}
                    >
                      {feedbackMessage.type === "correct" && <Check className="h-16 w-16 text-green-600" />}
                      {feedbackMessage.type === "incorrect" && <X className="h-16 w-16 text-red-600" />}
                      {feedbackMessage.type === "missed" && (
                        <div className="text-2xl font-bold text-amber-600">Missed!</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 w-full">
                  <Button
                    className="w-full"
                    onClick={() => handleResponse("primary")}
                    disabled={!activeStimuli.primary}
                  >
                    Respond (Z)
                  </Button>

                  <div className="mt-2 text-center text-sm text-gray-500">
                    Target: <span className="font-medium">{primaryTargetSymbol}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4">
                  <Ear className="h-5 w-5 text-amber-600" />
                  <h3 className="font-medium">Secondary Task</h3>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-[200px] w-full relative">
                  {renderSecondaryStimulus()}

                  {feedbackMessage.show && feedbackMessage.task === "secondary" && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-opacity-70 rounded-lg ${
                        feedbackMessage.type === "correct"
                          ? "bg-green-100"
                          : feedbackMessage.type === "incorrect"
                            ? "bg-red-100"
                            : feedbackMessage.type === "missed"
                              ? "bg-amber-100"
                              : "bg-transparent"
                      }`}
                    >
                      {feedbackMessage.type === "correct" && <Check className="h-16 w-16 text-green-600" />}
                      {feedbackMessage.type === "incorrect" && <X className="h-16 w-16 text-red-600" />}
                      {feedbackMessage.type === "missed" && (
                        <div className="text-2xl font-bold text-amber-600">Missed!</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 w-full">
                  <Button
                    className="w-full"
                    onClick={() => handleResponse("secondary")}
                    disabled={!activeStimuli.secondary}
                  >
                    Respond (M)
                  </Button>

                  <div className="mt-2 text-center text-sm text-gray-500">
                    Target: <span className="font-medium">{secondaryTargetSymbol}</span>
                  </div>
                </div>
              </div>
            </div>

            {settings.showPerformanceMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Primary Accuracy</span>
                    <span>{Math.round(primaryAccuracy)}%</span>
                  </div>
                  <Progress value={primaryAccuracy} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Secondary Accuracy</span>
                    <span>{Math.round(secondaryAccuracy)}%</span>
                  </div>
                  <Progress value={secondaryAccuracy} className="h-2" />
                </div>
              </div>
            )}
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
                    <Eye className="h-5 w-5 text-indigo-500" />
                    Primary Task
                  </CardTitle>
                  <CardDescription>
                    {TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].primaryTask}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{Math.round(primaryAccuracy)}%</div>
                  <Progress value={primaryAccuracy} className="h-2 mt-2" />
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div>
                      <div className="text-gray-500">Correct</div>
                      <div className="font-medium">
                        {responses.filter((r) => r.task === "primary" && r.correct).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Incorrect</div>
                      <div className="font-medium">
                        {responses.filter((r) => r.task === "primary" && !r.correct).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Missed</div>
                      <div className="font-medium">{missedStimuli.primary}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Avg. Time</div>
                      <div className="font-medium">
                        {averageResponseTime.primary > 0 ? `${(averageResponseTime.primary / 1000).toFixed(2)}s` : "-"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Ear className="h-5 w-5 text-amber-500" />
                    Secondary Task
                  </CardTitle>
                  <CardDescription>
                    {TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].secondaryTask}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{Math.round(secondaryAccuracy)}%</div>
                  <Progress value={secondaryAccuracy} className="h-2 mt-2" />
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div>
                      <div className="text-gray-500">Correct</div>
                      <div className="font-medium">
                        {responses.filter((r) => r.task === "secondary" && r.correct).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Incorrect</div>
                      <div className="font-medium">
                        {responses.filter((r) => r.task === "secondary" && !r.correct).length}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Missed</div>
                      <div className="font-medium">{missedStimuli.secondary}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Avg. Time</div>
                      <div className="font-medium">
                        {averageResponseTime.secondary > 0
                          ? `${(averageResponseTime.secondary / 1000).toFixed(2)}s`
                          : "-"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-emerald-500" />
                    Overall Performance
                  </CardTitle>
                  <CardDescription>Balance between tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{score}</div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Task Balance</span>
                      <span>{Math.min(Math.round(primaryAccuracy), Math.round(secondaryAccuracy))}%</span>
                    </div>
                    <Progress value={Math.min(primaryAccuracy, secondaryAccuracy)} className="h-2" />
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Primary Bonus</span>
                        <span>+{Math.floor(primaryAccuracy * 2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Secondary Bonus</span>
                        <span>+{Math.floor(secondaryAccuracy * 2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Balance Bonus</span>
                        <span>+{Math.floor(Math.min(primaryAccuracy, secondaryAccuracy) * 3)}</span>
                      </div>
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
                      <span>Divided Attention</span>
                      <span>Primary</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Selective Attention</span>
                      <span>High</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Processing Speed</span>
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
                      <span>Cognitive Flexibility</span>
                      <span>High</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Working Memory</span>
                      <span>Medium</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Sustained Attention</span>
                      <span>Medium</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "70%" }}></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Divided Attention</h1>
          <p className="text-gray-600 mt-2">Train your ability to focus on multiple tasks simultaneously</p>
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
                <DialogTitle>How to Play Divided Attention</DialogTitle>
                <DialogDescription>Train your ability to focus on multiple tasks simultaneously.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Game Rules:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Monitor both the primary and secondary tasks simultaneously</li>
                    <li>Respond only when you see the target stimulus in each task</li>
                    <li>Press Z or click the "Respond" button for the primary task</li>
                    <li>Press M or click the "Respond" button for the secondary task</li>
                    <li>Avoid responding to non-target stimuli</li>
                    <li>Try to maintain high accuracy on both tasks</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Task Type:</h4>
                  <p className="text-sm text-gray-600">
                    {TASK_TYPES[settings.taskType as keyof typeof TASK_TYPES].description}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cognitive Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Improves divided attention</li>
                    <li>Enhances multitasking ability</li>
                    <li>Develops cognitive flexibility</li>
                    <li>Trains selective attention</li>
                    <li>Builds processing speed</li>
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
                <DialogDescription>Customize your Divided Attention experience</DialogDescription>
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
                      <TabsTrigger value="visualAuditory">Visual & Auditory</TabsTrigger>
                      <TabsTrigger value="dualVisual">Dual Visual</TabsTrigger>
                      <TabsTrigger value="visualNumerical">Visual & Numerical</TabsTrigger>
                      <TabsTrigger value="spatialVerbal">Spatial & Verbal</TabsTrigger>
                      <TabsTrigger value="colorPosition">Color & Position</TabsTrigger>
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
                      <Label htmlFor="showPerformanceMetrics">Performance Metrics</Label>
                      <p className="text-sm text-gray-500">Show real-time performance metrics</p>
                    </div>
                    <Switch
                      id="showPerformanceMetrics"
                      checked={settings.showPerformanceMetrics}
                      onCheckedChange={(checked) => handleSettingsChange({ showPerformanceMetrics: checked })}
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

