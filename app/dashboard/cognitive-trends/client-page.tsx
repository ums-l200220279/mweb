"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Download, Info } from "lucide-react"
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
} from "recharts"
import { useToast } from "@/hooks/use-toast"

// Mock data for demonstration
const mockCognitiveData = {
  trends: [
    { date: "2023-01", memory: 72, attention: 68, executive: 65, language: 80, visuospatial: 75 },
    { date: "2023-02", memory: 70, attention: 72, executive: 68, language: 82, visuospatial: 76 },
    { date: "2023-03", memory: 73, attention: 75, executive: 70, language: 83, visuospatial: 78 },
    { date: "2023-04", memory: 71, attention: 73, executive: 72, language: 85, visuospatial: 80 },
    { date: "2023-05", memory: 74, attention: 76, executive: 75, language: 84, visuospatial: 82 },
    { date: "2023-06", memory: 76, attention: 78, executive: 77, language: 86, visuospatial: 83 },
    { date: "2023-07", memory: 75, attention: 77, executive: 76, language: 85, visuospatial: 81 },
    { date: "2023-08", memory: 77, attention: 79, executive: 78, language: 87, visuospatial: 84 },
    { date: "2023-09", memory: 79, attention: 81, executive: 80, language: 88, visuospatial: 85 },
    { date: "2023-10", memory: 78, attention: 80, executive: 79, language: 87, visuospatial: 84 },
    { date: "2023-11", memory: 80, attention: 82, executive: 81, language: 89, visuospatial: 86 },
    { date: "2023-12", memory: 82, attention: 84, executive: 83, language: 90, visuospatial: 87 },
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
    { domain: "Memory", score: 82, average: 75 },
    { domain: "Attention", score: 84, average: 78 },
    { domain: "Executive Function", score: 83, average: 76 },
    { domain: "Language", score: 90, average: 82 },
    { domain: "Visuospatial", score: 87, average: 80 },
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
}

export default function CognitiveTrendsClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState("1year")
  const [domainFilter, setDomainFilter] = useState("all")
  const [predictionTimeframe, setPredictionTimeframe] = useState("shortTerm")
  const [cognitiveData, setCognitiveData] = useState(mockCognitiveData)

  // In a real app, this would fetch data from an API
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/cognitive-trends?timeRange=${timeRange}')
        // const data = await response.json()
        // setCognitiveData(data)

        // For now, we'll just use the mock data
        setCognitiveData(mockCognitiveData)
      } catch (error) {
        console.error("Error fetching cognitive trends:", error)
        toast({
          title: "Error",
          description: "Failed to load cognitive trends data.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [timeRange, toast])

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleExportData = () => {
    // In a real app, this would generate and download a CSV or PDF
    toast({
      title: "Export Started",
      description: "Your cognitive trends data is being exported.",
    })

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your cognitive trends data has been exported successfully.",
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
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackToDashboard}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Cognitive Trends</h1>
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Cognitive Domains</TabsTrigger>
          <TabsTrigger value="games">Game Performance</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
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
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}`, "Score"]} labelFormatter={formatDate} />
                    <Legend />
                    <Line type="monotone" dataKey="memory" name="Memory" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="attention" name="Attention" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="executive" name="Executive" stroke="#ffc658" />
                    <Line type="monotone" dataKey="language" name="Language" stroke="#ff8042" />
                    <Line type="monotone" dataKey="visuospatial" name="Visuospatial" stroke="#0088fe" />
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
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Cognitive Domain Comparison</CardTitle>
                <CardDescription>Your performance compared to average for your age group</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cognitiveData.domainComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domain" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" name="Your Score" fill="#8884d8" />
                    <Bar dataKey="average" name="Age Group Average" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cognitive Profile</CardTitle>
              <CardDescription>Radar chart showing your performance across cognitive domains</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="80%" data={cognitiveData.radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Your Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cognitive Domains Tab */}
        <TabsContent value="domains" className="space-y-6">
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
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}`, "Score"]} labelFormatter={formatDate} />
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Language</CardTitle>
                <CardDescription>Verbal fluency, comprehension, and expression</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {cognitiveData.radarData.find((d) => d.domain === "Language")?.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Score</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Strengths:</div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Verbal comprehension</li>
                    <li>Vocabulary</li>
                  </ul>
                  <div className="text-sm font-medium mt-2">Areas for Improvement:</div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Verbal fluency</li>
                    <li>Word finding</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visuospatial</CardTitle>
                <CardDescription>Visual perception, spatial awareness, and construction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {cognitiveData.radarData.find((d) => d.domain === "Visuospatial")?.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Score</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Strengths:</div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Visual perception</li>
                    <li>Spatial orientation</li>
                  </ul>
                  <div className="text-sm font-medium mt-2">Areas for Improvement:</div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    <li>Visual construction</li>
                    <li>Mental rotation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Game Performance Tab */}
        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Performance Over Time</CardTitle>
              <CardDescription>Performance trends across different cognitive training games</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Number Memory Game</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {cognitiveData.gamePerformance[cognitiveData.gamePerformance.length - 1].NumberMemory}
                  </div>
                  <div className="text-sm text-muted-foreground">Latest Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Highest Digit Sequence:</span>
                    <span className="font-medium">12 digits</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Reaction Time:</span>
                    <span className="font-medium">1.2 seconds</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Improvement Rate:</span>
                    <span className="font-medium text-green-500">+25% (3 months)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Word Association Game</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {cognitiveData.gamePerformance[cognitiveData.gamePerformance.length - 1].WordAssociation}
                  </div>
                  <div className="text-sm text-muted-foreground">Latest Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vocabulary Range:</span>
                    <span className="font-medium">Advanced</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Response Time:</span>
                    <span className="font-medium">2.3 seconds</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Improvement Rate:</span>
                    <span className="font-medium text-green-500">+23% (3 months)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pattern Recognition Game</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {cognitiveData.gamePerformance[cognitiveData.gamePerformance.length - 1].PatternRecognition}
                  </div>
                  <div className="text-sm text-muted-foreground">Latest Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pattern Complexity:</span>
                    <span className="font-medium">Level 8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Accuracy Rate:</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Improvement Rate:</span>
                    <span className="font-medium text-green-500">+27% (3 months)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spatial Memory Game</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {cognitiveData.gamePerformance[cognitiveData.gamePerformance.length - 1].SpatialMemory}
                  </div>
                  <div className="text-sm text-muted-foreground">Latest Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Max Grid Size:</span>
                    <span className="font-medium">6×6</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Pattern Length:</span>
                    <span className="font-medium">12 cells</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Improvement Rate:</span>
                    <span className="font-medium text-green-500">+22% (3 months)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Memory Game</CardTitle>
                <CardDescription>Performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {cognitiveData.gamePerformance[cognitiveData.gamePerformance.length - 1].WorkingMemory}
                  </div>
                  <div className="text-sm text-muted-foreground">Latest Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Max N-Back Level:</span>
                    <span className="font-medium">4-back</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Accuracy Rate:</span>
                    <span className="font-medium">83%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Improvement Rate:</span>
                    <span className="font-medium text-green-500">+35% (3 months)</span>
                  </div>
                </div>
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
                These predictions are generated by our AI model based on your cognitive data, lifestyle factors, and
                research on cognitive aging. They are intended as guidance and not as medical advice.
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
                  Personalized recommendations based on your cognitive profile and predictions
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
      </Tabs>
    </div>
  )
}

