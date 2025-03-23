import { PrismaClient } from "@prisma/client"
import type { NotificationType, NotificationPriority, Notification } from "@/types/notifications"

const prisma = new PrismaClient()

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification({
    userId,
    type,
    title,
    message,
    priority = "NORMAL",
    data = {},
    relatedId = null,
  }: {
    userId: string
    type: NotificationType
    title: string
    message: string
    priority?: NotificationPriority
    data?: any
    relatedId?: string | null
  }): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
        data,
        relatedId,
        read: false,
        createdAt: new Date(),
      },
    })

    // Trigger real-time notification if applicable
    await this.triggerRealTimeNotification(notification)

    return notification
  }

  /**
   * Create notifications for multiple users
   */
  async createNotificationForMultipleUsers({
    userIds,
    type,
    title,
    message,
    priority = "NORMAL",
    data = {},
    relatedId = null,
  }: {
    userIds: string[]
    type: NotificationType
    title: string
    message: string
    priority?: NotificationPriority
    data?: any
    relatedId?: string | null
  }): Promise<Notification[]> {
    const notifications = []

    for (const userId of userIds) {
      const notification = await this.createNotification({
        userId,
        type,
        title,
        message,
        priority,
        data,
        relatedId,
      })
      notifications.push(notification)
    }

    return notifications
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    })
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    })
    return result.count
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Get all notifications for a user with pagination
   */
  async getNotifications(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ])

    return { notifications, total }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await prisma.notification.delete({
      where: { id: notificationId },
    })
  }

  /**
   * Trigger real-time notification via appropriate channels
   * This could be WebSockets, Push Notifications, SMS, etc.
   */
  private async triggerRealTimeNotification(notification: Notification): Promise<void> {
    // For high priority notifications, we might want to send SMS or push notifications
    if (notification.priority === "HIGH" || notification.priority === "URGENT") {
      // Send push notification if user has a device token
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
        select: { pushToken: true, role: true },
      })

      if (user?.pushToken) {
        await this.sendPushNotification(user.pushToken, notification)
      }

      // For URGENT notifications related to patients, notify caregivers and doctors
      if (notification.priority === "URGENT" && notification.type.startsWith("PATIENT_")) {
        await this.notifyPatientCareTeam(notification)
      }
    }

    // Emit to WebSocket for real-time updates in the UI
    // This is a placeholder - actual implementation would depend on your WebSocket setup
    // socketService.emitToUser(notification.userId, 'notification', notification);
  }

  /**
   * Send push notification to a device
   */
  private async sendPushNotification(deviceToken: string, notification: Notification): Promise<void> {
    // Implementation would depend on your push notification service (Firebase, OneSignal, etc.)
    // This is a placeholder
    console.log(`Sending push notification to ${deviceToken}:`, notification.title)
  }

  /**
   * Notify patient's care team (caregivers and doctors) about urgent patient-related notifications
   */
  private async notifyPatientCareTeam(notification: Notification): Promise<void> {
    // This assumes the notification is related to a patient and has patientId in the data
    const patientId = notification.data?.patientId
    if (!patientId) return

    // Find patient's caregivers and doctors
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        caregiverId: true,
        doctorId: true,
      },
    })

    if (!patient) return

    // Get caregiver and doctor user IDs
    const careTeamUserIds = []

    if (patient.caregiverId) {
      const caregiver = await prisma.caregiver.findUnique({
        where: { id: patient.caregiverId },
        select: { userId: true },
      })
      if (caregiver) careTeamUserIds.push(caregiver.userId)
    }

    if (patient.doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: patient.doctorId },
        select: { userId: true },
      })
      if (doctor) careTeamUserIds.push(doctor.userId)
    }

    // Create notifications for care team
    if (careTeamUserIds.length > 0) {
      await this.createNotificationForMultipleUsers({
        userIds: careTeamUserIds,
        type: "PATIENT_ALERT",
        title: `URGENT: ${notification.title}`,
        message: notification.message,
        priority: "URGENT",
        data: notification.data,
        relatedId: notification.relatedId,
      })
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService()

