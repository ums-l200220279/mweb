"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Brain, Trophy } from "lucide-react"
import SpatialMemoryGame from "@/components/games/spatial-memory-game"
import { useToast } from "@/hooks/use-toast"

export default function SpatialMemoryClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDifficulty, setSelectedDifficulty] = useState<"EASY" | "MEDIUM" | "HARD" | "ADAPTIVE">("MEDIUM")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameResults, setGameResults] = useState<any>(null)

  const handleStartGame = () => {
    setGameStarted(true)
    setGameResults(null)
  }

  const handleGameComplete = (results: any) => {
    setGameResults(results)
    setGameStarted(false)

    // Save results to backend (would be implemented in a real app)
    saveGameResults(results)
      .then(() => {
        toast({
          title: "Results Saved",
          description: "Your game results have been saved successfully.",
        })
      })
      .catch((error) => {
        console.error("Error saving results:", error)
        toast({
          title: "Error Saving Results",
          description: "There was a problem saving your results. Please try again.",
          variant: "destructive",
        })
      })
  }

  const saveGameResults = async (results: any) => {
    // This would be implemented to save results to your backend
    // For now, we'll just simulate a successful save
    return new Promise((resolve) => {
      setTimeout(resolve, 500)
    })
  }

  const handleBackToGames = () => {
    router.push("/brain-training")
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackToGames}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Spatial Memory</h1>
        </div>
      </div>

      {!gameStarted && !gameResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Spatial Memory Challenge
            </CardTitle>
            <CardDescription>Test and improve your spatial memory by remembering patterns in a grid.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Select Difficulty</h3>
                <Tabs defaultValue="MEDIUM" onValueChange={(value) => setSelectedDifficulty(value as any)}>
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="EASY">Easy</TabsTrigger>
                    <TabsTrigger value="MEDIUM">Medium</TabsTrigger>
                    <TabsTrigger value="HARD">Hard</TabsTrigger>
                    <TabsTrigger value="ADAPTIVE">Adaptive</TabsTrigger>
                  </TabsList>
                  <TabsContent value="EASY" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Start with shorter patterns and longer display times. Grid size increases more slowly.
                    </p>
                  </TabsContent>
                  <TabsContent value="MEDIUM" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Balanced pattern length and display times. Grid size increases at a moderate pace.
                    </p>
                  </TabsContent>
                  <TabsContent value="HARD" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Longer patterns with shorter display times. Grid size increases more quickly.
                    </p>
                  </TabsContent>
                  <TabsContent value="ADAPTIVE" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Difficulty adapts based on your performance history. Provides an optimal challenge level.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-medium mb-2">How to Play</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Watch as cells light up in a specific sequence</li>
                  <li>Memorize the pattern and order of highlighted cells</li>
                  <li>After the pattern is shown, click the cells in the same order</li>
                  <li>Patterns get longer and grids get larger as you progress</li>
                  <li>You have 3 lives - each incorrect pattern costs 1 life</li>
                </ul>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Benefits
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Improves spatial memory and visual processing</li>
                  <li>Enhances pattern recognition abilities</li>
                  <li>Strengthens sequential memory</li>
                  <li>Builds attention to visual details</li>
                  <li>Helps maintain visuospatial skills important for daily activities</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartGame} className="w-full">
              Start Game
            </Button>
          </CardFooter>
        </Card>
      )}

      {gameStarted && (
        <SpatialMemoryGame difficulty={selectedDifficulty} onComplete={handleGameComplete} onExit={handleBackToGames} />
      )}

      {gameResults && (
        <Card>
          <CardHeader>
            <CardTitle>Game Results</CardTitle>
            <CardDescription>Here's how you performed in the Spatial Memory challenge</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">{gameResults.score}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{Math.round(gameResults.accuracy)}%</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Max Grid Size</p>
                <p className="text-2xl font-bold">
                  {gameResults.maxGridSize}×{gameResults.maxGridSize}
                </p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Max Pattern</p>
                <p className="text-2xl font-bold">{gameResults.maxPatternLength} cells</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{(gameResults.reactionTime / 1000).toFixed(1)}s</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{Math.round(gameResults.completionRate)}%</p>
              </div>
            </div>

            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Cognitive Assessment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your performance indicates {getPerformanceText(gameResults)}
              </p>
              <h4 className="text-sm font-medium mb-1">Recommendations:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {getRecommendations(gameResults).map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleStartGame} className="flex-1">
              Play Again
            </Button>
            <Button variant="outline" onClick={handleBackToGames} className="flex-1">
              Back to Games
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

// Helper functions for results interpretation
function getPerformanceText(results: any): string {
  const { accuracy, maxGridSize, maxPatternLength } = results

  if (accuracy >= 90 && maxGridSize >= 5 && maxPatternLength >= 7) {
    return "excellent spatial memory abilities, above average for your age group."
  } else if (accuracy >= 75 && maxGridSize >= 4 && maxPatternLength >= 6) {
    return "good spatial memory abilities, within the normal range for your age group."
  } else if (accuracy >= 60 && maxGridSize >= 3 && maxPatternLength >= 5) {
    return "average spatial memory abilities, with room for improvement."
  } else {
    return "potential for improvement in spatial memory and pattern recognition with regular practice."
  }
}

function getRecommendations(results: any): string[] {
  const { accuracy, maxGridSize, maxPatternLength, reactionTime } = results

  const recommendations = []

  if (accuracy < 70) {
    recommendations.push(
      "Focus on improving pattern memorization by starting with simpler patterns and gradually increasing difficulty.",
    )
  }

  if (maxGridSize < 4) {
    recommendations.push("Practice with larger grids to improve your spatial awareness and visual field processing.")
  }

  if (maxPatternLength < 6) {
    recommendations.push(
      "Work on sequential memory exercises to increase the number of items you can remember in order.",
    )
  }

  if (reactionTime > 3000) {
    recommendations.push("Try to improve your processing speed by practicing quick visual recognition exercises.")
  }

  recommendations.push("Return to this exercise 2-3 times weekly for optimal improvement in spatial memory.")

  return recommendations
}

