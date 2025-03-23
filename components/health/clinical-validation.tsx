"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart } from "@/components/ui/chart"
import { FileText, Users, CheckCircle, AlertTriangle, BookOpen } from "lucide-react"

// Mock data for demonstration purposes
const validationStudies = [
  {
    id: "study1",
    title: "Validation of Memoright Cognitive Assessment Tools",
    status: "Completed",
    participants: 250,
    duration: "12 months",
    location: "Multi-center (5 sites)",
    leadInvestigator: "Dr. Sarah Johnson",
    results: {
      sensitivity: 0.92,
      specificity: 0.88,
      accuracy: 0.9,
      ppv: 0.86, // Positive Predictive Value
      npv: 0.93, // Negative Predictive Value
    },
    conclusion:
      "The Memoright cognitive assessment tools demonstrated high sensitivity and specificity for detecting mild cognitive impairment and early-stage dementia.",
    publication: "Journal of Cognitive Assessment, 2023",
  },
  {
    id: "study2",
    title: "Longitudinal Assessment of Memoright Prediction Algorithms",
    status: "In Progress",
    participants: 500,
    duration: "24 months",
    location: "Multi-center (8 sites)",
    leadInvestigator: "Dr. Michael Chen",
    results: {
      sensitivity: 0.89,
      specificity: 0.85,
      accuracy: 0.87,
      ppv: 0.83,
      npv: 0.91,
    },
    conclusion: "Preliminary results indicate strong predictive validity for cognitive decline over a 12-month period.",
    publication: "Pending",
  },
  {
    id: "study3",
    title: "Comparison of Memoright to Traditional Neuropsychological Assessments",
    status: "Completed",
    participants: 180,
    duration: "9 months",
    location: "Single-center",
    leadInvestigator: "Dr. Emily Rodriguez",
    results: {
      sensitivity: 0.87,
      specificity: 0.91,
      accuracy: 0.89,
      ppv: 0.89,
      npv: 0.9,
    },
    conclusion:
      "Memoright assessments showed strong correlation with traditional neuropsychological test batteries while requiring significantly less administration time.",
    publication: "Digital Health Technologies, 2022",
  },
]

const performanceMetrics = [
  { name: "Sensitivity", study1: 0.92, study2: 0.89, study3: 0.87 },
  { name: "Specificity", study1: 0.88, study2: 0.85, study3: 0.91 },
  { name: "Accuracy", study1: 0.9, study2: 0.87, study3: 0.89 },
  { name: "PPV", study1: 0.86, study2: 0.83, study3: 0.89 },
  { name: "NPV", study1: 0.93, study2: 0.91, study3: 0.9 },
]

const comparisonData = [
  { name: "MMSE", sensitivity: 0.81, specificity: 0.89, timeToAdminister: 10 },
  { name: "MoCA", sensitivity: 0.86, specificity: 0.87, timeToAdminister: 15 },
  { name: "SLUMS", sensitivity: 0.82, specificity: 0.86, timeToAdminister: 12 },
  { name: "Memoright", sensitivity: 0.9, specificity: 0.88, timeToAdminister: 8 },
]

export function ClinicalValidation() {
  const [selectedStudy, setSelectedStudy] = useState(validationStudies[0])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Clinical Validation</h2>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation Studies</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validationStudies.length}</div>
            <p className="text-xs text-muted-foreground">
              {validationStudies.filter((s) => s.status === "Completed").length} completed,{" "}
              {validationStudies.filter((s) => s.status === "In Progress").length} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validationStudies.reduce((sum, study) => sum + study.participants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across {validationStudies.length} studies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (validationStudies.reduce((sum, study) => sum + (study.results?.accuracy || 0), 0) /
                  validationStudies.length) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">Weighted average across all studies</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="studies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="studies">Validation Studies</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="comparison">Comparative Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="studies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {validationStudies.map((study) => (
              <Card
                key={study.id}
                className={selectedStudy.id === study.id ? "border-primary" : ""}
                onClick={() => setSelectedStudy(study)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{study.title}</CardTitle>
                  <CardDescription>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        study.status === "Completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      {study.status === "Completed" ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      )}
                      {study.status}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="font-medium">{study.participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{study.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="font-medium">{(study.results?.accuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" onClick={() => setSelectedStudy(study)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{selectedStudy.title}</CardTitle>
              <CardDescription>
                Led by {selectedStudy.leadInvestigator} at {selectedStudy.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Study Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{selectedStudy.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="font-medium">{selectedStudy.participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{selectedStudy.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedStudy.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Publication:</span>
                      <span className="font-medium">{selectedStudy.publication}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Results</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sensitivity:</span>
                      <span className="font-medium">{(selectedStudy.results.sensitivity * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Specificity:</span>
                      <span className="font-medium">{(selectedStudy.results.specificity * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="font-medium">{(selectedStudy.results.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Positive Predictive Value:</span>
                      <span className="font-medium">{(selectedStudy.results.ppv * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Negative Predictive Value:</span>
                      <span className="font-medium">{(selectedStudy.results.npv * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Conclusion</h4>
                <p className="text-muted-foreground">{selectedStudy.conclusion}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Across Studies</CardTitle>
              <CardDescription>Comparison of key validation metrics across all studies</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={performanceMetrics}
                index="name"
                categories={["study1", "study2", "study3"]}
                colors={["blue", "green", "purple"]}
                valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                className="h-80"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparison with Traditional Assessments</CardTitle>
              <CardDescription>Memoright vs. standard cognitive assessment tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Sensitivity & Specificity</h4>
                  <BarChart
                    data={comparisonData}
                    index="name"
                    categories={["sensitivity", "specificity"]}
                    colors={["blue", "green"]}
                    valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                    className="h-80"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Administration Time (minutes)</h4>
                  <BarChart
                    data={comparisonData}
                    index="name"
                    categories={["timeToAdminister"]}
                    colors={["purple"]}
                    valueFormatter={(value) => `${value} min`}
                    className="h-80"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

