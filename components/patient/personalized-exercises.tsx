"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Activity, Award, Clock, Dumbbell } from "lucide-react"
import type { RecommendationResult, ExerciseRecommendation } from "@/types/ml"

interface PersonalizedExercisesProps {
  patientId: string
}

export default function PersonalizedExercises({ patientId }: PersonalizedExercisesProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchRecommendations()
  }, [patientId])

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ml/recommend-exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId }),
      })

      if (!response.ok) {
        throw new Error("Failed to get exercise recommendations")
      }

      const data = await response.json()
      setRecommendations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "hard":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  const getExerciseIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "memory":
        return <Brain className="h-5 w-5" />
      case "attention":
        return <Activity className="h-5 w-5" />
      case "language":
        return <Award className="h-5 w-5" />
      case "physical":
        return <Dumbbell className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const filterExercises = (exercises: ExerciseRecommendation[]) => {
    if (activeTab === "all") return exercises
    return exercises.filter((ex) => ex.type.toLowerCase() === activeTab.toLowerCase())
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalized Exercises</CardTitle>
          <CardDescription>Loading your personalized exercise plan...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalized Exercises</CardTitle>
          <CardDescription>There was an error loading your exercises</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800">{error}</div>
          <Button onClick={fetchRecommendations} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!recommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalized Exercises</CardTitle>
          <CardDescription>Your AI-powered exercise recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-md bg-muted/20">
            <p className="text-muted-foreground">No recommendations available yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          Personalized Brain Training
        </CardTitle>
        <CardDescription>AI-recommended exercises based on your cognitive profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <div className="space-y-1 mr-4">
            <p className="text-sm font-medium">Focus Areas</p>
            <div className="flex flex-wrap gap-2">
              {recommendations.focusAreas.map((area, index) => (
                <Badge key={index} variant="default">
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {recommendations.avoidAreas.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Areas to Avoid</p>
              <div className="flex flex-wrap gap-2">
                {recommendations.avoidAreas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-red-500">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all">All Exercises</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="attention">Attention</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
            <TabsTrigger value="physical">Physical</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterExercises(recommendations.recommendedExercises).map((exercise, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      {getExerciseIcon(exercise.type)}
                      <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{exercise.name}</CardTitle>
                    <CardDescription className="text-xs">Targets: {exercise.targetDomain}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm mb-2">{exercise.expectedBenefit}</p>
                    <div className="text-xs text-muted-foreground">Recommended frequency: {exercise.frequency}</div>
                    <Progress value={Math.random() * 100} className="h-2 mt-2" />
                  </CardContent>
                  <div className="bg-muted p-4">
                    <Button variant="ghost" size="sm" className="w-full">
                      Start Exercise
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Complete Training Program</Button>
      </CardFooter>
    </Card>
  )
}

