"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock } from "lucide-react"

const appointments = [
  {
    id: 1,
    patientName: "John Doe",
    type: "Cognitive Assessment",
    date: "2024-03-16",
    time: "10:00 AM",
    status: "Confirmed",
  },
  {
    id: 2,
    patientName: "Sarah Smith",
    type: "Follow-up",
    date: "2024-03-16",
    time: "2:30 PM",
    status: "Pending",
  },
]

export default function AppointmentsTab() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>Manage your schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Today's schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{appointment.patientName}</h4>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {appointment.time}
                    </div>
                  </div>
                </div>
                <div>
                  <Badge variant={appointment.status === "Confirmed" ? "default" : "secondary"}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

