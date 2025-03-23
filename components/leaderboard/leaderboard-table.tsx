"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Trophy, Medal, Star } from "lucide-react"
import type { JSX } from "react"

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  score: number
  game: string
  gameType: string
  isCurrentUser: boolean
}

export function LeaderboardTable() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // In a real app, this would be an API call
        // const data = await getLeaderboard()

        // Mock data for demonstration
        const mockLeaderboard: LeaderboardEntry[] = [
          {
            rank: 1,
            userId: "user1",
            name: "Alex Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1850,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
          },
          {
            rank: 2,
            userId: "user2",
            name: "Jamie Smith",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1720,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
          },
          {
            rank: 3,
            userId: "user3",
            name: "Taylor Wilson",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1680,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
          },
          {
            rank: 4,
            userId: "user4",
            name: "Morgan Lee",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1590,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
          },
          {
            rank: 5,
            userId: "user5",
            name: "Casey Brown",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1520,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
          },
          {
            rank: 6,
            userId: "user6",
            name: "Jordan Miller",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1480,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
          },
          {
            rank: 7,
            userId: "user7",
            name: "Riley Davis",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1420,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
          },
          {
            rank: 8,
            userId: "user8",
            name: "Avery Garcia",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1380,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
          },
          {
            rank: 9,
            userId: "user9",
            name: "Quinn Martinez",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1340,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
          },
          {
            rank: 10,
            userId: "user10",
            name: "Reese Thompson",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1290,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
          },
          {
            rank: 11,
            userId: "user11",
            name: "Dakota Clark",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1260,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
          },
          {
            rank: 12,
            userId: "current-user",
            name: "You",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1250,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: true,
          },
        ]

        setLeaderboard(mockLeaderboard)
      } catch (error) {
        console.error("Error loading leaderboard:", error)
        toast({
          title: "Error",
          description: "Failed to load leaderboard. Please try again.",
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
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-6 w-6 rounded-full" />
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
  if (leaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <p className="text-muted-foreground mb-2">No leaderboard data available.</p>
        <p className="text-sm text-muted-foreground">Play brain training games to appear on the leaderboard.</p>
      </div>
    )
  }

  // Rank icons
  const rankIcons: Record<number, JSX.Element> = {
    1: <Trophy className="h-5 w-5 text-yellow-500" />,
    2: <Medal className="h-5 w-5 text-slate-400" />,
    3: <Medal className="h-5 w-5 text-amber-700" />,
  }

  // Game colors
  const gameColors: Record<string, string> = {
    memory_match: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    pattern_recognition: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Player</div>
        <div className="col-span-3">Game</div>
        <div className="col-span-3 text-right">Score</div>
      </div>

      {leaderboard.map((entry) => (
        <div
          key={entry.userId}
          className={`grid grid-cols-12 gap-4 items-center py-3 ${
            entry.isCurrentUser ? "bg-primary/5 rounded-lg" : ""
          }`}
        >
          <div className="col-span-1 text-center">
            {rankIcons[entry.rank] || (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {entry.rank}
              </div>
            )}
          </div>

          <div className="col-span-5 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={entry.avatar} alt={entry.name} />
              <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
              <div className="font-medium flex items-center gap-2">
                {entry.name}
                {entry.isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    You
                  </Badge>
                )}
              </div>

              {entry.rank <= 10 && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>Top {entry.rank === 1 ? "Player" : `${entry.rank * 10}%`}</span>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-3">
            <Badge variant="outline" className={`${gameColors[entry.gameType] || ""}`}>
              {entry.game}
            </Badge>
          </div>

          <div className="col-span-3 text-right font-medium">{entry.score.toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

