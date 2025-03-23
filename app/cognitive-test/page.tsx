"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Calendar, FileText, AlertCircle, CheckCircle2, BarChart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock data for cognitive tests
const availableTests = [
  {
    id: 1,
    title: "MMSE Cognitive Test",
    description: "Comprehensive assessment of cognitive function",
    duration: "15-20 min",
    lastCompleted: "15 days ago",
    frequency: "Monthly",
    image: "/placeholder.svg?height=100&width=200",
    path: "/cognitive-test/mmse",
  },
  {
    id: 2,
    title: "Memory Assessment",
    description: "Evaluate short-term and working memory",
    duration: "10 min",
    lastCompleted: "45 days ago",
    frequency: "Monthly",
    image: "/placeholder.svg?height=100&width=200",
    path: "/cognitive-test/memory",
  },
  {
    id: 3,
    title: "Attention Test",
    description: "Measure sustained and divided attention",
    duration: "8 min",
    lastCompleted: "30 days ago",
    frequency: "Monthly",
    image: "/placeholder.svg?height=100&width=200",
    path: "/cognitive-test/attention",
  },
  {
    id: 4,
    title: "Processing Speed Test",
    description: "Assess information processing speed",
    duration: "12 min",
    lastCompleted: "60 days ago",
    frequency: "Quarterly",
    image: "/placeholder.svg?height=100&width=200",
    path: "/cognitive-test/processing-speed",
  },
]

// Mock data for test history
const testHistory = [
  {
    id: 1,
    title: "MMSE Cognitive Test",
    date: "Apr 15, 2024",
    score: "28/30",
    status: "Completed",
    path: "/cognitive-test/results/123",
  },
  {
    id: 2,
    title: "Memory Assessment",
    date: "Mar 30, 2024",
    score: "85%",
    status: "Completed",
    path: "/cognitive-test/results/124",
  },
  {
    id: 3,
    title: "MMSE Cognitive Test",
    date: "Mar 15, 2024",
    score: "27/30",
    status: "Completed",
    path: "/cognitive-test/results/125",
  },
  {
    id: 4,
    title: "Attention Test",
    date: "Feb 28, 2024",
    score: "78%",
    status: "Completed",
    path: "/cognitive-test/results/126",
  },
  {
    id: 5,
    title: "MMSE Cognitive Test",
    date: "Feb 15, 2024",
    score: "27/30",
    status: "Completed",
    path: "/cognitive-test/results/127",
  },
]

// Mock data for upcoming tests
const upcomingTests = [
  {
    id: 1,
    title: "MMSE Cognitive Test",
    dueDate: "May 15, 2024",
    status: "Due Soon",
    path: "/cognitive-test/mmse",
  },
  {
    id: 2,
    title: "Memory Assessment",
    dueDate: "Apr 30, 2024",
    status: "Overdue",
    path: "/cognitive-test/memory",
  },
]

export default function CognitiveTestPage() {
  const [activeTab, setActiveTab] = useState("available")

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cognitive Tests</h1>
          <p className="text-muted-foreground mt-1">Assess and monitor your cognitive health with standardized tests</p>
        </div>

        {/* Test Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Test Overview</CardTitle>
            <CardDescription>Your testing schedule and recent results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4">
                <div className="rounded-full p-3 bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Last Test</p>
                  <p className="text-2xl font-bold">15 days ago</p>
                  <p className="text-xs text-muted-foreground">MMSE Cognitive Test</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-full p-3 bg-green-100">
                  <BarChart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Latest Score</p>
                  <p className="text-2xl font-bold">28/30</p>
                  <p className="text-xs text-muted-foreground">+1 from previous test</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="rounded-full p-3 bg-amber-100">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Next Test Due</p>
                  <p className="text-2xl font-bold">15 days</p>
                  <p className="text-xs text-muted-foreground">MMSE Cognitive Test</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Categories */}
        <Tabs defaultValue="available" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="available">Available Tests</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <div className="grid gap-6 md:grid-cols-2">
              {availableTests.map((test) => (
                <Card key={test.id} className="overflow-hidden">
                  <div className="relative h-40">
                    <Image src={test.image || "/placeholder.svg"} alt={test.title} fill className="object-cover" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {test.frequency}
                      </Badge>
                    </div>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{test.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>Last completed: {test.lastCompleted}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={test.path}>Start Test</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Test History</CardTitle>
                <CardDescription>Record of your completed cognitive assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Test Name</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Score</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testHistory.map((test) => (
                        <tr key={test.id} className="border-b">
                          <td className="py-3 px-4 text-sm">{test.title}</td>
                          <td className="py-3 px-4 text-sm">{test.date}</td>
                          <td className="py-3 px-4 text-sm font-medium">{test.score}</td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center">
                              <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                              <span>{test.status}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={test.path}>View Results</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tests</CardTitle>
                <CardDescription>Tests that are due soon or overdue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingTests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${test.status === "Overdue" ? "bg-red-100" : "bg-amber-100"}`}
                        >
                          {test.status === "Overdue" ? (
                            <AlertCircle
                              className={`h-5 w-5 ${test.status === "Overdue" ? "text-red-600" : "text-amber-600"}`}
                            />
                          ) : (
                            <Clock
                              className={`h-5 w-5 ${test.status === "Overdue" ? "text-red-600" : "text-amber-600"}`}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{test.title}</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Due: {test.dueDate}</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant={test.status === "Overdue" ? "destructive" : "outline"}>{test.status}</Badge>
                      <Button size="sm" asChild>
                        <Link href={test.path}>Take Test</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/cognitive-test/schedule">View Test Schedule</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>About Cognitive Testing</CardTitle>
            <CardDescription>Understanding the importance of regular cognitive assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Why Regular Testing Matters</h3>
                <p className="text-sm text-muted-foreground">
                  Regular cognitive assessments help track changes in brain function over time, allowing for early
                  detection of potential issues. Early intervention is key to managing cognitive health effectively.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Establishes your cognitive baseline</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Detects subtle changes in cognitive function</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Helps guide personalized brain training</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Provides data to share with healthcare providers</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">How to Prepare for a Test</h3>
                <p className="text-sm text-muted-foreground">
                  To ensure accurate results, follow these guidelines before taking a cognitive assessment:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Get a good night's sleep before the test</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Take the test in a quiet environment free from distractions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Avoid alcohol or caffeine for at least 4 hours before testing</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <p className="text-sm">Have your glasses or hearing aids if you use them</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/resources/cognitive-testing">Learn More About Cognitive Testing</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

