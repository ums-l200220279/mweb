"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Brain, Clock, Grid, Puzzle, Zap, BarChart3, Calendar, Trophy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface GameCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  timeEstimate: string
  completionRate?: number
  lastPlayed?: string
  cognitive: {
    memory: number
    attention: number
    processing: number
    executive: number
    language: number
  }
  status: "available" | "coming-soon" | "locked"
}

export default function BrainTrainingHub() {
  const [filter, setFilter] = useState("all")

  const games: GameCard[] = [
    {
      id: "memory-match",
      title: "Memory Match",
      description: "Test and improve your visual memory by matching pairs of cards",
      icon: <Grid className="h-8 w-8 text-indigo-500" />,
      category: "memory",
      difficulty: "beginner",
      timeEstimate: "5-10 min",
      completionRate: 75,
      lastPlayed: "2 days ago",
      cognitive: {
        memory: 80,
        attention: 60,
        processing: 40,
        executive: 30,
        language: 10,
      },
      status: "available",
    },
    {
      id: "word-recall",
      title: "Word Recall",
      description: "Enhance verbal memory by recalling words from a previously shown list",
      icon: <Puzzle className="h-8 w-8 text-emerald-500" />,
      category: "memory",
      difficulty: "intermediate",
      timeEstimate: "8-12 min",
      completionRate: 45,
      lastPlayed: "1 week ago",
      cognitive: {
        memory: 90,
        attention: 50,
        processing: 30,
        executive: 40,
        language: 70,
      },
      status: "available",
    },
    {
      id: "attention-focus",
      title: "Attention Focus",
      description: "Train sustained attention by identifying specific patterns among distractions",
      icon: <Zap className="h-8 w-8 text-amber-500" />,
      category: "attention",
      difficulty: "intermediate",
      timeEstimate: "10-15 min",
      cognitive: {
        memory: 30,
        attention: 90,
        processing: 60,
        executive: 50,
        language: 20,
      },
      status: "available",
    },
    {
      id: "number-sequence",
      title: "Number Sequence",
      description: "Improve working memory and pattern recognition with number sequences",
      icon: <Brain className="h-8 w-8 text-blue-500" />,
      category: "executive",
      difficulty: "advanced",
      timeEstimate: "12-15 min",
      cognitive: {
        memory: 60,
        attention: 70,
        processing: 50,
        executive: 85,
        language: 10,
      },
      status: "coming-soon",
    },
    {
      id: "speed-processing",
      title: "Speed Processing",
      description: "Enhance cognitive processing speed with timed visual identification tasks",
      icon: <Clock className="h-8 w-8 text-rose-500" />,
      category: "processing",
      difficulty: "beginner",
      timeEstimate: "5-8 min",
      cognitive: {
        memory: 20,
        attention: 60,
        processing: 90,
        executive: 30,
        language: 10,
      },
      status: "coming-soon",
    },
    {
      id: "verbal-fluency",
      title: "Verbal Fluency",
      description: "Improve language skills by generating words based on specific criteria",
      icon: <Puzzle className="h-8 w-8 text-purple-500" />,
      category: "language",
      difficulty: "intermediate",
      timeEstimate: "8-10 min",
      cognitive: {
        memory: 40,
        attention: 50,
        processing: 30,
        executive: 60,
        language: 90,
      },
      status: "locked",
    },
  ]

  const filteredGames =
    filter === "all" ? games : games.filter((game) => game.category === filter || game.status === filter)

  const categories = [
    { id: "all", label: "All Games" },
    { id: "memory", label: "Memory" },
    { id: "attention", label: "Attention" },
    { id: "processing", label: "Processing" },
    { id: "executive", label: "Executive Function" },
    { id: "language", label: "Language" },
    { id: "available", label: "Available" },
    { id: "coming-soon", label: "Coming Soon" },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-amber-100 text-amber-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Available</Badge>
      case "coming-soon":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Coming Soon</Badge>
      case "locked":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Locked</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brain Training Games</h1>
          <p className="text-gray-600 mt-2">Engage in scientifically-designed games to improve cognitive function</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/games/progress">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progress
            </Button>
          </Link>
          <Link href="/games/schedule">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
          </Link>
          <Link href="/games/achievements">
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Trophy className="h-4 w-4" />
              Achievements
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              onClick={() => setFilter(category.id)}
              className="text-sm"
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <Card key={game.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-gray-50">{game.icon}</div>
                {getStatusBadge(game.status)}
              </div>
              <CardTitle className="mt-2">{game.title}</CardTitle>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                  </span>
                  <span className="text-gray-500">{game.timeEstimate}</span>
                </div>

                {game.completionRate && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completion</span>
                      <span className="font-medium">{game.completionRate}%</span>
                    </div>
                    <Progress value={game.completionRate} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-5 gap-1">
                  {Object.entries(game.cognitive).map(([key, value]) => (
                    <div key={key} className="flex flex-col items-center">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${value}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{key.substring(0, 3)}</span>
                    </div>
                  ))}
                </div>

                {game.lastPlayed && <div className="text-xs text-gray-500">Last played: {game.lastPlayed}</div>}
              </div>
            </CardContent>
            <CardFooter>
              {game.status === "available" ? (
                <Link href={`/games/${game.id}`} className="w-full">
                  <Button className="w-full">
                    Play Game
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : game.status === "coming-soon" ? (
                <Button disabled className="w-full opacity-70">
                  Coming Soon
                </Button>
              ) : (
                <Button disabled className="w-full opacity-70">
                  Locked
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

