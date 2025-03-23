export type NotificationType =
  // Patient-related
  | "PATIENT_ALERT"
  | "PATIENT_ASSESSMENT"
  | "PATIENT_MEDICATION"
  | "PATIENT_APPOINTMENT"
  | "PATIENT_ACTIVITY"
  | "PATIENT_WEARABLE"
  | "PATIENT_COGNITIVE_DECLINE"

  // Doctor-related
  | "DOCTOR_APPOINTMENT"
  | "DOCTOR_PATIENT_UPDATE"
  | "DOCTOR_ASSESSMENT_REMINDER"

  // Caregiver-related
  | "CAREGIVER_TASK"
  | "CAREGIVER_PATIENT_ALERT"
  | "CAREGIVER_SUPPORT_GROUP"

  // System
  | "SYSTEM_UPDATE"
  | "ACCOUNT_SECURITY"

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  data?: any
  relatedId?: string | null
  read: boolean
  readAt?: Date | null
  createdAt: Date
}

