"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Trophy, Medal, UserPlus } from "lucide-react"
import type { JSX } from "react"

interface FriendEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  score: number
  game: string
  gameType: string
  isCurrentUser: boolean
  isOnline: boolean
}

export function FriendsLeaderboard() {
  const [friends, setFriends] = useState<FriendEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // In a real app, this would be an API call
        // const data = await getFriendsLeaderboard()

        // Mock data for demonstration
        const mockFriends: FriendEntry[] = [
          {
            rank: 1,
            userId: "current-user",
            name: "You",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1250,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: true,
            isOnline: true,
          },
          {
            rank: 2,
            userId: "friend1",
            name: "Sam Taylor",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1180,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
            isOnline: true,
          },
          {
            rank: 3,
            userId: "friend2",
            name: "Jordan Lee",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 1050,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
            isOnline: false,
          },
          {
            rank: 4,
            userId: "friend3",
            name: "Alex Chen",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 980,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
            isOnline: true,
          },
          {
            rank: 5,
            userId: "friend4",
            name: "Morgan Smith",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 920,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
            isOnline: false,
          },
          {
            rank: 6,
            userId: "friend5",
            name: "Casey Wilson",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 850,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
            isOnline: false,
          },
          {
            rank: 7,
            userId: "friend6",
            name: "Riley Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 780,
            game: "Memory Match",
            gameType: "memory_match",
            isCurrentUser: false,
            isOnline: true,
          },
          {
            rank: 8,
            userId: "friend7",
            name: "Taylor Garcia",
            avatar: "/placeholder.svg?height=40&width=40",
            score: 720,
            game: "Pattern Recognition",
            gameType: "pattern_recognition",
            isCurrentUser: false,
            isOnline: false,
          },
        ]

        setFriends(mockFriends)
      } catch (error) {
        console.error("Error loading friends leaderboard:", error)
        toast({
          title: "Error",
          description: "Failed to load friends leaderboard. Please try again.",
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
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-60 text-center">
        <p className="text-muted-foreground mb-2">No friends added yet.</p>
        <p className="text-sm text-muted-foreground mb-4">Add friends to see how you compare with them.</p>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Add Friends</span>
        </Button>
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
        <div className="col-span-5">Friend</div>
        <div className="col-span-3">Game</div>
        <div className="col-span-3 text-right">Score</div>
      </div>

      {friends.map((friend) => (
        <div
          key={friend.userId}
          className={`grid grid-cols-12 gap-4 items-center py-3 ${
            friend.isCurrentUser ? "bg-primary/5 rounded-lg" : ""
          }`}
        >
          <div className="col-span-1 text-center">
            {rankIcons[friend.rank] || (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {friend.rank}
              </div>
            )}
          </div>

          <div className="col-span-5 flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={friend.avatar} alt={friend.name} />
                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
              </Avatar>

              {friend.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>

            <div>
              <div className="font-medium flex items-center gap-2">
                {friend.name}
                {friend.isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    You
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground">{friend.isOnline ? "Online" : "Last seen recently"}</div>
            </div>
          </div>

          <div className="col-span-3">
            <Badge variant="outline" className={`${gameColors[friend.gameType] || ""}`}>
              {friend.game}
            </Badge>
          </div>

          <div className="col-span-3 text-right font-medium">{friend.score.toLocaleString()}</div>
        </div>
      ))}

      <div className="flex justify-center mt-6">
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Add More Friends</span>
        </Button>
      </div>
    </div>
  )
}

