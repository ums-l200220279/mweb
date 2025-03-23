"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Download,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react"
import { StudyStatus, getStudyManagementService } from "@/lib/research/study-management"
import { AnalysisType, getStatisticalAnalysisService } from "@/lib/research/statistical-analysis"

// Mock data for demonstration purposes
const activeStudy = {
  id: "study_123",
  title: "Longitudinal Assessment of Cognitive Decline in Older Adults",
  shortTitle: "Cognitive Decline Study",
  description: "A 24-month longitudinal study examining patterns of cognitive decline in adults over 65 years of age.",
  status: StudyStatus.ACTIVE,
  principalInvestigator: {
    id: "researcher_001",
    name: "Dr. Emily Rodriguez",
    institution: "University Medical Center",
    email: "e.rodriguez@umc.edu",
  },
  researchers: [
    {
      id: "researcher_002",
      name: "Dr. Michael Chen",
      role: "Co-Investigator",
      institution: "University Medical Center",
      email: "m.chen@umc.edu",
    },
    {
      id: "researcher_003",
      name: "Dr. Sarah Johnson",
      role: "Statistical Analyst",
      institution: "Data Science Institute",
      email: "s.johnson@dsi.edu",
    },
  ],
  startDate: "2023-01-15",
  targetParticipants: 500,
  currentParticipants: 328,
  protocol: {
    id: "protocol_123",
    version: "1.2",
    title: "Cognitive Decline Assessment Protocol",
    description: "Protocol for longitudinal assessment of cognitive decline",
    objectives: [
      "Identify early markers of cognitive decline",
      "Assess the rate of decline across different cognitive domains",
      "Evaluate the predictive value of digital cognitive assessments",
    ],
    inclusionCriteria: ["Age 65 or older", "Fluent in English", "Able to use a tablet device independently"],
    exclusionCriteria: [
      "Diagnosed dementia",
      "History of stroke or traumatic brain injury",
      "Severe visual or hearing impairment",
    ],
    assessments: [
      "Memoright Cognitive Assessment Battery",
      "Montreal Cognitive Assessment (MoCA)",
      "Digital Symbol Substitution Test",
      "Trail Making Test A & B",
    ],
    schedule: {
      duration: 730, // 24 months in days
      visits: [
        {
          name: "Baseline",
          dayOffset: 0,
          assessments: ["Full Battery"],
        },
        {
          name: "6-Month Follow-up",
          dayOffset: 180,
          assessments: ["Full Battery"],
        },
        {
          name: "12-Month Follow-up",
          dayOffset: 365,
          assessments: ["Full Battery"],
        },
        {
          name: "18-Month Follow-up",
          dayOffset: 545,
          assessments: ["Full Battery"],
        },
        {
          name: "24-Month Follow-up",
          dayOffset: 730,
          assessments: ["Full Battery"],
        },
      ],
    },
    dataCollectionMethods: ["In-person assessments", "Remote digital assessments", "Caregiver questionnaires"],
    statisticalAnalysisPlan: "Mixed-effects modeling will be used to assess cognitive trajectories over time.",
  },
  publications: [],
  datasets: [],
}

const participantData = {
  total: 328,
  active: 312,
  withdrawn: 16,
  completed: {
    baseline: 328,
    month6: 305,
    month12: 280,
    month18: 150,
    month24: 0,
  },
  demographics: {
    ageGroups: [
      { name: "65-69", count: 120 },
      { name: "70-74", count: 98 },
      { name: "75-79", count: 65 },
      { name: "80+", count: 45 },
    ],
    gender: [
      { name: "Female", count: 185 },
      { name: "Male", count: 143 },
    ],
    education: [
      { name: "High School", count: 95 },
      { name: "Some College", count: 78 },
      { name: "Bachelor's", count: 102 },
      { name: "Graduate", count: 53 },
    ],
  },
}

export function StudyDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const studyManagementService = getStudyManagementService()
  const statisticalAnalysisService = getStatisticalAnalysisService()

  const handleExportData = async (format: "csv" | "json" | "sav" | "xlsx") => {
    try {
      const exportUrl = await studyManagementService.exportStudyData(activeStudy.id, format)
      window.open(exportUrl, "_blank")
    } catch (error) {
      console.error("Failed to export data", error)
    }
  }

  const handleRunAnalysis = async (analysisType: AnalysisType) => {
    try {
      // In a real implementation, this would show a configuration modal
      // and then run the analysis with the specified parameters
      console.log(`Running ${analysisType} analysis`)
    } catch (error) {
      console.error("Failed to run analysis", error)
    }
  }

  const completionPercentage = (activeStudy.currentParticipants / activeStudy.targetParticipants) * 100

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{activeStudy.shortTitle}</h2>
          <p className="text-muted-foreground">{activeStudy.description}</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              activeStudy.status === StudyStatus.ACTIVE
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
            }`}
          >
            {activeStudy.status === StudyStatus.ACTIVE ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <AlertTriangle className="mr-1 h-3 w-3" />
            )}
            {activeStudy.status}
          </span>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Study Protocol
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeStudy.currentParticipants} / {activeStudy.targetParticipants}
            </div>
            <Progress value={completionPercentage} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completionPercentage.toFixed(1)}% of target enrollment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 months</div>
            <p className="text-xs text-muted-foreground mt-2">
              Started: {new Date(activeStudy.startDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95.1%</div>
            <p className="text-xs text-muted-foreground mt-2">{participantData.withdrawn} participants withdrawn</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Information</CardTitle>
              <CardDescription>Key details about the research study</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Principal Investigator</h4>
                <p>{activeStudy.principalInvestigator.name}</p>
                <p className="text-sm text-muted-foreground">{activeStudy.principalInvestigator.institution}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Research Team</h4>
                <ul className="space-y-2">
                  {activeStudy.researchers.map((researcher) => (
                    <li key={researcher.id}>
                      <p>
                        {researcher.name} - {researcher.role}
                      </p>
                      <p className="text-sm text-muted-foreground">{researcher.institution}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Study Objectives</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {activeStudy.protocol.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Assessment Schedule</h4>
                <ul className="space-y-2">
                  {activeStudy.protocol.schedule.visits.map((visit, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{visit.name}</span>
                      <span className="text-muted-foreground">Day {visit.dayOffset}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Participant Status</CardTitle>
                <CardDescription>Current status of study participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Active Participants</span>
                      <span>{participantData.active}</span>
                    </div>
                    <Progress value={(participantData.active / participantData.total) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Withdrawn Participants</span>
                      <span>{participantData.withdrawn}</span>
                    </div>
                    <Progress value={(participantData.withdrawn / participantData.total) * 100} className="h-2" />
                  </div>

                  <div className="pt-4">
                    <h4 className="text-sm font-semibold mb-2">Visit Completion</h4>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Baseline</span>
                          <span>
                            {participantData.completed.baseline} / {participantData.total}
                          </span>
                        </div>
                        <Progress
                          value={(participantData.completed.baseline / participantData.total) * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>6-Month</span>
                          <span>
                            {participantData.completed.month6} / {participantData.total}
                          </span>
                        </div>
                        <Progress
                          value={(participantData.completed.month6 / participantData.total) * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>12-Month</span>
                          <span>
                            {participantData.completed.month12} / {participantData.total}
                          </span>
                        </div>
                        <Progress
                          value={(participantData.completed.month12 / participantData.total) * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>18-Month</span>
                          <span>
                            {participantData.completed.month18} / {participantData.total}
                          </span>
                        </div>
                        <Progress
                          value={(participantData.completed.month18 / participantData.total) * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>24-Month</span>
                          <span>
                            {participantData.completed.month24} / {participantData.total}
                          </span>
                        </div>
                        <Progress
                          value={(participantData.completed.month24 / participantData.total) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>Demographic breakdown of study participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Age Groups</h4>
                    <div className="space-y-2">
                      {participantData.demographics.ageGroups.map((group, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span>{group.name}</span>
                            <span>
                              {group.count} ({((group.count / participantData.total) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(group.count / participantData.total) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Gender</h4>
                    <div className="space-y-2">
                      {participantData.demographics.gender.map((group, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span>{group.name}</span>
                            <span>
                              {group.count} ({((group.count / participantData.total) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(group.count / participantData.total) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Education</h4>
                    <div className="space-y-2">
                      {participantData.demographics.education.map((group, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span>{group.name}</span>
                            <span>
                              {group.count} ({((group.count / participantData.total) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={(group.count / participantData.total) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Statistical Analysis</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExportData("csv")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportData("xlsx")}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:border-primary"
              onClick={() => handleRunAnalysis(AnalysisType.DESCRIPTIVE)}
            >
              <CardHeader>
                <CardTitle>Descriptive Statistics</CardTitle>
                <CardDescription>Basic statistical measures of central tendency and dispersion</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart3 className="h-16 w-16 text-primary mx-auto mb-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Analyze means, medians, standard deviations, and distributions
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  Run Analysis
                </Button>
              </CardFooter>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary"
              onClick={() => handleRunAnalysis(AnalysisType.CORRELATION)}
            >
              <CardHeader>
                <CardTitle>Correlation Analysis</CardTitle>
                <CardDescription>Examine relationships between variables</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart3 className="h-16 w-16 text-primary mx-auto mb-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Calculate Pearson, Spearman, or Kendall correlations
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  Run Analysis
                </Button>
              </CardFooter>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary"
              onClick={() => handleRunAnalysis(AnalysisType.REGRESSION)}
            >
              <CardHeader>
                <CardTitle>Regression Analysis</CardTitle>
                <CardDescription>Model relationships and make predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart3 className="h-16 w-16 text-primary mx-auto mb-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Linear, multiple, or logistic regression models
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  Run Analysis
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

