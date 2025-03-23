"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, Award, RotateCcw, Home, ChevronUp, ChevronDown, Check, X } from "lucide-react"
import confetti from "canvas-confetti"
import { useToast } from "@/hooks/use-toast"

interface PatternItem {
  value: string | number
  color?: string
  shape?: string
}

interface PatternRecognitionProps {
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE"
  onComplete?: (results: {
    score: number
    accuracy: number
    completionRate: number
    mistakeCount: number
    reactionTime: number
    duration: number
  }) => void
  onExit?: () => void
}

export default function PatternRecognition({ difficulty = "MEDIUM", onComplete, onExit }: PatternRecognitionProps) {
  const { toast } = useToast()
  const [currentPattern, setCurrentPattern] = useState<PatternItem[]>([])
  const [options, setOptions] = useState<PatternItem[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [level, setLevel] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [lives, setLives] = useState<number>(3)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [showPattern, setShowPattern] = useState<boolean>(true)
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now())
  const [showInstructions, setShowInstructions] = useState<boolean>(true)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Define game parameters based on difficulty
  const getGameConfig = () => {
    switch (difficulty) {
      case "EASY":
        return {
          initialPatternLength: 3,
          maxLevel: 10,
          timeLimit: 180,
          patternViewTime: 3000,
          feedbackTime: 1000,
        }
      case "MEDIUM":
        return {
          initialPatternLength: 4,
          maxLevel: 15,
          timeLimit: 240,
          patternViewTime: 2500,
          feedbackTime: 800,
        }
      case "HARD":
        return {
          initialPatternLength: 5,
          maxLevel: 20,
          timeLimit: 300,
          patternViewTime: 2000,
          feedbackTime: 600,
        }
      case "ADAPTIVE":
        return {
          initialPatternLength: 4,
          maxLevel: 15,
          timeLimit: 240,
          patternViewTime: 2500,
          feedbackTime: 800,
        }
      default:
        return {
          initialPatternLength: 4,
          maxLevel: 15,
          timeLimit: 240,
          patternViewTime: 2500,
          feedbackTime: 800,
        }
    }
  }

  const { initialPatternLength, maxLevel, timeLimit, patternViewTime, feedbackTime } = getGameConfig()

  // Initialize game
  useEffect(() => {
    initializeGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty])

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted && !showFeedback) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= timeLimit) {
            endGame(false)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameCompleted, showFeedback])

  // Pattern display timer
  useEffect(() => {
    if (showPattern && gameStarted) {
      const timer = setTimeout(() => {
        setShowPattern(false)
        setLastActionTime(Date.now())
      }, patternViewTime)

      return () => clearTimeout(timer)
    }
  }, [showPattern, gameStarted, patternViewTime])

  // Feedback timer
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false)

        // If game is still active, generate next pattern
        if (!gameCompleted) {
          generatePattern()
        }
      }, feedbackTime)

      return () => clearTimeout(timer)
    }
  }, [showFeedback, gameCompleted, feedbackTime])

  // Initialize the game
  const initializeGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setTimeElapsed(0)
    setGameStarted(false)
    setGameCompleted(false)
    setTotalQuestions(0)
    setCorrectAnswers(0)
    setReactionTimes([])
    generatePattern()
  }

  // Generate a new pattern
  const generatePattern = () => {
    const patternLength = initialPatternLength + Math.floor(level / 3)

    // Generate the pattern
    const pattern = generateSequence(patternLength)
    setCurrentPattern(pattern)

    // Generate the next item options (including the correct one)
    const correctOption = getNextInSequence(pattern)
    const wrongOptions = generateWrongOptions(correctOption, 3)
    const allOptions = shuffleArray([correctOption, ...wrongOptions])

    setOptions(allOptions)
    setSelectedOption(null)
    setShowPattern(true)
  }

  // Generate a sequence based on a pattern
  const generateSequence = (length: number): PatternItem[] => {
    // Different pattern types
    const patternTypes = ["arithmetic", "geometric", "fibonacci", "alternating", "repeating"]

    // Select a pattern type based on level
    const patternType = patternTypes[Math.min(Math.floor(level / 3), patternTypes.length - 1)]

    const sequence: PatternItem[] = []

    switch (patternType) {
      case "arithmetic":
        // Arithmetic sequence (e.g., 2, 4, 6, 8, ...)
        const start = Math.floor(Math.random() * 5) + 1
        const increment = Math.floor(Math.random() * 3) + 1

        for (let i = 0; i < length; i++) {
          sequence.push({ value: start + i * increment })
        }
        break

      case "geometric":
        // Geometric sequence (e.g., 2, 4, 8, 16, ...)
        const geoStart = Math.floor(Math.random() * 3) + 1
        const multiplier = Math.floor(Math.random() * 2) + 2

        let current = geoStart
        for (let i = 0; i < length; i++) {
          sequence.push({ value: current })
          current *= multiplier
        }
        break

      case "fibonacci":
        // Fibonacci-like sequence
        let a = Math.floor(Math.random() * 3) + 1
        let b = Math.floor(Math.random() * 5) + 2

        sequence.push({ value: a })
        sequence.push({ value: b })

        for (let i = 2; i < length; i++) {
          const next = a + b
          sequence.push({ value: next })
          a = b
          b = next
        }
        break

      case "alternating":
        // Alternating pattern (e.g., 1, 3, 1, 3, ...)
        const values = [Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 5) + 6]

        for (let i = 0; i < length; i++) {
          sequence.push({ value: values[i % values.length] })
        }
        break

      case "repeating":
        // Repeating pattern (e.g., 1, 2, 3, 1, 2, 3, ...)
        const patternLength = Math.min(3, Math.floor(length / 2))
        const basePattern: PatternItem[] = []

        for (let i = 0; i < patternLength; i++) {
          basePattern.push({ value: Math.floor(Math.random() * 9) + 1 })
        }

        for (let i = 0; i < length; i++) {
          sequence.push({ ...basePattern[i % patternLength] })
        }
        break

      default:
        // Simple incrementing sequence as fallback
        for (let i = 0; i < length; i++) {
          sequence.push({ value: i + 1 })
        }
    }

    return sequence
  }

  // Determine the next item in the sequence
  const getNextInSequence = (pattern: PatternItem[]): PatternItem => {
    // For simple patterns, we can use basic rules
    if (pattern.length >= 2) {
      const numericPattern = pattern.every((item) => typeof item.value === "number")

      if (numericPattern) {
        const values = pattern.map((item) => item.value as number)

        // Check for arithmetic sequence
        const diffs = []
        for (let i = 1; i < values.length; i++) {
          diffs.push(values[i] - values[i - 1])
        }

        // Check if all differences are the same (arithmetic sequence)
        const isArithmetic = diffs.every((diff) => diff === diffs[0])
        if (isArithmetic) {
          return { value: values[values.length - 1] + diffs[0] }
        }

        // Check for geometric sequence
        const ratios = []
        for (let i = 1; i < values.length; i++) {
          ratios.push(values[i] / values[i - 1])
        }

        const isGeometric = ratios.every((ratio) => Math.abs(ratio - ratios[0]) < 0.0001)
        if (isGeometric) {
          return { value: values[values.length - 1] * ratios[0] }
        }

        // Check for Fibonacci-like sequence
        if (values.length >= 3) {
          const isFibonacci = values
            .slice(2)
            .every((val, idx) => Math.abs(val - (values[idx] + values[idx + 1])) < 0.0001)

          if (isFibonacci) {
            return { value: values[values.length - 1] + values[values.length - 2] }
          }
        }

        // Check for alternating pattern
        if (values.length >= 4) {
          const isAlternating = values.every((val, idx) => (idx % 2 === 0 ? val === values[0] : val === values[1]))

          if (isAlternating) {
            return { value: values[values.length % 2] }
          }
        }

        // Check for repeating pattern
        for (let patternLength = 1; patternLength <= Math.floor(values.length / 2); patternLength++) {
          let isRepeating = true

          for (let i = 0; i < values.length - patternLength; i++) {
            if (values[i] !== values[i + patternLength]) {
              isRepeating = false
              break
            }
          }

          if (isRepeating) {
            return { value: values[values.length % patternLength] }
          }
        }
      }
    }

    // Fallback: just increment the last value
    if (typeof pattern[pattern.length - 1].value === "number") {
      return { value: (pattern[pattern.length - 1].value as number) + 1 }
    }

    return { value: "?" }
  }

  // Generate wrong options that are different from the correct one
  const generateWrongOptions = (correctOption: PatternItem, count: number): PatternItem[] => {
    const wrongOptions: PatternItem[] = []

    if (typeof correctOption.value === "number") {
      const correctValue = correctOption.value as number

      // Generate options that are close to but different from the correct value
      while (wrongOptions.length < count) {
        let wrongValue: number

        // Different strategies for generating wrong values
        const strategy = Math.floor(Math.random() * 3)

        switch (strategy) {
          case 0:
            // Add or subtract a small random value
            wrongValue = correctValue + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1)
            break
          case 1:
            // Multiply or divide by a small factor
            wrongValue = correctValue * (Math.random() > 0.5 ? 2 : 0.5)
            break
          case 2:
            // Reverse digits or add/subtract 10
            wrongValue =
              correctValue > 10
                ? Number.parseInt(correctValue.toString().split("").reverse().join(""))
                : correctValue + (Math.random() > 0.5 ? 10 : -10)
            break
          default:
            wrongValue = correctValue + 1
        }

        // Ensure the value is positive and not equal to the correct value
        wrongValue = Math.max(1, Math.round(wrongValue))
        if (wrongValue !== correctValue && !wrongOptions.some((opt) => opt.value === wrongValue)) {
          wrongOptions.push({ value: wrongValue })
        }
      }
    } else {
      // For non-numeric values, generate random alternatives
      for (let i = 0; i < count; i++) {
        wrongOptions.push({ value: `Option ${i + 1}` })
      }
    }

    return wrongOptions
  }

  // Shuffle an array (Fisher-Yates algorithm)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Handle option selection
  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null || showFeedback) return

    // Start the game if not started
    if (!gameStarted) {
      setGameStarted(true)
    }

    setSelectedOption(index)

    // Record reaction time
    const currentTime = Date.now()
    const reactionTime = currentTime - lastActionTime
    setReactionTimes((prev) => [...prev, reactionTime])

    // Check if the answer is correct
    const isAnswerCorrect = options[index].value === getNextInSequence(currentPattern).value
    setIsCorrect(isAnswerCorrect)
    setTotalQuestions((prev) => prev + 1)

    if (isAnswerCorrect) {
      // Correct answer
      const levelBonus = Math.floor(level / 3) + 1
      const timeBonus = Math.max(0, 10 - Math.floor(reactionTime / 1000)) * 5
      const pointsEarned = 100 * levelBonus + timeBonus

      setScore((prev) => prev + pointsEarned)
      setCorrectAnswers((prev) => prev + 1)
      setLevel((prev) => prev + 1)

      // Show confetti for correct answers
      if (gameContainerRef.current) {
        const rect = gameContainerRef.current.getBoundingClientRect()
        confetti({
          particleCount: 30,
          spread: 50,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
        })
      }

      // Check if max level reached
      if (level >= maxLevel) {
        endGame(true)
        return
      }
    } else {
      // Wrong answer
      setLives((prev) => prev - 1)

      // Check if game over
      if (lives <= 1) {
        endGame(false)
        return
      }
    }

    // Show feedback
    setShowFeedback(true)
  }

  // End the game
  const endGame = (success: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setGameCompleted(true)

    // Calculate final score
    const timeBonus = Math.max(0, timeLimit - timeElapsed) * 2
    const accuracyBonus = Math.round((correctAnswers / Math.max(1, totalQuestions)) * 500)
    const levelBonus = level * 50
    const finalScore = score + timeBonus + accuracyBonus + levelBonus

    setScore(finalScore)

    // Calculate metrics
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    const completionRate = (level / maxLevel) * 100
    const mistakeCount = totalQuestions - correctAnswers
    const avgReactionTime =
      reactionTimes.length > 0 ? reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length : 0

    // Show completion message
    if (success) {
      toast({
        title: "Congratulations!",
        description: `You completed all ${maxLevel} levels with a score of ${finalScore}!`,
        duration: 5000,
      })

      // Show confetti for game completion
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.6 },
      })
    } else {
      toast({
        title: lives <= 0 ? "Game Over!" : "Time's up!",
        description: `You reached level ${level} with a score of ${finalScore}.`,
        duration: 5000,
      })
    }

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete({
        score: finalScore,
        accuracy,
        completionRate,
        mistakeCount,
        reactionTime: avgReactionTime,
        duration: timeElapsed,
      })
    }
  }

  // Restart the game
  const restartGame = () => {
    initializeGame()
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Game header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Pattern Recognition</h1>
          <Badge variant="outline" className="ml-2">
            {difficulty}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="font-mono text-lg">{formatTime(timeLimit - timeElapsed)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Award className="h-5 w-5 text-yellow-500" />
            <span className="font-mono text-lg">{score}</span>
          </div>

          <div className="flex">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full mx-0.5 ${i < lives ? "bg-red-500" : "bg-gray-300"}`} />
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={restartGame} title="Restart Game">
            <RotateCcw className="h-4 w-4" />
          </Button>

          {onExit && (
            <Button variant="outline" size="icon" onClick={onExit} title="Exit Game">
              <Home className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <h3 className="font-semibold text-lg">Instructions</h3>
            {showInstructions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>

          {showInstructions && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Identify the pattern and select the next item in the sequence.</p>
              <ul className="list-disc list-inside mt-2">
                <li>Observe the pattern carefully</li>
                <li>Determine what comes next in the sequence</li>
                <li>Select the correct option from the choices</li>
                <li>Complete as many levels as you can before time runs out</li>
                <li>You have 3 lives - each incorrect answer costs 1 life</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game progress */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Level: {level}/{maxLevel}
          </span>
          <span>•</span>
          <span>Accuracy: {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%</span>
        </div>

        <Progress value={(level / maxLevel) * 100} className="w-full sm:w-1/2 h-2" />
      </div>

      {/* Game board */}
      <div ref={gameContainerRef} className="w-full">
        {/* Pattern display */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-center text-lg font-medium mb-4">
              {showPattern ? "Observe the Pattern" : "What comes next?"}
            </h3>

            <div className="flex justify-center items-center gap-4 flex-wrap">
              {currentPattern.map((item, index) => (
                <div
                  key={index}
                  className="w-12 h-12 flex items-center justify-center text-xl font-bold border-2 border-primary rounded-lg"
                >
                  {showPattern ? item.value : "?"}
                </div>
              ))}

              {!showPattern && (
                <div className="w-12 h-12 flex items-center justify-center text-xl font-bold border-2 border-primary rounded-lg bg-primary/10">
                  ?
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        {!showPattern && (
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === index ? (isCorrect ? "default" : "destructive") : "outline"}
                className={`h-16 text-xl font-medium ${
                  showFeedback && index === selectedOption
                    ? isCorrect
                      ? "bg-green-500 hover:bg-green-500 text-white"
                      : "bg-red-500 hover:bg-red-500 text-white"
                    : ""
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null || showFeedback}
              >
                {option.value}
                {showFeedback && index === selectedOption && (
                  <span className="ml-2">{isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}</span>
                )}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Game completed overlay */}
      {gameCompleted && (
        <div className="mt-6 w-full">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-center mb-4">
                {level >= maxLevel ? "All Levels Completed!" : lives <= 0 ? "Game Over!" : "Time's Up!"}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Final Score</p>
                  <p className="text-3xl font-bold text-primary">{score}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Level Reached</p>
                  <p className="text-3xl font-bold">
                    {level}/{maxLevel}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-xl">
                    {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-xl font-mono">{formatTime(timeElapsed)}</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={restartGame}>Play Again</Button>

                {onExit && (
                  <Button variant="outline" onClick={onExit}>
                    Exit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

