"use client"

import { Suspense } from "react"
import MemoryMatchGame from "@/components/games/memory-match"
import { GameSessionProvider } from "@/components/games/game-session-provider"
import { DifficultySelector } from "@/components/games/difficulty-selector"
import { GameHeader } from "@/components/games/game-header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, Puzzle, Clock, Trophy } from "lucide-react"

export default function MemoryMatchClientPage() {
  return (
    <div className="container py-8">
      <GameHeader
        title="Memory Match"
        description="Find matching pairs of cards to improve your memory and attention."
        icon={<Puzzle className="h-6 w-6" />}
      />

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mt-8">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <Suspense fallback={<GameSkeleton />}>
            <GameSessionProvider gameId="memory_match">
              {({ sessionId, difficulty, setDifficulty, adaptiveLevel, handleGameComplete }) => (
                <>
                  <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />

                  <Card>
                    <CardContent className="p-6">
                      <MemoryMatchGame
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
                    <span>Memory</span>
                    <span className="font-medium">Primary</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "90%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>Attention</span>
                    <span className="font-medium">High</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span>Visual Processing</span>
                    <span className="font-medium">Medium</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "50%" }} />
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
                  <span className="font-medium">1,250</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Games Played</span>
                  <span className="font-medium">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Completion</span>
                  <span className="font-medium">85%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fastest Time</span>
                  <span className="font-medium">1:24</span>
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
                  <span>Cards are placed face down on the board.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    2
                  </span>
                  <span>Flip two cards at a time to find matching pairs.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    3
                  </span>
                  <span>If the cards match, they stay face up.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    4
                  </span>
                  <span>If they don't match, they flip back over.</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-medium">
                    5
                  </span>
                  <span>Find all pairs before time runs out to win!</span>
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

          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

