// Dashboard data types
export interface Patient {
  id: string
  name: string
  age: number
  diagnosis: string
  mmseScore: number
  lastCheckup: string
  riskLevel: "high" | "medium" | "low"
  status: "active" | "inactive"
  cognitiveScores: {
    date: string
    score: number
  }[]
  medications: {
    name: string
    dosage: string
    frequency: string
    startDate: string
    endDate?: string
  }[]
  appointments: Appointment[]
  caregiverNotes: CaregiverNote[]
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  patients: string[] // Patient IDs
  appointments: Appointment[]
}

export interface Caregiver {
  id: string
  name: string
  patients: string[] // Patient IDs
  notes: CaregiverNote[]
}

export interface Admin {
  id: string
  name: string
  role: "admin"
  permissions: string[]
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  type: "checkup" | "cognitive assessment" | "therapy" | "telehealth"
  status: "confirmed" | "pending" | "cancelled"
  notes?: string
}

export interface CaregiverNote {
  id: string
  patientId: string
  caregiverId: string
  date: string
  content: string
  category: "medication" | "behavior" | "activity" | "other"
}

export interface CognitiveAssessment {
  id: string
  patientId: string
  doctorId: string
  date: string
  mmseScore: number
  cognitiveAreas: {
    memory: number
    attention: number
    language: number
    visualSpatial: number
    executiveFunction: number
  }
  notes: string
  recommendations: string
}

export interface DashboardMetrics {
  totalPatients: number
  activePatients: number
  highRiskPatients: number
  appointmentsToday: number
  averageMmseScore: number
  pendingAssessments: number
}

