"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Brain,
  Activity,
  Users,
  Bell,
  FileText,
  Settings,
  AlertTriangle,
  MessageSquare,
  HelpCircle,
  Heart,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import PatientList from "@/components/caregiver/patient-list"
import PatientActivityFeed from "@/components/caregiver/patient-activity-feed"
import { useToast } from "@/hooks/use-toast"

export default function CaregiverDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleNotificationClick = () => {
    toast({
      title: "Notifications updated",
      description: "You have 3 unread notifications",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Caregiver Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, Sarah. Here's your patient overview for today, Wednesday, March 14
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleNotificationClick}>
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              3
            </span>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/caregiver/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Sarah Johnson" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Under Care</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-amber-500 font-medium">1</span> needs attention
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks for Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500 font-medium">2</span> completed, 3 remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-2">Next: Today at 2:00 PM</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Emergency Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">1</div>
              <p className="text-xs text-red-700 mt-2">Requires immediate attention</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Overview</CardTitle>
                <CardDescription>Quick summary of your patients</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Patient Activities</CardTitle>
                <CardDescription>Activities in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <PatientActivityFeed />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Alerts</CardTitle>
              <CardDescription>Alerts requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-red-800">Fall Detected: John Doe</h4>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">10 minutes ago</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      Possible fall detected in the bathroom. Immediate check required.
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" variant="destructive">
                        Contact Emergency
                      </Button>
                      <Button size="sm" variant="outline">
                        Mark as Resolved
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>View and manage your patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search patients..." className="w-[300px]" />
                    <Button variant="outline" size="sm">
                      Search
                    </Button>
                  </div>
                  <Button size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Add Patient
                  </Button>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
                    <div>Patient</div>
                    <div>Age</div>
                    <div>Condition</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  {[
                    {
                      name: "John Doe",
                      age: 72,
                      condition: "Mild Alzheimer's",
                      status: "needs-attention",
                      image: "/placeholder.svg?height=32&width=32",
                    },
                    {
                      name: "Mary Smith",
                      age: 68,
                      condition: "Early Dementia",
                      status: "stable",
                      image: "/placeholder.svg?height=32&width=32",
                    },
                    {
                      name: "Robert Johnson",
                      age: 75,
                      condition: "Moderate Alzheimer's",
                      status: "stable",
                      image: "/placeholder.svg?height=32&width=32",
                    },
                  ].map((patient, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b items-center">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={patient.image} alt={patient.name} />
                          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                      <div>{patient.age}</div>
                      <div>{patient.condition}</div>
                      <div>
                        <Badge
                          variant={patient.status === "needs-attention" ? "destructive" : "outline"}
                          className={
                            patient.status === "stable" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""
                          }
                        >
                          {patient.status === "stable" ? "Stable" : "Needs Attention"}
                        </Badge>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/caregiver/patients/${i + 1}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>Today's care activities and tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: "8:00 AM",
                    patient: "John Doe",
                    activity: "Morning Medication",
                    status: "completed",
                    icon: <FileText className="h-4 w-4" />,
                  },
                  {
                    time: "9:30 AM",
                    patient: "Mary Smith",
                    activity: "Breakfast and Morning Routine",
                    status: "completed",
                    icon: <Activity className="h-4 w-4" />,
                  },
                  {
                    time: "11:00 AM",
                    patient: "Robert Johnson",
                    activity: "Cognitive Exercise Session",
                    status: "in-progress",
                    icon: <Brain className="h-4 w-4" />,
                  },
                  {
                    time: "2:00 PM",
                    patient: "John Doe",
                    activity: "Doctor's Appointment",
                    status: "upcoming",
                    icon: <Calendar className="h-4 w-4" />,
                  },
                  {
                    time: "4:30 PM",
                    patient: "Mary Smith",
                    activity: "Evening Medication",
                    status: "upcoming",
                    icon: <FileText className="h-4 w-4" />,
                  },
                ].map((task, i) => (
                  <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                    <div className="min-w-[60px] text-sm font-medium">{task.time}</div>
                    <div
                      className={`p-2 rounded-full ${
                        task.status === "completed"
                          ? "bg-green-100"
                          : task.status === "in-progress"
                            ? "bg-blue-100"
                            : "bg-gray-100"
                      }`}
                    >
                      {task.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{task.activity}</h4>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "outline"
                              : task.status === "in-progress"
                                ? "default"
                                : "secondary"
                          }
                          className={
                            task.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""
                          }
                        >
                          {task.status === "completed"
                            ? "Completed"
                            : task.status === "in-progress"
                              ? "In Progress"
                              : "Upcoming"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Patient: {task.patient}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Add New Task
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Management</CardTitle>
              <CardDescription>Configure and manage patient alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active">
                <TabsList className="w-full">
                  <TabsTrigger value="active">Active Alerts</TabsTrigger>
                  <TabsTrigger value="history">Alert History</TabsTrigger>
                  <TabsTrigger value="settings">Alert Settings</TabsTrigger>
                </TabsList>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start space-x-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-red-800">Fall Detected: John Doe</h4>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">10 minutes ago</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        Possible fall detected in the bathroom. Immediate check required.
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="destructive">
                          Contact Emergency
                        </Button>
                        <Button size="sm" variant="outline">
                          Mark as Resolved
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Bell className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-amber-800">Medication Reminder: Mary Smith</h4>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                          30 minutes ago
                        </span>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">Morning medication has not been taken yet.</p>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline">
                          Mark as Administered
                        </Button>
                        <Button size="sm" variant="ghost">
                          Snooze
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Help Center</CardTitle>
            <CardDescription>Resources and support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link
                href="/dashboard/caregiver/help"
                className="block p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <h4 className="font-medium flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                  Getting Started Guide
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Learn how to use the caregiver dashboard effectively
                </p>
              </Link>
              <Link
                href="/dashboard/caregiver/community"
                className="block p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <h4 className="font-medium flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                  Community Support
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Connect with other caregivers and share experiences
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-auto py-4 flex flex-col items-center justify-center">
                <Users className="h-5 w-5 mb-2" />
                <span>Add Patient</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <Calendar className="h-5 w-5 mb-2" />
                <span>Schedule Appointment</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <Activity className="h-5 w-5 mb-2" />
                <span>Track Vitals</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <Heart className="h-5 w-5 mb-2" />
                <span>Self-Care Resources</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

