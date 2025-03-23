import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    activity: "Menyelesaikan Tes MMSE",
    time: "Hari ini, 10:30",
    score: "85/100",
  },
  {
    id: 2,
    activity: "Bermain Memory Match",
    time: "Hari ini, 09:15",
    score: "Level 5 selesai",
  },
  {
    id: 3,
    activity: "Bermain Word Connect",
    time: "Kemarin, 16:45",
    score: "20 kata ditemukan",
  },
  {
    id: 4,
    activity: "Menyelesaikan SoundMatch",
    time: "Kemarin, 14:20",
    score: "8/10 benar",
  },
]

export default function RecentActivities() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg" alt="Activity" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.activity}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
          <div className="text-sm font-medium">{activity.score}</div>
        </div>
      ))}
    </div>
  )
}

