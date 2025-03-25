import { Activity, Brain, Zap, Trophy, Clock } from "lucide-react"

export function RecentActivities() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
          <div className={`p-2 rounded-full bg-${activity.color}/10`}>{activity.icon}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">{activity.title}</h3>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
            {activity.achievement && (
              <div className="flex items-center gap-2 mt-2 bg-muted/50 px-2 py-1 rounded-md w-fit">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium">{activity.achievement}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const activities = [
  {
    title: "Completed Divided Attention Game",
    description: "Score: 850 points | Accuracy: 92%",
    time: "Today, 10:30 AM",
    color: "purple",
    icon: <Brain className="h-4 w-4 text-purple-500" />,
    achievement: "New personal best",
  },
  {
    title: "Completed Reaction Time Challenge",
    description: "Average reaction time: 245ms",
    time: "Yesterday, 3:15 PM",
    color: "orange",
    icon: <Zap className="h-4 w-4 text-orange-500" />,
  },
  {
    title: "Completed Working Memory Exercise",
    description: "Remembered 7 items in sequence",
    time: "Yesterday, 11:45 AM",
    color: "green",
    icon: <Activity className="h-4 w-4 text-green-500" />,
  },
  {
    title: "Completed Daily Training Session",
    description: "3 games | 15 minutes total",
    time: "2 days ago, 9:20 AM",
    color: "blue",
    icon: <Clock className="h-4 w-4 text-blue-500" />,
    achievement: "7-day streak",
  },
]

