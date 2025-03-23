"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertCircle,
  BookOpen,
  FileText,
  Stethoscope,
  ClipboardCheck,
  ArrowRight,
  ExternalLink,
  ThumbsUp,
} from "lucide-react"
import { ClinicalAlertLevel } from "@/lib/health/clinical-workflow"
import { CognitiveDomain } from "@/lib/ai/cognitive-analysis"

// Mock data for demonstration purposes
const patientData = {
  id: "p12345",
  name: "John Doe",
  age: 72,
  gender: "Male",
  conditions: [
    { code: "G30.9", name: "Alzheimer's disease", onset: "2020-03-15" },
    { code: "I10", name: "Hypertension", onset: "2015-06-22" },
    { code: "E11.9", name: "Type 2 Diabetes", onset: "2018-11-03" },
  ],
  medications: [
    { name: "Donepezil", dosage: "10mg", frequency: "daily", startDate: "2020-04-10" },
    { name: "Lisinopril", dosage: "20mg", frequency: "daily", startDate: "2015-07-05" },
    { name: "Metformin", dosage: "1000mg", frequency: "twice daily", startDate: "2018-11-15" },
  ],
}

const domainScores = {
  [CognitiveDomain.MEMORY]: 65,
  [CognitiveDomain.ATTENTION]: 72,
  [CognitiveDomain.EXECUTIVE_FUNCTION]: 58,
  [CognitiveDomain.LANGUAGE]: 80,
  [CognitiveDomain.VISUOSPATIAL]: 75,
  [CognitiveDomain.PROCESSING_SPEED]: 62,
}

const mockRecommendations = [
  {
    id: "rec_1",
    title: "Consider Cognitive Enhancer Adjustment",
    description:
      "Patient shows continued memory impairment despite current therapy. Consider adjusting acetylcholinesterase inhibitor or adding memantine.",
    evidenceLevel: "high",
    references: [
      "Birks J. Cholinesterase inhibitors for Alzheimer's disease. Cochrane Database Syst Rev. 2006",
      "McShane R, et al. Memantine for dementia. Cochrane Database Syst Rev. 2019",
    ],
    actions: [
      {
        id: "action_1",
        name: "Add Memantine",
        description: "Start with 5mg daily, titrate weekly by 5mg to target dose of 10mg twice daily",
        type: "medication",
      },
      {
        id: "action_2",
        name: "Schedule Follow-up",
        description: "Schedule follow-up in 4 weeks to assess response and side effects",
        type: "appointment",
      },
    ],
  },
  {
    id: "rec_2",
    title: "Cognitive Rehabilitation for Executive Function",
    description:
      "Patient shows significant executive function deficits. Evidence supports structured cognitive rehabilitation therapy.",
    evidenceLevel: "moderate",
    references: [
      "Bahar-Fuchs A, et al. Cognitive training and cognitive rehabilitation for mild to moderate Alzheimer's disease and vascular dementia. Cochrane Database Syst Rev. 2013",
    ],
    actions: [
      {
        id: "action_3",
        name: "Refer to Occupational Therapy",
        description:
          "Refer to occupational therapy for cognitive rehabilitation program focusing on executive function",
        type: "referral",
      },
    ],
  },
  {
    id: "rec_3",
    title: "Caregiver Support and Education",
    description: "Caregiver education and support has been shown to improve outcomes and reduce caregiver burden.",
    evidenceLevel: "high",
    references: [
      "Livingston G, et al. Dementia prevention, intervention, and care: 2020 report of the Lancet Commission. Lancet. 2020",
    ],
    actions: [
      {
        id: "action_4",
        name: "Caregiver Support Referral",
        description: "Refer to local Alzheimer's Association chapter for caregiver support group",
        type: "referral",
      },
      {
        id: "action_5",
        name: "Provide Educational Materials",
        description: "Provide educational materials on dementia management and caregiver self-care",
        type: "education",
      },
    ],
  },
]

const mockAlerts = [
  {
    id: "alert_1",
    patientId: patientData.id,
    level: ClinicalAlertLevel.WARNING,
    title: "Significant Memory Decline",
    description:
      "Patient shows 15% decline in memory performance over the past 3 months, exceeding the threshold for significant change.",
    triggerValue: -15,
    threshold: -10,
    domain: CognitiveDomain.MEMORY,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: false,
    actions: [
      {
        id: "action_1",
        name: "Review Medication",
        description: "Review current medications for efficacy and side effects",
        type: "review",
        parameters: {},
      },
      {
        id: "action_2",
        name: "Schedule Assessment",
        description: "Schedule comprehensive cognitive assessment",
        type: "appointment",
        parameters: {},
      },
    ],
  },
  {
    id: "alert_2",
    patientId: patientData.id,
    level: ClinicalAlertLevel.INFO,
    title: "Missed Cognitive Exercise Sessions",
    description: "Patient has completed only 40% of assigned cognitive exercise sessions in the past 2 weeks.",
    triggerValue: 40,
    threshold: 70,
    domain: "adherence",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    acknowledged: true,
    acknowledgedBy: "Dr. Smith",
    acknowledgedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    actions: [],
  },
]

export function ClinicalRecommendations() {
  const [selectedRecommendation, setSelectedRecommendation] = useState(mockRecommendations[0])
  const [implementedActions, setImplementedActions] = useState<string[]>([])

  const handleImplementAction = (actionId: string) => {
    if (implementedActions.includes(actionId)) {
      setImplementedActions(implementedActions.filter((id) => id !== actionId))
    } else {
      setImplementedActions([...implementedActions, actionId])
    }
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    // In a real implementation, this would call the service to acknowledge the alert
    console.log(`Acknowledging alert: ${alertId}`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Clinical Decision Support</h2>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Export to EMR
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientData.name}</div>
            <p className="text-xs text-muted-foreground">
              {patientData.age} years, {patientData.gender}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAlerts.filter((alert) => !alert.acknowledged).length}</div>
            <p className="text-xs text-muted-foreground">
              {mockAlerts.filter((alert) => alert.level === ClinicalAlertLevel.WARNING).length} warnings,
              {mockAlerts.filter((alert) => alert.level === ClinicalAlertLevel.CRITICAL).length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendations</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockRecommendations.filter((rec) => rec.evidenceLevel === "high").length} high evidence,
              {mockRecommendations.filter((rec) => rec.evidenceLevel === "moderate").length} moderate evidence
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="alerts">Clinical Alerts</TabsTrigger>
          <TabsTrigger value="history">Patient History</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Clinical Recommendations</CardTitle>
                  <CardDescription>Based on cognitive assessment results and clinical data</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-2">
                      {mockRecommendations.map((recommendation) => (
                        <div
                          key={recommendation.id}
                          className={`p-4 rounded-md cursor-pointer transition-colors ${
                            selectedRecommendation.id === recommendation.id
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => setSelectedRecommendation(recommendation)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{recommendation.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{recommendation.description}</p>
                            </div>
                            <Badge
                              variant={
                                recommendation.evidenceLevel === "high"
                                  ? "default"
                                  : recommendation.evidenceLevel === "moderate"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {recommendation.evidenceLevel}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{selectedRecommendation.title}</CardTitle>
                  <CardDescription>
                    Evidence level:{" "}
                    <span className="font-medium capitalize">{selectedRecommendation.evidenceLevel}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recommendation</h4>
                    <p className="text-muted-foreground">{selectedRecommendation.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Suggested Actions</h4>
                    <div className="space-y-3">
                      {selectedRecommendation.actions.map((action) => (
                        <div key={action.id} className="flex items-start justify-between p-3 rounded-md border">
                          <div>
                            <h5 className="font-medium">{action.name}</h5>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {action.type}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant={implementedActions.includes(action.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleImplementAction(action.id)}
                          >
                            {implementedActions.includes(action.id) ? (
                              <>
                                <ThumbsUp className="mr-1 h-3 w-3" />
                                Implemented
                              </>
                            ) : (
                              <>
                                <ArrowRight className="mr-1 h-3 w-3" />
                                Implement
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Evidence Base</h4>
                    <div className="space-y-2">
                      {selectedRecommendation.references.map((reference, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{reference}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View Guidelines
                  </Button>
                  <Button size="sm">Document in EMR</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Alerts</CardTitle>
              <CardDescription>Alerts based on cognitive assessment results and clinical thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAlerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`border-l-4 ${
                      alert.level === ClinicalAlertLevel.CRITICAL
                        ? "border-l-destructive"
                        : alert.level === ClinicalAlertLevel.WARNING
                          ? "border-l-yellow-500"
                          : "border-l-blue-500"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center">
                          <AlertCircle
                            className={`mr-2 h-4 w-4 ${
                              alert.level === ClinicalAlertLevel.CRITICAL
                                ? "text-destructive"
                                : alert.level === ClinicalAlertLevel.WARNING
                                  ? "text-yellow-500"
                                  : "text-blue-500"
                            }`}
                          />
                          {alert.title}
                        </CardTitle>
                        <Badge variant={alert.acknowledged ? "outline" : "secondary"}>
                          {alert.acknowledged ? "Acknowledged" : "New"}
                        </Badge>
                      </div>
                      <CardDescription>{new Date(alert.timestamp).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{alert.description}</p>

                      {alert.domain && (
                        <div className="flex items-center text-sm mb-4">
                          <span className="text-muted-foreground mr-2">Domain:</span>
                          <Badge variant="outline">{alert.domain}</Badge>
                        </div>
                      )}

                      {alert.actions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Recommended Actions</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {alert.actions.map((action) => (
                              <Button key={action.id} variant="outline" size="sm" className="justify-start">
                                <ArrowRight className="mr-2 h-3 w-3" />
                                {action.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      {!alert.acknowledged ? (
                        <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          Acknowledge Alert
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Acknowledged by {alert.acknowledgedBy} on {new Date(alert.acknowledgedAt!).toLocaleString()}
                        </p>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient History</CardTitle>
              <CardDescription>Medical history and current medications</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="conditions">
                  <AccordionTrigger>Medical Conditions</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {patientData.conditions.map((condition, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                          <div>
                            <span className="font-medium">{condition.name}</span>
                            <div className="text-xs text-muted-foreground">Code: {condition.code}</div>
                          </div>
                          <div className="text-sm">Since: {new Date(condition.onset).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="medications">
                  <AccordionTrigger>Current Medications</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {patientData.medications.map((medication, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                          <div>
                            <span className="font-medium">{medication.name}</span>
                            <div className="text-xs text-muted-foreground">
                              {medication.dosage}, {medication.frequency}
                            </div>
                          </div>
                          <div className="text-sm">Started: {new Date(medication.startDate).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cognitive">
                  <AccordionTrigger>Cognitive Assessment History</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(domainScores).map(([domain, score]) => (
                          <div key={domain} className="p-3 rounded-md border">
                            <div className="text-sm text-muted-foreground">{domain.replace("_", " ")}</div>
                            <div className="text-2xl font-bold">{score}</div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                              <div
                                className={`h-2 rounded-full ${
                                  score >= 80
                                    ? "bg-green-500"
                                    : score >= 70
                                      ? "bg-blue-500"
                                      : score >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button variant="outline" size="sm">
                        View Full Assessment History
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

