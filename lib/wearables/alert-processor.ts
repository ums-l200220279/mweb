import { PrismaClient } from "@prisma/client"
import { notificationService } from "@/lib/notifications/notification-service"
import type { WearableAlert } from "@/types/wearables"

const prisma = new PrismaClient()

export class WearableAlertProcessor {
  /**
   * Process a new wearable alert and take appropriate actions
   */
  async processAlert(alert: WearableAlert): Promise<void> {
    // Save alert to database
    await this.saveAlert(alert)

    // Create notifications for relevant users
    await this.createNotifications(alert)

    // For critical alerts, trigger emergency protocols
    if (alert.severity === "CRITICAL" || alert.severity === "HIGH") {
      await this.triggerEmergencyProtocols(alert)
    }

    // Log alert for audit purposes
    console.log(`Processed wearable alert: ${alert.type} for patient ${alert.patientId}`)
  }

  /**
   * Save alert to database
   */
  private async saveAlert(alert: WearableAlert): Promise<void> {
    await prisma.wearableAlert.create({
      data: {
        patientId: alert.patientId,
        timestamp: new Date(alert.timestamp),
        type: alert.type,
        severity: alert.severity,
        details: alert.details,
        acknowledged: false,
      },
    })
  }

  /**
   * Create notifications for relevant users
   */
  private async createNotifications(alert: WearableAlert): Promise<void> {
    // Get patient info
    const patient = await prisma.patient.findUnique({
      where: { id: alert.patientId },
      select: {
        userId: true,
        caregiverId: true,
        doctorId: true,
        user: {
          select: { name: true },
        },
      },
    })

    if (!patient) return

    const patientName = patient.user.name
    let title = ""
    let message = ""

    // Create notification content based on alert type
    switch (alert.type) {
      case "FALL":
        title = `Fall Detected: ${patientName}`
        message = `A fall was detected for ${patientName}. Please check on the patient immediately.`
        break
      case "WANDERING":
        title = `Wandering Alert: ${patientName}`
        message = `${patientName} appears to be wandering outside their safe zone.`
        break
      case "ABNORMAL_VITALS":
        title = `Abnormal Vitals: ${patientName}`
        message = `${patientName} has abnormal vital signs that require attention.`
        break
      case "INACTIVITY":
        title = `Inactivity Alert: ${patientName}`
        message = `${patientName} has shown unusual inactivity for an extended period.`
        break
      default:
        title = `Alert: ${patientName}`
        message = `An alert has been triggered for ${patientName}.`
    }

    // Determine notification priority based on alert severity
    let priority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
    switch (alert.severity) {
      case "CRITICAL":
        priority = "URGENT"
        break
      case "HIGH":
        priority = "HIGH"
        break
      case "MEDIUM":
        priority = "NORMAL"
        break
      default:
        priority = "LOW"
    }

    // Create notification for patient
    await notificationService.createNotification({
      userId: patient.userId,
      type: "PATIENT_WEARABLE",
      title,
      message,
      priority,
      data: {
        alertId: alert.id,
        alertType: alert.type,
        patientId: alert.patientId,
        details: alert.details,
      },
    })

    // Create notification for caregiver if exists
    if (patient.caregiverId) {
      const caregiver = await prisma.caregiver.findUnique({
        where: { id: patient.caregiverId },
        select: { userId: true },
      })

      if (caregiver) {
        await notificationService.createNotification({
          userId: caregiver.userId,
          type: "CAREGIVER_PATIENT_ALERT",
          title,
          message,
          priority,
          data: {
            alertId: alert.id,
            alertType: alert.type,
            patientId: alert.patientId,
            details: alert.details,
          },
        })
      }
    }

    // Create notification for doctor if exists and alert is serious
    if (patient.doctorId && (priority === "HIGH" || priority === "URGENT")) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: patient.doctorId },
        select: { userId: true },
      })

      if (doctor) {
        await notificationService.createNotification({
          userId: doctor.userId,
          type: "DOCTOR_PATIENT_UPDATE",
          title,
          message,
          priority,
          data: {
            alertId: alert.id,
            alertType: alert.type,
            patientId: alert.patientId,
            details: alert.details,
          },
        })
      }
    }
  }

  /**
   * Trigger emergency protocols for critical alerts
   */
  private async triggerEmergencyProtocols(alert: WearableAlert): Promise<void> {
    // Get emergency contacts
    const patient = await prisma.patient.findUnique({
      where: { id: alert.patientId },
      select: {
        user: {
          select: { name: true },
        },
        // Assuming we have emergency contacts in the database
        emergencyContacts: true,
      },
    })

    if (!patient) return

    // This would integrate with SMS, automated calling services, etc.
    // For now, we'll just log the action
    console.log(`EMERGENCY PROTOCOL: Alert for ${patient.user.name}, type: ${alert.type}, severity: ${alert.severity}`)

    // In a real implementation, you might:
    // 1. Send SMS to emergency contacts
    // 2. Trigger automated phone calls
    // 3. Notify emergency services if configured
    // 4. Update emergency status in the system
  }
}

// Singleton instance
export const wearableAlertProcessor = new WearableAlertProcessor()

