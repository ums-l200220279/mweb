import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video } from "lucide-react"
import Link from "next/link"

const appointments = [
  {
    id: 1,
    patientName: "Alice Brown",
    patientId: "P-12350",
    patientAvatar: "/placeholder.svg",
    appointmentType: "MMSE Assessment",
    date: "Tomorrow",
    time: "10:00 AM",
    isVideo: true,
  },
  {
    id: 2,
    patientName: "David Miller",
    patientId: "P-12351",
    patientAvatar: "/placeholder.svg",
    appointmentType: "Follow-up Consultation",
    date: "Tomorrow",
    time: "2:30 PM",
    isVideo: true,
  },
  {
    id: 3,
    patientName: "Jennifer Lee",
    patientId: "P-12352",
    patientAvatar: "/placeholder.svg",
    appointmentType: "Initial Assessment",
    date: "May 15, 2024",
    time: "11:15 AM",
    isVideo: false,
  },
  {
    id: 4,
    patientName: "Thomas Wilson",
    patientId: "P-12353",
    patientAvatar: "/placeholder.svg",
    appointmentType: "Cognitive Evaluation",
    date: "May 16, 2024",
    time: "9:45 AM",
    isVideo: true,
  },
]

export default function UpcomingAppointments() {
  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={appointment.patientAvatar} alt={appointment.patientName} />
              <AvatarFallback>{appointment.patientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{appointment.patientName}</h4>
                <span className="text-xs text-muted-foreground">({appointment.patientId})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{appointment.appointmentType}</span>
                {appointment.isVideo && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <Video className="mr-1 h-3 w-3" />
                      Video Call
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center justify-end text-sm">
                <Calendar className="mr-1 h-3 w-3" />
                <span>{appointment.date}</span>
              </div>
              <div className="flex items-center justify-end text-sm text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>{appointment.time}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/doctor/appointments/${appointment.id}`}>
                {appointment.isVideo ? "Join Call" : "View Details"}
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

