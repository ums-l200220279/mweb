"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { ArrowUp, ArrowDown, Brain, Activity, Clock } from "lucide-react"
import Link from "next/link"

// Mock data for cognitive metrics
const memoryData = [
  { name: "Jan", score: 65 },
  { name: "Feb", score: 68 },
  { name: "Mar", score: 72 },
  { name: "Apr", score: 75 },
]

const attentionData = [
  { name: "Jan", score: 70 },
  { name: "Feb", score: 78 },
  { name: "Mar", score: 75 },
  { name: "Apr", score: 80 },
]

const processingSpeedData = [
  { name: "Jan", score: 60 },
  { name: "Feb", score: 65 },
  { name: "Mar", score: 70 },
  { name: "Apr", score: 75 },
]

const cognitiveScores = [
  {
    category: "Memory",
    metrics: [
      { name: "Short-term Memory", score: 75, change: 5, direction: "up" },
      { name: "Long-term Memory", score: 82, change: 2, direction: "up" },
      { name: "Working Memory", score: 68, change: 3, direction: "up" },
    ],
  },
  {
    category: "Attention",
    metrics: [
      { name: "Sustained Attention", score: 80, change: 8, direction: "up" },
      { name: "Divided Attention", score: 65, change: 3, direction: "down" },
      { name: "Selective Attention", score: 72, change: 5, direction: "up" },
    ],
  },
  {
    category: "Processing Speed",
    metrics: [
      { name: "Visual Processing", score: 78, change: 6, direction: "up" },
      { name: "Auditory Processing", score: 70, change: 5, direction: "up" },
      { name: "Response Time", score: 65, change: 2, direction: "down" },
    ],
  },
]

// Mock data for test history
const testHistory = [
  { date: "Apr 15, 2024", type: "MMSE Cognitive Test", score: "28/30", change: "+1" },
  { date: "Mar 30, 2024", type: "Memory Assessment", score: "85%", change: "+3%" },
  { date: "Mar 15, 2024", type: "MMSE Cognitive Test", score: "27/30", change: "0" },
  { date: "Feb 28, 2024", type: "Attention Test", score: "78%", change: "+5%" },
  { date: "Feb 15, 2024", type: "MMSE Cognitive Test", score: "27/30", change: "+2" },
]

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Report</h1>
          <p className="text-muted-foreground mt-1">Track your cognitive health improvements over time</p>
        </div>

        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
            <TabsTrigger value="history">Test History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cognitive Health Score</CardTitle>
                  <CardDescription>Overall assessment of your cognitive abilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                    <Progress value={76} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Needs Improvement</span>
                      <span>Good</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Memory</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">75%</span>
                          <div className="flex items-center text-green-600 text-xs">
                            <ArrowUp className="h-3 w-3" />
                            <span>3%</span>
                          </div>
                        </div>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Attention</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">80%</span>
                          <div className="flex items-center text-green-600 text-xs">
                            <ArrowUp className="h-3 w-3" />
                            <span>5%</span>
                          </div>
                        </div>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Processing Speed</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">72%</span>
                          <div className="flex items-center text-green-600 text-xs">
                            <ArrowUp className="h-3 w-3" />
                            <span>4%</span>
                          </div>
                        </div>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest completed exercises and assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-green-100">
                        <Brain className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Completed Memory Exercise</p>
                        <p className="text-xs text-muted-foreground">April 18, 2024 • Score: 85%</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-blue-100">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Finished Cognitive Assessment</p>
                        <p className="text-xs text-muted-foreground">April 15, 2024 • Score: 28/30</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-purple-100">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Read Article: "Boosting Brain Health"</p>
                        <p className="text-xs text-muted-foreground">April 12, 2024 • 10 min read</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Progress Over Time</CardTitle>
                <CardDescription>Tracking your cognitive metrics over the past 4 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" allowDuplicatedCategory={false} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line dataKey="score" data={memoryData} name="Memory" stroke="#8884d8" />
                      <Line dataKey="score" data={attentionData} name="Attention" stroke="#82ca9d" />
                      <Line dataKey="score" data={processingSpeedData} name="Processing Speed" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/progress/detailed">View Detailed Analytics</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="detailed">
            <div className="space-y-6">
              {cognitiveScores.map((category) => (
                <Card key={category.category}>
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                    <CardDescription>
                      Detailed breakdown of your {category.category.toLowerCase()} metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {category.metrics.map((metric) => (
                        <div key={metric.name}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{metric.score}%</span>
                              <div
                                className={`flex items-center ${metric.direction === "up" ? "text-green-600" : "text-red-600"} text-xs`}
                              >
                                {metric.direction === "up" ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowDown className="h-3 w-3" />
                                )}
                                <span>{metric.change}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                              <div
                                style={{ width: `${metric.score}%` }}
                                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                  category.category === "Memory"
                                    ? "bg-purple-500"
                                    : category.category === "Attention"
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                }`}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={category.metrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar
                            dataKey="score"
                            fill={
                              category.category === "Memory"
                                ? "#8884d8"
                                : category.category === "Attention"
                                  ? "#82ca9d"
                                  : "#ffc658"
                            }
                            name="Score"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Test History</CardTitle>
                <CardDescription>Record of all your completed assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Assessment Type</th>
                        <th className="text-left py-3 px-4 font-medium">Score</th>
                        <th className="text-left py-3 px-4 font-medium">Change</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testHistory.map((test, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4 text-sm">{test.date}</td>
                          <td className="py-3 px-4 text-sm">{test.type}</td>
                          <td className="py-3 px-4 text-sm font-medium">{test.score}</td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`${test.change.includes("+") ? "text-green-600" : test.change === "0" ? "text-gray-500" : "text-red-600"}`}
                            >
                              {test.change}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Button variant="ghost" size="sm">
                              View Details
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
        </Tabs>
      </div>
    </div>
  )
}

