"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Trophy, Medal, Star, Award, Clock, Zap, Brain, Target } from "lucide-react"
import type { JSX } from "react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  earnedAt: string
}

export function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // In a real app, this would be an API call
        // const data = await getUserAchievements()

        // Mock data for demonstration
        const mockAchievements: Achievement[] = [
          {
            id: "1",
            name: "First Steps",
            description: "Complete your first brain training game",
            icon: "trophy",
            points: 50,
            tier: "bronze",
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          },
          {
            id: "2",
            name: "Memory Novice",
            description: "Score over 500 points in Memory Match",
            icon: "brain",
            points: 100,
            tier: "bronze",
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
          },
          {
            id: "3",
            name: "Pattern Spotter",
            description: "Complete 5 rounds in Pattern Recognition",
            icon: "target",
            points: 100,
            tier: "bronze",
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          },
          {
            id: "4",
            name: "Quick Thinker",
            description: "Average response time under 1.5 seconds",
            icon: "zap",
            points: 150,
            tier: "silver",
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          },
          {
            id: "5",
            name: "Dedicated Learner",
            description: "Train for 5 consecutive days",
            icon: "clock",
            points: 200,
            tier: "silver",
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
          },
          {
            id: "6",
            name: "Memory Master",
            description: "Score over 1000 points in Memory Match on hard difficulty",
            icon: "award",
            points: 300,
            tier: "gold",
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          },
          {
            id: "7",
            name: "Rising Star",
            description: "Improve your cognitive score by 10% in a month",
            icon: "star",
            points: 250,
            tier: "silver",
            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
        ]

        setAchievements(mockAchievements)
      } catch (error) {
        console.error("Error loading achievements:", error)
        toast({
          title: "Error",
          description: "Failed to load achievements. Please try again.",
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
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    )
  }

  // If no data, show a message
  if (achievements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <p className="text-muted-foreground mb-2">No achievements yet.</p>
        <p className="text-sm text-muted-foreground">Play brain training games to earn achievements and rewards.</p>
      </div>
    )
  }

  // Achievement icons
  const achievementIcons: Record<string, JSX.Element> = {
    trophy: <Trophy className="h-6 w-6" />,
    medal: <Medal className="h-6 w-6" />,
    star: <Star className="h-6 w-6" />,
    award: <Award className="h-6 w-6" />,
    clock: <Clock className="h-6 w-6" />,
    zap: <Zap className="h-6 w-6" />,
    brain: <Brain className="h-6 w-6" />,
    target: <Target className="h-6 w-6" />,
  }

  // Tier colors
  const tierColors: Record<string, string> = {
    bronze: "bg-amber-700",
    silver: "bg-slate-400",
    gold: "bg-yellow-500",
    platinum: "bg-indigo-300",
  }

  return (
    <div className="space-y-6">
      {achievements.map((achievement) => (
        <div key={achievement.id} className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full ${tierColors[achievement.tier]} flex items-center justify-center`}
          >
            {achievementIcons[achievement.icon] || <Trophy className="h-6 w-6" />}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{achievement.name}</h3>
              <Badge variant="outline" className="capitalize">
                {achievement.tier}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(achievement.earnedAt), { addSuffix: true })}
              </span>

              <span className="text-xs font-medium">+{achievement.points} points</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

