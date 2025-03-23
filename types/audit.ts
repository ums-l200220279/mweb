export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "FAILED_LOGIN"
  | "PASSWORD_RESET"
  | "EXPORT"
  | "IMPORT"
  | "SHARE"
  | "SYNC"
  | "ACCESS_EHR"
  | "ASSESSMENT"
  | "WEARABLE_CONNECT"
  | "WEARABLE_DISCONNECT"

export type AuditResource =
  | "USER"
  | "PATIENT"
  | "DOCTOR"
  | "CAREGIVER"
  | "ASSESSMENT"
  | "APPOINTMENT"
  | "MEDICATION"
  | "WEARABLE_DATA"
  | "COGNITIVE_EXERCISE"
  | "EHR_RECORD"
  | "NOTIFICATION"
  | "ALERT"

export interface AuditLog {
  id: string
  userId: string
  action: AuditAction
  resource: AuditResource
  resourceId: string | null
  details: any
  ip: string | null
  userAgent: string | null
  timestamp: Date
}

