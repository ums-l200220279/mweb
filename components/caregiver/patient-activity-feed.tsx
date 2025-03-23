import { Activity, Brain, Calendar, Clock, Pill } from "lucide-react"

const activities = [
  {
    id: 1,
    patient: "John Doe",
    activity: "Completed Memory Exercise",
    time: "10 minutes ago",
    icon: <Brain className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    patient: "Mary Smith",
    activity: "Took Medication",
    time: "1 hour ago",
    icon: <Pill className="h-4 w-4" />,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 3,
    patient: "John Doe",
    activity: "Missed Medication",
    time: "2 hours ago",
    icon: <Pill className="h-4 w-4" />,
    color: "bg-red-100 text-red-600",
  },
  {
    id: 4,
    patient: "Robert Johnson",
    activity: "Appointment with Dr. Williams",
    time: "Yesterday, 2:00 PM",
    icon: <Calendar className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 5,
    patient: "Mary Smith",
    activity: "Completed Daily Assessment",
    time: "Yesterday, 10:30 AM",
    icon: <Activity className="h-4 w-4" />,
    color: "bg-turquoise-100 text-turquoise-600",
  },
]

export default function PatientActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className={`${activity.color} p-2 rounded-full`}>{activity.icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.patient}</p>
            <p className="text-sm text-slate-500">{activity.activity}</p>
            <div className="flex items-center mt-1 text-xs text-slate-400">
              <Clock className="h-3 w-3 mr-1" />
              {activity.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

