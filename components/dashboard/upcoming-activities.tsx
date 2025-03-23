import { Card, CardContent } from "@/components/ui/card"
import { Brain, Dumbbell, Book } from "lucide-react"

const activities = [
  { name: "Memory Game", time: "10:00 AM", icon: Brain },
  { name: "Physical Exercise", time: "2:00 PM", icon: Dumbbell },
  { name: "Reading Session", time: "4:30 PM", icon: Book },
]

export default function UpcomingActivities() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <Card key={index}>
          <CardContent className="flex items-center p-4">
            <activity.icon className="h-8 w-8 text-turquoise-500 mr-4" />
            <div>
              <h3 className="font-semibold">{activity.name}</h3>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

