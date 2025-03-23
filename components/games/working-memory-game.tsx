"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, Award, RotateCcw, Home, Check, X } from "lucide-react"
import confetti from "canvas-confetti"
import { useToast } from "@/hooks/use-toast"

interface WorkingMemoryGameProps {
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE"
  onComplete?: (results: {
    score: number
    accuracy: number
    completionRate: number
    mistakeCount: number
    reactionTime: number
    duration: number
    maxNBack: number
    maxSequenceLength: number
  }) => void
  onExit?: () => void
  sessionId?: string
  adaptiveLevel?: number
}

type MemoryItem = {
  id: number
  value: string
  position: number
  isTarget: boolean
  userResponse: boolean | null
}

export default function WorkingMemoryGame({
  difficulty = "MEDIUM",
  onComplete,
  onExit,
  sessionId,
  adaptiveLevel,
}: WorkingMemoryGameProps) {
  const { toast } = useToast()
  const [level, setLevel] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [lives, setLives] = useState<number>(3)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(true)

  const [nBack, setNBack] = useState<number>(1) // How many items back to compare (n-back level)
  const [currentSequence, setCurrentSequence] = useState<MemoryItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [currentItem, setCurrentItem] = useState<MemoryItem | null>(null)
  const [sequenceLength, setSequenceLength] = useState<number>(10) // Length of the sequence
  const [showingItem, setShowingItem] = useState<boolean>(false)
  const [waitingForResponse, setWaitingForResponse] = useState<boolean>(false)
  const [totalResponses, setTotalResponses] = useState<number>(0)
  const [correctResponses, setCorrectResponses] = useState<number>(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now())
  const [maxNBackReached, setMaxNBackReached] = useState<number>(1)
  const [maxSequenceLengthReached, setMaxSequenceLengthReached] = useState<number>(10)
  const [gameMode, setGameMode] = useState<"position" | "value" | "dual">("position")
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const itemTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Define game parameters based on difficulty
  const getGameConfig = () => {
    switch (difficulty) {
      case "EASY":
        return {
          initialNBack: 1,
          maxLevel: 10,
          timeLimit: 180,
          itemDisplayTime: 2500,
          interItemInterval: 500,
          responseTime: 3000,
          feedbackTime: 1000,
          targetProbability: 0.3, // 30% chance of target
          initialGameMode: "position" as const,
        }
      case "MEDIUM":
        return {
          initialNBack: 2,
          maxLevel: 15,
          timeLimit: 240,
          itemDisplayTime: 2000,
          interItemInterval: 300,
          responseTime: 2500,
          feedbackTime: 800,
          targetProbability: 0.3,
          initialGameMode: "position" as const,
        }
      case "HARD":
        return {
          initialNBack: 3,
          maxLevel: 20,
          timeLimit: 300,
          itemDisplayTime: 1500,
          interItemInterval: 200,
          responseTime: 2000,
          feedbackTime: 600,
          targetProbability: 0.3,
          initialGameMode: "dual" as const,
        }
      case "ADAPTIVE":
        return {
          initialNBack: adaptiveLevel ? adaptiveLevel : 2,
          maxLevel: 15,
          timeLimit: 240,
          itemDisplayTime: 2000,
          interItemInterval: 300,
          responseTime: 2500,
          feedbackTime: 800,
          targetProbability: 0.3,
          initialGameMode: "position" as const,
        }
      default:
        return {
          initialNBack: 2,
          maxLevel: 15,
          timeLimit: 240,
          itemDisplayTime: 2000,
          interItemInterval: 300,
          responseTime: 2500,
          feedbackTime: 800,
          targetProbability: 0.3,
          initialGameMode: "position" as const,
        }
    }
  }

  const {
    initialNBack,
    maxLevel,
    timeLimit,
    itemDisplayTime,
    interItemInterval,
    responseTime,
    feedbackTime,
    targetProbability,
    initialGameMode,
  } = getGameConfig()

  // Possible values for items (letters)
  const possibleValues = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
  ]

  // Possible positions (3x3 grid)
  const possiblePositions = [0, 1, 2, 3, 4, 5, 6, 7, 8]

  // Initialize game
  useEffect(() => {
    initializeGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, adaptiveLevel])

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
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
  }, [gameStarted, gameCompleted])

  // Feedback timer
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false)

        // Continue with next item if not at the end of sequence
        if (currentIndex < currentSequence.length - 1 && !gameCompleted) {
          showNextItem()
        } else if (!gameCompleted) {
          // End of sequence, move to next level or end game
          const accuracy = totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0

          if (accuracy >= 80) {
            // Good performance, increase difficulty
            moveToNextLevel()
          } else if (accuracy < 50) {
            // Poor performance, lose a life
            setLives((prev) => {
              const newLives = prev - 1
              if (newLives <= 0) {
                endGame(false)
              }
              return newLives
            })

            // Retry same level if lives remaining
            if (lives > 1) {
              generateSequence(nBack, gameMode)
            }
          } else {
            // Average performance, stay at same level but new sequence
            generateSequence(nBack, gameMode)
          }
        }
      }, feedbackTime)

      return () => clearTimeout(timer)
    }
  }, [
    showFeedback,
    gameCompleted,
    currentIndex,
    currentSequence.length,
    correctResponses,
    totalResponses,
    nBack,
    gameMode,
    lives,
    feedbackTime,
  ])

  // Initialize the game
  const initializeGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setTimeElapsed(0)
    setGameStarted(false)
    setGameCompleted(false)
    setTotalResponses(0)
    setCorrectResponses(0)
    setReactionTimes([])
    setNBack(initialNBack)
    setMaxNBackReached(initialNBack)
    setMaxSequenceLengthReached(10)
    setGameMode(initialGameMode)
    setCurrentIndex(-1)
    setCurrentItem(null)
    setShowingItem(false)
    setWaitingForResponse(false)
  }

  // Move to next level
  const moveToNextLevel = () => {
    const newLevel = level + 1
    setLevel(newLevel)

    // Every 2 levels, increase difficulty
    if (newLevel % 2 === 0) {
      // Alternate between increasing n-back and changing game mode
      if (newLevel % 4 === 0) {
        // Increase n-back
        const newNBack = nBack + 1
        setNBack(newNBack)

        // Update max n-back reached
        if (newNBack > maxNBackReached) {
          setMaxNBackReached(newNBack)
        }

        // Generate new sequence with increased n-back
        generateSequence(newNBack, gameMode)
      } else {
        // Change game mode to make it harder
        let newGameMode: "position" | "value" | "dual" = gameMode

        if (gameMode === "position") {
          newGameMode = "value"
        } else if (gameMode === "value") {
          newGameMode = "dual"
        } else {
          // If already in dual mode, increase sequence length
          const newLength = sequenceLength + 5
          setSequenceLength(newLength)

          // Update max sequence length reached
          if (newLength > maxSequenceLengthReached) {
            setMaxSequenceLengthReached(newLength)
          }
        }

        setGameMode(newGameMode)

        // Generate new sequence with new game mode
        generateSequence(nBack, newGameMode)
      }
    } else {
      // Just generate a new sequence with same parameters
      generateSequence(nBack, gameMode)
    }

    // Check if max level reached
    if (newLevel >= maxLevel) {
      endGame(true)
    }
  }

  // Generate a new sequence
  const generateSequence = (currentNBack: number, currentGameMode: "position" | "value" | "dual") => {
    const newSequence: MemoryItem[] = []

    // First n items cannot be targets (since we're looking n-back)
    for (let i = 0; i < currentNBack; i++) {
      const value = possibleValues[Math.floor(Math.random() * possibleValues.length)]
      const position = possiblePositions[Math.floor(Math.random() * possiblePositions.length)]

      newSequence.push({
        id: i,
        value,
        position,
        isTarget: false,
        userResponse: null,
      })
    }

    // Generate the rest of the sequence
    for (let i = currentNBack; i < sequenceLength; i++) {
      // Decide if this should be a target (match n-back)
      const isTarget = Math.random() < targetProbability

      let value: string
      let position: number

      if (isTarget) {
        // This is a target, so it should match the n-back item
        const nBackItem = newSequence[i - currentNBack]

        if (currentGameMode === "position" || currentGameMode === "dual") {
          // Position should match
          position = nBackItem.position
        } else {
          // Position should be different
          let newPosition
          do {
            newPosition = possiblePositions[Math.floor(Math.random() * possiblePositions.length)]
          } while (newPosition === nBackItem.position)
          position = newPosition
        }

        if (currentGameMode === "value" || currentGameMode === "dual") {
          // Value should match
          value = nBackItem.value
        } else {
          // Value should be different
          let newValue
          do {
            newValue = possibleValues[Math.floor(Math.random() * possibleValues.length)]
          } while (newValue === nBackItem.value)
          value = newValue
        }
      } else {
        // Not a target, so it should NOT match the n-back item
        const nBackItem = newSequence[i - currentNBack]

        if (currentGameMode === "position" || currentGameMode === "dual") {
          // Position should NOT match
          let newPosition
          do {
            newPosition = possiblePositions[Math.floor(Math.random() * possiblePositions.length)]
          } while (newPosition === nBackItem.position)
          position = newPosition
        } else {
          // Position can be anything
          position = possiblePositions[Math.floor(Math.random() * possiblePositions.length)]
        }

        if (currentGameMode === "value" || currentGameMode === "dual") {
          // Value should NOT match
          let newValue
          do {
            newValue = possibleValues[Math.floor(Math.random() * possibleValues.length)]
          } while (newValue === nBackItem.value)
          value = newValue
        } else {
          // Value can be anything
          value = possibleValues[Math.floor(Math.random() * possibleValues.length)]
        }
      }

      newSequence.push({
        id: i,
        value,
        position,
        isTarget,
        userResponse: null,
      })
    }

    setCurrentSequence(newSequence)
    setCurrentIndex(-1)
    setCurrentItem(null)

    // Start showing the sequence
    if (gameStarted) {
      showNextItem()
    }
  }

  // Show the next item in the sequence
  const showNextItem = () => {
    const nextIndex = currentIndex + 1

    if (nextIndex < currentSequence.length) {
      setCurrentIndex(nextIndex)
      setCurrentItem(currentSequence[nextIndex])
      setShowingItem(true)
      setWaitingForResponse(false)

      // Schedule hiding the item
      itemTimerRef.current = setTimeout(() => {
        setShowingItem(false)
        setWaitingForResponse(true)
        setLastActionTime(Date.now())

        // Set a timeout for response
        responseTimeoutRef.current = setTimeout(() => {
          // No response given in time
          if (waitingForResponse && currentItem) {
            handleResponse(false)
          }
        }, responseTime)
      }, itemDisplayTime)
    }
  }

  // Handle user response
  const handleResponse = (isMatch: boolean) => {
    if (!waitingForResponse || !currentItem || showFeedback) return

    // Clear response timeout
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current)
    }

    setWaitingForResponse(false)

    // Record reaction time
    const currentTime = Date.now()
    const reactionTime = currentTime - lastActionTime
    setReactionTimes((prev) => [...prev, reactionTime])

    // Update current item with user response
    const updatedSequence = [...currentSequence]
    updatedSequence[currentIndex] = {
      ...currentItem,
      userResponse: isMatch,
    }
    setCurrentSequence(updatedSequence)

    // Check if response is correct
    const isCorrect = currentItem.isTarget === isMatch
    setIsCorrect(isCorrect)

    // Update totals
    setTotalResponses((prev) => prev + 1)
    if (isCorrect) {
      setCorrectResponses((prev) => prev + 1)

      // Calculate score
      const nBackBonus = nBack * 10
      const modeBonus = gameMode === "position" ? 5 : gameMode === "value" ? 10 : 20
      const timeBonus = Math.max(0, 5 - Math.floor(reactionTime / 1000)) * 5
      const pointsEarned = 20 + nBackBonus + modeBonus + timeBonus

      setScore((prev) => prev + pointsEarned)

      // Show confetti for correct answers
      if (gameContainerRef.current && currentItem.isTarget) {
        const rect = gameContainerRef.current.getBoundingClientRect()
        confetti({
          particleCount: 20,
          spread: 40,
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          },
        })
      }

      setFeedbackMessage(currentItem.isTarget ? "Correct match!" : "Correct non-match!")
    } else {
      setFeedbackMessage(currentItem.isTarget ? "Missed match!" : "False alarm!")
    }

    // Show feedback
    setShowFeedback(true)
  }

  // Start the game
  const startGame = () => {
    setGameStarted(true)
    generateSequence(nBack, gameMode)
    showNextItem()
  }

  // End the game
  const endGame = (success: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (itemTimerRef.current) {
      clearTimeout(itemTimerRef.current)
    }

    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current)
    }

    setGameCompleted(true)

    // Calculate final score
    const timeBonus = Math.max(0, timeLimit - timeElapsed) * 2
    const accuracyBonus = Math.round((correctResponses / Math.max(1, totalResponses)) * 500)
    const levelBonus = level * 50
    const nBackBonus = maxNBackReached * 100
    const modeBonus = gameMode === "position" ? 0 : gameMode === "value" ? 100 : 200
    const finalScore = score + timeBonus + accuracyBonus + levelBonus + nBackBonus + modeBonus

    setScore(finalScore)

    // Calculate metrics
    const accuracy = totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0
    const completionRate = (level / maxLevel) * 100
    const mistakeCount = totalResponses - correctResponses
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
        maxNBack: maxNBackReached,
        maxSequenceLength: maxSequenceLengthReached,
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

  // Get game mode display text
  const getGameModeText = () => {
    switch (gameMode) {
      case "position":
        return "Position Match"
      case "value":
        return "Letter Match"
      case "dual":
        return "Dual Match"
      default:
        return "Position Match"
    }
  }

  // Get instructions based on game mode
  const getInstructions = () => {
    switch (gameMode) {
      case "position":
        return "Press MATCH when a letter appears in the same position as the letter that appeared N positions back."
      case "value":
        return "Press MATCH when the same letter appears as the letter that appeared N positions back, regardless of position."
      case "dual":
        return "Press MATCH when both the letter AND position match what appeared N positions back."
      default:
        return "Press MATCH when a letter appears in the same position as the letter that appeared N positions back."
    }
  }

  return (
    <div ref={gameContainerRef} className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Game header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Working Memory</h1>
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
              <p>This is an N-Back task that tests your working memory.</p>
              <ul className="list-disc list-inside mt-2">
                <li>You'll see a sequence of letters appearing in different positions</li>
                <li>Your task is to identify when the current item matches the one that appeared N positions back</li>
                <li>
                  Current N-Back level: <span className="font-bold">{nBack}</span>
                </li>
                <li>
                  Current mode: <span className="font-bold">{getGameModeText()}</span>
                </li>
                <li>{getInstructions()}</li>
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
          <span>N-Back: {nBack}</span>
          <span>•</span>
          <span>Mode: {getGameModeText()}</span>
          <span>•</span>
          <span>Accuracy: {totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0}%</span>
        </div>

        <Progress value={(level / maxLevel) * 100} className="w-full sm:w-1/2 h-2" />
      </div>

      {/* Game board */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">
            {showFeedback
              ? isCorrect
                ? "Correct!"
                : "Incorrect!"
              : showingItem
                ? "Remember this item"
                : waitingForResponse
                  ? "Is this a match?"
                  : "Get ready..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 min-h-[300px]">
          {/* 3x3 Grid for displaying items */}
          <div className="grid grid-cols-3 gap-2 w-64 h-64 mb-4">
            {possiblePositions.map((pos) => (
              <div
                key={pos}
                className={`flex items-center justify-center rounded-md border ${
                  currentItem && showingItem && currentItem.position === pos
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {currentItem && showingItem && currentItem.position === pos && (
                  <span className="text-3xl font-bold">{currentItem.value}</span>
                )}
              </div>
            ))}
          </div>

          {/* Response buttons */}
          {waitingForResponse && !showFeedback && (
            <div className="flex gap-4 mt-4">
              <Button size="lg" onClick={() => handleResponse(true)} className="w-32">
                Match
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleResponse(false)} className="w-32">
                No Match
              </Button>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className={`text-4xl ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                {isCorrect ? <Check className="h-12 w-12" /> : <X className="h-12 w-12" />}
              </div>
              <p className="text-lg">{feedbackMessage}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center pt-0 pb-6">
          {!gameStarted && !showingItem && !waitingForResponse && !showFeedback && !gameCompleted && (
            <Button onClick={startGame}>Start</Button>
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
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
                    {totalResponses > 0 ? Math.round((correctResponses / totalResponses) * 100) : 0}%
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Max N-Back</p>
                  <p className="text-xl">{maxNBackReached}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Game Mode</p>
                  <p className="text-xl">{getGameModeText()}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                  <p className="text-xl font-mono">
                    {reactionTimes.length > 0
                      ? `${(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(1)}s`
                      : "N/A"}
                  </p>
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

