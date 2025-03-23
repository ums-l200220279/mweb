"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, Award, RotateCcw, Home, Check, X } from "lucide-react"
import confetti from "canvas-confetti"
import { useToast } from "@/hooks/use-toast"

interface SpatialMemoryGameProps {
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE"
  onComplete?: (results: {
    score: number
    accuracy: number
    completionRate: number
    mistakeCount: number
    reactionTime: number
    duration: number
    maxGridSize: number
    maxPatternLength: number
  }) => void
  onExit?: () => void
  sessionId?: string
  adaptiveLevel?: number
}

type GridCell = {
  id: number
  highlighted: boolean
  selected: boolean
  correct: boolean | null
}

export default function SpatialMemoryGame({
  difficulty = "MEDIUM",
  onComplete,
  onExit,
  sessionId,
  adaptiveLevel,
}: SpatialMemoryGameProps) {
  const { toast } = useToast()
  const [level, setLevel] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [lives, setLives] = useState<number>(3)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(true)
  const [totalPatterns, setTotalPatterns] = useState<number>(0)
  const [correctPatterns, setCorrectPatterns] = useState<number>(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now())

  const [gridSize, setGridSize] = useState<number>(3) // Initial grid size (3x3)
  const [grid, setGrid] = useState<GridCell[]>([])
  const [pattern, setPattern] = useState<number[]>([])
  const [userPattern, setUserPattern] = useState<number[]>([])
  const [showingPattern, setShowingPattern] = useState<boolean>(false)
  const [patternStep, setPatternStep] = useState<number>(0)
  const [inputMode, setInputMode] = useState<boolean>(false)
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [maxGridSizeReached, setMaxGridSizeReached] = useState<number>(0)
  const [maxPatternLengthReached, setMaxPatternLengthReached] = useState<number>(0)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const patternTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Define game parameters based on difficulty
  const getGameConfig = () => {
    switch (difficulty) {
      case "EASY":
        return {
          initialPatternLength: 3,
          maxLevel: 10,
          timeLimit: 180,
          highlightTime: 800,
          intervalTime: 300,
          feedbackTime: 1000,
          gridSizeIncreaseLevel: 4, // Increase grid size every 4 levels
        }
      case "MEDIUM":
        return {
          initialPatternLength: 4,
          maxLevel: 15,
          timeLimit: 240,
          highlightTime: 600,
          intervalTime: 250,
          feedbackTime: 800,
          gridSizeIncreaseLevel: 3, // Increase grid size every 3 levels
        }
      case "HARD":
        return {
          initialPatternLength: 5,
          maxLevel: 20,
          timeLimit: 300,
          highlightTime: 500,
          intervalTime: 200,
          feedbackTime: 600,
          gridSizeIncreaseLevel: 2, // Increase grid size every 2 levels
        }
      case "ADAPTIVE":
        return {
          initialPatternLength: adaptiveLevel ? adaptiveLevel + 2 : 4,
          maxLevel: 15,
          timeLimit: 240,
          highlightTime: 600,
          intervalTime: 250,
          feedbackTime: 800,
          gridSizeIncreaseLevel: 3,
        }
      default:
        return {
          initialPatternLength: 4,
          maxLevel: 15,
          timeLimit: 240,
          highlightTime: 600,
          intervalTime: 250,
          feedbackTime: 800,
          gridSizeIncreaseLevel: 3,
        }
    }
  }

  const {
    initialPatternLength,
    maxLevel,
    timeLimit,
    highlightTime,
    intervalTime,
    feedbackTime,
    gridSizeIncreaseLevel,
  } = getGameConfig()

  // Initialize game
  useEffect(() => {
    initializeGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, adaptiveLevel])

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted && !showingPattern && !showFeedback) {
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
  }, [gameStarted, gameCompleted, showingPattern, showFeedback])

  // Feedback timer
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false)
        resetGrid()

        // If game is still active, generate next pattern
        if (!gameCompleted) {
          if (isCorrect) {
            // Move to next level if correct
            const newLevel = level + 1
            setLevel(newLevel)

            // Check if we should increase grid size
            if (newLevel % gridSizeIncreaseLevel === 0 && gridSize < 6) {
              const newGridSize = gridSize + 1
              setGridSize(newGridSize)

              // Update max grid size reached if this is higher
              if (newGridSize > maxGridSizeReached) {
                setMaxGridSizeReached(newGridSize)
              }

              // Initialize new grid
              initializeGrid(newGridSize)
            }

            // Generate new pattern for next level
            generatePattern(newLevel)
          } else {
            // Retry same level if incorrect
            generatePattern(level)
          }
        }
      }, feedbackTime)

      return () => clearTimeout(timer)
    }
  }, [showFeedback, gameCompleted, isCorrect, level, gridSize, feedbackTime, gridSizeIncreaseLevel, maxGridSizeReached])

  // Initialize the game
  const initializeGame = () => {
    setLevel(1)
    setScore(0)
    setLives(3)
    setTimeElapsed(0)
    setGameStarted(false)
    setGameCompleted(false)
    setTotalPatterns(0)
    setCorrectPatterns(0)
    setReactionTimes([])
    setGridSize(3) // Start with 3x3 grid
    setMaxGridSizeReached(3)
    setMaxPatternLengthReached(initialPatternLength)

    initializeGrid(3)
  }

  // Initialize grid
  const initializeGrid = (size: number) => {
    const newGrid: GridCell[] = []
    for (let i = 0; i < size * size; i++) {
      newGrid.push({
        id: i,
        highlighted: false,
        selected: false,
        correct: null,
      })
    }
    setGrid(newGrid)
  }

  // Reset grid (clear highlights and selections)
  const resetGrid = () => {
    setGrid(
      grid.map((cell) => ({
        ...cell,
        highlighted: false,
        selected: false,
        correct: null,
      })),
    )
  }

  // Generate a new pattern
  const generatePattern = (currentLevel: number) => {
    // Calculate pattern length based on level
    const patternLength = initialPatternLength + Math.floor((currentLevel - 1) / 2)

    // Update max pattern length reached if this is higher
    if (patternLength > maxPatternLengthReached) {
      setMaxPatternLengthReached(patternLength)
    }

    // Generate random pattern
    const newPattern: number[] = []
    const gridCellCount = gridSize * gridSize

    for (let i = 0; i < patternLength; i++) {
      let cell
      do {
        cell = Math.floor(Math.random() * gridCellCount)
      } while (newPattern.includes(cell))
      newPattern.push(cell)
    }

    setPattern(newPattern)
    setUserPattern([])
    setPatternStep(0)
    setInputMode(false)

    // Start showing pattern
    showPattern(newPattern)
  }

  // Show pattern animation
  const showPattern = (patternToShow: number[]) => {
    setShowingPattern(true)

    // Reset grid first
    resetGrid()

    // Show pattern step by step
    let step = 0

    const showNextStep = () => {
      // Clear previous highlight
      setGrid((prev) =>
        prev.map((cell) => ({
          ...cell,
          highlighted: false,
        })),
      )

      if (step < patternToShow.length) {
        // Highlight current step
        const cellId = patternToShow[step]
        setGrid((prev) =>
          prev.map((cell) => ({
            ...cell,
            highlighted: cell.id === cellId,
          })),
        )

        step++

        // Schedule next step
        patternTimerRef.current = setTimeout(showNextStep, highlightTime)
      } else {
        // Pattern complete, allow user input
        setGrid((prev) =>
          prev.map((cell) => ({
            ...cell,
            highlighted: false,
          })),
        )
        setShowingPattern(false)
        setInputMode(true)
        setLastActionTime(Date.now())

        // Start the game if not started
        if (!gameStarted) {
          setGameStarted(true)
        }
      }
    }

    // Start showing pattern after a short delay
    patternTimerRef.current = setTimeout(showNextStep, intervalTime)
  }

  // Handle cell click
  const handleCellClick = (cellId: number) => {
    if (!inputMode || showFeedback) return

    // Add cell to user pattern
    const updatedUserPattern = [...userPattern, cellId]
    setUserPattern(updatedUserPattern)

    // Highlight selected cell
    setGrid((prev) =>
      prev.map((cell) => ({
        ...cell,
        selected: cell.id === cellId || prev.find((c) => c.id === cell.id)?.selected,
      })),
    )

    // Check if user has input the full pattern
    if (updatedUserPattern.length === pattern.length) {
      checkPattern(updatedUserPattern)
    }
  }

  // Check if user pattern matches the original pattern
  const checkPattern = (userPatternToCheck: number[]) => {
    setInputMode(false)
    setTotalPatterns((prev) => prev + 1)

    // Record reaction time
    const currentTime = Date.now()
    const reactionTime = currentTime - lastActionTime
    setReactionTimes((prev) => [...prev, reactionTime])

    // Check if patterns match
    const isPatternCorrect = pattern.every((cell, index) => cell === userPatternToCheck[index])
    setIsCorrect(isPatternCorrect)

    // Show feedback on grid
    setGrid((prev) =>
      prev.map((cell) => {
        const isInPattern = pattern.includes(cell.id)
        const isInUserPattern = userPatternToCheck.includes(cell.id)

        return {
          ...cell,
          correct: isInPattern ? isInUserPattern : !isInUserPattern,
        }
      }),
    )

    if (isPatternCorrect) {
      // Correct pattern
      setCorrectPatterns((prev) => prev + 1)

      // Calculate score
      const levelBonus = level * 10
      const gridBonus = gridSize * 5
      const timeBonus = Math.max(0, 10 - Math.floor(reactionTime / 1000)) * 5
      const pointsEarned = 100 + levelBonus + gridBonus + timeBonus

      setScore((prev) => prev + pointsEarned)

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
      // Wrong pattern
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

    if (patternTimerRef.current) {
      clearTimeout(patternTimerRef.current)
    }

    setGameCompleted(true)

    // Calculate final score
    const timeBonus = Math.max(0, timeLimit - timeElapsed) * 2
    const accuracyBonus = Math.round((correctPatterns / Math.max(1, totalPatterns)) * 500)
    const levelBonus = level * 50
    const gridBonus = gridSize * 100
    const finalScore = score + timeBonus + accuracyBonus + levelBonus + gridBonus

    setScore(finalScore)

    // Calculate metrics
    const accuracy = totalPatterns > 0 ? (correctPatterns / totalPatterns) * 100 : 0
    const completionRate = (level / maxLevel) * 100
    const mistakeCount = totalPatterns - correctPatterns
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
        maxGridSize: maxGridSizeReached,
        maxPatternLength: maxPatternLengthReached,
      })
    }
  }

  // Restart the game
  const restartGame = () => {
    initializeGame()
  }

  // Start the game
  const startGame = () => {
    generatePattern(level)
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get cell color based on state
  const getCellColor = (cell: GridCell) => {
    if (cell.highlighted) return "bg-primary hover:bg-primary"
    if (cell.selected) return "bg-primary/50 hover:bg-primary/60"
    if (cell.correct === true) return "bg-green-500 hover:bg-green-600"
    if (cell.correct === false) return "bg-red-500 hover:bg-red-600"
    return "bg-muted hover:bg-muted/80"
  }

  return (
    <div ref={gameContainerRef} className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Game header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Spatial Memory</h1>
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
              <p>Memorize the pattern of highlighted cells, then reproduce it in the same order.</p>
              <ul className="list-disc list-inside mt-2">
                <li>Watch carefully as cells light up in sequence</li>
                <li>After the pattern is shown, click the cells in the same order</li>
                <li>Patterns get longer and grids get larger as you progress</li>
                <li>You have 3 lives - each incorrect pattern costs 1 life</li>
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
          <span>
            Grid: {gridSize}×{gridSize}
          </span>
          <span>•</span>
          <span>Accuracy: {totalPatterns > 0 ? Math.round((correctPatterns / totalPatterns) * 100) : 0}%</span>
        </div>

        <Progress value={(level / maxLevel) * 100} className="w-full sm:w-1/2 h-2" />
      </div>

      {/* Game board */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">
            {showingPattern
              ? "Memorize this pattern"
              : inputMode
                ? "Reproduce the pattern"
                : showFeedback
                  ? isCorrect
                    ? "Correct!"
                    : "Incorrect!"
                  : "Get ready..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div
            className={`grid gap-2 mx-auto`}
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: `min(100%, ${gridSize * 70}px)`,
            }}
          >
            {grid.map((cell) => (
              <button
                key={cell.id}
                className={`aspect-square rounded-md transition-colors ${getCellColor(cell)} ${
                  inputMode && !showFeedback ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={() => handleCellClick(cell.id)}
                disabled={!inputMode || showFeedback}
                aria-label={`Grid cell ${cell.id}`}
              />
            ))}
          </div>

          {showFeedback && (
            <div className="mt-6 text-center">
              <p className={`text-lg font-medium ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                {isCorrect ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-5 w-5" /> Correct pattern!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <X className="h-5 w-5" /> Incorrect pattern!
                  </span>
                )}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center pt-0 pb-6">
          {!gameStarted && !showingPattern && !showFeedback && !gameCompleted && (
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
                    {totalPatterns > 0 ? Math.round((correctPatterns / totalPatterns) * 100) : 0}%
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Max Grid Size</p>
                  <p className="text-xl">
                    {maxGridSizeReached}×{maxGridSizeReached}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Max Pattern Length</p>
                  <p className="text-xl">{maxPatternLengthReached} cells</p>
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

