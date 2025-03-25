"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Award, RotateCcw, Play, Pause } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"

interface MemoryCard {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
}

interface MemoryMatchProps {
  difficulty?: "easy" | "medium" | "hard"
  onComplete?: (score: number, time: number) => void
}

export default function MemoryMatch({ difficulty = "medium", onComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const [time, setTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [gameComplete, setGameComplete] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)

  // Determine grid size and total pairs based on difficulty
  const gridConfig = {
    easy: { cols: 4, rows: 3, totalPairs: 6 },
    medium: { cols: 4, rows: 4, totalPairs: 8 },
    hard: { cols: 6, rows: 4, totalPairs: 12 },
  }[difficulty]

  const totalPairs = gridConfig.totalPairs

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [difficulty])

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isPlaying && !gameComplete) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPlaying, gameComplete])

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0) {
      const finalScore = calculateScore()
      setScore(finalScore)
      setIsPlaying(false)
      setGameComplete(true)

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      if (onComplete) {
        onComplete(finalScore, time)
      }
    }
  }, [matchedPairs, totalPairs])

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCardId, secondCardId] = flippedCards
      const firstCard = cards.find((card) => card.id === firstCardId)
      const secondCard = cards.find((card) => card.id === secondCardId)

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.id === firstCardId || card.id === secondCardId ? { ...card, isMatched: true } : card,
          ),
        )
        setMatchedPairs((prev) => prev + 1)
        setFlippedCards([])
      } else {
        // No match, flip back after delay
        const timer = setTimeout(() => {
          setFlippedCards([])
        }, 1000)
        return () => clearTimeout(timer)
      }

      setMoves((prev) => prev + 1)
    }
  }, [flippedCards, cards])

  const initializeGame = () => {
    const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"]
    const selectedEmojis = emojis.slice(0, totalPairs)

    // Create pairs
    const cardPairs = [...selectedEmojis, ...selectedEmojis].map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }))

    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5)

    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setTime(0)
    setIsPlaying(false)
    setGameComplete(false)
    setScore(0)
  }

  const handleCardClick = (cardId: number) => {
    if (!isPlaying) {
      setIsPlaying(true)
    }

    // Ignore click if:
    // - Card is already flipped or matched
    // - Two cards are already flipped
    const clickedCard = cards.find((card) => card.id === cardId)
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched || flippedCards.length >= 2 || gameComplete) {
      return
    }

    // Flip the card
    setCards((prevCards) => prevCards.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card)))

    // Add to flipped cards
    setFlippedCards((prev) => [...prev, cardId])
  }

  const calculateScore = () => {
    // Base score calculation:
    // - Higher score for fewer moves
    // - Higher score for faster time
    // - Adjusted by difficulty

    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    }[difficulty]

    const movesPenalty = Math.max(0, moves - totalPairs) * 5
    const timePenalty = Math.floor(time / 10)

    const baseScore = 1000
    const calculatedScore = Math.max(0, Math.floor((baseScore - movesPenalty - timePenalty) * difficultyMultiplier))

    return calculatedScore
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  const restartGame = () => {
    initializeGame()
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-2xl">Memory Match</CardTitle>
            <CardDescription>Find all matching pairs to complete the game</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
            <Button variant="outline" size="sm" onClick={restartGame}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Restart
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Game Stats */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(time)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{moves} Moves</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Progress:</span>
            <div className="w-32 ml-2">
              <Progress value={(matchedPairs / totalPairs) * 100} className="h-2" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              {matchedPairs}/{totalPairs}
            </span>
          </div>
          {!gameComplete && (
            <Button variant="ghost" size="sm" onClick={togglePlay} className="text-xs">
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  {time === 0 ? "Start" : "Resume"}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Game Grid */}
        <div
          className={cn("grid gap-2 sm:gap-4", {
            "grid-cols-4 grid-rows-3": difficulty === "easy",
            "grid-cols-4 grid-rows-4": difficulty === "medium",
            "grid-cols-6 grid-rows-4": difficulty === "hard",
          })}
        >
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className={cn("aspect-square rounded-lg cursor-pointer perspective-500", {
                "pointer-events-none": !isPlaying && !gameComplete,
              })}
              onClick={() => handleCardClick(card.id)}
              whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn("w-full h-full relative transition-transform duration-500 transform-style-3d", {
                  "rotate-y-180": card.isFlipped || card.isMatched,
                })}
              >
                {/* Card Back */}
                <div className="absolute w-full h-full backface-hidden bg-primary-100 border-2 border-primary-200 rounded-lg flex items-center justify-center text-primary-500">
                  <span className="text-2xl">?</span>
                </div>

                {/* Card Front */}
                <div
                  className={cn(
                    "absolute w-full h-full backface-hidden rotate-y-180 rounded-lg flex items-center justify-center text-4xl",
                    {
                      "bg-green-100 border-2 border-green-200": card.isMatched,
                      "bg-white border-2 border-primary-200": !card.isMatched,
                    },
                  )}
                >
                  {card.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>

      {/* Game Complete Screen */}
      <AnimatePresence>
        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <CardFooter className="flex flex-col items-center p-6 bg-primary-50 rounded-b-lg">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-primary-700 mb-1">Congratulations!</h3>
                <p className="text-sm text-muted-foreground">
                  You completed the game in {formatTime(time)} with {moves} moves
                </p>
              </div>

              <div className="bg-white rounded-full p-4 mb-4 shadow-md">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                  <p className="text-3xl font-bold text-primary-600">{score}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={restartGame}>Play Again</Button>
                <Button variant="outline" asChild>
                  <a href="/dashboard/games">More Games</a>
                </Button>
              </div>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

