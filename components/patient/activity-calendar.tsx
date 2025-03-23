"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Pill, FootprintsIcon as Walk, Apple } from "lucide-react"

const activities = [
  { date: new Date(2024, 4, 15), type: "exercise", title: "Morning Walk", icon: Walk, color: "bg-green-500" },
  { date: new Date(2024, 4, 15), type: "medication", title: "Take Medication", icon: Pill, color: "bg-blue-500" },
  { date: new Date(2024, 4, 15), type: "brain-training", title: "Memory Game", icon: Brain, color: "bg-purple-500" },
  { date: new Date(2024, 4, 16), type: "nutrition", title: "Healthy Breakfast", icon: Apple, color: "bg-yellow-500" },
  // Add more activities as needed
]

export default function ActivityCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const selectedActivities = activities.filter(
    (activity) => activity.date.toDateString() === selectedDate?.toDateString(),
  )

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Activity Calendar</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View and manage your daily activities</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activities for {selectedDate?.toDateString()}</CardTitle>
            <CardDescription>Your scheduled activities for the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedActivities.length > 0 ? (
              <ul className="space-y-4">
                {selectedActivities.map((activity, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${activity.color}`}>
                      <activity.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No activities scheduled for this date.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

