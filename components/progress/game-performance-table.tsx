"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserGameHistory } from "@/lib/api/game-api"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Puzzle, Zap } from "lucide-react"

interface GameSession {
  id: string
  gameId: string
  startTime: string
  endTime: string
  score: number
  difficulty: string
  completed: boolean
  metrics: {
    correctAnswers: number
    totalQuestions: number
    averageResponseTime: number
    mistakes: number
  }
  game: {
    id: string
    name: string
    type: string
  }
}

export function GamePerformanceTable() {
  const [history, setHistory] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await getUserGameHistory(10)
        setHistory(data)
      } catch (error) {
        console.error("Error loading game history:", error)
        toast({
          title: "Error",
          description: "Failed to load game history. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    )
  }

  // If no data, show a message
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <p className="text-muted-foreground mb-2">No game history available.</p>
        <p className="text-sm text-muted-foreground">Play brain training games to start tracking your performance.</p>
      </div>
    )
  }

  // Mock data for demonstration
  if (history.length < 5) {
    const mockGames = [
      {
        id: "mock1",
        gameId: "memory_match",
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 3).toISOString(),
        score: 1250,
        difficulty: "medium",
        completed: true,
        metrics: {
          correctAnswers: 8,
          totalQuestions: 8,
          averageResponseTime: 1200,
          mistakes: 3,
        },
        game: {
          id: "memory_match",
          name: "Memory Match",
          type: "memory_match",
        },
      },
      {
        id: "mock2",
        gameId: "pattern_recognition",
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 60 * 2).toISOString(),
        score: 980,
        difficulty: "hard",
        completed: true,
        metrics: {
          correctAnswers: 15,
          totalQuestions: 15,
          averageResponseTime: 800,
          mistakes: 2,
        },
        game: {
          id: "pattern_recognition",
          name: "Pattern Recognition",
          type: "pattern_recognition",
        },
      },
    ]

    // Add mock data to fill the table
    history.push(...mockGames.slice(0, 5 - history.length))
  }

  // Game icons
  const gameIcons: Record<string, JSX.Element> = {
    memory_match: <Puzzle className="h-5 w-5 text-primary" />,
    pattern_recognition: <Zap className="h-5 w-5 text-primary" />,
  }

  // Difficulty colors
  const difficultyColors: Record<string, string> = {
    easy: "text-green-500",
    medium: "text-blue-500",
    hard: "text-orange-500",
    adaptive: "text-purple-500",
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
        <div className="col-span-5">Game</div>
        <div className="col-span-2 text-center">Score</div>
        <div className="col-span-2 text-center">Accuracy</div>
        <div className="col-span-3 text-right">Played</div>
      </div>

      {history.map((session) => {
        // Calculate accuracy
        const accuracy = (session.metrics.correctAnswers / (session.metrics.totalQuestions || 1)) * 100

        return (
          <div key={session.id} className="grid grid-cols-12 gap-4 items-center py-2">
            <div className="col-span-5 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {gameIcons[session.game.type] || <div className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-medium">{session.game.name}</div>
                <div className={`text-xs ${difficultyColors[session.difficulty] || "text-muted-foreground"}`}>
                  {session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)}
                </div>
              </div>
            </div>

            <div className="col-span-2 text-center font-medium">{session.score.toLocaleString()}</div>

            <div className="col-span-2 text-center">
              <div className="font-medium">{Math.round(accuracy)}%</div>
              <div className="text-xs text-muted-foreground">
                {session.metrics.correctAnswers}/{session.metrics.totalQuestions}
              </div>
            </div>

            <div className="col-span-3 text-right text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(session.endTime), { addSuffix: true })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

