// Implementasi untuk anonimisasi data
import crypto from "crypto"

export class DataAnonymization {
  /**
   * Anonymize patient data for research or analytics
   */
  static anonymizePatientData(patientData: any): any {
    const anonymized = { ...patientData }

    // Remove direct identifiers
    delete anonymized.name
    delete anonymized.email
    delete anonymized.phone
    delete anonymized.address
    delete anonymized.ssn
    delete anonymized.medicalRecordNumber

    // Hash patient ID
    if (anonymized.id) {
      anonymized.id = this.hashIdentifier(anonymized.id)
    }

    // Generalize age (round to nearest 5 years)
    if (anonymized.age) {
      anonymized.age = Math.floor(anonymized.age / 5) * 5
    }

    // Generalize location data if present
    if (anonymized.location) {
      // Keep only first 3 characters of zip code
      if (anonymized.location.zipCode) {
        anonymized.location.zipCode = anonymized.location.zipCode.substring(0, 3) + "XX"
      }

      // Remove specific address
      delete anonymized.location.address
      delete anonymized.location.streetName
    }

    // Adjust timestamps to reduce identifiability
    if (anonymized.registrationDate) {
      // Round to nearest month
      const date = new Date(anonymized.registrationDate)
      date.setDate(1)
      anonymized.registrationDate = date.toISOString()
    }

    return anonymized
  }

  /**
   * Hash an identifier consistently
   */
  private static hashIdentifier(identifier: string): string {
    // Use a consistent salt for the same identifiers to hash the same way
    const salt = process.env.ANONYMIZATION_SALT || "default-salt-change-this"
    return crypto
      .createHash("sha256")
      .update(identifier + salt)
      .digest("hex")
  }

  /**
   * Create k-anonymized dataset
   */
  static kAnonymize(dataset: any[], k = 5): any[] {
    // This is a simplified implementation
    // In a real system, this would implement proper k-anonymity

    // Group records by quasi-identifiers
    const groups: Record<string, any[]> = {}

    for (const record of dataset) {
      // Create a key based on generalized quasi-identifiers
      const key = `${Math.floor((record.age || 0) / 10) * 10}-${record.gender || "unknown"}`

      if (!groups[key]) {
        groups[key] = []
      }

      groups[key].push(record)
    }

    // Only include groups with at least k records
    const anonymizedDataset: any[] = []

    for (const [key, records] of Object.entries(groups)) {
      if (records.length >= k) {
        // Generalize all records in this group
        const generalizedRecords = records.map((record) => {
          const [ageGroup] = key.split("-")
          return {
            ...record,
            age: `${ageGroup}-${Number.parseInt(ageGroup) + 9}`,
            // Remove or generalize other quasi-identifiers as needed
          }
        })

        anonymizedDataset.push(...generalizedRecords)
      }
    }

    return anonymizedDataset
  }
}

