"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import PatientOverviewTab from "@/components/doctor/patient-overview-tab"
import CognitiveAnalysisTab from "@/components/doctor/cognitive-analysis-tab"
import AppointmentsTab from "@/components/doctor/appointments-tab"
import ReportsTab from "@/components/doctor/reports-tab"
import DashboardMetrics from "@/components/doctor/dashboard-metrics"

export default function DoctorDashboard() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Dr. Sarah Chen</h1>
          <p className="text-muted-foreground">Here's your patient overview and daily schedule.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Schedule New Appointment
        </Button>
      </div>

      <DashboardMetrics />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Patient Overview</TabsTrigger>
          <TabsTrigger value="cognitive">Cognitive Analysis</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="reports">Reports & Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PatientOverviewTab />
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-4">
          <CognitiveAnalysisTab />
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <AppointmentsTab />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

