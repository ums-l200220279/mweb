"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Calendar, FileText, Activity, Award } from "lucide-react"
import Link from "next/link"
import CognitiveScoreChart from "@/components/patient/cognitive-score-chart"
import TodoList from "@/components/patient/todo-list"
import DailyRecommendations from "@/components/patient/daily-recommendations"

export default function PatientDashboard() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <div className="space-y-6">
      {showWelcome && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, John!</CardTitle>
            <CardDescription>Here's your personalized health summary for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowWelcome(false)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-blue-500" />
              Cognitive Progress
            </CardTitle>
            <CardDescription>Your MMSE score and cognitive changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <CognitiveScoreChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-green-500" />
              Today's Goals
            </CardTitle>
            <CardDescription>Your tasks and activities for today</CardDescription>
          </CardHeader>
          <CardContent>
            <TodoList />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-yellow-500" />
            Daily AI Recommendations
          </CardTitle>
          <CardDescription>Personalized suggestions for your cognitive health</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyRecommendations />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Button size="lg" className="h-24" asChild>
          <Link href="/patient/brain-training">
            <Brain className="mr-2 h-6 w-6" />
            Start Brain Training
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/patient/activity-calendar">
            <Calendar className="mr-2 h-6 w-6" />
            View Activity Calendar
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/patient/health-history">
            <FileText className="mr-2 h-6 w-6" />
            Check Health History
          </Link>
        </Button>
      </div>
    </div>
  )
}

