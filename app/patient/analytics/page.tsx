"use client"

import { useState } from "react"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/layout/page-header"
import { Section } from "@/components/layout/section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Download, Filter } from "lucide-react"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveGrid } from "@/components/layout/responsive-grid"
import { AreaChart, BarChart, LineChart, PieChart } from "@/components/ui/chart"
import { useMediaQuery } from "@/hooks/use-media-query"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Mock data
const mockCognitiveScores = [
  { date: "2023-01", score: 28 },
  { date: "2023-02", score: 27 },
  { date: "2023-03", score: 26 },
  { date: "2023-04", score: 25 },
  { date: "2023-05", score: 26 },
  { date: "2023-06", score: 27 },
  { date: "2023-07", score: 28 },
  { date: "2023-08", score: 27 },
  { date: "2023-09", score: 26 },
  { date: "2023-10", score: 25 },
  { date: "2023-11", score: 24 },
  { date: "2023-12", score: 23 },
]

const mockDomainScores = [
  { name: "Memory", score: 75 },
  { name: "Attention", score: 82 },
  { name: "Language", score: 68 },
  { name: "Visuospatial", score: 90 },
  { name: "Executive", score: 65 },
]

const mockGamePerformance = [
  { game: "Memory Match", score: 85, date: "2023-12-01" },
  { game: "Word Recall", score: 72, date: "2023-12-03" },
  { game: "Pattern Recognition", score: 90, date: "2023-12-05" },
  { game: "Spatial Awareness", score: 78, date: "2023-12-07" },
  { game: "Attention Test", score: 82, date: "2023-12-09" },
]

const mockAnomalies = [
  { date: "2023-11-15", metric: "Response Time", value: 2.5, threshold: 1.8, severity: "medium" },
  { date: "2023-11-28", metric: "Memory Score", value: 65, threshold: 75, severity: "high" },
  { date: "2023-12-05", metric: "Attention Score", value: 68, threshold: 70, severity: "low" },
]

export default function PatientAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleExportData = () => {
    // Implementation for exporting data
    console.log("Exporting data...")
  }

  return (
    <Container>
      <PageHeader
        title="Cognitive Health Analytics"
        description="Track and analyze cognitive health metrics and performance over time"
        actions={
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="w-full md:w-auto md:flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <DatePickerWithRange />
          </CardContent>
        </Card>

        <Card className="w-full md:w-auto md:flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Data Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="tests">Cognitive Tests</SelectItem>
                <SelectItem value="games">Game Performance</SelectItem>
                <SelectItem value="activities">Daily Activities</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive Domains</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Section>
            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Current Cognitive Health</CardTitle>
                  <CardDescription>Based on latest assessment</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <PieChart
                      data={[
                        { name: "Score", value: 76 },
                        { name: "Remaining", value: 24 },
                      ]}
                      colors={["hsl(var(--primary))", "hsl(var(--muted))"]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={80}
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold">76</span>
                      <span className="text-sm text-muted-foreground">Good</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>MMSE Score</CardTitle>
                  <CardDescription>Mini-Mental State Examination</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <LineChart
                      data={mockCognitiveScores}
                      xAxisDataKey="date"
                      series={[
                        {
                          dataKey: "score",
                          name: "MMSE Score",
                          color: "hsl(var(--primary))",
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={false}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cognitive Domains</CardTitle>
                  <CardDescription>Performance across key areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <BarChart
                      data={mockDomainScores}
                      xAxisDataKey="name"
                      series={[
                        {
                          dataKey: "score",
                          name: "Score",
                          color: "hsl(var(--primary))",
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </Section>

          <Section title="Dementia Risk Assessment" description="Based on cognitive patterns and medical history">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">Current Risk Profile</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Overall Risk</span>
                          <span className="text-sm font-medium text-amber-500">Moderate</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "45%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Age Factor</span>
                          <span className="text-sm font-medium text-amber-500">Moderate</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "50%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Genetic Factor</span>
                          <span className="text-sm font-medium text-green-500">Low</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "25%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Cognitive Decline</span>
                          <span className="text-sm font-medium text-amber-500">Moderate</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                        </span>
                        <span>Schedule a follow-up cognitive assessment in 3 months</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                        </span>
                        <span>Increase frequency of memory exercises to daily</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                        </span>
                        <span>Consider Mediterranean diet for brain health</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                        </span>
                        <span>Maintain regular physical activity (30 min/day)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-6">
          <Section
            title="Cognitive Domain Performance"
            description="Detailed analysis of performance across cognitive domains"
          >
            <ResponsiveGrid cols={{ default: 1, lg: 2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Memory</CardTitle>
                  <CardDescription>Short and long-term memory performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <AreaChart
                      data={[
                        { date: "Jan", shortTerm: 65, longTerm: 75 },
                        { date: "Feb", shortTerm: 68, longTerm: 73 },
                        { date: "Mar", shortTerm: 70, longTerm: 72 },
                        { date: "Apr", shortTerm: 65, longTerm: 70 },
                        { date: "May", shortTerm: 63, longTerm: 68 },
                        { date: "Jun", shortTerm: 60, longTerm: 65 },
                      ]}
                      xAxisDataKey="date"
                      series={[
                        {
                          dataKey: "shortTerm",
                          name: "Short-term Memory",
                          color: "hsl(var(--primary))",
                          fillOpacity: 0.6,
                        },
                        {
                          dataKey: "longTerm",
                          name: "Long-term Memory",
                          color: "hsl(var(--accent))",
                          fillOpacity: 0.6,
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={true}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Attention</CardTitle>
                  <CardDescription>Sustained and divided attention metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <AreaChart
                      data={[
                        { date: "Jan", sustained: 80, divided: 75 },
                        { date: "Feb", sustained: 82, divided: 78 },
                        { date: "Mar", sustained: 85, divided: 80 },
                        { date: "Apr", sustained: 83, divided: 79 },
                        { date: "May", sustained: 80, divided: 75 },
                        { date: "Jun", sustained: 78, divided: 72 },
                      ]}
                      xAxisDataKey="date"
                      series={[
                        {
                          dataKey: "sustained",
                          name: "Sustained Attention",
                          color: "hsl(var(--primary))",
                          fillOpacity: 0.6,
                        },
                        {
                          dataKey: "divided",
                          name: "Divided Attention",
                          color: "hsl(var(--accent))",
                          fillOpacity: 0.6,
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={true}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Language</CardTitle>
                  <CardDescription>Verbal fluency and comprehension</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <AreaChart
                      data={[
                        { date: "Jan", fluency: 70, comprehension: 75 },
                        { date: "Feb", fluency: 68, comprehension: 73 },
                        { date: "Mar", fluency: 65, comprehension: 70 },
                        { date: "Apr", fluency: 63, comprehension: 68 },
                        { date: "May", fluency: 60, comprehension: 65 },
                        { date: "Jun", fluency: 58, comprehension: 63 },
                      ]}
                      xAxisDataKey="date"
                      series={[
                        {
                          dataKey: "fluency",
                          name: "Verbal Fluency",
                          color: "hsl(var(--primary))",
                          fillOpacity: 0.6,
                        },
                        {
                          dataKey: "comprehension",
                          name: "Comprehension",
                          color: "hsl(var(--accent))",
                          fillOpacity: 0.6,
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={true}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Executive Function</CardTitle>
                  <CardDescription>Planning, decision-making, and problem-solving</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <AreaChart
                      data={[
                        { date: "Jan", planning: 65, problemSolving: 70 },
                        { date: "Feb", planning: 68, problemSolving: 72 },
                        { date: "Mar", planning: 70, problemSolving: 75 },
                        { date: "Apr", planning: 72, problemSolving: 78 },
                        { date: "May", planning: 70, problemSolving: 75 },
                        { date: "Jun", planning: 68, problemSolving: 73 },
                      ]}
                      xAxisDataKey="date"
                      series={[
                        {
                          dataKey: "planning",
                          name: "Planning",
                          color: "hsl(var(--primary))",
                          fillOpacity: 0.6,
                        },
                        {
                          dataKey: "problemSolving",
                          name: "Problem Solving",
                          color: "hsl(var(--accent))",
                          fillOpacity: 0.6,
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </Section>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Section
              title="Game Performance Analysis"
              description="Cognitive performance across different game activities"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Game Performance Trends</CardTitle>
                  <CardDescription>Score progression across different cognitive games</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <BarChart
                      data={mockGamePerformance}
                      xAxisDataKey="game"
                      series={[
                        {
                          dataKey: "score",
                          name: "Score",
                          color: "hsl(var(--primary))",
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={false}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Time Analysis</CardTitle>
                    <CardDescription>Average response time in seconds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <LineChart
                        data={[
                          { date: "Week 1", time: 2.5 },
                          { date: "Week 2", time: 2.3 },
                          { date: "Week 3", time: 2.1 },
                          { date: "Week 4", time: 2.0 },
                          { date: "Week 5", time: 1.9 },
                          { date: "Week 6", time: 1.8 },
                        ]}
                        xAxisDataKey="date"
                        series={[
                          {
                            dataKey: "time",
                            name: "Response Time (s)",
                            color: "hsl(var(--primary))",
                          },
                        ]}
                        showXAxis={true}
                        showYAxis={true}
                        showTooltip={true}
                        showLegend={false}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accuracy Trends</CardTitle>
                    <CardDescription>Percentage of correct responses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <LineChart
                        data={[
                          { date: "Week 1", accuracy: 75 },
                          { date: "Week 2", accuracy: 78 },
                          { date: "Week 3", accuracy: 80 },
                          { date: "Week 4", accuracy: 82 },
                          { date: "Week 5", accuracy: 85 },
                          { date: "Week 6", accuracy: 83 },
                        ]}
                        xAxisDataKey="date"
                        series={[
                          {
                            dataKey: "accuracy",
                            name: "Accuracy (%)",
                            color: "hsl(var(--primary))",
                          },
                        ]}
                        showXAxis={true}
                        showYAxis={true}
                        showTooltip={true}
                        showLegend={false}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Section>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Section
            title="Cognitive Trajectory Prediction"
            description="AI-powered prediction of cognitive health over time"
          >
            <Card>
              <CardHeader>
                <CardTitle>Projected Cognitive Score</CardTitle>
                <CardDescription>6-month prediction based on current trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LineChart
                    data={[
                      { month: "Jan", actual: 76, predicted: null },
                      { month: "Feb", actual: 75, predicted: null },
                      { month: "Mar", actual: 73, predicted: null },
                      { month: "Apr", actual: 72, predicted: null },
                      { month: "May", actual: 70, predicted: null },
                      { month: "Jun", actual: 68, predicted: null },
                      { month: "Jul", actual: null, predicted: 67 },
                      { month: "Aug", actual: null, predicted: 65 },
                      { month: "Sep", actual: null, predicted: 64 },
                      { month: "Oct", actual: null, predicted: 62 },
                      { month: "Nov", actual: null, predicted: 61 },
                      { month: "Dec", actual: null, predicted: 60 },
                    ]}
                    xAxisDataKey="month"
                    series={[
                      {
                        dataKey: "actual",
                        name: "Actual Score",
                        color: "hsl(var(--primary))",
                      },
                      {
                        dataKey: "predicted",
                        name: "Predicted Score",
                        color: "hsl(var(--muted-foreground))",
                        strokeDasharray: "5 5",
                      },
                    ]}
                    showXAxis={true}
                    showYAxis={true}
                    showTooltip={true}
                    showLegend={true}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Intervention Impact Analysis</CardTitle>
                  <CardDescription>Projected impact of recommended interventions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <LineChart
                      data={[
                        { month: "Jul", baseline: 67, withIntervention: 67 },
                        { month: "Aug", baseline: 65, withIntervention: 66 },
                        { month: "Sep", baseline: 64, withIntervention: 66 },
                        { month: "Oct", baseline: 62, withIntervention: 67 },
                        { month: "Nov", baseline: 61, withIntervention: 68 },
                        { month: "Dec", baseline: 60, withIntervention: 70 },
                      ]}
                      xAxisDataKey="month"
                      series={[
                        {
                          dataKey: "baseline",
                          name: "Baseline Projection",
                          color: "hsl(var(--muted-foreground))",
                          strokeDasharray: "5 5",
                        },
                        {
                          dataKey: "withIntervention",
                          name: "With Interventions",
                          color: "hsl(var(--primary))",
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={true}
                    />
                  </div>

                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Recommended Interventions</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                        </span>
                        <span>Daily cognitive training exercises (30 minutes)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                        </span>
                        <span>Mediterranean diet rich in omega-3 fatty acids</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                        </span>
                        <span>Regular physical exercise (45 minutes, 3x weekly)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                        </span>
                        <span>Social engagement activities (2x weekly)</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Section
            title="Cognitive Anomaly Detection"
            description="Identification of unusual patterns in cognitive performance"
          >
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
                <CardDescription>Unusual patterns that may require attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Metric</th>
                        <th className="text-left py-3 px-4">Value</th>
                        <th className="text-left py-3 px-4">Threshold</th>
                        <th className="text-left py-3 px-4">Severity</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAnomalies.map((anomaly, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{anomaly.date}</td>
                          <td className="py-3 px-4">{anomaly.metric}</td>
                          <td className="py-3 px-4">{anomaly.value}</td>
                          <td className="py-3 px-4">{anomaly.threshold}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                anomaly.severity === "high"
                                  ? "bg-destructive/20 text-destructive"
                                  : anomaly.severity === "medium"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Timeline</CardTitle>
                  <CardDescription>Visualization of detected anomalies over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <LineChart
                      data={[
                        { date: "Week 1", score: 76, threshold: 70 },
                        { date: "Week 2", score: 75, threshold: 70 },
                        { date: "Week 3", score: 73, threshold: 70 },
                        { date: "Week 4", score: 72, threshold: 70 },
                        { date: "Week 5", score: 68, threshold: 70 },
                        { date: "Week 6", score: 65, threshold: 70 },
                        { date: "Week 7", score: 67, threshold: 70 },
                        { date: "Week 8", score: 69, threshold: 70 },
                        { date: "Week 9", score: 68, threshold: 70 },
                        { date: "Week 10", score: 66, threshold: 70 },
                        { date: "Week 11", score: 65, threshold: 70 },
                        { date: "Week 12", score: 63, threshold: 70 },
                      ]}
                      xAxisDataKey="date"
                      series={[
                        {
                          dataKey: "score",
                          name: "Cognitive Score",
                          color: "hsl(var(--primary))",
                        },
                        {
                          dataKey: "threshold",
                          name: "Threshold",
                          color: "hsl(var(--destructive))",
                          strokeDasharray: "5 5",
                        },
                      ]}
                      showXAxis={true}
                      showYAxis={true}
                      showTooltip={true}
                      showLegend={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </Container>
  )
}

