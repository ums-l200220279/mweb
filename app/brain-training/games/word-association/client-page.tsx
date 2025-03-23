"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Brain, Trophy } from "lucide-react"
import WordAssociationGame from "@/components/games/word-association-game"
import { useToast } from "@/hooks/use-toast"

export default function WordAssociationClientPage() {
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
          <h1 className="text-2xl font-bold">Word Association</h1>
        </div>
      </div>

      {!gameStarted && !gameResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Word Association Challenge
            </CardTitle>
            <CardDescription>
              Test your semantic processing and language skills by identifying related word pairs.
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
                      More obviously related or unrelated word pairs with longer response times. Good for beginners.
                    </p>
                  </TabsContent>
                  <TabsContent value="MEDIUM" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Balanced mix of word pairs with moderate response times. Suitable for regular practice.
                    </p>
                  </TabsContent>
                  <TabsContent value="HARD" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      More subtle relationships between words and shorter response times. A real challenge!
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
                  <li>You'll see two words displayed on screen</li>
                  <li>Decide if the words are semantically related or unrelated</li>
                  <li>Related words have a meaningful connection (e.g., "Dog" and "Cat")</li>
                  <li>Unrelated words have no obvious connection (e.g., "Elephant" and "Pencil")</li>
                  <li>Answer quickly for higher scores</li>
                  <li>You have 3 lives - each incorrect answer costs 1 life</li>
                </ul>
              </div>

              <div className="bg-primary/10 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Benefits
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Improves semantic processing abilities</li>
                  <li>Enhances language comprehension</li>
                  <li>Strengthens cognitive associations</li>
                  <li>Builds vocabulary and word relationships</li>
                  <li>Helps maintain language skills important for daily communication</li>
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
        <WordAssociationGame
          difficulty={selectedDifficulty}
          onComplete={handleGameComplete}
          onExit={handleBackToGames}
        />
      )}

      {gameResults && (
        <Card>
          <CardHeader>
            <CardTitle>Game Results</CardTitle>
            <CardDescription>Here's how you performed in the Word Association challenge</CardDescription>
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
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">
                  {Math.floor(gameResults.duration / 60)}:{(gameResults.duration % 60).toString().padStart(2, "0")}
                </p>
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
  const { accuracy, reactionTime } = results

  if (accuracy >= 90 && reactionTime < 2000) {
    return "excellent semantic processing abilities, above average for your age group."
  } else if (accuracy >= 75 && reactionTime < 3000) {
    return "good semantic processing abilities, within the normal range for your age group."
  } else if (accuracy >= 60 && reactionTime < 4000) {
    return "average semantic processing abilities, with room for improvement."
  } else {
    return "potential for improvement in semantic processing and language skills with regular practice."
  }
}

function getRecommendations(results: any): string[] {
  const { accuracy, reactionTime, mistakeCount } = results

  const recommendations = []

  if (accuracy < 70) {
    recommendations.push("Focus on building vocabulary and understanding word relationships.")
  }

  if (reactionTime > 3000) {
    recommendations.push("Practice quick word association exercises to improve processing speed.")
  }

  if (mistakeCount > 10) {
    recommendations.push("Read more diverse materials to strengthen your semantic networks.")
  }

  recommendations.push("Return to this exercise 2-3 times weekly for optimal improvement in language processing.")

  return recommendations
}

