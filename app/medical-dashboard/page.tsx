"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar } from "@/components/ui/calendar"
import { Search, CalendarIcon, Clock, Plus, Filter, ChevronRight } from "lucide-react"
import Link from "next/link"

// Mock data for cognitive trends
const cognitiveData = [
  { month: "Jan", mmse: 26, attention: 72, memory: 68 },
  { month: "Feb", mmse: 27, attention: 75, memory: 70 },
  { month: "Mar", mmse: 27, attention: 78, memory: 73 },
  { month: "Apr", mmse: 28, attention: 82, memory: 76 },
]

// Mock data for patients
const patients = [
  {
    id: 1,
    name: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    age: 72,
    condition: "Mild Cognitive Impairment",
    lastTest: "Apr 15, 2024",
    score: "28/30",
    change: "+1",
    status: "Stable",
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    age: 68,
    condition: "Alzheimer's Disease",
    lastTest: "Apr 12, 2024",
    score: "24/30",
    change: "-1",
    status: "Declining",
  },
  {
    id: 3,
    name: "Bob Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    age: 75,
    condition: "Vascular Dementia",
    lastTest: "Apr 10, 2024",
    score: "22/30",
    change: "0",
    status: "Stable",
  },
]

// Mock data for upcoming appointments
const appointments = [
  {
    id: 1,
    patient: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    type: "Cognitive Assessment",
    date: "Apr 25, 2024",
    time: "10:00 AM",
    status: "Confirmed",
  },
  {
    id: 2,
    patient: "Jane Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    type: "Follow-up",
    date: "Apr 26, 2024",
    time: "2:30 PM",
    status: "Confirmed",
  },
  {
    id: 3,
    patient: "Bob Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    type: "Medication Review",
    date: "Apr 28, 2024",
    time: "11:15 AM",
    status: "Pending",
  },
]

export default function MedicalDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPatient, setSelectedPatient] = useState(patients[0])

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, Dr. Sarah Chen</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your patients today</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
            <Button>Schedule Appointment</Button>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">248</div>
              <p className="text-xs text-muted-foreground">+12 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">2 pending confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Patient List */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Patient Overview</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search patients..." className="w-full pl-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted ${selectedPatient.id === patient.id ? "bg-muted" : ""}`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={patient.avatar} alt={patient.name} />
                        <AvatarFallback>
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{patient.age} years</span>
                          <span>•</span>
                          <span>{patient.condition}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        patient.status === "Stable"
                          ? "outline"
                          : patient.status === "Improving"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {patient.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/medical-dashboard/patients">View All Patients</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Patient Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Cognitive Analysis</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/medical-dashboard/patients/${selectedPatient.id}`}>View Full Profile</Link>
                </Button>
              </div>
              <CardDescription>Detailed cognitive health data for {selectedPatient.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3 mb-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last MMSE Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{selectedPatient.score}</p>
                    <Badge
                      variant={
                        selectedPatient.change.includes("+")
                          ? "secondary"
                          : selectedPatient.change === "0"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {selectedPatient.change}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Tested on {selectedPatient.lastTest}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="text-lg font-medium">{selectedPatient.condition}</p>
                  <p className="text-xs text-muted-foreground">Diagnosed 2 years ago</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Next Appointment</p>
                  <p className="text-lg font-medium">Apr 25, 2024</p>
                  <p className="text-xs text-muted-foreground">10:00 AM - Cognitive Assessment</p>
                </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cognitiveData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" domain={[0, 30]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="mmse" name="MMSE Score" stroke="#8884d8" />
                    <Line yAxisId="right" type="monotone" dataKey="attention" name="Attention" stroke="#82ca9d" />
                    <Line yAxisId="right" type="monotone" dataKey="memory" name="Memory" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments and Calendar */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your schedule for the next few days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={appointment.avatar} alt={appointment.patient} />
                        <AvatarFallback>
                          {appointment.patient
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{appointment.date}</span>
                          <Clock className="h-3 w-3 ml-1" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={appointment.status === "Confirmed" ? "outline" : "secondary"}>
                        {appointment.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/medical-dashboard/appointments">View All Appointments</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Manage your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Previous</Button>
              <Button variant="outline">Next</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

