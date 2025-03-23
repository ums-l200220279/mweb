import { CronJob } from "cron"
import { backupService } from "./backup-service"
import { ResilientApiClient } from "../utils/resilient-api-client" // Import ResilientApiClient

// Run daily backup at 2 AM
export const dailyBackupJob = new CronJob(
  "0 2 * * *", // Cron expression: At 02:00 every day
  async () => {
    try {
      console.log("Starting scheduled daily backup...")
      const backupId = await backupService.createBackup({
        includeUserData: true,
        includeGameData: true,
        includeAnalytics: false, // Don't include analytics in daily backup
        encryptBackup: true,
      })
      console.log(`Daily backup completed: ${backupId}`)
    } catch (error) {
      console.error("Daily backup failed:", error)
      // Send alert notification
      await sendBackupFailureAlert("daily", error)
    }
  },
  null, // onComplete
  false, // start
  "UTC", // timezone
)

// Run weekly full backup on Sunday at 3 AM
export const weeklyBackupJob = new CronJob(
  "0 3 * * 0", // Cron expression: At 03:00 on Sunday
  async () => {
    try {
      console.log("Starting scheduled weekly full backup...")
      const backupId = await backupService.createBackup({
        includeUserData: true,
        includeGameData: true,
        includeAnalytics: true, // Include analytics in weekly backup
        encryptBackup: true,
      })
      console.log(`Weekly full backup completed: ${backupId}`)
    } catch (error) {
      console.error("Weekly backup failed:", error)
      // Send alert notification
      await sendBackupFailureAlert("weekly", error)
    }
  },
  null, // onComplete
  false, // start
  "UTC", // timezone
)

async function sendBackupFailureAlert(type: string, error: unknown): Promise<void> {
  // Implementation to send alert via email, Slack, etc.
  const errorMessage = error instanceof Error ? error.message : String(error)

  try {
    // Example: Send alert to monitoring service
    const alertClient = new ResilientApiClient(process.env.ALERT_SERVICE_URL)
    await alertClient.post("/alerts", {
      type: "backup_failure",
      severity: "high",
      message: `${type} backup failed: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    })
  } catch (alertError) {
    console.error("Failed to send backup failure alert:", alertError)
  }
}

// Start the backup jobs
export function startScheduledBackups(): void {
  if (process.env.ENABLE_SCHEDULED_BACKUPS === "true") {
    dailyBackupJob.start()
    weeklyBackupJob.start()
    console.log("Scheduled backup jobs started")
  } else {
    console.log("Scheduled backups are disabled")
  }
}

