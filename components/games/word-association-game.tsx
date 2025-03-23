"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, Award, RotateCcw, Home, Check, X } from "lucide-react"
import confetti from "canvas-confetti"
import { useToast } from "@/hooks/use-toast"

interface WordPair {
  id: number
  word1: string
  word2: string
  related: boolean
}

interface WordAssociationGameProps {
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
  sessionId?: string
  adaptiveLevel?: number
}

export default function WordAssociationGame({
  difficulty = "MEDIUM",
  onComplete,
  onExit,
  sessionId,
  adaptiveLevel,
}: WordAssociationGameProps) {
  const { toast } = useToast()
  const [currentPair, setCurrentPair] = useState<WordPair | null>(null)
  const [level, setLevel] = useState<number>(1)
  const [score, setScore] = useState<number>(0)
  const [lives, setLives] = useState<number>(3)
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [showFeedback, setShowFeedback] = useState<boolean>(false)
  const [isCorrect, setIsCorrect] = useState<boolean>(false)
  const [totalQuestions, setTotalQuestions] = useState<number>(0)
  const [correctAnswers, setCorrectAnswers] = useState<number>(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [lastActionTime, setLastActionTime] = useState<number>(Date.now())
  const [showInstructions, setShowInstructions] = useState<boolean>(true)
  const [wordPairs, setWordPairs] = useState<WordPair[]>([])
  const [remainingPairs, setRemainingPairs] = useState<WordPair[]>([])

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Define game parameters based on difficulty
  const getGameConfig = () => {
    switch (difficulty) {
      case "EASY":
        return {
          pairsPerLevel: 10,
          maxLevel: 3,
          timeLimit: 180,
          feedbackTime: 1000,
          relatedRatio: 0.6, // 60% related, 40% unrelated
        }
      case "MEDIUM":
        return {
          pairsPerLevel: 15,
          maxLevel: 4,
          timeLimit: 240,
          feedbackTime: 800,
          relatedRatio: 0.5, // 50% related, 50% unrelated
        }
      case "HARD":
        return {
          pairsPerLevel: 20,
          maxLevel: 5,
          timeLimit: 300,
          feedbackTime: 600,
          relatedRatio: 0.4, // 40% related, 60% unrelated
        }
      case "ADAPTIVE":
        return {
          pairsPerLevel: 15,
          maxLevel: 4,
          timeLimit: 240,
          feedbackTime: 800,
          relatedRatio: 0.5,
        }
      default:
        return {
          pairsPerLevel: 15,
          maxLevel: 4,
          timeLimit: 240,
          feedbackTime: 800,
          relatedRatio: 0.5,
        }
    }
  }

  const { pairsPerLevel, maxLevel, timeLimit, feedbackTime, relatedRatio } = getGameConfig()

  // Word pairs database
  const wordPairsDatabase = {
    related: [
      { word1: "Dog", word2: "Cat", category: "Animals" },
      { word1: "Table", word2: "Chair", category: "Furniture" },
      { word1: "Sun", word2: "Moon", category: "Celestial Bodies" },
      { word1: "Book", word2: "Read", category: "Literature" },
      { word1: "Water", word2: "Drink", category: "Beverages" },
      { word1: "Car", word2: "Drive", category: "Transportation" },
      { word1: "Pen", word2: "Paper", category: "Writing" },
      { word1: "Doctor", word2: "Nurse", category: "Medical" },
      { word1: "Shoe", word2: "Sock", category: "Clothing" },
      { word1: "Fork", word2: "Spoon", category: "Utensils" },
      { word1: "Rain", word2: "Umbrella", category: "Weather" },
      { word1: "Bread", word2: "Butter", category: "Food" },
      { word1: "Hammer", word2: "Nail", category: "Tools" },
      { word1: "Salt", word2: "Pepper", category: "Condiments" },
      { word1: "King", word2: "Queen", category: "Royalty" },
      { word1: "Day", word2: "Night", category: "Time" },
      { word1: "Hot", word2: "Cold", category: "Temperature" },
      { word1: "Happy", word2: "Sad", category: "Emotions" },
      { word1: "Black", word2: "White", category: "Colors" },
      { word1: "Up", word2: "Down", category: "Directions" },
      { word1: "Teacher", word2: "Student", category: "Education" },
      { word1: "Flower", word2: "Bee", category: "Nature" },
      { word1: "Mountain", word2: "Climb", category: "Geography" },
      { word1: "Piano", word2: "Music", category: "Arts" },
      { word1: "Eye", word2: "See", category: "Body Parts" },
      { word1: "Ear", word2: "Hear", category: "Senses" },
      { word1: "Laugh", word2: "Joke", category: "Humor" },
      { word1: "Fire", word2: "Smoke", category: "Elements" },
      { word1: "Tree", word2: "Leaf", category: "Plants" },
      { word1: "Fish", word2: "Swim", category: "Activities" },
      { word1: "Bird", word2: "Fly", category: "Animals" },
      { word1: "Lock", word2: "Key", category: "Security" },
      { word1: "Question", word2: "Answer", category: "Communication" },
      { word1: "Winter", word2: "Snow", category: "Seasons" },
      { word1: "Summer", word2: "Beach", category: "Vacation" },
      { word1: "Tooth", word2: "Dentist", category: "Health" },
      { word1: "Money", word2: "Bank", category: "Finance" },
      { word1: "Cake", word2: "Birthday", category: "Celebrations" },
      { word1: "Telephone", word2: "Call", category: "Communication" },
      { word1: "Bed", word2: "Sleep", category: "Furniture" },
    ],
    unrelated: [
      { word1: "Elephant", word2: "Pencil", category: "Random" },
      { word1: "Ocean", word2: "Mountain", category: "Geography" },
      { word1: "Computer", word2: "Banana", category: "Random" },
      { word1: "Guitar", word2: "Airplane", category: "Random" },
      { word1: "Lamp", word2: "Pizza", category: "Random" },
      { word1: "Window", word2: "Carrot", category: "Random" },
      { word1: "Clock", word2: "Butterfly", category: "Random" },
      { word1: "Pillow", word2: "Rocket", category: "Random" },
      { word1: "Camera", word2: "Waterfall", category: "Random" },
      { word1: "Bicycle", word2: "Diamond", category: "Random" },
      { word1: "Candle", word2: "Octopus", category: "Random" },
      { word1: "Keyboard", word2: "Tornado", category: "Random" },
      { word1: "Wallet", word2: "Cactus", category: "Random" },
      { word1: "Helmet", word2: "Cupcake", category: "Random" },
      { word1: "Backpack", word2: "Lighthouse", category: "Random" },
      { word1: "Scissors", word2: "Planet", category: "Random" },
      { word1: "Toothbrush", word2: "Volcano", category: "Random" },
      { word1: "Microphone", word2: "Snowflake", category: "Random" },
      { word1: "Umbrella", word2: "Dinosaur", category: "Random" },
      { word1: "Glove", word2: "Pyramid", category: "Random" },
      { word1: "Stapler", word2: "Dolphin", category: "Random" },
      { word1: "Envelope", word2: "Telescope", category: "Random" },
      { word1: "Bucket", word2: "Satellite", category: "Random" },
      { word1: "Ladder", word2: "Pineapple", category: "Random" },
      { word1: "Mirror", word2: "Tornado", category: "Random" },
      { word1: "Compass", word2: "Popcorn", category: "Random" },
      { word1: "Whistle", word2: "Skyscraper", category: "Random" },
      { word1: "Magnet", word2: "Seashell", category: "Random" },
      { word1: "Shovel", word2: "Kangaroo", category: "Random" },
      { word1: "Flashlight", word2: "Bagel", category: "Random" },
      { word1: "Anchor", word2: "Helicopter", category: "Random" },
      { word1: "Telescope", word2: "Strawberry", category: "Random" },
      { word1: "Wrench", word2: "Penguin", category: "Random" },
      { word1: "Paintbrush", word2: "Submarine", category: "Random" },
      { word1: "Thermometer", word2: "Cactus", category: "Random" },
      { word1: "Compass", word2: "Hamburger", category: "Random" },
      { word1: "Binoculars", word2: "Watermelon", category: "Random" },
      { word1: "Microscope", word2: "Giraffe", category: "Random" },
      { word1: "Hourglass", word2: "Spaceship", category: "Random" },
      { word1: "Telescope", word2: "Donut", category: "Random" },
    ],
  }

  // Initialize game
  useEffect(() => {
    initializeGame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, adaptiveLevel])

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

  // Feedback timer
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false)

        // If game is still active, show next pair
        if (!gameCompleted) {
          showNextPair()
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
    generateWordPairs()
  }

  // Generate word pairs for the game
  const generateWordPairs = () => {
    const allPairs: WordPair[] = []
    let pairId = 1

    // Calculate how many related and unrelated pairs we need
    const totalPairs = pairsPerLevel * maxLevel
    const relatedCount = Math.floor(totalPairs * relatedRatio)
    const unrelatedCount = totalPairs - relatedCount

    // Get random related pairs
    const shuffledRelated = [...wordPairsDatabase.related].sort(() => Math.random() - 0.5)
    const selectedRelated = shuffledRelated.slice(0, relatedCount)

    // Get random unrelated pairs
    const shuffledUnrelated = [...wordPairsDatabase.unrelated].sort(() => Math.random() - 0.5)
    const selectedUnrelated = shuffledUnrelated.slice(0, unrelatedCount)

    // Create related pairs
    selectedRelated.forEach((pair) => {
      allPairs.push({
        id: pairId++,
        word1: pair.word1,
        word2: pair.word2,
        related: true,
      })
    })

    // Create unrelated pairs
    selectedUnrelated.forEach((pair) => {
      allPairs.push({
        id: pairId++,
        word1: pair.word1,
        word2: pair.word2,
        related: false,
      })
    })

    // Shuffle all pairs
    const shuffledPairs = allPairs.sort(() => Math.random() - 0.5)

    setWordPairs(shuffledPairs)
    setRemainingPairs(shuffledPairs)

    // Start with the first pair
    if (shuffledPairs.length > 0) {
      setCurrentPair(shuffledPairs[0])
    }
  }

  // Show the next word pair
  const showNextPair = () => {
    // Remove the current pair from remaining pairs
    const updatedRemainingPairs = remainingPairs.filter((pair) => pair.id !== currentPair?.id)
    setRemainingPairs(updatedRemainingPairs)

    // Check if we've completed the current level
    const pairsAnswered = totalQuestions + 1
    const currentLevelCompleted = pairsAnswered % pairsPerLevel === 0

    if (currentLevelCompleted && level < maxLevel) {
      // Move to next level
      setLevel((prev) => prev + 1)
    }

    // Check if we've completed all pairs
    if (updatedRemainingPairs.length === 0) {
      endGame(true)
      return
    }

    // Show the next pair
    setCurrentPair(updatedRemainingPairs[0])
    setLastActionTime(Date.now())
  }

  // Handle user answer
  const handleAnswer = (answer: boolean) => {
    if (showFeedback || !currentPair) return

    // Start the game if not started
    if (!gameStarted) {
      setGameStarted(true)
    }

    // Record reaction time
    const currentTime = Date.now()
    const reactionTime = currentTime - lastActionTime
    setReactionTimes((prev) => [...prev, reactionTime])

    // Check if the answer is correct
    const isAnswerCorrect = answer === currentPair.related
    setIsCorrect(isAnswerCorrect)
    setTotalQuestions((prev) => prev + 1)

    if (isAnswerCorrect) {
      // Correct answer
      const levelBonus = level
      const timeBonus = Math.max(0, 5 - Math.floor(reactionTime / 1000)) * 10
      const pointsEarned = 50 * levelBonus + timeBonus

      setScore((prev) => prev + pointsEarned)
      setCorrectAnswers((prev) => prev + 1)

      // Show confetti for correct answers
      if (gameContainerRef.current) {
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
    const levelBonus = level * 100
    const finalScore = score + timeBonus + accuracyBonus + levelBonus

    setScore(finalScore)

    // Calculate metrics
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    const completionRate = success ? 100 : (totalQuestions / (pairsPerLevel * maxLevel)) * 100
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

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalPairs = pairsPerLevel * maxLevel
    const pairsCompleted = totalPairs - remainingPairs.length
    return (pairsCompleted / totalPairs) * 100
  }

  return (
    <div ref={gameContainerRef} className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Game header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Word Association</h1>
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
              <p>Determine if the two words shown are related or unrelated to each other.</p>
              <ul className="list-disc list-inside mt-2">
                <li>Related words have a semantic connection (e.g., "Dog" and "Cat")</li>
                <li>Unrelated words have no obvious connection (e.g., "Elephant" and "Pencil")</li>
                <li>Answer quickly for higher scores</li>
                <li>You have 3 lives - each incorrect answer costs 1 life</li>
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

        <Progress value={calculateProgress()} className="w-full sm:w-1/2 h-2" />
      </div>

      {/* Game board */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">
            {showFeedback ? (isCorrect ? "Correct!" : "Incorrect!") : "Are these words related?"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
          {currentPair && (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-8 text-3xl font-bold">
                <span className="p-4 bg-primary/10 rounded-lg">{currentPair.word1}</span>
                <span className="text-muted-foreground">+</span>
                <span className="p-4 bg-primary/10 rounded-lg">{currentPair.word2}</span>
              </div>

              {!showFeedback && (
                <div className="flex gap-4 mt-4">
                  <Button size="lg" onClick={() => handleAnswer(true)} className="w-32">
                    Related
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => handleAnswer(false)} className="w-32">
                    Unrelated
                  </Button>
                </div>
              )}

              {showFeedback && (
                <div className="flex flex-col items-center gap-4 mt-4">
                  <div className={`text-4xl ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                    {isCorrect ? <Check className="h-12 w-12" /> : <X className="h-12 w-12" />}
                  </div>
                  <p className="text-lg">
                    These words are <span className="font-bold">{currentPair.related ? "related" : "unrelated"}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {!currentPair && !gameCompleted && (
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Loading word pairs...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center pt-0 pb-6">
          {!gameStarted && !showFeedback && !gameCompleted && (
            <Button onClick={() => setGameStarted(true)}>Start</Button>
          )}
        </CardFooter>
      </Card>

      {/* Game completed overlay */}
      {gameCompleted && (
        <div className="mt-6 w-full">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-center mb-4">
                {remainingPairs.length === 0 ? "All Levels Completed!" : lives <= 0 ? "Game Over!" : "Time's Up!"}
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

