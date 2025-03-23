"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Calendar,
  Download,
  Info,
  Brain,
  Activity,
  AlertTriangle,
  Check,
  Clock,
  FileText,
  User,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

// Mock patient data
const mockPatient = {
  id: "p123456",
  name: "John Smith",
  age: 72,
  gender: "Male",
  diagnosis: "Mild Cognitive Impairment",
  riskLevel: "moderate",
  lastAssessment: "2023-12-15",
  nextAppointment: "2024-01-20",
  avatar: "/placeholder.svg?height=40&width=40",
  contactInfo: {
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, CA 94321",
  },
  medicalInfo: {
    medications: ["Donepezil 5mg", "Memantine 10mg"],
    allergies: ["Penicillin"],
    conditions: ["Hypertension", "Type 2 Diabetes"],
    familyHistory: ["Alzheimer's Disease (Mother)"],
  },
  caregiverInfo: {
    name: "Mary Smith",
    relationship: "Spouse",
    phone: "+1 (555) 123-4568",
    email: "mary.smith@example.com",
  },
}

// Mock cognitive data
const mockCognitiveData = {
  trends: [
    { date: "2023-01", memory: 72, attention: 68, executive: 65, language: 80, visuospatial: 75, overall: 72 },
    { date: "2023-02", memory: 70, attention: 72, executive: 68, language: 82, visuospatial: 76, overall: 73 },
    { date: "2023-03", memory: 73, attention: 75, executive: 70, language: 83, visuospatial: 78, overall: 75 },
    { date: "2023-04", memory: 71, attention: 73, executive: 72, language: 85, visuospatial: 80, overall: 76 },
    { date: "2023-05", memory: 74, attention: 76, executive: 75, language: 84, visuospatial: 82, overall: 78 },
    { date: "2023-06", memory: 76, attention: 78, executive: 77, language: 86, visuospatial: 83, overall: 80 },
    { date: "2023-07", memory: 75, attention: 77, executive: 76, language: 85, visuospatial: 81, overall: 79 },
    { date: "2023-08", memory: 77, attention: 79, executive: 78, language: 87, visuospatial: 84, overall: 81 },
    { date: "2023-09", memory: 79, attention: 81, executive: 80, language: 88, visuospatial: 85, overall: 83 },
    { date: "2023-10", memory: 78, attention: 80, executive: 79, language: 87, visuospatial: 84, overall: 82 },
    { date: "2023-11", memory: 80, attention: 82, executive: 81, language: 89, visuospatial: 86, overall: 84 },
    { date: "2023-12", memory: 82, attention: 84, executive: 83, language: 90, visuospatial: 87, overall: 85 },
  ],
  gamePerformance: [
    {
      month: "Jan",
      NumberMemory: 65,
      WordAssociation: 70,
      PatternRecognition: 60,
      SpatialMemory: 55,
      WorkingMemory: 50,
    },
    {
      month: "Feb",
      NumberMemory: 68,
      WordAssociation: 72,
      PatternRecognition: 63,
      SpatialMemory: 58,
      WorkingMemory: 54,
    },
    {
      month: "Mar",
      NumberMemory: 70,
      WordAssociation: 75,
      PatternRecognition: 65,
      SpatialMemory: 60,
      WorkingMemory: 58,
    },
    {
      month: "Apr",
      NumberMemory: 72,
      WordAssociation: 78,
      PatternRecognition: 68,
      SpatialMemory: 63,
      WorkingMemory: 62,
    },
    {
      month: "May",
      NumberMemory: 75,
      WordAssociation: 80,
      PatternRecognition: 70,
      SpatialMemory: 65,
      WorkingMemory: 65,
    },
    {
      month: "Jun",
      NumberMemory: 78,
      WordAssociation: 82,
      PatternRecognition: 73,
      SpatialMemory: 68,
      WorkingMemory: 68,
    },
    {
      month: "Jul",
      NumberMemory: 80,
      WordAssociation: 85,
      PatternRecognition: 75,
      SpatialMemory: 70,
      WorkingMemory: 72,
    },
    {
      month: "Aug",
      NumberMemory: 82,
      WordAssociation: 87,
      PatternRecognition: 78,
      SpatialMemory: 73,
      WorkingMemory: 75,
    },
    {
      month: "Sep",
      NumberMemory: 85,
      WordAssociation: 89,
      PatternRecognition: 80,
      SpatialMemory: 75,
      WorkingMemory: 78,
    },
    {
      month: "Oct",
      NumberMemory: 87,
      WordAssociation: 90,
      PatternRecognition: 82,
      SpatialMemory: 78,
      WorkingMemory: 80,
    },
    {
      month: "Nov",
      NumberMemory: 89,
      WordAssociation: 92,
      PatternRecognition: 85,
      SpatialMemory: 80,
      WorkingMemory: 83,
    },
    {
      month: "Dec",
      NumberMemory: 90,
      WordAssociation: 93,
      PatternRecognition: 87,
      SpatialMemory: 82,
      WorkingMemory: 85,
    },
  ],
  mmseScores: [
    { date: "2023-01-15", score: 24 },
    { date: "2023-03-20", score: 25 },
    { date: "2023-06-10", score: 26 },
    { date: "2023-09-05", score: 27 },
    { date: "2023-12-01", score: 28 },
  ],
  domainComparison: [
    { domain: "Memory", score: 82, average: 75, benchmark: 85 },
    { domain: "Attention", score: 84, average: 78, benchmark: 87 },
    { domain: "Executive Function", score: 83, average: 76, benchmark: 86 },
    { domain: "Language", score: 90, average: 82, benchmark: 88 },
    { domain: "Visuospatial", score: 87, average: 80, benchmark: 89 },
  ],
  radarData: [
    { domain: "Memory", score: 82, fullMark: 100 },
    { domain: "Attention", score: 84, fullMark: 100 },
    { domain: "Executive Function", score: 83, fullMark: 100 },
    { domain: "Language", score: 90, fullMark: 100 },
    { domain: "Visuospatial", score: 87, fullMark: 100 },
  ],
  predictions: {
    shortTerm: {
      predictedScore: 85,
      confidence: 0.8,
      riskLevel: "low",
      factors: ["Consistent cognitive training", "Regular physical exercise", "Good sleep patterns"],
      recommendations: [
        "Continue with current cognitive training regimen",
        "Maintain physical exercise routine",
        "Consider adding more challenging memory exercises",
      ],
    },
    mediumTerm: {
      predictedScore: 87,
      confidence: 0.7,
      riskLevel: "low",
      factors: [
        "Positive trend in cognitive scores",
        "Regular cognitive assessments",
        "Balanced cognitive training across domains",
      ],
      recommendations: [
        "Increase frequency of executive function exercises",
        "Add variety to cognitive training",
        "Schedule regular cognitive assessments",
      ],
    },
    longTerm: {
      predictedScore: 88,
      confidence: 0.6,
      riskLevel: "low",
      factors: [
        "Consistent improvement in cognitive scores",
        "Comprehensive cognitive training",
        "Regular medical check-ups",
      ],
      recommendations: [
        "Maintain comprehensive cognitive training",
        "Continue regular medical check-ups",
        "Consider advanced cognitive assessments",
      ],
    },
  },
  anomalies: [
    {
      date: "2023-04-15",
      domain: "Memory",
      severity: "moderate",
      description: "Sudden drop in memory performance during Number Memory game",
      possibleCauses: ["Medication change", "Sleep disturbance", "Stress"],
      recommendations: ["Review medication schedule", "Assess sleep quality", "Consider stress management techniques"],
    },
    {
      date: "2023-08-22",
      domain: "Attention",
      severity: "mild",
      description: "Slight decline in sustained attention during Working Memory Challenge",
      possibleCauses: ["Fatigue", "Time of day effect", "Environmental distractions"],
      recommendations: [
        "Optimize testing environment",
        "Schedule assessments during peak cognitive hours",
        "Ensure adequate rest before testing",
      ],
    },
  ],
  patientHeatmap: [
    { hour: "8AM", day: "Mon", value: 85 },
    { hour: "9AM", day: "Mon", value: 87 },
    { hour: "10AM", day: "Mon", value: 89 },
    { hour: "11AM", day: "Mon", value: 86 },
    { hour: "12PM", day: "Mon", value: 80 },
    { hour: "1PM", day: "Mon", value: 75 },
    { hour: "2PM", day: "Mon", value: 78 },
    { hour: "3PM", day: "Mon", value: 80 },
    { hour: "4PM", day: "Mon", value: 82 },
    { hour: "5PM", day: "Mon", value: 78 },

    { hour: "8AM", day: "Tue", value: 83 },
    { hour: "9AM", day: "Tue", value: 85 },
    { hour: "10AM", day: "Tue", value: 88 },
    { hour: "11AM", day: "Tue", value: 86 },
    { hour: "12PM", day: "Tue", value: 78 },
    { hour: "1PM", day: "Tue", value: 74 },
    { hour: "2PM", day: "Tue", value: 76 },
    { hour: "3PM", day: "Tue", value: 78 },
    { hour: "4PM", day: "Tue", value: 80 },
    { hour: "5PM", day: "Tue", value: 76 },

    { hour: "8AM", day: "Wed", value: 84 },
    { hour: "9AM", day: "Wed", value: 86 },
    { hour: "10AM", day: "Wed", value: 90 },
    { hour: "11AM", day: "Wed", value: 88 },
    { hour: "12PM", day: "Wed", value: 82 },
    { hour: "1PM", day: "Wed", value: 76 },
    { hour: "2PM", day: "Wed", value: 78 },
    { hour: "3PM", day: "Wed", value: 82 },
    { hour: "4PM", day: "Wed", value: 84 },
    { hour: "5PM", day: "Wed", value: 80 },

    { hour: "8AM", day: "Thu", value: 82 },
    { hour: "9AM", day: "Thu", value: 84 },
    { hour: "10AM", day: "Thu", value: 87 },
    { hour: "11AM", day: "Thu", value: 85 },
    { hour: "12PM", day: "Thu", value: 79 },
    { hour: "1PM", day: "Thu", value: 73 },
    { hour: "2PM", day: "Thu", value: 75 },
    { hour: "3PM", day: "Thu", value: 77 },
    { hour: "4PM", day: "Thu", value: 79 },
    { hour: "5PM", day: "Thu", value: 75 },

    { hour: "8AM", day: "Fri", value: 80 },
    { hour: "9AM", day: "Fri", value: 82 },
    { hour: "10AM", day: "Fri", value: 85 },
    { hour: "11AM", day: "Fri", value: 83 },
    { hour: "12PM", day: "Fri", value: 77 },
    { hour: "1PM", day: "Fri", value: 72 },
    { hour: "2PM", day: "Fri", value: 74 },
    { hour: "3PM", day: "Fri", value: 76 },
    { hour: "4PM", day: "Fri", value: 78 },
    { hour: "5PM", day: "Fri", value: 74 },
  ],
  recentAssessments: [
    {
      id: "a123",
      date: "2023-12-01",
      type: "MMSE",
      score: 28,
      administrator: "Dr. Sarah Johnson",
      notes: "Patient showed improvement in orientation and recall sections.",
      domains: [
        { name: "Orientation", score: 9, maxScore: 10 },
        { name: "Registration", score: 3, maxScore: 3 },
        { name: "Attention & Calculation", score: 4, maxScore: 5 },
        { name: "Recall", score: 3, maxScore: 3 },
        { name: "Language", score: 8, maxScore: 8 },
        { name: "Visual Construction", score: 1, maxScore: 1 },
      ],
    },
    {
      id: "a122",
      date: "2023-11-15",
      type: "Comprehensive",
      score: 84,
      administrator: "Dr. Sarah Johnson",
      notes: "Comprehensive assessment including cognitive games and speech analysis.",
      domains: [
        { name: "Memory", score: 80, maxScore: 100 },
        { name: "Attention", score: 82, maxScore: 100 },
        { name: "Executive Function", score: 81, maxScore: 100 },
        { name: "Language", score: 89, maxScore: 100 },
        { name: "Visuospatial", score: 86, maxScore: 100 },
      ],
    },
    {
      id: "a121",
      date: "2023-10-20",
      type: "Game-Based",
      score: 82,
      administrator: "Self-administered",
      notes: "Patient completed all five cognitive games with good performance.",
      games: [
        { name: "Number Memory", score: 87, maxScore: 100 },
        { name: "Word Association", score: 90, maxScore: 100 },
        { name: "Pattern Recognition", score: 82, maxScore: 100 },
        { name: "Spatial Memory", score: 78, maxScore: 100 },
        { name: "Working Memory", score: 80, maxScore: 100 },
      ],
    },
  ],
  upcomingAppointments: [
    {
      id: "apt123",
      date: "2024-01-20",
      time: "10:30 AM",
      type: "Follow-up",
      provider: "Dr. Sarah Johnson",
      location: "Memory Clinic, Room 305",
      notes: "Quarterly follow-up assessment",
    },
    {
      id: "apt124",
      date: "2024-02-15",
      time: "2:00 PM",
      type: "Neuropsychological Assessment",
      provider: "Dr. Michael Chen",
      location: "Neurology Department, Room 210",
      notes: "Comprehensive neuropsychological evaluation",
    },
  ],
  dementiaCategories: [
    { name: "Alzheimer's Disease", probability: 0.15, color: "#8884d8" },
    { name: "Vascular Dementia", probability: 0.08, color: "#82ca9d" },
    { name: "Lewy Body Dementia", probability: 0.05, color: "#ffc658" },
    { name: "Frontotemporal Dementia", probability: 0.03, color: "#ff8042" },
    { name: "Mixed Dementia", probability: 0.07, color: "#0088fe" },
    { name: "No Dementia", probability: 0.62, color: "#00C49F" },
  ],
}

// Colors for charts
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00C49F"]

export default function PatientAnalyticsClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get("id") || "p123456"
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState("1year")
  const [domainFilter, setDomainFilter] = useState("all")
  const [predictionTimeframe, setPredictionTimeframe] = useState("shortTerm")
  const [patient, setPatient] = useState(mockPatient)
  const [cognitiveData, setCognitiveData] = useState(mockCognitiveData)
  const [isLoading, setIsLoading] = useState(false)

  // In a real app, this would fetch data from an API
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // In a real app, this would be an API call
        // const response = await fetch(`/api/patients/${patientId}/analytics?timeRange=${timeRange}`)
        // const data = await response.json()
        // setPatient(data.patient)
        // setCognitiveData(data.cognitiveData)

        // For now, we'll just use the mock data
        setPatient(mockPatient)
        setCognitiveData(mockCognitiveData)

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching patient analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load patient analytics data.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchData()
  }, [patientId, timeRange, toast])

  const handleBackToDashboard = () => {
    router.push("/doctor/dashboard")
  }

  const handleExportData = () => {
    // In a real app, this would generate and download a CSV or PDF
    toast({
      title: "Export Started",
      description: "Patient analytics data is being exported.",
    })

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Patient analytics data has been exported successfully.",
      })
    }, 2000)
  }

  // Filter data based on selected time range
  const getFilteredData = () => {
    // In a real app, this would filter the data based on the selected time range
    // For now, we'll just return the full dataset
    return cognitiveData.trends
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Get risk level badge color
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "severe":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="container max-w-7xl py-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading patient analytics...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Patient Analytics</h1>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>

          {/* Patient Info Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback>
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{patient.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline">{patient.age} years</Badge>
                      <Badge variant="outline">{patient.gender}</Badge>
                      <Badge>{patient.diagnosis}</Badge>
                      <Badge className={getRiskLevelColor(patient.riskLevel)}>
                        {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)} Risk
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Last Assessment: {formatDate(patient.lastAssessment)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Next Appointment: {formatDate(patient.nextAppointment)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:ml-auto flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={() => router.push(`/doctor/patient-profile?id=${patientId}`)}>
                    <User className="mr-2 h-4 w-4" />
                    View Full Profile
                  </Button>
                  <Button onClick={() => router.push(`/doctor/assessment?id=${patientId}`)}>
                    <Brain className="mr-2 h-4 w-4" />
                    New Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cognitive">Cognitive Domains</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cognitive Health Score</CardTitle>
                    <CardDescription>Overall cognitive health trend over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getFilteredData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => {
                            const d = new Date(date)
                            return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`
                          }}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          formatter={(value) => [`${value}`, "Score"]}
                          labelFormatter={(label) => {
                            const d = new Date(label)
                            return `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="overall"
                          name="Overall Score"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Line type="monotone" dataKey="memory" name="Memory" stroke="#82ca9d" strokeDasharray="5 5" />
                        <Line
                          type="monotone"
                          dataKey="attention"
                          name="Attention"
                          stroke="#ffc658"
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>MMSE Score Progression</CardTitle>
                    <CardDescription>Mini-Mental State Examination scores over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cognitiveData.mmseScores} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={formatDate} />
                        <YAxis domain={[0, 30]} />
                        <Tooltip formatter={(value) => [`${value}`, "MMSE Score"]} labelFormatter={formatDate} />
                        <Legend />
                        <Line type="monotone" dataKey="score" name="MMSE Score" stroke="#8884d8" activeDot={{ r: 8 }} />
                        {/* Reference lines for MMSE interpretation */}
                        <CartesianGrid strokeDasharray="3 3" />
                        <ReferenceLine
                          y={24}
                          stroke="green"
                          strokeDasharray="3 3"
                          label={{ value: "Normal", position: "right" }}
                        />
                        <ReferenceLine
                          y={18}
                          stroke="orange"
                          strokeDasharray="3 3"
                          label={{ value: "Mild", position: "right" }}
                        />
                        <ReferenceLine
                          y={10}
                          stroke="red"
                          strokeDasharray="3 3"
                          label={{ value: "Moderate", position: "right" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cognitive Domain Comparison</CardTitle>
                    <CardDescription>Performance compared to age group average and clinical benchmark</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={cognitiveData.domainComparison}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="domain" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" name="Patient Score" fill="#8884d8" />
                        <Bar dataKey="average" name="Age Group Average" fill="#82ca9d" />
                        <Bar dataKey="benchmark" name="Clinical Benchmark" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cognitive Profile</CardTitle>
                    <CardDescription>Radar chart showing performance across cognitive domains</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius="80%" data={cognitiveData.radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="domain" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name="Current Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Dementia Risk Assessment</CardTitle>
                    <CardDescription>Probability analysis based on cognitive profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={cognitiveData.dementiaCategories}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="probability"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {cognitiveData.dementiaCategories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "Probability"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Based on cognitive profile and risk factors. Not a clinical diagnosis.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recent Assessments</CardTitle>
                    <CardDescription>Latest cognitive evaluations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cognitiveData.recentAssessments.slice(0, 2).map((assessment) => (
                        <div key={assessment.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{assessment.type} Assessment</h4>
                              <p className="text-sm text-muted-foreground">{formatDate(assessment.date)}</p>
                            </div>
                            <Badge>
                              {assessment.score} / {assessment.type === "MMSE" ? 30 : 100}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{assessment.notes}</p>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-sm"
                            onClick={() => router.push(`/doctor/assessment-details?id=${assessment.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                    <CardDescription>Scheduled visits and assessments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cognitiveData.upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium">{appointment.type}</h4>
                            <Badge variant="outline">{appointment.date}</Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <User className="h-3.5 w-3.5" />
                            <span>{appointment.provider}</span>
                          </div>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-sm"
                            onClick={() => router.push(`/doctor/appointments?id=${appointment.id}`)}
                          >
                            Manage Appointment
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Cognitive Domains Tab */}
            <TabsContent value="cognitive" className="space-y-6">
              <div className="flex justify-end mb-4">
                <Select value={domainFilter} onValueChange={setDomainFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    <SelectItem value="memory">Memory</SelectItem>
                    <SelectItem value="attention">Attention</SelectItem>
                    <SelectItem value="executive">Executive Function</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                    <SelectItem value="visuospatial">Visuospatial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Domain Performance Over Time</CardTitle>
                  <CardDescription>Detailed view of performance in each cognitive domain</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getFilteredData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                          const d = new Date(date)
                          return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`
                        }}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip
                        formatter={(value) => [`${value}`, "Score"]}
                        labelFormatter={(label) => {
                          const d = new Date(label)
                          return `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`
                        }}
                      />
                      <Legend />
                      {(domainFilter === "all" || domainFilter === "memory") && (
                        <Line type="monotone" dataKey="memory" name="Memory" stroke="#8884d8" activeDot={{ r: 8 }} />
                      )}
                      {(domainFilter === "all" || domainFilter === "attention") && (
                        <Line type="monotone" dataKey="attention" name="Attention" stroke="#82ca9d" />
                      )}
                      {(domainFilter === "all" || domainFilter === "executive") && (
                        <Line type="monotone" dataKey="executive" name="Executive Function" stroke="#ffc658" />
                      )}
                      {(domainFilter === "all" || domainFilter === "language") && (
                        <Line type="monotone" dataKey="language" name="Language" stroke="#ff8042" />
                      )}
                      {(domainFilter === "all" || domainFilter === "visuospatial") && (
                        <Line type="monotone" dataKey="visuospatial" name="Visuospatial" stroke="#0088fe" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Game Performance Analysis</CardTitle>
                  <CardDescription>Performance trends across different cognitive training games</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cognitiveData.gamePerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="NumberMemory"
                        name="Number Memory"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line type="monotone" dataKey="WordAssociation" name="Word Association" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="PatternRecognition" name="Pattern Recognition" stroke="#ffc658" />
                      <Line type="monotone" dataKey="SpatialMemory" name="Spatial Memory" stroke="#ff8042" />
                      <Line type="monotone" dataKey="WorkingMemory" name="Working Memory" stroke="#0088fe" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cognitive Performance Heatmap</CardTitle>
                  <CardDescription>Performance patterns by day of week and time of day</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid />
                      <XAxis type="category" dataKey="hour" name="Hour" allowDuplicatedCategory={false} />
                      <YAxis type="category" dataKey="day" name="Day" allowDuplicatedCategory={false} width={80} />
                      <ZAxis type="number" dataKey="value" range={[100, 1000]} name="Performance" />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name, props) => {
                          if (name === "Performance") {
                            return [`${props.payload.value}`, "Score"]
                          }
                          return [value, name]
                        }}
                      />
                      <Scatter
                        name="Performance Score"
                        data={cognitiveData.patientHeatmap}
                        fill="#8884d8"
                        shape="circle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Memory</CardTitle>
                    <CardDescription>Short-term and long-term memory performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-primary">
                        {cognitiveData.radarData.find((d) => d.domain === "Memory")?.score}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Score</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Strengths:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Short-term memory recall</li>
                        <li>Visual memory</li>
                      </ul>
                      <div className="text-sm font-medium mt-2">Areas for Improvement:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Verbal memory</li>
                        <li>Working memory capacity</li>
                      </ul>
                      <div className="text-sm font-medium mt-2">Recommended Exercises:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Number Memory Game (Level 5-6)</li>
                        <li>Spatial Memory Game (Level 4)</li>
                        <li>Verbal recall exercises</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Attention</CardTitle>
                    <CardDescription>Sustained, divided, and selective attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-primary">
                        {cognitiveData.radarData.find((d) => d.domain === "Attention")?.score}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Score</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Strengths:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Sustained attention</li>
                        <li>Selective attention</li>
                      </ul>
                      <div className="text-sm font-medium mt-2">Areas for Improvement:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Divided attention</li>
                        <li>Attention switching</li>
                      </ul>
                      <div className="text-sm font-medium mt-2">Recommended Exercises:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Working Memory Challenge (3-back)</li>
                        <li>Dual-task exercises</li>
                        <li>Attention switching games</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Executive Function</CardTitle>
                    <CardDescription>Planning, decision-making, and cognitive flexibility</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-primary">
                        {cognitiveData.radarData.find((d) => d.domain === "Executive Function")?.score}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Score</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Strengths:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Planning abilities</li>
                        <li>Problem-solving</li>
                      </ul>
                      <div className="text-sm font-medium mt-2">Areas for Improvement:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Cognitive flexibility</li>
                        <li>Inhibitory control</li>
                      </ul>
                      <div className="text-sm font-medium mt-2">Recommended Exercises:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        <li>Pattern Recognition Game (Level 5)</li>
                        <li>Task-switching exercises</li>
                        <li>Strategic planning games</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Assessments Tab */}
            <TabsContent value="assessments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment History</CardTitle>
                  <CardDescription>Comprehensive view of all cognitive assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {cognitiveData.recentAssessments.map((assessment) => (
                      <div key={assessment.id} className="border rounded-md p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium">{assessment.type} Assessment</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(assessment.date)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                <span>Administrator: {assessment.administrator}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0 flex items-center gap-2">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{assessment.score}</div>
                              <div className="text-xs text-muted-foreground">
                                {assessment.type === "MMSE" ? "/ 30" : "/ 100"}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/doctor/assessment-details?id=${assessment.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Notes</h4>
                          <p className="text-sm text-muted-foreground">{assessment.notes}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Domain Scores</h4>
                          <div className="space-y-3">
                            {assessment.domains
                              ? assessment.domains.map((domain, index) => (
                                  <div key={index}>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>{domain.name}</span>
                                      <span className="font-medium">
                                        {domain.score} / {domain.maxScore}
                                      </span>
                                    </div>
                                    <Progress value={(domain.score / domain.maxScore) * 100} className="h-2" />
                                  </div>
                                ))
                              : assessment.games
                                ? assessment.games.map((game, index) => (
                                    <div key={index}>
                                      <div className="flex justify-between text-sm mb-1">
                                        <span>{game.name}</span>
                                        <span className="font-medium">
                                          {game.score} / {game.maxScore}
                                        </span>
                                      </div>
                                      <Progress value={(game.score / game.maxScore) * 100} className="h-2" />
                                    </div>
                                  ))
                                : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>MMSE Performance Breakdown</CardTitle>
                    <CardDescription>Detailed analysis of MMSE test components</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={cognitiveData.recentAssessments[0].domains}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, (dataMax) => Math.max(dataMax, 10)]} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip
                          formatter={(value, name, props) => {
                            return [`${value} / ${props.payload.maxScore}`, props.payload.name]
                          }}
                        />
                        <Legend />
                        <Bar dataKey="score" name="Score" fill="#8884d8" />
                        <Bar dataKey="maxScore" name="Maximum Score" fill="#82ca9d" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Game Performance Comparison</CardTitle>
                    <CardDescription>Comparison of performance across cognitive games</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius="80%" data={cognitiveData.recentAssessments[2].games}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name="Game Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip formatter={(value) => [`${value} / 100`, "Score"]} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="space-y-6">
              <div className="flex justify-end mb-4">
                <Select value={predictionTimeframe} onValueChange={setPredictionTimeframe}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shortTerm">Short Term (3-6 months)</SelectItem>
                    <SelectItem value="mediumTerm">Medium Term (6-12 months)</SelectItem>
                    <SelectItem value="longTerm">Long Term (1-3 years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-muted-foreground" />
                    About Cognitive Predictions
                  </CardTitle>
                  <CardDescription>
                    These predictions are generated by our AI model based on the patient's cognitive data, lifestyle
                    factors, and research on cognitive aging. They are intended as guidance for clinical decision-making
                    and not as definitive prognoses.
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Predicted Cognitive Score</CardTitle>
                    <CardDescription>
                      {predictionTimeframe === "shortTerm" && "Predicted score for the next 3-6 months"}
                      {predictionTimeframe === "mediumTerm" && "Predicted score for the next 6-12 months"}
                      {predictionTimeframe === "longTerm" && "Predicted score for the next 1-3 years"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-primary">
                        {cognitiveData.predictions[predictionTimeframe].predictedScore}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Predicted Score (0-100)</div>
                      <div className="flex items-center justify-center mt-2">
                        <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                          Confidence: {(cognitiveData.predictions[predictionTimeframe].confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Risk Level</h4>
                        <div
                          className={`text-sm px-3 py-1.5 rounded-md inline-block
                          ${
                            cognitiveData.predictions[predictionTimeframe].riskLevel === "low"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : cognitiveData.predictions[predictionTimeframe].riskLevel === "moderate"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {cognitiveData.predictions[predictionTimeframe].riskLevel.charAt(0).toUpperCase() +
                            cognitiveData.predictions[predictionTimeframe].riskLevel.slice(1)}{" "}
                          Risk
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Contributing Factors</h4>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {cognitiveData.predictions[predictionTimeframe].factors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>
                      Personalized recommendations based on cognitive profile and predictions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {cognitiveData.predictions[predictionTimeframe].recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                            <Check className="h-4 w-4" />
                          </div>
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cognitive Trajectory</CardTitle>
                  <CardDescription>
                    Projected cognitive score over time based on current trends and interventions
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        type="category"
                        allowDuplicatedCategory={false}
                        domain={["dataMin", "dataMax"]}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        data={[
                          { date: "2023-12", score: 82 },
                          { date: "2024-03", score: cognitiveData.predictions.shortTerm.predictedScore },
                          { date: "2024-09", score: cognitiveData.predictions.mediumTerm.predictedScore },
                          { date: "2025-12", score: cognitiveData.predictions.longTerm.predictedScore },
                        ]}
                        type="monotone"
                        dataKey="score"
                        name="Predicted Score"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        data={[
                          { date: "2023-12", score: 82 },
                          { date: "2024-03", score: 80 },
                          { date: "2024-09", score: 78 },
                          { date: "2025-12", score: 75 },
                        ]}
                        type="monotone"
                        dataKey="score"
                        name="Without Intervention"
                        stroke="#ff8042"
                        strokeDasharray="5 5"
                      />
                      <Line
                        data={[
                          { date: "2023-12", score: 82 },
                          { date: "2024-03", score: 85 },
                          { date: "2024-09", score: 90 },
                          { date: "2025-12", score: 95 },
                        ]}
                        type="monotone"
                        dataKey="score"
                        name="Optimal Intervention"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Anomalies Tab */}
            <TabsContent value="anomalies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    Detected Cognitive Anomalies
                  </CardTitle>
                  <CardDescription>
                    Unusual patterns or sudden changes in cognitive performance that may warrant attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {cognitiveData.anomalies.length > 0 ? (
                      cognitiveData.anomalies.map((anomaly, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium">{anomaly.domain} Domain Anomaly</h3>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>Detected: {formatDate(anomaly.date)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <Badge className={getSeverityColor(anomaly.severity)}>
                                {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)} Severity
                              </Badge>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Description</h4>
                            <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                          </div>

                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Possible Causes</h4>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {anomaly.possibleCauses.map((cause, i) => (
                                <li key={i}>{cause}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {anomaly.recommendations.map((recommendation, i) => (
                                <li key={i}>{recommendation}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 mb-4">
                          <Check className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Anomalies Detected</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          No significant anomalies or unusual patterns have been detected in this patient's cognitive
                          performance data.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection Timeline</CardTitle>
                  <CardDescription>Timeline of detected anomalies in cognitive performance</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid />
                      <XAxis type="category" dataKey="date" name="Date" tickFormatter={formatDate} />
                      <YAxis type="category" dataKey="domain" name="Domain" width={100} />
                      <ZAxis type="number" dataKey="severityValue" range={[100, 1000]} name="Severity" />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name, props) => {
                          if (name === "Severity") {
                            return [props.payload.severity, "Severity"]
                          }
                          return [value, name]
                        }}
                        labelFormatter={formatDate}
                      />
                      <Legend />
                      <Scatter
                        name="Anomaly"
                        data={cognitiveData.anomalies.map((a) => ({
                          ...a,
                          severityValue: a.severity === "mild" ? 1 : a.severity === "moderate" ? 2 : 3,
                        }))}
                        fill="#ff8042"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection Settings</CardTitle>
                  <CardDescription>
                    Configure sensitivity and notification settings for anomaly detection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Detection Sensitivity</h4>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Select sensitivity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (Detect only major anomalies)</SelectItem>
                          <SelectItem value="medium">Medium (Balanced detection)</SelectItem>
                          <SelectItem value="high">High (Detect subtle anomalies)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Notification Preferences</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="email-notify" className="text-sm">
                            Email Notifications
                          </label>
                          <input type="checkbox" id="email-notify" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="app-notify" className="text-sm">
                            In-App Notifications
                          </label>
                          <input type="checkbox" id="app-notify" className="toggle" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label htmlFor="urgent-notify" className="text-sm">
                            Urgent Anomalies Only
                          </label>
                          <input type="checkbox" id="urgent-notify" className="toggle" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">Run Manual Anomaly Detection</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Run anomaly detection manually on historical data with custom parameters.
                      </p>
                      <Button>
                        <Activity className="mr-2 h-4 w-4" />
                        Run Detection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

// Helper component for ReferenceLine
const ReferenceLine = ({ y, stroke, strokeDasharray, label }) => {
  return (
    <g>
      <line x1="0%" x2="100%" y1={y} y2={y} stroke={stroke} strokeDasharray={strokeDasharray} />
      {label && (
        <text
          x={label.position === "right" ? "95%" : "5%"}
          y={y - 5}
          textAnchor={label.position === "right" ? "end" : "start"}
          fill={stroke}
          fontSize="12"
        >
          {label.value}
        </text>
      )}
    </g>
  )
}

