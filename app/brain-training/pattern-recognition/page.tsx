"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, Brain, ArrowLeft, Trophy, Info } from "lucide-react"
import Link from "next/link"

// Generate a random pattern of colored squares
const generatePattern = (size: number, colors: string[]) => {
  const pattern = []
  for (let i = 0; i < size; i++) {
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    pattern.push(randomColor)
  }
  return pattern
}

// Available colors for the pattern
const colors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
]

// Game levels
const levels = [
  { size: 4, displayTime: 3000, name: "Easy" },
  { size: 6, displayTime: 3000, name: "Medium" },
  { size: 9, displayTime: 4000, name: "Hard" },
  { size: 12, displayTime: 5000, name: "Expert" },
]

export default function PatternRecognitionPage() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameState, setGameState] = useState<"intro" | "memorize" | "recall" | "feedback" | "complete">("intro")
  const [pattern, setPattern] = useState<string[]>([])
  const [userPattern, setUserPattern] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  // Start the game
  const startGame = () => {
    const newPattern = generatePattern(levels[currentLevel].size, colors)
    setPattern(newPattern)
    setUserPattern([])
    setTimeLeft(levels[currentLevel].displayTime / 1000)
    setGameState("memorize")

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameState("recall")
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Handle square selection during recall phase
  const handleSquareClick = (color: string, index: number) => {
    if (gameState !== "recall") return

    const newUserPattern = [...userPattern, color]
    setUserPattern(newUserPattern)

    // Check if user has selected all squares
    if (newUserPattern.length === pattern.length) {
      // Calculate score
      let correct = 0
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === newUserPattern[i]) {
          correct++
        }
      }

      const levelScore = Math.round((correct / pattern.length) * 100)
      setScore(levelScore)
      setTotalCorrect((prev) => prev + correct)
      setGameState("feedback")
    }
  }

  // Move to the next level
  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel((prev) => prev + 1)
      setGameState("intro")
    } else {
      setGameState("complete")
    }
  }

  // Retry the current level
  const retryLevel = () => {
    setGameState("intro")
  }

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/brain-gym">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Pattern Recognition</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowInstructions(true)}>
            <Info className="h-4 w-4 mr-2" />
            Instructions
          </Button>
        </div>

        {/* Game Area */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>
                  Level {currentLevel + 1}: {levels[currentLevel].name}
                </CardTitle>
                <CardDescription>
                  {gameState === "intro" && "Memorize the pattern and recreate it"}
                  {gameState === "memorize" && "Memorize the pattern!"}
                  {gameState === "recall" && "Recreate the pattern from memory"}
                  {gameState === "feedback" && `You got ${score}% correct`}
                  {gameState === "complete" && "Exercise complete!"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {gameState === "memorize" && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{timeLeft}s</span>
                  </div>
                )}
                <Badge variant="outline">
                  {gameState === "intro" && "Get Ready"}
                  {gameState === "memorize" && "Memorizing"}
                  {gameState === "recall" && "Recalling"}
                  {gameState === "feedback" && "Feedback"}
                  {gameState === "complete" && "Complete"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {gameState === "intro" && (
              <div className="flex flex-col items-center justify-center py-12">
                <Brain className="h-16 w-16 text-primary mb-4" />
                <h2 className="text-xl font-bold mb-2">Pattern Recognition Challenge</h2>
                <p className="text-center text-muted-foreground mb-6 max-w-md">
                  You'll see a pattern of colored squares for {levels[currentLevel].displayTime / 1000} seconds.
                  Memorize it, then recreate the pattern from memory.
                </p>
                <Button onClick={startGame}>Start Level {currentLevel + 1}</Button>
              </div>
            )}

            {gameState === "memorize" && (
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <Progress value={(timeLeft / (levels[currentLevel].displayTime / 1000)) * 100} className="w-64" />
                </div>
                <div className={`grid grid-cols-${Math.sqrt(levels[currentLevel].size)} gap-4 p-4`}>
                  {pattern.map((color, index) => (
                    <div key={index} className={`${color} w-16 h-16 rounded-lg`} />
                  ))}
                </div>
              </div>
            )}

            {gameState === "recall" && (
              <div className="flex flex-col items-center">
                <p className="mb-4 text-muted-foreground">Select {pattern.length} squares to recreate the pattern</p>
                <div className="grid grid-cols-4 gap-4 p-4">
                  {colors.map((color, index) => (
                    <div
                      key={index}
                      className={`${color} w-16 h-16 rounded-lg cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => handleSquareClick(color, index)}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">
                    Your selection ({userPattern.length}/{pattern.length}):
                  </p>
                  <div className="flex gap-2">
                    {userPattern.map((color, index) => (
                      <div key={index} className={`${color} w-8 h-8 rounded-md`} />
                    ))}
                    {Array(pattern.length - userPattern.length)
                      .fill(0)
                      .map((_, index) => (
                        <div key={index} className="w-8 h-8 rounded-md border border-dashed border-muted-foreground" />
                      ))}
                  </div>
                </div>
              </div>
            )}

            {gameState === "feedback" && (
              <div className="flex flex-col items-center py-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-4 text-center">
                    {score >= 80 ? "Great job!" : score >= 50 ? "Good effort!" : "Keep practicing!"}
                  </h3>
                  <div className="flex justify-center gap-8 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Your Score</p>
                      <p className="text-3xl font-bold">{score}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Correct Squares</p>
                      <p className="text-3xl font-bold">
                        {Math.round((score / 100) * pattern.length)}/{pattern.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Original Pattern:</p>
                    <div className="flex flex-wrap gap-2 max-w-xs">
                      {pattern.map((color, index) => (
                        <div key={index} className={`${color} w-8 h-8 rounded-md`} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Your Pattern:</p>
                    <div className="flex flex-wrap gap-2 max-w-xs">
                      {userPattern.map((color, index) => (
                        <div
                          key={index}
                          className={`${color} w-8 h-8 rounded-md ${color === pattern[index] ? "ring-2 ring-green-500" : "ring-2 ring-red-500"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {gameState === "complete" && (
              <div className="flex flex-col items-center py-12">
                <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Exercise Complete!</h2>
                <p className="text-center text-muted-foreground mb-6 max-w-md">
                  You've completed all levels of the Pattern Recognition exercise.
                </p>
                <div className="flex justify-center gap-8 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                    <p className="text-3xl font-bold">
                      {Math.round((totalCorrect / levels.reduce((acc, level) => acc + level.size, 0)) * 100)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Levels Completed</p>
                    <p className="text-3xl font-bold">
                      {levels.length}/{levels.length}
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowResults(true)}>View Detailed Results</Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {gameState === "feedback" && (
              <>
                <Button variant="outline" onClick={retryLevel}>
                  Retry Level
                </Button>
                <Button onClick={nextLevel}>
                  {currentLevel < levels.length - 1 ? "Next Level" : "Complete Exercise"}
                </Button>
              </>
            )}
            {gameState === "complete" && (
              <Button className="w-full" asChild>
                <Link href="/brain-gym">Return to Brain Gym</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pattern Recognition Instructions</DialogTitle>
            <DialogDescription>How to play and why it's beneficial</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">How to Play</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                <li>You'll be shown a pattern of colored squares for a few seconds</li>
                <li>Memorize the pattern as best you can</li>
                <li>After the pattern disappears, recreate it by selecting the same colored squares</li>
                <li>You'll receive feedback on your accuracy</li>
                <li>Progress through increasingly difficult levels</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium">Cognitive Benefits</h3>
              <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                <li>Improves visual memory</li>
                <li>Enhances pattern recognition abilities</li>
                <li>Strengthens attention to detail</li>
                <li>Builds working memory capacity</li>
                <li>Develops visual-spatial processing</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInstructions(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exercise Results</DialogTitle>
            <DialogDescription>Your performance on the Pattern Recognition exercise</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Overall Score:</span>
              <span className="font-bold">
                {Math.round((totalCorrect / levels.reduce((acc, level) => acc + level.size, 0)) * 100)}%
              </span>
            </div>
            <div className="space-y-2">
              {levels.map((level, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                  <span>
                    Level {index + 1}: {level.name}
                  </span>
                  <Badge variant={index <= currentLevel ? "default" : "outline"}>
                    {index < currentLevel ? "Completed" : index === currentLevel ? "Current" : "Locked"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Cognitive Areas Trained:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Visual Memory</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Attention</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Pattern Recognition</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Working Memory</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResults(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

