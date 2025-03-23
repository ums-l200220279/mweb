"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { motion } from "framer-motion"
import { Brain, Puzzle, Headphones, BookOpen, Zap, Clock, Award, TrendingUp, BarChart } from "lucide-react"

const games = [
  {
    id: 1,
    title: "Memory Match",
    description: "Match pairs of cards to train your visual memory",
    image: "/placeholder.svg?height=200&width=300",
    level: "Beginner",
    category: "Memory",
    popular: true,
    color: "bg-blue-500",
    icon: Puzzle,
    progress: 65,
  },
  {
    id: 2,
    title: "Word Connect",
    description: "Find hidden words from scrambled letters",
    image: "/placeholder.svg?height=200&width=300",
    level: "Intermediate",
    category: "Language",
    popular: true,
    color: "bg-purple-500",
    icon: BookOpen,
    progress: 42,
  },
  {
    id: 3,
    title: "Sound Match",
    description: "Train your auditory memory by matching sounds",
    image: "/placeholder.svg?height=200&width=300",
    level: "Beginner",
    category: "Memory",
    popular: false,
    color: "bg-amber-500",
    icon: Headphones,
    progress: 78,
  },
  {
    id: 4,
    title: "Speed Sort",
    description: "Sort items into categories as quickly as possible",
    image: "/placeholder.svg?height=200&width=300",
    level: "Advanced",
    category: "Processing Speed",
    popular: false,
    color: "bg-red-500",
    icon: Zap,
    progress: 30,
  },
  {
    id: 5,
    title: "Pattern Recognition",
    description: "Identify and complete visual patterns",
    image: "/placeholder.svg?height=200&width=300",
    level: "Intermediate",
    category: "Problem Solving",
    popular: true,
    color: "bg-green-500",
    icon: Brain,
    progress: 55,
  },
  {
    id: 6,
    title: "Reaction Time",
    description: "Test and improve your reaction speed",
    image: "/placeholder.svg?height=200&width=300",
    level: "Beginner",
    category: "Processing Speed",
    popular: false,
    color: "bg-orange-500",
    icon: Clock,
    progress: 60,
  },
]

const categories = [
  { name: "All", value: "all" },
  { name: "Memory", value: "Memory" },
  { name: "Language", value: "Language" },
  { name: "Problem Solving", value: "Problem Solving" },
  { name: "Processing Speed", value: "Processing Speed" },
]

const achievements = [
  { name: "Memory Master", description: "Complete 10 memory games", progress: 70, icon: Award },
  { name: "Word Wizard", description: "Find 100 words in Word Connect", progress: 45, icon: BookOpen },
  { name: "Speed Demon", description: "Achieve perfect score in Reaction Time", progress: 20, icon: Zap },
]

export default function BrainGymPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredGames = selectedCategory === "all" ? games : games.filter((game) => game.category === selectedCategory)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-turquoise-900">Brain Gym</h1>
          <p className="text-muted-foreground">Train your brain with fun, scientifically-designed exercises</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Today's Training</span>
            <div className="flex items-center gap-2">
              <Progress value={33} className="w-24 h-2" />
              <span className="text-sm font-medium">1/3</span>
            </div>
          </div>

          <Button className="bg-turquoise-500 hover:bg-turquoise-600">
            <Zap className="mr-2 h-4 w-4" />
            Daily Workout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Your Brain Performance</CardTitle>
            <CardDescription>Track your cognitive skills progress over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                { name: "Memory", score: 78, icon: Brain, color: "text-blue-500" },
                { name: "Attention", score: 65, icon: Zap, color: "text-purple-500" },
                { name: "Problem Solving", score: 82, icon: Puzzle, color: "text-green-500" },
                { name: "Processing Speed", score: 70, icon: Clock, color: "text-orange-500" },
              ].map((skill) => (
                <div key={skill.name} className="flex flex-col items-center justify-center p-4 rounded-lg border">
                  <skill.icon className={`h-8 w-8 ${skill.color} mb-2`} />
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-2xl font-bold">{skill.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/brain-gym/performance">
                <BarChart className="mr-2 h-4 w-4" />
                View Detailed Performance
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your progress towards brain training milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.name} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <achievement.icon className="h-4 w-4 text-turquoise-500" />
                    <span className="text-sm font-medium">{achievement.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={achievement.progress} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/brain-gym/achievements">
                <Award className="mr-2 h-4 w-4" />
                View All Achievements
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/brain-gym/favorites">My Favorites</Link>
            </Button>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-0">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md">
                      <div className="relative h-40 w-full">
                        <div className={`absolute inset-0 ${game.color} opacity-20`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <game.icon className={`h-16 w-16 ${game.color} text-white opacity-80`} />
                        </div>
                        {game.popular && <Badge className="absolute right-2 top-2 bg-turquoise-500">Popular</Badge>}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl">{game.title}</CardTitle>
                          <Badge variant="outline">{game.level}</Badge>
                        </div>
                        <CardDescription>{game.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Your progress</span>
                          <Progress value={game.progress} className="h-1 flex-1" />
                          <span className="text-xs font-medium">{game.progress}%</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full bg-turquoise-500 hover:bg-turquoise-600" asChild>
                          <Link href={`/dashboard/brain-gym/${game.id}`}>Play Now</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Training Plan</CardTitle>
          <CardDescription>Personalized exercises based on your cognitive profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="bg-blue-100 p-3 rounded-full">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Memory Training</h3>
                <p className="text-sm text-muted-foreground">Focus on improving short-term memory recall</p>
              </div>
              <Button size="sm">Start</Button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="bg-purple-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Attention Boost</h3>
                <p className="text-sm text-muted-foreground">Exercises to enhance focus and concentration</p>
              </div>
              <Button size="sm">Start</Button>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Cognitive Flexibility</h3>
                <p className="text-sm text-muted-foreground">Train your brain to switch between different concepts</p>
              </div>
              <Button size="sm">Start</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

