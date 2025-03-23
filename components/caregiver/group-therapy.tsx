import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, Users, Video } from "lucide-react"

const therapySessions = [
  {
    id: 1,
    title: "Coping with Caregiver Stress",
    facilitator: "Dr. Emily Roberts",
    date: "March 15, 2025",
    time: "2:00 PM - 3:30 PM",
    participants: 8,
    maxParticipants: 12,
    description:
      "This session focuses on strategies to manage stress and prevent burnout while caring for loved ones with dementia.",
  },
  {
    id: 2,
    title: "Understanding Behavioral Changes",
    facilitator: "Dr. James Wilson",
    date: "March 18, 2025",
    time: "10:00 AM - 11:30 AM",
    participants: 6,
    maxParticipants: 10,
    description: "Learn about common behavioral changes in dementia patients and effective response strategies.",
  },
  {
    id: 3,
    title: "Communication Techniques",
    facilitator: "Sarah Thompson, LCSW",
    date: "March 20, 2025",
    time: "3:00 PM - 4:30 PM",
    participants: 9,
    maxParticipants: 12,
    description:
      "Explore effective communication techniques to maintain connection with your loved one as their cognitive abilities change.",
  },
]

export default function GroupTherapy() {
  return (
    <div className="space-y-6">
      {therapySessions.map((session) => (
        <Card key={session.id} className="p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h3 className="font-medium text-lg">{session.title}</h3>
              <p className="text-sm text-slate-500">Facilitated by {session.facilitator}</p>
              <p className="mt-2 text-sm">{session.description}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-slate-500">
                  <Calendar className="mr-1 h-4 w-4" />
                  {session.date}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="mr-1 h-4 w-4" />
                  {session.time}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <Users className="mr-1 h-4 w-4" />
                  {session.participants}/{session.maxParticipants} participants
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-[120px]">
              <Button className="w-full">
                <Video className="mr-2 h-4 w-4" />
                Join Session
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </Card>
      ))}
      <div className="flex justify-center">
        <Button variant="outline">View All Sessions</Button>
      </div>
    </div>
  )
}

