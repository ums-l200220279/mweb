"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Brain, Activity, Award, Bell, FileText, Settings, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import PatientCognitiveChart from "@/components/patient/cognitive-chart"
import TodoList from "@/components/patient/todo-list"
import DailyRecommendations from "@/components/patient/daily-recommendations"
import { useToast } from "@/hooks/use-toast"

export default function PatientDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return null
  }

  const handleNotificationClick = () => {
    toast({
      title: "Notifications updated",
      description: "You have 3 unread notifications",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, John</h2>
          <p className="text-muted-foreground">Here's your cognitive health summary for today, Wednesday, March 14</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleNotificationClick}>
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/patient/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">66%</div>
              <Progress value={progress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">4 of 6 tasks completed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cognitive Score</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">26/30</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500 font-medium">↑ 2 points</span> from last assessment
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Mar 16</div>
              <p className="text-xs text-muted-foreground mt-2">Dr. Smith at 10:30 AM</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brain Training</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 Days</div>
              <p className="text-xs text-muted-foreground mt-2">Current streak</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Cognitive Health Trends</CardTitle>
                <CardDescription>Your cognitive scores over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <PatientCognitiveChart />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Your scheduled activities for today</CardDescription>
              </CardHeader>
              <CardContent>
                <TodoList />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/patient/tasks">View All Tasks</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Care Team</CardTitle>
                <CardDescription>Your healthcare providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Dr. Smith" />
                      <AvatarFallback>DS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Dr. Sarah Smith</p>
                      <p className="text-xs text-muted-foreground">Neurologist</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Primary
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Dr. Johnson" />
                      <AvatarFallback>RJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Dr. Robert Johnson</p>
                      <p className="text-xs text-muted-foreground">Psychiatrist</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Mary Williams" />
                      <AvatarFallback>MW</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Mary Williams</p>
                      <p className="text-xs text-muted-foreground">Caregiver</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Family
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Contact Care Team
                </Button>
              </CardFooter>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Daily Recommendations</CardTitle>
                <CardDescription>Personalized suggestions for your cognitive health</CardDescription>
              </CardHeader>
              <CardContent>
                <DailyRecommendations />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brain Training Activities</CardTitle>
              <CardDescription>Exercises to improve your cognitive function</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "Memory Match", description: "Card matching game", icon: Brain, progress: 75 },
                  { title: "Word Association", description: "Connect related words", icon: FileText, progress: 40 },
                  {
                    title: "Pattern Recognition",
                    description: "Identify visual patterns",
                    icon: Activity,
                    progress: 90,
                  },
                  { title: "Number Sequence", description: "Complete number patterns", icon: Clock, progress: 60 },
                  { title: "Spatial Reasoning", description: "3D visualization exercises", icon: Users, progress: 30 },
                  { title: "Attention Training", description: "Focus and concentration", icon: Bell, progress: 85 },
                ].map((activity, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <activity.icon className="h-5 w-5 text-primary" />
                        <Badge variant="outline">{activity.progress}%</Badge>
                      </div>
                      <CardTitle className="text-base mt-2">{activity.title}</CardTitle>
                      <CardDescription className="text-xs">{activity.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Progress value={activity.progress} className="h-2" />
                    </CardContent>
                    <div className="bg-muted p-4 pt-0">
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link
                          href={`/dashboard/patient/brain-training/${activity.title.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          Continue
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/dashboard/patient/brain-training">View All Training Exercises</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Assessment History</CardTitle>
              <CardDescription>Your MMSE test results over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                Detailed progress chart will appear here
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Domain Breakdown</CardTitle>
                <CardDescription>Cognitive performance by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { domain: "Memory", score: 8, maxScore: 10 },
                  { domain: "Attention", score: 7, maxScore: 8 },
                  { domain: "Language", score: 6, maxScore: 7 },
                  { domain: "Visuospatial", score: 5, maxScore: 5 },
                ].map((domain, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{domain.domain}</p>
                      <p className="text-sm font-medium">
                        {domain.score}/{domain.maxScore}
                      </p>
                    </div>
                    <Progress value={(domain.score / domain.maxScore) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Assessment Timeline</CardTitle>
                <CardDescription>History of your cognitive assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: "March 10, 2025", score: 26, change: "+2", doctor: "Dr. Smith" },
                    { date: "February 8, 2025", score: 24, change: "+1", doctor: "Dr. Smith" },
                    { date: "January 12, 2025", score: 23, change: "0", doctor: "Dr. Johnson" },
                    { date: "December 15, 2024", score: 23, change: "-1", doctor: "Dr. Smith" },
                  ].map((assessment, i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{assessment.date}</p>
                        <p className="text-xs text-muted-foreground">Administered by {assessment.doctor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{assessment.score}/30</p>
                        <p
                          className={`text-xs ${
                            assessment.change.startsWith("+")
                              ? "text-green-500"
                              : assessment.change === "0"
                                ? "text-muted-foreground"
                                : "text-red-500"
                          }`}
                        >
                          {assessment.change} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Complete History
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Health Plan</CardTitle>
              <CardDescription>AI-generated recommendations based on your cognitive profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Cognitive Exercise Recommendations</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { title: "Memory Training", description: "Focus on short-term memory exercises", priority: "High" },
                    { title: "Attention Practice", description: "Daily concentration activities", priority: "Medium" },
                    { title: "Language Skills", description: "Word games and vocabulary building", priority: "Medium" },
                    { title: "Problem Solving", description: "Logic puzzles and reasoning tasks", priority: "Low" },
                  ].map((rec, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full ${
                          rec.priority === "High"
                            ? "bg-red-500"
                            : rec.priority === "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                        <Badge variant="outline" className="mt-1">
                          {rec.priority} Priority
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Lifestyle Recommendations</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { title: "Physical Activity", description: "30 minutes of walking daily", priority: "High" },
                    {
                      title: "Sleep Hygiene",
                      description: "Maintain consistent 8-hour sleep schedule",
                      priority: "High",
                    },
                    {
                      title: "Social Engagement",
                      description: "Weekly social activities with friends/family",
                      priority: "Medium",
                    },
                    {
                      title: "Diet",
                      description: "Mediterranean diet rich in omega-3 fatty acids",
                      priority: "Medium",
                    },
                  ].map((rec, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full ${
                          rec.priority === "High"
                            ? "bg-red-500"
                            : rec.priority === "Medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                        <Badge variant="outline" className="mt-1">
                          {rec.priority} Priority
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Download Plan</Button>
              <Button>Share with Caregiver</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button size="lg" className="h-24" asChild>
          <Link href="/dashboard/patient/brain-training">
            <Brain className="mr-2 h-6 w-6" />
            Start Brain Training
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/patient/appointments">
            <Calendar className="mr-2 h-6 w-6" />
            Manage Appointments
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/patient/medications">
            <FileText className="mr-2 h-6 w-6" />
            Medication Schedule
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/patient/telehealth">
            <Users className="mr-2 h-6 w-6" />
            Start Telehealth Session
          </Link>
        </Button>
      </div>
    </div>
  )
}

