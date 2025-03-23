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
  BarChart,
  PieChart,
  LineChart,
  Search,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import CognitiveScoreChart from "@/components/doctor/cognitive-score-chart"
import DementiaCategoryChart from "@/components/doctor/dementia-category-chart"
import PatientHeatmap from "@/components/doctor/patient-heatmap"
import RecentAssessments from "@/components/doctor/recent-assessments"
import { useToast } from "@/hooks/use-toast"

export default function DoctorDashboardPage() {
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
      description: "You have 5 unread notifications",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, Dr. Smith. Here's your patient overview for today, Wednesday, March 14
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleNotificationClick}>
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              5
            </span>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/doctor/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Dr. Smith" />
            <AvatarFallback>DS</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients, assessments, or appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500 font-medium">↑ 12</span> from last month
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
              <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-red-500 font-medium">↑ 4</span> from last week
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
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-2">Next: John Doe at 10:30 AM</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-amber-500 font-medium">↑ 3</span> requiring review
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Cognitive Score Overview</CardTitle>
                <CardDescription>Average MMSE scores across all patients</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <CognitiveScoreChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Dementia Risk Categories</CardTitle>
                <CardDescription>Distribution of patients across risk categories</CardDescription>
              </CardHeader>
              <CardContent>
                <DementiaCategoryChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Patient Cognitive Health Heatmap</CardTitle>
              <CardDescription>Overview of cognitive function across patient demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientHeatmap />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Latest patient MMSE test results</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentAssessments />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/doctor/assessments">View All Assessments</Link>
              </Button>
            </CardFooter>
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
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Add Patient
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
                    <div>Patient</div>
                    <div>Age</div>
                    <div>Diagnosis</div>
                    <div>Last Assessment</div>
                    <div>Risk Level</div>
                    <div>Actions</div>
                  </div>
                  {[
                    {
                      name: "John Doe",
                      age: 72,
                      diagnosis: "Mild Alzheimer's",
                      lastAssessment: "Mar 10, 2025",
                      risk: "medium",
                    },
                    {
                      name: "Mary Smith",
                      age: 68,
                      diagnosis: "Early Dementia",
                      lastAssessment: "Mar 8, 2025",
                      risk: "low",
                    },
                    {
                      name: "Robert Johnson",
                      age: 75,
                      diagnosis: "Moderate Alzheimer's",
                      lastAssessment: "Mar 5, 2025",
                      risk: "high",
                    },
                    {
                      name: "Emily Davis",
                      age: 70,
                      diagnosis: "Mild Cognitive Impairment",
                      lastAssessment: "Mar 3, 2025",
                      risk: "low",
                    },
                    {
                      name: "Michael Wilson",
                      age: 78,
                      diagnosis: "Vascular Dementia",
                      lastAssessment: "Mar 1, 2025",
                      risk: "high",
                    },
                  ].map((patient, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b items-center">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={patient.name} />
                          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                      <div>{patient.age}</div>
                      <div>{patient.diagnosis}</div>
                      <div>{patient.lastAssessment}</div>
                      <div>
                        <Badge
                          variant={
                            patient.risk === "high" ? "destructive" : patient.risk === "medium" ? "default" : "outline"
                          }
                          className={patient.risk === "low" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {patient.risk === "high"
                            ? "High Risk"
                            : patient.risk === "medium"
                              ? "Medium Risk"
                              : "Low Risk"}
                        </Badge>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/doctor/patients/${i + 1}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">Page 1 of 5</div>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Cognitive Decline Rates</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  Decline Rate Chart
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Diagnosis Distribution</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  Diagnosis Chart
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Treatment Efficacy</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  Treatment Chart
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Comprehensive data analysis and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="trends">
                <TabsList className="w-full">
                  <TabsTrigger value="trends">Trends</TabsTrigger>
                  <TabsTrigger value="demographics">Demographics</TabsTrigger>
                  <TabsTrigger value="treatments">Treatments</TabsTrigger>
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                </TabsList>
                <div className="mt-4 h-[400px] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  Advanced analytics visualization will appear here
                </div>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Generate Comprehensive Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Research</CardTitle>
              <CardDescription>Latest studies and clinical trials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Efficacy of Cognitive Training in Early-Stage Alzheimer's",
                    institution: "Mayo Clinic",
                    status: "Recruiting",
                    eligibility: "Patients with MMSE scores 20-26",
                    date: "Started Jan 2025",
                  },
                  {
                    title: "Novel Biomarkers for Early Detection of Dementia",
                    institution: "Johns Hopkins University",
                    status: "Active",
                    eligibility: "Adults 60+ with family history",
                    date: "Started Nov 2024",
                  },
                  {
                    title: "Combination Therapy for Moderate Alzheimer's Disease",
                    institution: "Stanford Medical Center",
                    status: "Recruiting",
                    eligibility: "Patients with MMSE scores 14-19",
                    date: "Started Feb 2025",
                  },
                ].map((study, i) => (
                  <Card key={i}>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{study.title}</CardTitle>
                        <Badge
                          variant={study.status === "Recruiting" ? "outline" : "default"}
                          className={study.status === "Recruiting" ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : ""}
                        >
                          {study.status}
                        </Badge>
                      </div>
                      <CardDescription>{study.institution}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between text-sm">
                        <span>{study.eligibility}</span>
                        <span className="text-muted-foreground">{study.date}</span>
                      </div>
                    </CardContent>
                    <div className="bg-muted p-4">
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button size="sm">Refer Patients</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Browse All Clinical Trials</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button size="lg" className="h-24" asChild>
          <Link href="/dashboard/doctor/patients">
            <Users className="mr-2 h-6 w-6" />
            Manage Patients
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/doctor/assessments/new">
            <Brain className="mr-2 h-6 w-6" />
            New Assessment
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/doctor/appointments">
            <Calendar className="mr-2 h-6 w-6" />
            Manage Schedule
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/doctor/telehealth">
            <Activity className="mr-2 h-6 w-6" />
            Start Telehealth
          </Link>
        </Button>
      </div>
    </div>
  )
}

