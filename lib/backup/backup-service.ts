import { prisma } from "@/lib/db"
import { encrypt, decrypt } from "@/lib/security/encryption"
import fs from "fs/promises"
import path from "path"
import { ResilientApiClient } from "@/lib/api/resilient-client"

type BackupOptions = {
  includeUserData: boolean
  includeGameData: boolean
  includeAnalytics: boolean
  encryptBackup: boolean
}

type BackupMetadata = {
  timestamp: string
  version: string
  options: BackupOptions
  tables: string[]
  recordCounts: Record<string, number>
}

export class BackupService {
  private apiClient: ResilientApiClient
  private backupDir: string

  constructor() {
    this.apiClient = new ResilientApiClient(process.env.BACKUP_SERVICE_URL)
    this.backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), "backups")
  }

  async createBackup(options: Partial<BackupOptions> = {}): Promise<string> {
    const defaultOptions: BackupOptions = {
      includeUserData: true,
      includeGameData: true,
      includeAnalytics: true,
      encryptBackup: true,
    }

    const backupOptions = { ...defaultOptions, ...options }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupId = `backup-${timestamp}`
    const backupData: Record<string, any> = {}
    const metadata: BackupMetadata = {
      timestamp,
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      options: backupOptions,
      tables: [],
      recordCounts: {},
    }

    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true })

      // Backup user data if requested
      if (backupOptions.includeUserData) {
        const users = await prisma.user.findMany({
          include: {
            accounts: true,
            sessions: true,
            profile: true,
          },
        })
        backupData.users = users
        metadata.tables.push("users", "accounts", "sessions", "profiles")
        metadata.recordCounts.users = users.length
      }

      // Backup game data if requested
      if (backupOptions.includeGameData) {
        const games = await prisma.game.findMany()
        const gameSessions = await prisma.gameSession.findMany()
        const gameResults = await prisma.gameResult.findMany()

        backupData.games = games
        backupData.gameSessions = gameSessions
        backupData.gameResults = gameResults

        metadata.tables.push("games", "gameSessions", "gameResults")
        metadata.recordCounts.games = games.length
        metadata.recordCounts.gameSessions = gameSessions.length
        metadata.recordCounts.gameResults = gameResults.length
      }

      // Backup analytics data if requested
      if (backupOptions.includeAnalytics) {
        const analytics = await prisma.analytics.findMany()
        backupData.analytics = analytics
        metadata.tables.push("analytics")
        metadata.recordCounts.analytics = analytics.length
      }

      // Prepare backup content
      let backupContent = JSON.stringify(backupData)

      // Encrypt backup if requested
      if (backupOptions.encryptBackup) {
        backupContent = encrypt(backupContent, process.env.ENCRYPTION_KEY!)
        metadata.encrypted = true
      }

      // Write backup file
      const backupFilePath = path.join(this.backupDir, `${backupId}.json`)
      await fs.writeFile(backupFilePath, backupContent)

      // Write metadata file
      const metadataFilePath = path.join(this.backupDir, `${backupId}-metadata.json`)
      await fs.writeFile(metadataFilePath, JSON.stringify(metadata, null, 2))

      // Upload to remote storage if configured
      if (process.env.BACKUP_REMOTE_STORAGE === "true") {
        await this.uploadBackupToRemoteStorage(backupId, backupContent, metadata)
      }

      return backupId
    } catch (error) {
      console.error("Backup failed:", error)
      throw new Error(`Backup failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    try {
      let backupContent: string
      let metadata: BackupMetadata

      // Try to get backup from local storage first
      try {
        const backupFilePath = path.join(this.backupDir, `${backupId}.json`)
        const metadataFilePath = path.join(this.backupDir, `${backupId}-metadata.json`)

        backupContent = await fs.readFile(backupFilePath, "utf-8")
        metadata = JSON.parse(await fs.readFile(metadataFilePath, "utf-8"))
      } catch (error) {
        // If local backup not found, try remote storage
        console.log("Local backup not found, trying remote storage...")
        const remoteBackup = await this.downloadBackupFromRemoteStorage(backupId)
        backupContent = remoteBackup.content
        metadata = remoteBackup.metadata
      }

      // Decrypt backup if it was encrypted
      if (metadata.encrypted) {
        backupContent = decrypt(backupContent, process.env.ENCRYPTION_KEY!)
      }

      const backupData = JSON.parse(backupContent)

      // Start a transaction for the restore
      await prisma.$transaction(async (tx) => {
        // Restore user data if included
        if (backupData.users && metadata.tables.includes("users")) {
          // Clear existing data first (optional, depends on your strategy)
          await tx.user.deleteMany({})

          // Restore users and related data
          for (const user of backupData.users) {
            await tx.user.create({
              data: {
                ...user,
                accounts: { create: user.accounts },
                sessions: { create: user.sessions },
                profile: user.profile ? { create: user.profile } : undefined,
              },
            })
          }
        }

        // Restore game data if included
        if (backupData.games && metadata.tables.includes("games")) {
          await tx.game.deleteMany({})
          await tx.game.createMany({ data: backupData.games })
        }

        if (backupData.gameSessions && metadata.tables.includes("gameSessions")) {
          await tx.gameSession.deleteMany({})
          await tx.gameSession.createMany({ data: backupData.gameSessions })
        }

        if (backupData.gameResults && metadata.tables.includes("gameResults")) {
          await tx.gameResult.deleteMany({})
          await tx.gameResult.createMany({ data: backupData.gameResults })
        }

        // Restore analytics data if included
        if (backupData.analytics && metadata.tables.includes("analytics")) {
          await tx.analytics.deleteMany({})
          await tx.analytics.createMany({ data: backupData.analytics })
        }
      })

      console.log(`Backup ${backupId} restored successfully`)
    } catch (error) {
      console.error("Restore failed:", error)
      throw new Error(`Restore failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async listBackups(): Promise<{ id: string; metadata: BackupMetadata }[]> {
    try {
      const localBackups = await this.listLocalBackups()

      // If remote storage is configured, also list remote backups
      if (process.env.BACKUP_REMOTE_STORAGE === "true") {
        const remoteBackups = await this.listRemoteBackups()

        // Merge local and remote backups, removing duplicates
        const allBackups = [...localBackups]
        for (const remoteBackup of remoteBackups) {
          if (!allBackups.some((b) => b.id === remoteBackup.id)) {
            allBackups.push(remoteBackup)
          }
        }

        return allBackups
      }

      return localBackups
    } catch (error) {
      console.error("Failed to list backups:", error)
      throw new Error(`Failed to list backups: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async listLocalBackups(): Promise<{ id: string; metadata: BackupMetadata }[]> {
    try {
      const files = await fs.readdir(this.backupDir)
      const metadataFiles = files.filter((file) => file.endsWith("-metadata.json"))

      const backups = await Promise.all(
        metadataFiles.map(async (file) => {
          const backupId = file.replace("-metadata.json", "")
          const metadataContent = await fs.readFile(path.join(this.backupDir, file), "utf-8")
          const metadata = JSON.parse(metadataContent)
          return { id: backupId, metadata }
        }),
      )

      // Sort by timestamp, newest first
      return backups.sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime())
    } catch (error) {
      console.error("Failed to list local backups:", error)
      return []
    }
  }

  private async uploadBackupToRemoteStorage(
    backupId: string,
    content: string,
    metadata: BackupMetadata,
  ): Promise<void> {
    try {
      await this.apiClient.post("/backups", {
        backupId,
        content,
        metadata,
      })
      console.log(`Backup ${backupId} uploaded to remote storage`)
    } catch (error) {
      console.error("Failed to upload backup to remote storage:", error)
      throw new Error(`Failed to upload backup: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async downloadBackupFromRemoteStorage(
    backupId: string,
  ): Promise<{ content: string; metadata: BackupMetadata }> {
    try {
      return await this.apiClient.get(`/backups/${backupId}`)
    } catch (error) {
      console.error("Failed to download backup from remote storage:", error)
      throw new Error(`Failed to download backup: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private async listRemoteBackups(): Promise<{ id: string; metadata: BackupMetadata }[]> {
    try {
      return await this.apiClient.get("/backups")
    } catch (error) {
      console.error("Failed to list remote backups:", error)
      return []
    }
  }
}

// Singleton instance
export const backupService = new BackupService()

