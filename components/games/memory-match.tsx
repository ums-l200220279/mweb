"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Award, RotateCcw, Home } from "lucide-react"
import confetti from "canvas-confetti"
import { useToast } from "@/hooks/use-toast"

interface MemoryCard {
  id: number
  value: string
  flipped: boolean
  matched: boolean
  image?: string
}

interface MemoryMatchProps {
  difficulty?: "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE"
  customConfig?: { pairs: number; timeLimit: number }
  onComplete?: (results: {
    score: number
    accuracy: number
    completionRate: number
    mistakeCount: number
    reactionTime: number
    duration: number
  }) => void
  onExit?: () => void
  sessionId?: string
  adaptiveLevel?: number
  userId?: string
}

export default function MemoryMatchGame({
  difficulty = "MEDIUM",
  customConfig,
  onComplete,
  onExit,
  sessionId,
  adaptiveLevel,
  userId,
}: MemoryMatchProps) {
  const { toast } = useToast()
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [mistakes, setMistakes] = useState<number>(0)
  const [firstMoveTime, setFirstMoveTime] = useState<number | null>(null)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastMoveTime, setLastMoveTime] = useState<number>(Date.now())
  const [showInstructions, setShowInstructions] = useState<boolean>(true)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Define game parameters based on difficulty
  const getGameConfig = () => {
    switch (difficulty) {
      case "EASY":
        return {
          pairs: 6,
          timeLimit: 60,
        }
      case "MEDIUM":
        return {
          pairs: 8,
          timeLimit: 90,
        }
      case "HARD":
        return {
          pairs: 12,
          timeLimit: 120,
        }
      case "ADAPTIVE":
        return {
          pairs: 8,
          timeLimit: 90,
        }
      default:
        return {
          pairs: customConfig?.pairs || 8,
          timeLimit: customConfig?.timeLimit || 90,
        }
    }
  }

  const { pairs, timeLimit } = getGameConfig()

  // Initialize game
  useEffect(() => {
    initializeGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, customConfig])

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
  }, [gameStarted, gameCompleted, timeLimit])

  // Initialize the game
  const initializeGame = () => {
    const newCards = createCards(pairs)
    setCards(newCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setScore(0)
    setTimeElapsed(0)
    setGameStarted(false)
    setGameCompleted(false)
    setFirstMoveTime(null)
    setReactionTimes([])
  }

  // Create the cards
  const createCards = (pairs: number): MemoryCard[] => {
    const cardValues: string[] = []
    for (let i = 1; i <= pairs; i++) {
      cardValues.push(String(i))
      cardValues.push(String(i))
    }

    const shuffledValues = shuffleArray(cardValues)

    return shuffledValues.map((value, index) => ({
      id: index,
      value: value,
      flipped: false,
      matched: false,
    }))
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

  // Handle card click
  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].flipped || cards[index].matched || gameCompleted) return

    // Start the game if not started
    if (!gameStarted) {
      setGameStarted(true)
      setFirstMoveTime(Date.now())
    }

    // Record reaction time
    const currentTime = Date.now()
    const reactionTime = currentTime - lastMoveTime
    setReactionTimes((prev) => [...prev, reactionTime])
    setLastMoveTime(currentTime)

    // Flip the card
    const newFlippedCards = [...flippedCards, index]
    setFlippedCards(newFlippedCards)

    // Check for match after two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)

      const [firstIndex, secondIndex] = newFlippedCards
      if (cards[firstIndex].value === cards[secondIndex].value) {
        // Match found
        setMatchedPairs((prev) => prev + 1)
        setCards((prev) =>
          prev.map((card, i) =>
            i === firstIndex || i === secondIndex ? { ...card, flipped: true, matched: true } : card,
          ),
        )
        setFlippedCards([])
      } else {
        // No match, flip back after a delay
        setMistakes((prev) => prev + 1)
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) => (i === firstIndex || i === secondIndex ? { ...card, flipped: false } : card)),
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  // End the game
  const endGame = (success: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setGameCompleted(true)

    // Calculate final score
    const accuracy = moves > 0 ? ((matchedPairs / moves) * 100).toFixed(1) : 0
    const avgReactionTime =
      reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0

    // Show completion message
    if (success) {
      toast({
        title: "Congratulations!",
        description: `You completed the game in ${formatTime(timeElapsed)} with ${moves} moves and ${mistakes} mistakes!`,
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
        title: "Time's Up!",
        description: `You've run out of time. You made ${moves} moves and ${mistakes} mistakes.`,
        variant: "destructive",
      })
    }

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete({
        score: calculateScore(accuracy, timeElapsed, mistakes),
        accuracy: Number(accuracy),
        completionRate: matchedPairs / pairs,
        mistakeCount: mistakes,
        reactionTime: avgReactionTime,
        duration: timeElapsed,
      })
    }
  }

  // Calculate score
  const calculateScore = (accuracy: string, timeElapsed: number, mistakes: number): number => {
    const accuracyScore = Number(accuracy) * 5
    const timeBonus = Math.max(0, 100 - timeElapsed) * 2
    const mistakePenalty = mistakes * 10

    return Math.max(0, Math.round(accuracyScore + timeBonus - mistakePenalty))
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
    <div ref={gameContainerRef} className="flex flex-col items-center w-full">
      {/* Game header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Memory Match</h1>
          <Badge variant="outline">{difficulty}</Badge>
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

      {/* Game board */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={card.id}
            data-testid="memory-card"
            data-flipped={card.flipped}
            data-matched={card.matched}
            className={`relative w-24 h-24 rounded-lg cursor-pointer transition-transform duration-300 ${
              card.flipped || card.matched ? "transform rotate-y-180" : ""
            }`}
            onClick={() => handleCardClick(index)}
          >
            <div className="absolute inset-0 bg-gray-200 rounded-lg backface-hidden"></div>
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800 bg-white rounded-lg rotate-y-180 backface-hidden">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Game completed overlay */}
      {gameCompleted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-center mb-4">
                {matchedPairs === pairs ? "Congratulations!" : "Time's Up!"}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Final Score</p>
                  <p className="text-3xl font-bold text-primary">{score}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-xl">{moves > 0 ? ((matchedPairs / moves) * 100).toFixed(1) : 0}%</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-xl font-mono">{formatTime(timeElapsed)}</p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Mistakes</p>
                  <p className="text-xl">{mistakes}</p>
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
\
"

