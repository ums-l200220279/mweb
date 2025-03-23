"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, Dumbbell, Clock, Trophy, Zap, BarChart, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock data for brain exercises
const memoryExercises = [
  {
    id: 1,
    title: "Pattern Recognition",
    description: "Identify and remember visual patterns",
    difficulty: "Medium",
    duration: "5 min",
    category: "Memory",
    completed: true,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/pattern-recognition",
  },
  {
    id: 2,
    title: "Word Recall",
    description: "Remember and recall lists of words",
    difficulty: "Easy",
    duration: "3 min",
    category: "Memory",
    completed: false,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/word-recall",
  },
  {
    id: 3,
    title: "Spatial Memory",
    description: "Remember the location of objects",
    difficulty: "Hard",
    duration: "7 min",
    category: "Memory",
    completed: false,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/spatial-memory",
  },
]

const attentionExercises = [
  {
    id: 4,
    title: "Concentration Challenge",
    description: "Focus on specific elements while ignoring distractions",
    difficulty: "Medium",
    duration: "4 min",
    category: "Attention",
    completed: true,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/concentration",
  },
  {
    id: 5,
    title: "Divided Attention",
    description: "Perform multiple tasks simultaneously",
    difficulty: "Hard",
    duration: "6 min",
    category: "Attention",
    completed: false,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/divided-attention",
  },
  {
    id: 6,
    title: "Visual Search",
    description: "Find specific items in a complex visual field",
    difficulty: "Medium",
    duration: "5 min",
    category: "Attention",
    completed: false,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/visual-search",
  },
]

const processingExercises = [
  {
    id: 7,
    title: "Speed Processing",
    description: "Respond quickly to visual stimuli",
    difficulty: "Medium",
    duration: "4 min",
    category: "Processing",
    completed: true,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/speed-processing",
  },
  {
    id: 8,
    title: "Number Sequencing",
    description: "Identify and complete number patterns quickly",
    difficulty: "Easy",
    duration: "3 min",
    category: "Processing",
    completed: false,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/number-sequencing",
  },
  {
    id: 9,
    title: "Reaction Time",
    description: "Test and improve your reaction speed",
    difficulty: "Medium",
    duration: "5 min",
    category: "Processing",
    completed: false,
    image: "/placeholder.svg?height=100&width=200",
    path: "/brain-training/reaction-time",
  },
]

// Mock data for achievements
const achievements = [
  {
    id: 1,
    title: "Memory Master",
    description: "Complete 10 memory exercises",
    progress: 60,
    icon: Brain,
  },
  {
    id: 2,
    title: "Focus Champion",
    description: "Achieve 90% accuracy in attention exercises",
    progress: 75,
    icon: Zap,
  },
  {
    id: 3,
    title: "Speed Demon",
    description: "Complete 5 processing speed exercises in under 20 minutes",
    progress: 40,
    icon: Clock,
  },
  {
    id: 4,
    title: "Consistent Trainer",
    description: "Complete exercises for 7 consecutive days",
    progress: 85,
    icon: Dumbbell,
  },
]

export default function BrainGymPage() {
  const [activeTab, setActiveTab] = useState("recommended")

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brain Gym</h1>
            <p className="text-muted-foreground mt-1">Exercise your brain with personalized cognitive training</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-medium">Level 4</span>
            </div>
            <Button asChild>
              <Link href="/brain-gym/daily-challenge">Daily Challenge</Link>
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Training Progress</CardTitle>
            <CardDescription>Weekly activity and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Weekly Goal</span>
                  <span className="text-sm font-medium">5/7 days</span>
                </div>
                <Progress value={71} className="h-2" />
                <p className="text-xs text-muted-foreground">2 more days to reach your weekly goal</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Exercises Completed</span>
                  <span className="text-sm font-medium">12/20</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-muted-foreground">8 more exercises to complete this week</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Score</span>
                  <span className="text-sm font-medium">82%</span>
                </div>
                <Progress value={82} className="h-2" />
                <p className="text-xs text-muted-foreground">+5% improvement from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Categories */}
        <Tabs defaultValue="recommended" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="attention">Attention</TabsTrigger>
            <TabsTrigger value="processing">Processing Speed</TabsTrigger>
          </TabsList>

          <TabsContent value="recommended">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...memoryExercises, ...attentionExercises, ...processingExercises]
                .sort(() => 0.5 - Math.random())
                .slice(0, 6)
                .map((exercise) => (
                  <Card key={exercise.id} className="overflow-hidden">
                    <div className="relative h-40">
                      <Image
                        src={exercise.image || "/placeholder.svg"}
                        alt={exercise.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={exercise.completed ? "secondary" : "outline"}>
                          {exercise.completed ? "Completed" : exercise.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{exercise.title}</CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {exercise.category}
                        </Badge>
                      </div>
                      <CardDescription>{exercise.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{exercise.duration}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" asChild>
                        <Link href={exercise.path}>{exercise.completed ? "Try Again" : "Start Exercise"}</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="memory">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {memoryExercises.map((exercise) => (
                <Card key={exercise.id} className="overflow-hidden">
                  <div className="relative h-40">
                    <Image
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={exercise.completed ? "secondary" : "outline"}>
                        {exercise.completed ? "Completed" : exercise.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {exercise.category}
                      </Badge>
                    </div>
                    <CardDescription>{exercise.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{exercise.duration}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={exercise.path}>{exercise.completed ? "Try Again" : "Start Exercise"}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attention">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {attentionExercises.map((exercise) => (
                <Card key={exercise.id} className="overflow-hidden">
                  <div className="relative h-40">
                    <Image
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={exercise.completed ? "secondary" : "outline"}>
                        {exercise.completed ? "Completed" : exercise.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {exercise.category}
                      </Badge>
                    </div>
                    <CardDescription>{exercise.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{exercise.duration}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={exercise.path}>{exercise.completed ? "Try Again" : "Start Exercise"}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="processing">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {processingExercises.map((exercise) => (
                <Card key={exercise.id} className="overflow-hidden">
                  <div className="relative h-40">
                    <Image
                      src={exercise.image || "/placeholder.svg"}
                      alt={exercise.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={exercise.completed ? "secondary" : "outline"}>
                        {exercise.completed ? "Completed" : exercise.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {exercise.category}
                      </Badge>
                    </div>
                    <CardDescription>{exercise.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{exercise.duration}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={exercise.path}>{exercise.completed ? "Try Again" : "Start Exercise"}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Achievements Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Track your progress and unlock rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-4">
                    <div className="rounded-full p-2 bg-primary/10">
                      <achievement.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{achievement.title}</p>
                        <span className="text-sm font-medium">{achievement.progress}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      <Progress value={achievement.progress} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/brain-gym/achievements">View All Achievements</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Resources</CardTitle>
              <CardDescription>Learn more about cognitive training</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full p-2 bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">The Science Behind Brain Training</p>
                    <p className="text-xs text-muted-foreground">Learn how cognitive exercises improve brain health</p>
                    <Button variant="link" className="h-auto p-0 text-sm" asChild>
                      <Link href="/resources/brain-training-science">Read Article</Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-full p-2 bg-green-100">
                    <BarChart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tracking Your Progress</p>
                    <p className="text-xs text-muted-foreground">How to interpret your cognitive assessment results</p>
                    <Button variant="link" className="h-auto p-0 text-sm" asChild>
                      <Link href="/resources/tracking-progress">Read Article</Link>
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-full p-2 bg-purple-100">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Creating a Brain Training Routine</p>
                    <p className="text-xs text-muted-foreground">
                      Tips for establishing an effective cognitive exercise habit
                    </p>
                    <Button variant="link" className="h-auto p-0 text-sm" asChild>
                      <Link href="/resources/training-routine">Read Article</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/resources">Browse All Resources</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

