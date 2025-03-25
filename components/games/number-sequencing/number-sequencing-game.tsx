"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Timer, Brain, Award, RotateCcw, HelpCircle, Settings } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { gameAnalytics } from "@/lib/game-analytics"

// Difficulty presets
const DIFFICULTY_PRESETS = {
  beginner: {
    sequenceLength: 5,
    timeLimit: 60,
    complexity: "low",
    patternTypes: ["arithmetic"],
    assistanceLevel: 3,
  },
  easy: {
    sequenceLength: 6,
    timeLimit: 60,
    complexity: "low",
    patternTypes: ["arithmetic", "geometric"],
    assistanceLevel: 2,
  },
  medium: {
    sequenceLength: 7,
    timeLimit: 45,
    complexity: "medium",
    patternTypes: ["arithmetic", "geometric", "fibonacci"],
    assistanceLevel: 1,
  },
  hard: {
    sequenceLength: 8,
    timeLimit: 40,
    complexity: "high",
    patternTypes: ["arithmetic", "geometric", "fibonacci", "power"],
    assistanceLevel: 0,
  },
  expert: {
    sequenceLength: 9,
    timeLimit: 30,
    complexity: "high",
    patternTypes: ["arithmetic", "geometric", "fibonacci", "power", "prime"],
    assistanceLevel: 0,
  },
}

// Sequence types
interface SequenceGenerator {
  generate: (length: number, complexity: string) => number[]
  name: string
  description: string
}

const SEQUENCE_GENERATORS: Record<string, SequenceGenerator> = {
  arithmetic: {
    name: "Arithmetic Sequence",
    description: "Each number differs from the previous by a constant value",
    generate: (length, complexity) => {
      // Determine step size based on complexity
      let step: number
      if (complexity === "low") {
        step = Math.floor(Math.random() * 5) + 1 // 1-5
      } else if (complexity === "medium") {
        step = Math.floor(Math.random() * 10) + 1 // 1-10
      } else {
        step = Math.floor(Math.random() * 20) - 10 // -10 to 10
      }

      // Determine starting number
      const start = Math.floor(Math.random() * 20) - 10 // -10 to 10

      // Generate sequence
      return Array.from({ length }, (_, i) => start + i * step)
    },
  },
  geometric: {
    name: "Geometric Sequence",
    description: "Each number is multiplied by a constant value",
    generate: (length, complexity) => {
      // Determine ratio based on complexity
      let ratio: number
      if (complexity === "low") {
        ratio = 2 // Simple doubling
      } else if (complexity === "medium") {
        ratio = [2, 3, 4][Math.floor(Math.random() * 3)] // 2, 3, or 4
      } else {
        ratio = [2, 3, 4, 0.5, 0.25, 0.1][Math.floor(Math.random() * 6)] // Including fractions
      }

      // Determine starting number (avoid 0 for geometric sequences)
      const start = Math.floor(Math.random() * 10) + 1 // 1-10

      // Generate sequence
      return Array.from({ length }, (_, i) => Math.round(start * Math.pow(ratio, i)))
    },
  },
  fibonacci: {
    name: "Fibonacci-like Sequence",
    description: "Each number is the sum of the two preceding numbers",
    generate: (length, complexity) => {
      // Determine starting numbers based on complexity
      let first: number, second: number
      if (complexity === "low") {
        first = 1
        second = 1
      } else if (complexity === "medium") {
        first = Math.floor(Math.random() * 5) + 1 // 1-5
        second = Math.floor(Math.random() * 5) + 1 // 1-5
      } else {
        first = Math.floor(Math.random() * 10) - 5 // -5 to 5
        second = Math.floor(Math.random() * 10) - 5 // -5 to 5
      }

      // Generate sequence
      const sequence = [first, second]
      for (let i = 2; i < length; i++) {
        sequence.push(sequence[i - 1] + sequence[i - 2])
      }

      return sequence
    },
  },
  power: {
    name: "Power Sequence",
    description: "Each number is raised to a power",
    generate: (length, complexity) => {
      // Determine base based on complexity
      let base: number
      if (complexity === "low") {
        base = 2 // Simple powers of 2
      } else if (complexity === "medium") {
        base = [2, 3][Math.floor(Math.random() * 2)] // Powers of 2 or 3
      } else {
        base = [2, 3, 4, 5][Math.floor(Math.random() * 4)] // Powers of 2, 3, 4, or 5
      }

      // Generate sequence
      return Array.from({ length }, (_, i) => Math.pow(base, i))
    },
  },
  prime: {
    name: "Prime Numbers",
    description: "Sequence of prime numbers",
    generate: (length, complexity) => {
      // Helper function to check if a number is prime
      const isPrime = (num: number): boolean => {
        if (num <= 1) return false
        if (num <= 3) return true
        if (num % 2 === 0 || num % 3 === 0) return false

        let i = 5
        while (i * i <= num) {
          if (num % i === 0 || num % (i + 2) === 0) return false
          i += 6
        }

        return true
      }

      // Generate sequence of prime numbers
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

      // For higher complexity, we can skip some primes
      if (complexity === "medium") {
        // Take every other prime
        return primes.filter((_, i) => i % 2 === 0).slice(0, length)
      } else if (complexity === "high") {
        // Take every third prime
        return primes.filter((_, i) => i % 3 === 0).slice(0, length)
      } else {
        // Just take the first n primes
        return primes.slice(0, length)
      }
    },
  },
}

// Game phases
type GamePhase = "intro" | "playing" | "results"

// Sequence interface
interface Sequence {
  numbers: number[]
  type: string
  answer: number
  userAnswer: number | null
  isCorrect: boolean | null
}

// Game settings interface
interface GameSettings {
  difficulty: string
  enableTimer: boolean
  enableHints: boolean
  enableSound: boolean
  showFeedback: boolean
}

export default function NumberSequencingGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro")
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(60)
  const [score, setScore] = useState<number>(0)
  const [hintsRemaining, setHintsRemaining] = useState<number>(3)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(false)
  const [userInput, setUserInput] = useState<string>("")
  const [showHint, setShowHint] = useState<boolean>(false)
  const [hintText, setHintText] = useState<string>("")
  const [sequenceLength, setSequenceLength] = useState<number>(5)

  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    enableTimer: true,
    enableHints: true,
    enableSound: true,
    showFeedback: true,
  })

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const gameStartTimeRef = useRef<number>(0)

  // Initialize game
  const initializeGame = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    setSequenceLength(difficultySettings.sequenceLength)

    // Generate sequences
    const generatedSequences: Sequence[] = []

    // Number of sequences based on difficulty
    const sequenceCount = {
      beginner: 5,
      easy: 8,
      medium: 10,
      hard: 12,
      expert: 15,
    }[settings.difficulty]

    for (let i = 0; i < sequenceCount; i++) {
      // Select random pattern type from available types for this difficulty
      const patternType =
        difficultySettings.patternTypes[Math.floor(Math.random() * difficultySettings.patternTypes.length)]

      // Generate sequence
      const generator = SEQUENCE_GENERATORS[patternType]
      const numbers = generator.generate(difficultySettings.sequenceLength, difficultySettings.complexity)

      // The answer is the next number in the sequence
      const answer = calculateNextNumber(numbers, patternType)

      generatedSequences.push({
        numbers,
        type: patternType,
        answer,
        userAnswer: null,
        isCorrect: null,
      })
    }

    setSequences(generatedSequences)
    setCurrentSequenceIndex(0)
    setTimeRemaining(difficultySettings.timeLimit)
    setScore(0)
    setHintsRemaining(difficultySettings.assistanceLevel)
    setUserInput("")
    setShowHint(false)
    setHintText("")

    gameStartTimeRef.current = 0
  }

  // Calculate the next number in a sequence
  const calculateNextNumber = (numbers: number[], type: string): number => {
    switch (type) {
      case "arithmetic":
        // For arithmetic sequences, the difference between consecutive terms is constant
        const diff = numbers[1] - numbers[0]
        return numbers[numbers.length - 1] + diff

      case "geometric":
        // For geometric sequences, the ratio between consecutive terms is constant
        const ratio = numbers[1] / numbers[0]
        return Math.round(numbers[numbers.length - 1] * ratio)

      case "fibonacci":
        // For Fibonacci-like sequences, each term is the sum of the two preceding terms
        return numbers[numbers.length - 1] + numbers[numbers.length - 2]

      case "power":
        // For power sequences, we need to determine the base and continue the pattern
        // Assuming the sequence is of the form base^0, base^1, base^2, ...
        const base = Math.round(Math.pow(numbers[1], 1))
        return Math.pow(base, numbers.length)

      case "prime":
        // For prime sequences, we need to find the next prime number
        let nextNum = numbers[numbers.length - 1] + 1
        while (!isPrime(nextNum)) {
          nextNum++
        }
        return nextNum

      default:
        return 0
    }
  }

  // Check if a number is prime
  const isPrime = (num: number): boolean => {
    if (num <= 1) return false
    if (num <= 3) return true
    if (num % 2 === 0 || num % 3 === 0) return false

    let i = 5
    while (i * i <= num) {
      if (num % i === 0 || num % (i + 2) === 0) return false
      i += 6
    }

    return true
  }

  // Initialize game on mount and settings change
  useEffect(() => {
    initializeGame()
  }, [settings])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gamePhase === "playing" && settings.enableTimer && timeRemaining > 0) {
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
    }

    return () => clearInterval(timer)
  }, [gamePhase, settings.enableTimer, timeRemaining])

  // Focus input when entering playing phase
  useEffect(() => {
    if (gamePhase === "playing" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gamePhase, currentSequenceIndex])

  // Start game
  const startGame = () => {
    setGamePhase("playing")
    gameStartTimeRef.current = Date.now()
  }

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!userInput.trim()) return

    const numericAnswer = Number.parseInt(userInput.trim())
    if (isNaN(numericAnswer)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number.",
        variant: "destructive",
      })
      return
    }

    // Update current sequence with user's answer
    const currentSequence = sequences[currentSequenceIndex]
    const isCorrect = numericAnswer === currentSequence.answer

    const updatedSequences = [...sequences]
    updatedSequences[currentSequenceIndex] = {
      ...currentSequence,
      userAnswer: numericAnswer,
      isCorrect,
    }

    setSequences(updatedSequences)

    // Update score
    if (isCorrect) {
      // Base points for correct answer
      const points = 100

      // Bonus based on difficulty
      const difficultyBonus = {
        beginner: 0,
        easy: 25,
        medium: 50,
        hard: 100,
        expert: 150,
      }[settings.difficulty]

      // Add to score
      setScore((prev) => prev + points + difficultyBonus)

      // Show feedback
      if (settings.showFeedback) {
        toast({
          title: "Correct!",
          description: `The next number in the sequence is ${currentSequence.answer}.`,
          variant: "default",
        })
      }

      // Play sound if enabled
      if (settings.enableSound) {
        // Play success sound
        console.log("Playing success sound")
      }
    } else {
      // Penalty for incorrect answer
      setScore((prev) => Math.max(0, prev - 25))

      // Show feedback
      if (settings.showFeedback) {
        toast({
          title: "Incorrect",
          description: `The correct answer was ${currentSequence.answer}.`,
          variant: "destructive",
        })
      }

      // Play sound if enabled
      if (settings.enableSound) {
        // Play error sound
        console.log("Playing error sound")
      }
    }

    // Move to next sequence or end game
    if (currentSequenceIndex < sequences.length - 1) {
      setCurrentSequenceIndex(currentSequenceIndex + 1)
      setUserInput("")
      setShowHint(false)
      setHintText("")
    } else {
      endGame()
    }
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitAnswer()
    }
  }

  // Handle hint request
  const handleHint = () => {
    if (hintsRemaining <= 0 || !settings.enableHints) return

    setHintsRemaining(hintsRemaining - 1)
    setShowHint(true)

    const currentSequence = sequences[currentSequenceIndex]

    // Generate hint based on sequence type
    let hint = ""
    switch (currentSequence.type) {
      case "arithmetic":
        const diff = currentSequence.numbers[1] - currentSequence.numbers[0]
        hint = `This is an arithmetic sequence with a common difference of ${diff}.`
        break

      case "geometric":
        const ratio = currentSequence.numbers[1] / currentSequence.numbers[0]
        hint = `This is a geometric sequence with a common ratio of ${ratio}.`
        break

      case "fibonacci":
        hint = `This is a Fibonacci-like sequence where each number is the sum of the two preceding numbers.`
        break

      case "power":
        const base = Math.round(Math.pow(currentSequence.numbers[1], 1))
        hint = `This is a power sequence with base ${base}.`
        break

      case "prime":
        hint = `This is a sequence of prime numbers.`
        break
    }

    setHintText(hint)
  }

  // End game
  const endGame = () => {
    setGamePhase("results")

    // Calculate final score
    const correctAnswers = sequences.filter((seq) => seq.isCorrect).length
    const totalSequences = sequences.length
    const accuracy = (correctAnswers / totalSequences) * 100

    const accuracyBonus = Math.floor(accuracy * 5)
    const timeBonus = timeRemaining > 0 ? timeRemaining * 5 : 0

    const finalScore = score + accuracyBonus + timeBonus
    setScore(finalScore)

    // Record game session
    const gameSession = {
      id: `ns-${Date.now()}`,
      userId: "current-user", // This would be the actual user ID in a real implementation
      gameId: "number-sequencing",
      gameName: "Number Sequencing",
      startTime: new Date(gameStartTimeRef.current),
      endTime: new Date(),
      duration: Math.floor((Date.now() - gameStartTimeRef.current) / 1000),
      score: finalScore,
      difficulty: settings.difficulty,
      completed: true,
      metrics: {
        accuracy: accuracy / 100,
        correctAnswers,
        incorrectAnswers: totalSequences - correctAnswers,
        totalItems: totalSequences,
      },
    }

    gameAnalytics.recordGameSession(gameSession)
  }

  // Handle game over (time ran out)
  const handleGameOver = () => {
    // Mark all remaining sequences as unanswered
    const updatedSequences = sequences.map((seq, index) => {
      if (index >= currentSequenceIndex) {
        return {
          ...seq,
          userAnswer: null,
          isCorrect: false,
        }
      }
      return seq
    })

    setSequences(updatedSequences)

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

  // Render game content based on phase
  const renderGameContent = () => {
    switch (gamePhase) {
      case "intro":
        return (
          <div className="flex flex-col items-center text-center p-8">
            <Brain className="h-16 w-16 text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Number Sequencing</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Improve working memory and pattern recognition by identifying the next number in various sequences.
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
                <span>Sequence Types:</span>
                <span>
                  {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].patternTypes.join(", ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sequence Length:</span>
                <span>
                  {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].sequenceLength} numbers
                </span>
              </div>
              {settings.enableTimer && (
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span>
                    {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].timeLimit} seconds
                  </span>
                </div>
              )}
            </div>
            <Button onClick={startGame} className="w-full max-w-md">
              Start Game
            </Button>
          </div>
        )

      case "playing":
        if (currentSequenceIndex >= sequences.length) {
          return null
        }

        const currentSequence = sequences[currentSequenceIndex]

        return (
          <div className="flex flex-col items-center p-8">
            {settings.enableTimer && (
              <div className="flex items-center gap-2 mb-6">
                <Timer className="h-5 w-5 text-amber-500" />
                <span className={`font-medium ${timeRemaining < 10 ? "text-red-500" : ""}`}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}

            <div className="w-full max-w-2xl mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500">
                  Sequence {currentSequenceIndex + 1} of {sequences.length}
                </span>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">Score: {score}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {currentSequence.numbers.map((number, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-white border-2 border-indigo-200 rounded-lg flex items-center justify-center shadow-sm"
                    >
                      <span className="text-xl font-bold text-indigo-600">{number}</span>
                    </div>
                  ))}
                  <div className="w-16 h-16 bg-indigo-100 border-2 border-indigo-300 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-xl font-bold text-indigo-600">?</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="number"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter the next number..."
                    className="flex-1"
                  />
                  <Button onClick={handleSubmitAnswer}>Submit</Button>
                </div>
              </div>

              {settings.enableHints && (
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleHint}
                    disabled={hintsRemaining <= 0 || showHint}
                    className="flex items-center gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Hint ({hintsRemaining})
                  </Button>

                  {showHint && <div className="text-sm text-indigo-600 italic">{hintText}</div>}
                </div>
              )}
            </div>

            <Progress value={(currentSequenceIndex / sequences.length) * 100} className="w-full max-w-2xl h-2" />
          </div>
        )

      case "results":
        const correctAnswers = sequences.filter((seq) => seq.isCorrect).length
        const totalSequences = sequences.length
        const accuracy = (correctAnswers / totalSequences) * 100

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
                  <CardTitle>Accuracy</CardTitle>
                  <CardDescription>Correct answers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">{Math.round(accuracy)}%</div>
                  <Progress value={accuracy} className="h-2 mt-2" />
                  <div className="text-sm text-gray-500 text-center mt-2">
                    {correctAnswers} of {totalSequences} sequences
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Sequence Types</CardTitle>
                  <CardDescription>Patterns identified</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.keys(SEQUENCE_GENERATORS)
                      .filter((type) =>
                        DIFFICULTY_PRESETS[
                          settings.difficulty as keyof typeof DIFFICULTY_PRESETS
                        ].patternTypes.includes(type),
                      )
                      .map((type) => {
                        const sequencesOfType = sequences.filter((seq) => seq.type === type)
                        const correctOfType = sequencesOfType.filter((seq) => seq.isCorrect).length
                        const totalOfType = sequencesOfType.length

                        return (
                          <div key={type} className="flex justify-between items-center">
                            <span className="text-sm">{SEQUENCE_GENERATORS[type].name}</span>
                            <Badge variant={correctOfType === totalOfType ? "default" : "outline"}>
                              {correctOfType}/{totalOfType}
                            </Badge>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Score Breakdown</CardTitle>
                  <CardDescription>Points earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Correct Answers</span>
                      <span>{correctAnswers * 100}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy Bonus</span>
                      <span>{Math.floor(accuracy * 5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Bonus</span>
                      <span>{timeRemaining > 0 ? timeRemaining * 5 : 0}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Score</span>
                      <span>{score}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full max-w-4xl mb-8">
              <h3 className="text-xl font-bold mb-4">Sequence Review</h3>
              <div className="space-y-4">
                {sequences.map((sequence, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      sequence.isCorrect
                        ? "bg-green-50 border border-green-200"
                        : sequence.userAnswer !== null
                          ? "bg-red-50 border border-red-200"
                          : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Sequence {index + 1}</span>
                      <Badge variant={sequence.isCorrect ? "default" : "outline"}>
                        {sequence.isCorrect ? "Correct" : sequence.userAnswer !== null ? "Incorrect" : "Skipped"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {sequence.numbers.map((number, i) => (
                        <div key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm">
                          {number}
                        </div>
                      ))}
                      <div
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          sequence.isCorrect
                            ? "bg-green-100 border-green-300 text-green-800"
                            : sequence.userAnswer !== null
                              ? "bg-red-100 border-red-300 text-red-800"
                              : "bg-gray-100 border-gray-300 text-gray-800"
                        }`}
                      >
                        {sequence.answer}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>Pattern: {SEQUENCE_GENERATORS[sequence.type].name}</span>
                      {sequence.userAnswer !== null && !sequence.isCorrect && (
                        <span className="ml-4">Your answer: {sequence.userAnswer}</span>
                      )}
                    </div>
                  </div>
                ))}
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
          <h1 className="text-3xl font-bold text-gray-900">Number Sequencing</h1>
          <p className="text-gray-600 mt-2">Improve working memory and pattern recognition with number sequences</p>
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
                <DialogTitle>How to Play Number Sequencing</DialogTitle>
                <DialogDescription>
                  Train your pattern recognition and working memory with number sequences.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Game Rules:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>You will be shown a sequence of numbers following a pattern</li>
                    <li>Identify the pattern and determine the next number in the sequence</li>
                    <li>Enter your answer in the input field and submit</li>
                    <li>Complete as many sequences as you can before time runs out</li>
                    <li>Use hints wisely - you have a limited number</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Sequence Types:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {Object.entries(SEQUENCE_GENERATORS).map(([key, generator]) => (
                      <li key={key}>
                        <span className="font-medium">{generator.name}</span>: {generator.description}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cognitive Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Improves pattern recognition</li>
                    <li>Enhances working memory</li>
                    <li>Develops logical reasoning</li>
                    <li>Trains mathematical thinking</li>
                    <li>Builds executive function skills</li>
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
                <DialogDescription>Customize your Number Sequencing experience</DialogDescription>
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableTimer">Enable Timer</Label>
                      <p className="text-sm text-gray-500">Time limit for completing the game</p>
                    </div>
                    <Switch
                      id="enableTimer"
                      checked={settings.enableTimer}
                      onCheckedChange={(checked) => handleSettingsChange({ enableTimer: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableHints">Enable Hints</Label>
                      <p className="text-sm text-gray-500">Allow using hints during gameplay</p>
                    </div>
                    <Switch
                      id="enableHints"
                      checked={settings.enableHints}
                      onCheckedChange={(checked) => handleSettingsChange({ enableHints: checked })}
                    />
                  </div>

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
                      <Label htmlFor="showFeedback">Show Feedback</Label>
                      <p className="text-sm text-gray-500">Display feedback after each answer</p>
                    </div>
                    <Switch
                      id="showFeedback"
                      checked={settings.showFeedback}
                      onCheckedChange={(checked) => handleSettingsChange({ showFeedback: checked })}
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

