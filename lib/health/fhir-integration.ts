/**
 * FHIR Integration Service
 *
 * Provides integration with FHIR (Fast Healthcare Interoperability Resources) standard
 * for healthcare data exchange.
 */

import { logger } from "@/lib/monitoring/logger"

export enum FHIRResourceType {
  PATIENT = "Patient",
  OBSERVATION = "Observation",
  CONDITION = "Condition",
  PROCEDURE = "Procedure",
  MEDICATION = "Medication",
  MEDICATION_REQUEST = "MedicationRequest",
  DIAGNOSTIC_REPORT = "DiagnosticReport",
  CARE_PLAN = "CarePlan",
  QUESTIONNAIRE = "Questionnaire",
  QUESTIONNAIRE_RESPONSE = "QuestionnaireResponse",
}

export interface FHIRReference {
  reference: string
  type?: string
  display?: string
}

export interface FHIRCodeableConcept {
  coding: Array<{
    system: string
    code: string
    display: string
  }>
  text?: string
}

export interface FHIRResource {
  resourceType: FHIRResourceType
  id?: string
  meta?: {
    versionId?: string
    lastUpdated?: string
    profile?: string[]
  }
  identifier?: Array<{
    system: string
    value: string
  }>
  [key: string]: any
}

export interface FHIRPatient extends FHIRResource {
  resourceType: FHIRResourceType.PATIENT
  name?: Array<{
    use?: string
    family?: string
    given?: string[]
    prefix?: string[]
    suffix?: string[]
  }>
  gender?: "male" | "female" | "other" | "unknown"
  birthDate?: string
  address?: Array<{
    use?: string
    type?: string
    text?: string
    line?: string[]
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }>
  telecom?: Array<{
    system?: string
    value?: string
    use?: string
  }>
  active?: boolean
}

export interface FHIRObservation extends FHIRResource {
  resourceType: FHIRResourceType.OBSERVATION
  status:
    | "registered"
    | "preliminary"
    | "final"
    | "amended"
    | "corrected"
    | "cancelled"
    | "entered-in-error"
    | "unknown"
  category?: FHIRCodeableConcept[]
  code: FHIRCodeableConcept
  subject: FHIRReference
  effectiveDateTime?: string
  effectivePeriod?: {
    start: string
    end?: string
  }
  issued?: string
  valueQuantity?: {
    value: number
    unit: string
    system: string
    code: string
  }
  valueString?: string
  valueBoolean?: boolean
  valueInteger?: number
  valueCodeableConcept?: FHIRCodeableConcept
  interpretation?: FHIRCodeableConcept[]
  note?: Array<{
    text: string
  }>
}

export class FHIRService {
  private baseUrl: string
  private authToken?: string

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl
    this.authToken = authToken
  }

  /**
   * Set the authentication token for FHIR API requests
   */
  public setAuthToken(token: string): void {
    this.authToken = token
  }

  /**
   * Get headers for FHIR API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
    }

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`
    }

    return headers
  }

  /**
   * Create a FHIR resource
   */
  public async createResource<T extends FHIRResource>(resource: T): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/${resource.resourceType}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(resource),
      })

      if (!response.ok) {
        throw new Error(`Failed to create FHIR resource: ${response.statusText}`)
      }

      return (await response.json()) as T
    } catch (error) {
      logger.error("Error creating FHIR resource", error)
      throw error
    }
  }

  /**
   * Read a FHIR resource by ID
   */
  public async readResource<T extends FHIRResource>(resourceType: FHIRResourceType, id: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to read FHIR resource: ${response.statusText}`)
      }

      return (await response.json()) as T
    } catch (error) {
      logger.error(`Error reading FHIR resource ${resourceType}/${id}`, error)
      throw error
    }
  }

  /**
   * Update a FHIR resource
   */
  public async updateResource<T extends FHIRResource>(resource: T): Promise<T> {
    if (!resource.id) {
      throw new Error("Resource ID is required for update")
    }

    try {
      const response = await fetch(`${this.baseUrl}/${resource.resourceType}/${resource.id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(resource),
      })

      if (!response.ok) {
        throw new Error(`Failed to update FHIR resource: ${response.statusText}`)
      }

      return (await response.json()) as T
    } catch (error) {
      logger.error(`Error updating FHIR resource ${resource.resourceType}/${resource.id}`, error)
      throw error
    }
  }

  /**
   * Delete a FHIR resource
   */
  public async deleteResource(resourceType: FHIRResourceType, id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${resourceType}/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete FHIR resource: ${response.statusText}`)
      }
    } catch (error) {
      logger.error(`Error deleting FHIR resource ${resourceType}/${id}`, error)
      throw error
    }
  }

  /**
   * Search for FHIR resources
   */
  public async searchResources<T extends FHIRResource>(
    resourceType: FHIRResourceType,
    params: Record<string, string>,
  ): Promise<T[]> {
    try {
      const searchParams = new URLSearchParams(params)
      const response = await fetch(`${this.baseUrl}/${resourceType}?${searchParams.toString()}`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to search FHIR resources: ${response.statusText}`)
      }

      const result = await response.json()
      return (result.entry || []).map((entry: any) => entry.resource) as T[]
    } catch (error) {
      logger.error(`Error searching FHIR resources of type ${resourceType}`, error)
      throw error
    }
  }

  /**
   * Convert cognitive assessment data to FHIR Observation
   */
  public createCognitiveAssessmentObservation(
    patientId: string,
    assessmentType: string,
    score: number,
    maxScore: number,
    assessmentDate: Date,
    notes?: string,
  ): FHIRObservation {
    const observation: FHIRObservation = {
      resourceType: FHIRResourceType.OBSERVATION,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "survey",
              display: "Survey",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "http://memoright.com/cognitive-assessments",
            code: assessmentType,
            display: `Memoright ${assessmentType} Assessment`,
          },
        ],
        text: `Cognitive Assessment - ${assessmentType}`,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      effectiveDateTime: assessmentDate.toISOString(),
      issued: new Date().toISOString(),
      valueQuantity: {
        value: score,
        unit: "score",
        system: "http://unitsofmeasure.org",
        code: "score",
      },
      interpretation: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
              code: this.interpretScore(score, maxScore),
              display: this.getScoreDisplayText(score, maxScore),
            },
          ],
        },
      ],
    }

    if (notes) {
      observation.note = [{ text: notes }]
    }

    return observation
  }

  /**
   * Interpret a cognitive assessment score
   */
  private interpretScore(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100

    if (percentage >= 90) return "N" // Normal
    if (percentage >= 70) return "L" // Low
    if (percentage >= 50) return "LL" // Low Low
    return "A" // Abnormal
  }

  /**
   * Get display text for a cognitive assessment score
   */
  private getScoreDisplayText(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100

    if (percentage >= 90) return "Normal"
    if (percentage >= 70) return "Mild Impairment"
    if (percentage >= 50) return "Moderate Impairment"
    return "Severe Impairment"
  }
}

// Create a singleton instance
let fhirServiceInstance: FHIRService | null = null

export const getFHIRService = (): FHIRService => {
  if (!fhirServiceInstance) {
    // In a real implementation, these would come from environment variables
    const fhirBaseUrl = process.env.FHIR_BASE_URL || "https://api.memoright.com/fhir"
    const fhirAuthToken = process.env.FHIR_AUTH_TOKEN

    fhirServiceInstance = new FHIRService(fhirBaseUrl, fhirAuthToken)
  }

  return fhirServiceInstance
}

