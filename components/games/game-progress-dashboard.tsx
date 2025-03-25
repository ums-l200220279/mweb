"use client"

import { useState } from "react"
import { Calendar, BarChart3, LineChart, Brain, ArrowUp, ArrowDown, Minus, Clock, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// This would typically come from your API
const mockGameData = {
  weeklyActivity: [65, 59, 80, 81, 56, 55, 40],
  monthlyActivity: [
    65, 59, 80, 81, 56, 55, 40, 55, 60, 70, 45, 90, 65, 59, 80, 81, 56, 55, 40, 55, 60, 70, 45, 90, 65, 59, 80, 81, 56,
    55,
  ],
  cognitiveScores: {
    memory: [
      { date: "2023-01-01", score: 65 },
      { date: "2023-01-08", score: 68 },
      { date: "2023-01-15", score: 72 },
      { date: "2023-01-22", score: 75 },
      { date: "2023-01-29", score: 71 },
      { date: "2023-02-05", score: 78 },
      { date: "2023-02-12", score: 82 },
      { date: "2023-02-19", score: 85 },
    ],
    attention: [
      { date: "2023-01-01", score: 55 },
      { date: "2023-01-08", score: 58 },
      { date: "2023-01-15", score: 62 },
      { date: "2023-01-22", score: 65 },
      { date: "2023-01-29", score: 68 },
      { date: "2023-02-05", score: 72 },
      { date: "2023-02-12", score: 75 },
      { date: "2023-02-19", score: 78 },
    ],
    processing: [
      { date: "2023-01-01", score: 70 },
      { date: "2023-01-08", score: 72 },
      { date: "2023-01-15", score: 75 },
      { date: "2023-01-22", score: 73 },
      { date: "2023-01-29", score: 78 },
      { date: "2023-02-05", score: 80 },
      { date: "2023-02-12", score: 83 },
      { date: "2023-02-19", score: 85 },
    ],
    executive: [
      { date: "2023-01-01", score: 60 },
      { date: "2023-01-08", score: 63 },
      { date: "2023-01-15", score: 65 },
      { date: "2023-01-22", score: 68 },
      { date: "2023-01-29", score: 70 },
      { date: "2023-02-05", score: 73 },
      { date: "2023-02-12", score: 75 },
      { date: "2023-02-19", score: 78 },
    ],
    language: [
      { date: "2023-01-01", score: 75 },
      { date: "2023-01-08", score: 77 },
      { date: "2023-01-15", score: 80 },
      { date: "2023-01-22", score: 82 },
      { date: "2023-01-29", score: 85 },
      { date: "2023-02-05", score: 83 },
      { date: "2023-02-12", score: 87 },
      { date: "2023-02-19", score: 90 },
    ],
  },
  recentGames: [
    {
      id: 1,
      name: "Memory Match",
      date: "2023-02-19",
      score: 85,
      previousScore: 82,
      duration: "8m 45s",
      improvement: "up",
    },
    {
      id: 2,
      name: "Word Recall",
      date: "2023-02-18",
      score: 72,
      previousScore: 75,
      duration: "12m 20s",
      improvement: "down",
    },
    {
      id: 3,
      name: "Attention Focus",
      date: "2023-02-17",
      score: 68,
      previousScore: 68,
      duration: "10m 15s",
      improvement: "same",
    },
    {
      id: 4,
      name: "Memory Match",
      date: "2023-02-16",
      score: 82,
      previousScore: 78,
      duration: "9m 10s",
      improvement: "up",
    },
    {
      id: 5,
      name: "Speed Processing",
      date: "2023-02-15",
      score: 90,
      previousScore: 85,
      duration: "7m 30s",
      improvement: "up",
    },
  ],
  achievements: [
    { id: 1, name: "Memory Master", description: "Score 90+ in Memory Match", completed: true, date: "2023-02-10" },
    {
      id: 2,
      name: "Attention Ace",
      description: "Complete 10 Attention Focus sessions",
      completed: false,
      progress: 7,
    },
    {
      id: 3,
      name: "Word Wizard",
      description: "Recall 50 words in a single session",
      completed: true,
      date: "2023-02-05",
    },
    {
      id: 4,
      name: "Consistent Player",
      description: "Play games for 7 consecutive days",
      completed: true,
      date: "2023-01-28",
    },
    {
      id: 5,
      name: "Processing Pro",
      description: "Complete Speed Processing in under 5 minutes",
      completed: false,
      progress: "5m 30s",
    },
  ],
}

export default function GameProgressDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [timeframe, setTimeframe] = useState("week")
  const [cognitiveArea, setCognitiveArea] = useState("memory")

  // This would be replaced with actual chart components in a real implementation
  const renderChart = (type: string, data: any) => {
    return (
      <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <LineChart className="h-10 w-10 text-indigo-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Chart visualization would render here</p>
          <p className="text-xs text-gray-400 mt-1">Using real chart library (Recharts/Chart.js)</p>
        </div>
      </div>
    )
  }

  const getImprovementIcon = (improvement: string) => {
    switch (improvement) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Game Progress Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your cognitive improvement over time</p>
        </div>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Select defaultValue="week" onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Game Sessions</CardTitle>
            <CardDescription>Total sessions this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">24</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  15% from last week
                </p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Score</CardTitle>
            <CardDescription>Across all cognitive areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">78.5</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  5.2% improvement
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Time Spent</CardTitle>
            <CardDescription>Total training time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">3h 45m</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  20% from last week
                </p>
              </div>
              <Clock className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cognitive Performance</CardTitle>
              <Select defaultValue={cognitiveArea} onValueChange={setCognitiveArea}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="memory">Memory</SelectItem>
                  <SelectItem value="attention">Attention</SelectItem>
                  <SelectItem value="processing">Processing Speed</SelectItem>
                  <SelectItem value="executive">Executive Function</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {renderChart(
              "line",
              mockGameData.cognitiveScores[cognitiveArea as keyof typeof mockGameData.cognitiveScores],
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64">
              <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-16 w-16 text-indigo-500" />
                </div>
                <div className="absolute inset-0 border-8 border-indigo-100 rounded-full"></div>
                <div
                  className="absolute inset-0 border-8 border-indigo-500 rounded-full"
                  style={{
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    clip: "rect(0px, 128px, 128px, 64px)",
                  }}
                ></div>
              </div>
              <p className="text-3xl font-bold">12 Days</p>
              <p className="text-gray-500 text-sm mt-1">Current streak</p>
              <p className="text-indigo-600 text-sm mt-4 font-medium">2 days until next achievement!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Game Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGameData.recentGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{game.name}</p>
                    <p className="text-sm text-gray-500">
                      {game.date} • {game.duration}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <p className="font-bold">{game.score}</p>
                      <div className="flex items-center text-xs">
                        {getImprovementIcon(game.improvement)}
                        <span className="ml-1">{game.previousScore}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGameData.achievements.map((achievement) => (
                <div key={achievement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                    {achievement.completed ? (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Completed</div>
                    ) : (
                      <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">In Progress</div>
                    )}
                  </div>

                  {achievement.completed ? (
                    <p className="text-xs text-gray-500 mt-2">Achieved on {achievement.date}</p>
                  ) : (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{
                          width:
                            typeof achievement.progress === "number" ? `${(achievement.progress / 10) * 100}%` : "50%",
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

