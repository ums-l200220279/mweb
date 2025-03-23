"use client"

import { Suspense } from "react"
import PatternRecognitionGame from "@/components/games/pattern-recognition"
import { GameSessionProvider } from "@/components/games/game-session-provider"
import { DifficultySelector } from "@/components/games/difficulty-selector"
import { GameHeader } from "@/components/games/game-header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Zap, Clock, Trophy } from "lucide-react"

export default function PatternRecognitionClientPage() {
  return (
    <div className="container py-8">
      <GameHeader
        title="Pattern Recognition"
        description="Remember and repeat color patterns to enhance your visual memory and focus."
        icon={<Zap className="h-6 w-6" />}
      />

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mt-8">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <Suspense fallback={<GameSkeleton />}>
            <GameSessionProvider gameId="pattern_recognition">
              {({ sessionId, difficulty, setDifficulty, adaptiveLevel, handleGameComplete }) => (
                <>
                  <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />

                  <Card>
                    <CardContent className="p-6">
                      <PatternRecognitionGame
                        difficulty={difficulty}
                        sessionId={sessionId}
                        adaptiveLevel={adaptiveLevel}
                        onComplete={handleGameComplete}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </GameSessionProvider>
          </Suspense>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>Cognitive Benefits</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>Visual Memory</span>
                    <span className="font-medium">Primary</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "90%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>Focus</span>
                    <span className="font-medium">High</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>Processing Speed</span>
                    <span className="font-medium">Medium</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span>Your Stats</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Best Score</span>
                  <span className="font-medium">980</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Games Played</span>
                  <span className="font-medium">8</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Longest Pattern</span>
                  <span className="font-medium">9 colors</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                  <span className="font-medium">1.2s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>How to Play</span>
              </h3>

              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    1
                  </span>
                  <span>Watch the sequence of colors that appears.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    2
                  </span>
                  <span>Remember the order of the colors shown.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    3
                  </span>
                  <span>After the sequence ends, repeat it by clicking the colors in the same order.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    4
                  </span>
                  <span>Each correct sequence earns points and advances you to the next round.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    5
                  </span>
                  <span>Complete all rounds before time runs out to win!</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function GameSkeleton() {
  return (
    <>
      <div className="flex justify-end mb-4">
        <Skeleton className="h-10 w-40" />
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>

          <Skeleton className="h-2 w-full mb-6" />

          <div className="flex justify-center mb-6">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

