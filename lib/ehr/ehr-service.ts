import { PrismaClient } from "@prisma/client"
import type { EHRProvider, EHRPatientRecord, EHRMedication, EHRLabResult } from "@/types/ehr"

const prisma = new PrismaClient()

/**
 * Service for integrating with external Electronic Health Record (EHR) systems
 */
export class EHRService {
  private provider: EHRProvider

  constructor(provider: EHRProvider) {
    this.provider = provider
  }

  /**
   * Fetch patient records from the EHR system
   */
  async getPatientRecords(patientId: string): Promise<EHRPatientRecord | null> {
    try {
      // Get external patient identifier
      const patientMapping = await prisma.ehrPatientMapping.findFirst({
        where: { internalPatientId: patientId, providerId: this.provider.id },
      })

      if (!patientMapping) {
        console.warn(`No EHR mapping found for patient ${patientId} with provider ${this.provider.id}`)
        return null
      }

      // Call provider-specific API to get patient records
      const records = await this.provider.fetchPatientRecords(patientMapping.externalPatientId)

      // Log the access for audit purposes
      await this.logEHRAccess(patientId, "FETCH_RECORDS")

      return records
    } catch (error) {
      console.error(`Error fetching patient records from EHR: ${error}`)
      throw new Error(`Failed to fetch patient records: ${error.message}`)
    }
  }

  /**
   * Fetch patient medications from the EHR system
   */
  async getPatientMedications(patientId: string): Promise<EHRMedication[]> {
    try {
      const patientMapping = await prisma.ehrPatientMapping.findFirst({
        where: { internalPatientId: patientId, providerId: this.provider.id },
      })

      if (!patientMapping) {
        console.warn(`No EHR mapping found for patient ${patientId} with provider ${this.provider.id}`)
        return []
      }

      const medications = await this.provider.fetchPatientMedications(patientMapping.externalPatientId)

      // Log the access for audit purposes
      await this.logEHRAccess(patientId, "FETCH_MEDICATIONS")

      return medications
    } catch (error) {
      console.error(`Error fetching patient medications from EHR: ${error}`)
      throw new Error(`Failed to fetch patient medications: ${error.message}`)
    }
  }

  /**
   * Fetch patient lab results from the EHR system
   */
  async getPatientLabResults(patientId: string): Promise<EHRLabResult[]> {
    try {
      const patientMapping = await prisma.ehrPatientMapping.findFirst({
        where: { internalPatientId: patientId, providerId: this.provider.id },
      })

      if (!patientMapping) {
        console.warn(`No EHR mapping found for patient ${patientId} with provider ${this.provider.id}`)
        return []
      }

      const labResults = await this.provider.fetchPatientLabResults(patientMapping.externalPatientId)

      // Log the access for audit purposes
      await this.logEHRAccess(patientId, "FETCH_LAB_RESULTS")

      return labResults
    } catch (error) {
      console.error(`Error fetching patient lab results from EHR: ${error}`)
      throw new Error(`Failed to fetch patient lab results: ${error.message}`)
    }
  }

  /**
   * Link a patient in our system with a patient in the EHR system
   */
  async linkPatient(internalPatientId: string, externalPatientId: string): Promise<boolean> {
    try {
      await prisma.ehrPatientMapping.create({
        data: {
          internalPatientId,
          externalPatientId,
          providerId: this.provider.id,
          linkedAt: new Date(),
        },
      })

      return true
    } catch (error) {
      console.error(`Error linking patient with EHR: ${error}`)
      throw new Error(`Failed to link patient with EHR: ${error.message}`)
    }
  }

  /**
   * Send cognitive assessment results to the EHR system
   */
  async sendCognitiveAssessment(assessmentId: string): Promise<boolean> {
    try {
      // Get assessment data
      const assessment = await prisma.cognitiveAssessment.findUnique({
        where: { id: assessmentId },
        include: {
          patient: true,
          doctor: true,
        },
      })

      if (!assessment) {
        throw new Error(`Assessment not found: ${assessmentId}`)
      }

      // Get external patient identifier
      const patientMapping = await prisma.ehrPatientMapping.findFirst({
        where: {
          internalPatientId: assessment.patientId,
          providerId: this.provider.id,
        },
      })

      if (!patientMapping) {
        console.warn(`No EHR mapping found for patient ${assessment.patientId} with provider ${this.provider.id}`)
        return false
      }

      // Format assessment data for EHR
      const ehrAssessmentData = {
        patientId: patientMapping.externalPatientId,
        date: assessment.date,
        type: "COGNITIVE_ASSESSMENT",
        scores: {
          mmse: assessment.mmseScore,
          memory: assessment.memory,
          attention: assessment.attention,
          language: assessment.language,
          visualSpatial: assessment.visualSpatial,
          executiveFunction: assessment.executiveFunction,
        },
        notes: assessment.notes,
        recommendations: assessment.recommendations,
        provider: {
          name: assessment.doctor.user.name,
          role: "DOCTOR",
        },
      }

      // Send to EHR
      await this.provider.sendAssessmentResults(ehrAssessmentData)

      // Log the access for audit purposes
      await this.logEHRAccess(assessment.patientId, "SEND_ASSESSMENT")

      return true
    } catch (error) {
      console.error(`Error sending assessment to EHR: ${error}`)
      throw new Error(`Failed to send assessment to EHR: ${error.message}`)
    }
  }

  /**
   * Log access to EHR for audit purposes
   */
  private async logEHRAccess(patientId: string, action: string): Promise<void> {
    await prisma.ehrAccessLog.create({
      data: {
        patientId,
        providerId: this.provider.id,
        action,
        timestamp: new Date(),
      },
    })
  }
}

/**
 * Factory to create EHR service for different providers
 */
export function createEHRService(providerName: string): EHRService {
  // In a real implementation, you would have different provider implementations
  // For now, we'll use a mock provider
  const provider: EHRProvider = {
    id: providerName,
    name: providerName,
    fetchPatientRecords: async (externalPatientId) => {
      // Mock implementation
      console.log(`Fetching records for ${externalPatientId} from ${providerName}`)
      return {
        patientId: externalPatientId,
        demographics: {
          name: "John Doe",
          dob: "1950-01-01",
          gender: "Male",
        },
        diagnoses: [{ code: "G30.9", description: "Alzheimer's disease, unspecified", date: "2022-01-15" }],
        allergies: [],
        // Other fields would be populated in a real implementation
      }
    },
    fetchPatientMedications: async (externalPatientId) => {
      // Mock implementation
      return [
        {
          name: "Donepezil",
          dosage: "10mg",
          frequency: "Once daily",
          startDate: "2022-01-20",
          prescribedBy: "Dr. Smith",
        },
      ]
    },
    fetchPatientLabResults: async (externalPatientId) => {
      // Mock implementation
      return [
        {
          testName: "Complete Blood Count",
          date: "2022-03-15",
          results: {
            wbc: "7.5",
            rbc: "4.8",
            hgb: "14.2",
            hct: "42.1",
            plt: "250",
          },
          normalRanges: {
            wbc: "4.5-11.0",
            rbc: "4.5-5.9",
            hgb: "13.5-17.5",
            hct: "41.0-50.0",
            plt: "150-450",
          },
          interpretation: "Normal",
        },
      ]
    },
    sendAssessmentResults: async (data) => {
      // Mock implementation
      console.log(`Sending assessment results to ${providerName} for patient ${data.patientId}`)
      return true
    },
  }

  return new EHRService(provider)
}

