export type WearableType = "FITBIT" | "APPLE_WATCH" | "SAMSUNG" | "GARMIN" | "GPS_TRACKER" | "MEDICAL_DEVICE"

export interface WearableDevice {
  id: string
  type: WearableType
  model: string
  lastSynced?: Date
  accessToken?: string
  refreshToken?: string
}

export interface SleepData {
  date: string
  startTime: string
  endTime: string
  duration: number // in milliseconds
  efficiency: number // 0-100
  stages?: {
    deep: number // in minutes
    light: number
    rem: number
    awake: number
  }
  restlessCount?: number
  awakeningsCount?: number
}

export interface ActivityData {
  date: string
  steps: number
  distance: number // in meters
  calories: number
  activeMinutes: number
  sedentaryMinutes: number
  heartRateZones?: {
    outOfRange: number // in minutes
    fatBurn: number
    cardio: number
    peak: number
  }
  floors?: number
}

export interface VitalSignsData {
  timestamp: string
  heartRate?: number // bpm
  bloodPressure?: {
    systolic: number
    diastolic: number
  }
  bloodOxygen?: number // percentage
  temperature?: number // celsius
  respiratoryRate?: number // breaths per minute
  glucose?: number // mg/dL
}

export interface LocationData {
  timestamp: string
  latitude: number
  longitude: number
  accuracy: number // in meters
  speed?: number // in m/s
  altitude?: number // in meters
}

export interface WearableAlert {
  id: string
  patientId: string
  timestamp: string
  type: string
  severity: string
  details: any
  acknowledged: boolean
  resolvedAt?: Date
}

