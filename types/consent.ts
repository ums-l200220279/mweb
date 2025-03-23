export type ConsentType =
  | "DATA_COLLECTION"
  | "DATA_SHARING"
  | "MARKETING"
  | "RESEARCH"
  | "WEARABLE_TRACKING"
  | "LOCATION_TRACKING"
  | "THIRD_PARTY_SHARING"
  | "EHR_ACCESS"

export type ConsentStatus = "GRANTED" | "DENIED" | "REVOKED" | "EXPIRED"

export interface Consent {
  id: string
  userId: string
  type: ConsentType
  status: ConsentStatus
  details: any
  grantedAt: Date
  expiresAt: Date | null
  revokedAt: Date | null
}

