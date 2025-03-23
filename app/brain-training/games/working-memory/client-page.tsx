"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Brain, Trophy } from "lucide-react"
import WorkingMemoryGame from "@/components/games/working-memory-game"
import { useToast } from "@/hooks/use-toast"

export default function WorkingMemoryClientPage() {
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
          <h1 className="text-2xl font-bold">Working Memory Challenge</h1>
        </div>
      </div>

      {!gameStarted && !gameResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              N-Back Working Memory Task
            </CardTitle>
            <CardDescription>
              Test and improve your working memory with this scientifically validated N-Back task.
            </CardDescription>
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
                      Start with 1-back position matching. Longer display times and response windows.
                    </p>
                  </TabsContent>
                  <TabsContent value="MEDIUM" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Start with 2-back position matching. Standard display times and response windows.
                    </p>
                  </TabsContent>
                  <TabsContent value="HARD" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Start with 3-back dual matching (position and letter). Shorter display times and response windows.
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
                  <li>You'll see a sequence of letters appearing in different positions on a 3×3 grid</li>
                  <li>Your task is to identify when the current item matches the one that appeared N positions back</li>
                  <li>Press "Match" when you detect a match, "No Match" otherwise</li>
                  <li>The game has three modes: Position Match, Letter Match, and Dual Match</li>
                  <li>As you progress, N will increase and the game mode will become more challenging</li>
                </ul>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Benefits
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Improves working memory capacity</li>
                  <li>Enhances attention and focus</li>
                  <li>Strengthens information processing</li>
                  <li>Builds cognitive control</li>
                  <li>Scientifically validated to improve fluid intelligence</li>
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
        <WorkingMemoryGame difficulty={selectedDifficulty} onComplete={handleGameComplete} onExit={handleBackToGames} />
      )}

      {gameResults && (
        <Card>
          <CardHeader>
            <CardTitle>Game Results</CardTitle>
            <CardDescription>Here's how you performed in the Working Memory challenge</CardDescription>
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
                <p className="text-sm text-muted-foreground">Max N-Back</p>
                <p className="text-2xl font-bold">{gameResults.maxNBack}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{(gameResults.reactionTime / 1000).toFixed(1)}s</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold">{Math.round(gameResults.completionRate)}%</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Mistakes</p>
                <p className="text-2xl font-bold">{gameResults.mistakeCount}</p>
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
  const { accuracy, maxNBack } = results

  if (accuracy >= 85 && maxNBack >= 4) {
    return "excellent working memory capacity, above average for your age group."
  } else if (accuracy >= 70 && maxNBack >= 3) {
    return "good working memory capacity, within the normal range for your age group."
  } else if (accuracy >= 60 && maxNBack >= 2) {
    return "average working memory capacity, with room for improvement."
  } else {
    return "potential for improvement in working memory capacity with regular practice."
  }
}

function getRecommendations(results: any): string[] {
  const { accuracy, maxNBack, reactionTime } = results

  const recommendations = []

  if (accuracy < 70) {
    recommendations.push("Focus on improving accuracy by practicing with lower N-back levels first.")
  }

  if (maxNBack < 3) {
    recommendations.push("Gradually increase N-back level as you improve, aiming to reach at least 3-back.")
  }

  if (reactionTime > 2500) {
    recommendations.push("Work on improving your processing speed with regular practice.")
  }

  recommendations.push(
    "Practice this exercise 3-4 times weekly for 15-20 minutes for optimal improvement in working memory.",
  )
  recommendations.push("Consider combining with other cognitive exercises for comprehensive brain training.")

  return recommendations
}

