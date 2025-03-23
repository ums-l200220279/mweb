export enum UserRole {
  PATIENT = "patient",
  CAREGIVER = "caregiver",
  DOCTOR = "doctor",
  ADMIN = "admin",
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string
}

export interface CognitiveScore {
  date: string
  score: number
  maxScore: number
  category: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  timeOfDay: string[]
  instructions: string
}

export interface Appointment {
  id: string
  title: string
  date: string
  time: string
  doctor: string
  location: string
  type: "in-person" | "virtual"
  notes?: string
}

export interface Activity {
  id: string
  type: "medication" | "exercise" | "assessment" | "appointment" | "social"
  title: string
  description: string
  completed: boolean
  scheduledFor: string
  importance: "low" | "medium" | "high"
}

export interface Alert {
  id: string
  type: "fall" | "medication" | "wandering" | "emergency" | "other"
  patientId: string
  patientName: string
  timestamp: string
  description: string
  status: "active" | "acknowledged" | "resolved"
  priority: "low" | "medium" | "high" | "critical"
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  condition: string
  stage: "early" | "moderate" | "severe"
  caregiverId?: string
  doctorId?: string
  lastAssessment?: string
  cognitiveScore?: number
  status: "stable" | "needs-attention" | "critical"
  image?: string
}

