"use client"

import { useState, useEffect } from "react"
import { useApiQuery } from "@/lib/api/hooks/use-api-query"
import { useApiMutation } from "@/lib/api/hooks/use-api-mutation"
import {
  CognitiveDomain,
  type CognitiveAssessmentResult,
  type CognitiveTrendAnalysis,
  type CognitiveAnomalyDetection,
  type CognitiveRiskAssessment,
} from "@/lib/ai/cognitive-analysis"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/layout/page-header"
import { Section } from "@/components/layout/section"
import { Container } from "@/components/layout/container"
import { ResponsiveGrid } from "@/components/layout/responsive-grid"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/security/auth-middleware"
import { useTracing } from "@/lib/observability/tracing"
import { useMetrics } from "@/lib/observability/metrics"
import { Brain, Calendar, Download, AlertTriangle, TrendingDown, TrendingUp, Activity } from "lucide-react"
import { format } from "date-fns"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
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
  Cell,
} from "recharts"

// Mock patient data
const PATIENT_DATA = {
  id: "p12345",
  name: "John Doe",
  age: 72,
  gender: "Male",
  lastAssessment: new Date().toISOString(),
  overallScore: 78,
  demographics: {
    age: 72,
    gender: "Male",
    education: "College",
    familyHistory: true,
  },
}

// Mock assessment results
const MOCK_ASSESSMENT_RESULTS: CognitiveAssessmentResult[] = [
  {
    patientId: PATIENT_DATA.id,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    domain: CognitiveDomain.MEMORY,
    score: 75,
    rawData: {},
    metadata: {},
  },
  {
    patientId: PATIENT_DATA.id,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    domain: CognitiveDomain.ATTENTION,
    score: 82,
    rawData: {},
    metadata: {},
  },
  {
    patientId: PATIENT_DATA.id,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    domain: CognitiveDomain.EXECUTIVE_FUNCTION,
    score: 68,
    rawData: {},
    metadata: {},
  },
  {
    patientId: PATIENT_DATA.id,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    domain: CognitiveDomain.LANGUAGE,
    score: 85,
    rawData: {},
    metadata: {},
  },
  {
    patientId: PATIENT_DATA.id,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    domain: CognitiveDomain.VISUOSPATIAL,
    score: 79,
    rawData: {},
    metadata: {},
  },
  {
    patientId: PATIENT_DATA.id,
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    domain: CognitiveDomain.PROCESSING_SPEED,
    score: 72,
    rawData: {},
    metadata: {},
  },
]

// Domain colors
const DOMAIN_COLORS: Record<CognitiveDomain, string> = {
  [CognitiveDomain.MEMORY]: "#0ea5e9",
  [CognitiveDomain.ATTENTION]: "#f59e0b",
  [CognitiveDomain.EXECUTIVE_FUNCTION]: "#10b981",
  [CognitiveDomain.LANGUAGE]: "#8b5cf6",
  [CognitiveDomain.VISUOSPATIAL]: "#ec4899",
  [CognitiveDomain.PROCESSING_SPEED]: "#f43f5e",
}

// Domain labels
const DOMAIN_LABELS: Record<CognitiveDomain, string> = {
  [CognitiveDomain.MEMORY]: "Memory",
  [CognitiveDomain.ATTENTION]: "Attention",
  [CognitiveDomain.EXECUTIVE_FUNCTION]: "Executive Function",
  [CognitiveDomain.LANGUAGE]: "Language",
  [CognitiveDomain.VISUOSPATIAL]: "Visuospatial",
  [CognitiveDomain.PROCESSING_SPEED]: "Processing Speed",
}

export default function CognitiveAnalysisDashboard() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { withSpan } = useTracing()
  const { activeUsers } = useMetrics()

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const [selectedDomain, setSelectedDomain] = useState<CognitiveDomain>(CognitiveDomain.MEMORY)

  // Track active users
  useEffect(() => {
    if (user) {
      activeUsers.inc(1, { type: "dashboard" })

      return () => {
        activeUsers.dec(1, { type: "dashboard" })
      }
    }
  }, [user, activeUsers])

  // Fetch domain scores
  const {
    data: domainScores,
    isLoading: isLoadingScores,
    error: scoresError,
    refetch: refetchScores,
  } = useApiQuery<Record<CognitiveDomain, number>>({
    queryKey: ["cognitive", "scores", PATIENT_DATA.id],
    queryFn: async () => {
      // In a real implementation, this would call the API
      // For demonstration purposes, we'll simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate API response
      const response = await fetch("/api/cognitive/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: MOCK_ASSESSMENT_RESULTS }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch domain scores")
      }

      const data = await response.json()
      return data.analysis
    },
    enabled: !!user,
  })

  // Fetch trend analysis
  const {
    data: trendAnalysis,
    isLoading: isLoadingTrend,
    error: trendError,
    refetch: refetchTrend,
  } = useApiQuery<CognitiveTrendAnalysis>({
    queryKey: [
      "cognitive",
      "trends",
      PATIENT_DATA.id,
      selectedDomain,
      dateRange.from.getTime(),
      dateRange.to.getTime(),
    ],
    queryFn: async () => {
      // In a real implementation, this would call the API
      // For demonstration purposes, we'll simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200))

      // Simulate API response
      const response = await fetch("/api/cognitive/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: PATIENT_DATA.id,
          domain: selectedDomain,
          timeRange: {
            start: dateRange.from.getTime(),
            end: dateRange.to.getTime(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch trend analysis")
      }

      const data = await response.json()
      return data.trends
    },
    enabled: !!user && !!selectedDomain,
  })

  // Fetch anomalies
  const {
    data: anomalies,
    isLoading: isLoadingAnomalies,
    error: anomaliesError,
    refetch: refetchAnomalies,
  } = useApiQuery<CognitiveAnomalyDetection[]>({
    queryKey: ["cognitive", "anomalies", PATIENT_DATA.id, selectedDomain],
    queryFn: async () => {
      // In a real implementation, this would call the API
      // For demonstration purposes, we'll simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate API response
      const response = await fetch("/api/cognitive/anomalies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: PATIENT_DATA.id,
          domain: selectedDomain,
          recentResults: MOCK_ASSESSMENT_RESULTS.filter((r) => r.domain === selectedDomain),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch anomalies")
      }

      const data = await response.json()
      return data.anomalies
    },
    enabled: !!user && !!selectedDomain,
  })

  // Fetch risk assessment
  const {
    data: riskAssessment,
    isLoading: isLoadingRisk,
    error: riskError,
    refetch: refetchRisk,
  } = useApiQuery<CognitiveRiskAssessment>({
    queryKey: ["cognitive", "risk", PATIENT_DATA.id],
    queryFn: async () => {
      // In a real implementation, this would call the API
      // For demonstration purposes, we'll simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1800))

      // Simulate API response
      const response = await fetch("/api/cognitive/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: PATIENT_DATA.id,
          domainScores: domainScores || {},
          demographics: PATIENT_DATA.demographics,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch risk assessment")
      }

      const data = await response.json()
      return data.risk
    },
    enabled: !!user && !!domainScores,
  })

  // Export data mutation
  const exportMutation = useApiMutation({
    mutationFn: async () => {
      return withSpan("exportData", async () => {
        // In a real implementation, this would call the API
        // For demonstration purposes, we'll simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simulate successful export
        return { success: true }
      })
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "Data has been exported successfully.",
        duration: 3000,
      })
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data.",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  // Handle export
  const handleExport = () => {
    exportMutation.mutate()
  }

  // Handle refresh
  const handleRefresh = () => {
    refetchScores()
    refetchTrend()
    refetchAnomalies()
    refetchRisk()

    toast({
      title: "Refreshing Data",
      description: "Fetching the latest cognitive data.",
      duration: 3000,
    })
  }

  // Format domain scores for charts
  const domainScoresData = domainScores
    ? Object.entries(domainScores).map(([domain, score]) => ({
        domain: DOMAIN_LABELS[domain as CognitiveDomain],
        score,
        color: DOMAIN_COLORS[domain as CognitiveDomain],
      }))
    : []

  // Format risk data for charts
  const riskData = riskAssessment
    ? Object.entries(riskAssessment.domainRisks).map(([domain, risk]) => ({
        domain: DOMAIN_LABELS[domain as CognitiveDomain],
        risk: risk * 100,
        color: DOMAIN_COLORS[domain as CognitiveDomain],
      }))
    : []

  return (
    <Container>
      <PageHeader
        title="Cognitive Health Analysis"
        description="Comprehensive analysis of cognitive health data and trends"
        actions={
          <>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoadingScores || isLoadingTrend || isLoadingAnomalies || isLoadingRisk}
            >
              Refresh
            </Button>
            <Button onClick={handleExport} disabled={exportMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-medium">{PATIENT_DATA.name}</h2>
            <p className="text-sm text-muted-foreground">
              {PATIENT_DATA.age} years, {PATIENT_DATA.gender}
            </p>
          </div>
        </div>

        <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Cognitive Domains</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Overall Cognitive Health</CardTitle>
                <CardDescription>Current cognitive health score</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingScores ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : scoresError ? (
                  <ErrorMessage message={scoresError.message || "Failed to load data"} onRetry={refetchScores} />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold">{PATIENT_DATA.overallScore}</span>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Score", value: PATIENT_DATA.overallScore },
                              { name: "Remaining", value: 100 - PATIENT_DATA.overallScore },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            <Cell fill="#0ea5e9" />
                            <Cell fill="#e2e8f0" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Last assessment: {format(new Date(PATIENT_DATA.lastAssessment), "PPP")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>MMSE Score Progression</CardTitle>
                <CardDescription>Mini-Mental State Examination</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTrend ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : trendError ? (
                  <ErrorMessage message={trendError.message || "Failed to load data"} onRetry={refetchTrend} />
                ) : (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { date: "2023-01", score: 28 },
                          { date: "2023-02", score: 27 },
                          { date: "2023-03", score: 28 },
                          { date: "2023-04", score: 26 },
                          { date: "2023-05", score: 25 },
                          { date: "2023-06", score: 26 },
                        ]}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 30]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Cognitive Domains</CardTitle>
                <CardDescription>Performance across domains</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingScores ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : scoresError ? (
                  <ErrorMessage message={scoresError.message || "Failed to load data"} onRetry={refetchScores} />
                ) : (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={domainScoresData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="domain" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name="Score" dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </ResponsiveGrid>

          <Section title="Dementia Risk Assessment" description="Analysis of cognitive decline risk factors">
            <Card>
              <CardContent className="pt-6">
                {isLoadingRisk ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : riskError ? (
                  <ErrorMessage message={riskError.message || "Failed to load risk data"} onRetry={refetchRisk} />
                ) : !riskAssessment ? (
                  <EmptyState
                    icon={<AlertTriangle className="h-10 w-10" />}
                    title="No risk data available"
                    description="Risk assessment data is not available for this patient."
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-4">Overall Risk</h3>
                        <div className="relative w-full h-40">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{Math.round(riskAssessment.overallRisk * 100)}%</span>
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Risk", value: riskAssessment.overallRisk * 100 },
                                  { name: "Remaining", value: 100 - riskAssessment.overallRisk * 100 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                              >
                                <Cell fill="#f43f5e" />
                                <Cell fill="#e2e8f0" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-center text-muted-foreground mt-2">
                          Confidence: {Math.round(riskAssessment.confidence * 100)}%
                        </p>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-4">Domain Risk Factors</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={riskData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="domain" />
                              <YAxis domain={[0, 100]} />
                              <Tooltip />
                              <Bar dataKey="risk">
                                {riskData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Recommendations</h3>
                      <ul className="space-y-2">
                        {riskAssessment.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="mt-1 rounded-full bg-primary/10 p-1">
                              <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Section>
        </TabsContent>

        <TabsContent value="domains" className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(DOMAIN_LABELS).map(([domain, label]) => (
              <Button
                key={domain}
                variant={selectedDomain === domain ? "default" : "outline"}
                className="h-auto py-3 flex flex-col gap-2"
                onClick={() => setSelectedDomain(domain as CognitiveDomain)}
              >
                <span>{label}</span>
                {domainScores && (
                  <span className="text-lg font-bold">{Math.round(domainScores[domain as CognitiveDomain] || 0)}</span>
                )}
              </Button>
            ))}
          </div>

          <Section
            title={`${DOMAIN_LABELS[selectedDomain]} Performance`}
            description="Detailed analysis of domain performance over time"
          >
            <Card>
              <CardContent className="pt-6">
                {isLoadingTrend ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : trendError ? (
                  <ErrorMessage message={trendError.message || "Failed to load trend data"} onRetry={refetchTrend} />
                ) : !trendAnalysis ? (
                  <EmptyState
                    icon={<Calendar className="h-10 w-10" />}
                    title="No trend data available"
                    description="Trend data is not available for this domain and time range."
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trendAnalysis.dataPoints.map((point) => ({
                            date: format(new Date(point.timestamp), "MMM dd"),
                            score: point.score,
                          }))}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke={DOMAIN_COLORS[selectedDomain]}
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Trend Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Slope:</span>
                              <span className="font-medium flex items-center">
                                {trendAnalysis.trend.slope.toFixed(3)}
                                {trendAnalysis.trend.slope < 0 ? (
                                  <TrendingDown className="ml-1 h-4 w-4 text-destructive" />
                                ) : (
                                  <TrendingUp className="ml-1 h-4 w-4 text-green-500" />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Correlation:</span>
                              <span className="font-medium">{trendAnalysis.trend.correlation.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Classification:</span>
                              <span className="font-medium capitalize">
                                {trendAnalysis.classification.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Statistical Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Percentile:</span>
                              <span className="font-medium">{trendAnalysis.percentile.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Z-Score:</span>
                              <span className="font-medium">{trendAnalysis.zScore.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Confidence:</span>
                              <span className="font-medium">{(trendAnalysis.confidence * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Interpretation</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">
                            {trendAnalysis.classification === "normal"
                              ? "Performance is within normal range with no significant decline observed."
                              : trendAnalysis.classification === "mild_decline"
                                ? "Mild decline observed. Recommend continued monitoring and cognitive exercises."
                                : trendAnalysis.classification === "moderate_decline"
                                  ? "Moderate decline observed. Consider clinical evaluation and intervention strategies."
                                  : "Significant decline observed. Immediate clinical evaluation recommended."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Section>
        </TabsContent>

        <TabsContent value="assessments">
          <Section title="Assessment History" description="History of cognitive assessments and game performance">
            <Card>
              <CardContent className="pt-6">
                <p>Assessment content will be implemented here.</p>
              </CardContent>
            </Card>
          </Section>
        </TabsContent>

        <TabsContent value="predictions">
          <Section title="Cognitive Predictions" description="Predictive analysis of cognitive health trajectory">
            <Card>
              <CardContent className="pt-6">
                <p>Predictions content will be implemented here.</p>
              </CardContent>
            </Card>
          </Section>
        </TabsContent>

        <TabsContent value="anomalies">
          <Section title="Anomaly Detection" description="Detection of unusual patterns in cognitive performance">
            <Card>
              <CardContent className="pt-6">
                {isLoadingAnomalies ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : anomaliesError ? (
                  <ErrorMessage
                    message={anomaliesError.message || "Failed to load anomaly data"}
                    onRetry={refetchAnomalies}
                  />
                ) : !anomalies || anomalies.length === 0 ? (
                  <EmptyState
                    icon={<AlertTriangle className="h-10 w-10" />}
                    title="No anomalies detected"
                    description="No significant anomalies have been detected in the selected domain."
                  />
                ) : (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      {anomalies.length} anomalies detected in {DOMAIN_LABELS[selectedDomain]} domain.
                    </p>

                    <div className="space-y-4">
                      {anomalies.map((anomaly, index) => (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center">
                              <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                              Anomaly on {format(new Date(anomaly.timestamp), "PPP")}
                            </CardTitle>
                            <CardDescription>Confidence: {(anomaly.confidence * 100).toFixed(1)}%</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Actual Score</p>
                                  <p className="text-xl font-bold">{anomaly.score.toFixed(1)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Expected Score</p>
                                  <p className="text-xl font-bold">{anomaly.expectedScore.toFixed(1)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Deviation (Z-Score)</p>
                                  <p className="text-xl font-bold">{anomaly.zScore.toFixed(2)}</p>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Contributing Factors</p>
                                <div className="space-y-2">
                                  {anomaly.factors.map((factor, idx) => (
                                    <div key={idx} className="flex items-center">
                                      <div className="w-full bg-secondary rounded-full h-2.5">
                                        <div
                                          className="bg-primary h-2.5 rounded-full"
                                          style={{ width: `${factor.contribution * 100}%` }}
                                        ></div>
                                      </div>
                                      <span className="ml-2 text-sm min-w-[100px]">
                                        {factor.name} ({(factor.contribution * 100).toFixed(0)}%)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Section>
        </TabsContent>
      </Tabs>
    </Container>
  )
}

