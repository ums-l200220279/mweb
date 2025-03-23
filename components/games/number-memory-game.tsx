"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, Award, RotateCcw, Home, Check, X } from "lucide-react"
import confetti from "canvas-confetti"
import { useToast } from "@/hooks/use-toast"

interface NumberMemoryGameProps {
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE"
  onComplete?: (results: {
    score: number
    accuracy: number
    completionRate: number
    mistakeCount: number
    reactionTime: number
    duration: number
    maxDigits: number
  }) => void
  onExit?: () => void
  sessionId?: string
  adaptiveLevel?: number
}

export default function NumberMemoryGame({
  difficulty = "MEDIUM",
  onComplete,
  onExit,
  sessionId,
  adaptiveLevel,
}: NumberMemoryGameProps) {
  const { toast } = useToast()
  const [currentNumber, setCurrentNumber] = useState<string>("")
  const [userInput, setUserInput] = useState<string>("")
  const [level, setLevel] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [lives, setLives] = useState<number>(3)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [showNumber, setShowNumber] = useState<boolean>(false)
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now())
  const [showInstructions, setShowInstructions] = useState<boolean>(true)
  const [inputMode, setInputMode] = useState<"waiting" | "input" | "feedback">("waiting")
  const [maxDigitsReached, setMaxDigitsReached] = useState<number>(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Define game parameters based on difficulty
  const getGameConfig = () => {
    switch (difficulty) {
      case "EASY":
        return {
          initialDigits: 3,
          maxLevel: 12,
          timeLimit: 180,
          displayTime: 2000,
          feedbackTime: 1000,
        }
      case "MEDIUM":
        return {
          initialDigits: 4,
          maxLevel: 15,
          timeLimit: 240,
          displayTime: 1500,
          feedbackTime: 800,
        }
      case "HARD":
        return {
          initialDigits: 5,
          maxLevel: 20,
          timeLimit: 300,
          displayTime: 1000,
          feedbackTime: 600,
        }
      case "ADAPTIVE":
        return {
          initialDigits: adaptiveLevel ? adaptiveLevel + 2 : 4,
          maxLevel: 20,
          timeLimit: 240,
          displayTime: 1500,
          feedbackTime: 800,
        }
      default:
        return {
          initialDigits: 4,
          maxLevel: 15,
          timeLimit: 240,
          displayTime: 1500,
          feedbackTime: 800,
        }
    }
  }

  const { initialDigits, maxLevel, timeLimit, displayTime, feedbackTime } = getGameConfig()

  // Initialize game
  useEffect(() => {
    initializeGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, adaptiveLevel])

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted && inputMode === "input") {
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
  }, [gameStarted, gameCompleted, inputMode])

  // Number display timer
  useEffect(() => {
    if (showNumber && gameStarted) {
      const timer = setTimeout(
        () => {
          setShowNumber(false)
          setInputMode("input")
          setLastActionTime(Date.now())
          if (inputRef.current) {
            inputRef.current.focus()
          }
        },
        displayTime + level * 100,
      )

      return () => clearTimeout(timer)
    }
  }, [showNumber, gameStarted, displayTime, level])

  // Feedback timer
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false)
        setUserInput("")

        // If game is still active, generate next number
        if (!gameCompleted) {
          generateNumber()
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
    setMaxDigitsReached(0)
    setInputMode("waiting")
    generateNumber()
  }

  // Generate a new number
  const generateNumber = () => {
    const digits = initialDigits + Math.floor(level / 3)
    const newNumber = generateRandomNumber(digits)

    setCurrentNumber(newNumber)
    setShowNumber(true)
    setInputMode("waiting")

    // Update max digits reached if this is higher
    if (digits > maxDigitsReached) {
      setMaxDigitsReached(digits)
    }

    // Start the game if not started
    if (!gameStarted) {
      setGameStarted(true)
    }
  }

  // Generate a random number with specified number of digits
  const generateRandomNumber = (digits: number): string => {
    let number = ""
    for (let i = 0; i < digits; i++) {
      // First digit should not be 0
      if (i === 0) {
        number += Math.floor(Math.random() * 9) + 1
      } else {
        number += Math.floor(Math.random() * 10)
      }
    }
    return number
  }

  // Handle user input submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (inputMode !== "input" || !userInput) return

    setInputMode("feedback")
    setTotalQuestions((prev) => prev + 1)

    // Record reaction time
    const currentTime = Date.now()
    const reactionTime = currentTime - lastActionTime
    setReactionTimes((prev) => [...prev, reactionTime])

    // Check if the answer is correct
    const isAnswerCorrect = userInput === currentNumber
    setIsCorrect(isAnswerCorrect)

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
        maxDigits: maxDigitsReached,
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
    <div ref={gameContainerRef} className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Game header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Number Memory</h1>
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

      {/* Game instructions */}
      {showInstructions && (
        <Card className="w-full mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">How to Play</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)}>
                Hide
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Memorize the number that appears on screen, then type it correctly when it disappears.</p>
              <ul className="list-disc list-inside mt-2">
                <li>Numbers will appear for a short time</li>
                <li>The length of the number increases as you progress</li>
                <li>You have 3 lives - each incorrect answer costs 1 life</li>
                <li>Try to reach the highest level you can!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

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
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">
            {showNumber
              ? "Memorize this number"
              : inputMode === "input"
                ? "What was the number?"
                : showFeedback
                  ? isCorrect
                    ? "Correct!"
                    : "Incorrect!"
                  : "Get ready..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
          {showNumber && <div className="text-4xl md:text-6xl font-bold tracking-wider font-mono">{currentNumber}</div>}

          {inputMode === "input" && !showNumber && (
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <div className="flex flex-col items-center gap-4">
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter the number you saw"
                  className="text-center text-2xl font-mono h-14"
                  autoFocus
                />
                <Button type="submit" disabled={!userInput}>
                  Submit
                </Button>
              </div>
            </form>
          )}

          {showFeedback && (
            <div className="flex flex-col items-center gap-4">
              <div className={`text-4xl ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                {isCorrect ? <Check className="h-16 w-16" /> : <X className="h-16 w-16" />}
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">{isCorrect ? "Correct!" : "Incorrect!"}</p>
                {!isCorrect && (
                  <p className="text-muted-foreground mt-2">
                    The correct number was: <span className="font-mono font-bold">{currentNumber}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center pt-0 pb-6">
          {inputMode === "waiting" && !showNumber && !showFeedback && !gameCompleted && (
            <Button onClick={generateNumber}>Start</Button>
          )}
        </CardFooter>
      </Card>

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
                  <p className="text-sm text-muted-foreground">Max Digits</p>
                  <p className="text-xl font-mono">{maxDigitsReached}</p>
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

