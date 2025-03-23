import { RedisCache } from "@/lib/cache/redis-cache"
import prisma from "@/lib/db-client"
import { Encryption } from "@/lib/security/encryption"
import { createWearableService } from "@/lib/wearables/wearable-service"
import { AuditLogger } from "@/lib/audit/audit-logger"

interface SyncQueueItem {
  userId: string
  deviceId: string
  dataType: string
  data: any
  timestamp: string
  syncId: string
}

export class OfflineSync {
  private static readonly SYNC_QUEUE_PREFIX = "sync:queue:"
  private static readonly SYNC_STATUS_PREFIX = "sync:status:"
  private static readonly SYNC_CONFLICT_PREFIX = "sync:conflict:"

  /**
   * Queue data for synchronization
   * @param userId The user ID
   * @param deviceId The device ID
   * @param dataType The type of data
   * @param data The data to sync
   * @returns The sync ID
   */
  static async queueForSync(userId: string, deviceId: string, dataType: string, data: any): Promise<string> {
    // Generate a unique sync ID
    const syncId = Encryption.generateToken(16)

    // Create queue item
    const queueItem: SyncQueueItem = {
      userId,
      deviceId,
      dataType,
      data,
      timestamp: new Date().toISOString(),
      syncId,
    }

    // Add to queue
    const queueKey = `${this.SYNC_QUEUE_PREFIX}${userId}`
    const queue = (await RedisCache.get<SyncQueueItem[]>(queueKey)) || []
    queue.push(queueItem)

    // Save queue
    await RedisCache.set(queueKey, queue)

    // Set status to pending
    const statusKey = `${this.SYNC_STATUS_PREFIX}${syncId}`
    await RedisCache.set(statusKey, "pending")

    return syncId
  }

  /**
   * Process sync queue for a user
   * @param userId The user ID
   * @returns The number of items processed
   */
  static async processSyncQueue(userId: string): Promise<number> {
    // Get queue
    const queueKey = `${this.SYNC_QUEUE_PREFIX}${userId}`
    const queue = (await RedisCache.get<SyncQueueItem[]>(queueKey)) || []

    // If queue is empty, nothing to do
    if (queue.length === 0) {
      return 0
    }

    // Process each item
    let processedCount = 0

    for (const item of queue) {
      try {
        // Process based on data type
        switch (item.dataType) {
          case "game_session":
            await this.processGameSession(item)
            break
          case "cognitive_score":
            await this.processCognitiveScore(item)
            break
          case "health_data":
            await this.processHealthData(item)
            break
          default:
            // Unknown data type, mark as error
            const statusKey = `${this.SYNC_STATUS_PREFIX}${item.syncId}`
            await RedisCache.set(statusKey, "error:unknown_data_type")
            continue
        }

        // Update status to completed
        const statusKey = `${this.SYNC_STATUS_PREFIX}${item.syncId}`
        await RedisCache.set(statusKey, "completed")

        processedCount++
      } catch (error) {
        console.error(`Error processing sync item ${item.syncId}:`, error)

        // Update status to error
        const statusKey = `${this.SYNC_STATUS_PREFIX}${item.syncId}`
        await RedisCache.set(statusKey, `error:${error.message}`)
      }
    }

    // Remove processed items from queue
    const newQueue = queue.filter((item) => {
      const statusKey = `${this.SYNC_STATUS_PREFIX}${item.syncId}`
      const status = RedisCache.get<string>(statusKey)
      return status !== "completed"
    })

    // Save updated queue
    await RedisCache.set(queueKey, newQueue)

    return processedCount
  }

  /**
   * Process a game session sync item
   * @param item The sync queue item
   */
  private static async processGameSession(item: SyncQueueItem): Promise<void> {
    const { userId, data } = item

    // Check if session already exists
    const existingSession = await prisma.gameSession.findUnique({
      where: { id: data.id },
    })

    if (existingSession) {
      // Handle conflict
      await this.handleConflict(item, existingSession)
      return
    }

    // Create new session
    await prisma.gameSession.create({
      data: {
        id: data.id,
        userId,
        gameId: data.gameId,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        score: data.score,
        difficulty: data.difficulty,
        completed: data.completed,
        metrics: data.metrics,
      },
    })
  }

  /**
   * Process a cognitive score sync item
   * @param item The sync queue item
   */
  private static async processCognitiveScore(item: SyncQueueItem): Promise<void> {
    const { userId, data } = item

    // Create cognitive score
    await prisma.cognitiveScore.create({
      data: {
        patientId: userId,
        category: data.category,
        score: data.score,
        date: new Date(data.date),
      },
    })
  }

  /**
   * Process a health data sync item
   * @param item The sync queue item
   */
  private static async processHealthData(item: SyncQueueItem): Promise<void> {
    const { userId, data } = item

    // Create health data entry
    await prisma.healthData.create({
      data: {
        userId,
        type: data.type,
        value: data.value,
        unit: data.unit,
        source: data.source,
        timestamp: new Date(data.timestamp),
      },
    })
  }

  /**
   * Handle a sync conflict
   * @param item The sync queue item
   * @param existingData The existing data
   */
  private static async handleConflict(item: SyncQueueItem, existingData: any): Promise<void> {
    // Store conflict information
    const conflictKey = `${this.SYNC_CONFLICT_PREFIX}${item.syncId}`

    await RedisCache.set(conflictKey, {
      syncItem: item,
      existingData,
      timestamp: new Date().toISOString(),
    })

    // Update status to conflict
    const statusKey = `${this.SYNC_STATUS_PREFIX}${item.syncId}`
    await RedisCache.set(statusKey, "conflict")
  }

  /**
   * Resolve a sync conflict
   * @param syncId The sync ID
   * @param resolution The resolution strategy ("keep_existing", "use_new", "merge")
   */
  static async resolveConflict(syncId: string, resolution: "keep_existing" | "use_new" | "merge"): Promise<void> {
    // Get conflict information
    const conflictKey = `${this.SYNC_CONFLICT_PREFIX}${syncId}`
    const conflict = await RedisCache.get<any>(conflictKey)

    if (!conflict) {
      throw new Error(`Conflict with ID ${syncId} not found`)
    }

    const { syncItem, existingData } = conflict

    // Resolve based on strategy
    switch (resolution) {
      case "keep_existing":
        // Do nothing, keep existing data
        break
      case "use_new":
        // Update with new data
        await this.updateData(syncItem.dataType, existingData.id, syncItem.data)
        break
      case "merge":
        // Merge data
        const mergedData = this.mergeData(syncItem.dataType, existingData, syncItem.data)
        await this.updateData(syncItem.dataType, existingData.id, mergedData)
        break
    }

    // Update status to resolved
    const statusKey = `${this.SYNC_STATUS_PREFIX}${syncId}`
    await RedisCache.set(statusKey, `resolved:${resolution}`)

    // Remove conflict
    await RedisCache.delete(conflictKey)
  }

  /**
   * Update data in the database
   * @param dataType The type of data
   * @param id The data ID
   * @param data The new data
   */
  private static async updateData(dataType: string, id: string, data: any): Promise<void> {
    switch (dataType) {
      case "game_session":
        await prisma.gameSession.update({
          where: { id },
          data: {
            score: data.score,
            endTime: data.endTime ? new Date(data.endTime) : null,
            completed: data.completed,
            metrics: data.metrics,
          },
        })
        break
      case "cognitive_score":
        await prisma.cognitiveScore.update({
          where: { id },
          data: {
            score: data.score,
            date: new Date(data.date),
          },
        })
        break
      case "health_data":
        await prisma.healthData.update({
          where: { id },
          data: {
            value: data.value,
            unit: data.unit,
            source: data.source,
            timestamp: new Date(data.timestamp),
          },
        })
        break
    }
  }

  /**
   * Merge data
   * @param dataType The type of data
   * @param existingData The existing data
   * @param newData The new data
   * @returns The merged data
   */
  private static mergeData(dataType: string, existingData: any, newData: any): any {
    switch (dataType) {
      case "game_session":
        // For game sessions, use the higher score
        return {
          ...existingData,
          score: Math.max(existingData.score, newData.score),
          completed: existingData.completed || newData.completed,
          metrics: {
            ...existingData.metrics,
            ...newData.metrics,
            correctAnswers: Math.max(existingData.metrics.correctAnswers, newData.metrics.correctAnswers),
          },
        }
      case "cognitive_score":
        // For cognitive scores, use the higher score
        return {
          ...existingData,
          score: Math.max(existingData.score, newData.score),
        }
      case "health_data":
        // For health data, use the newer timestamp
        const existingTimestamp = new Date(existingData.timestamp).getTime()
        const newTimestamp = new Date(newData.timestamp).getTime()

        return newTimestamp > existingTimestamp ? newData : existingData
      default:
        return newData
    }
  }

  /**
   * Get sync status
   * @param syncId The sync ID
   * @returns The sync status
   */
  static async getSyncStatus(syncId: string): Promise<string | null> {
    const statusKey = `${this.SYNC_STATUS_PREFIX}${syncId}`
    return RedisCache.get<string>(statusKey)
  }

  /**
   * Get pending sync items for a user
   * @param userId The user ID
   * @returns The pending sync items
   */
  static async getPendingSyncItems(userId: string): Promise<SyncQueueItem[]> {
    const queueKey = `${this.SYNC_QUEUE_PREFIX}${userId}`
    return RedisCache.get<SyncQueueItem[]>(queueKey) || []
  }

  /**
   * Store offline wearable data for later synchronization
   */
  static async storeOfflineData({
    patientId,
    deviceId,
    dataType,
    data,
    timestamp,
  }: {
    patientId: string
    deviceId: string
    dataType: string
    data: any
    timestamp: Date
  }): Promise<void> {
    await prisma.offlineWearableData.create({
      data: {
        patientId,
        deviceId,
        dataType,
        data,
        timestamp,
        synced: false,
      },
    })
  }

  /**
   * Synchronize offline data with the server
   */
  static async synchronizeOfflineData(patientId: string): Promise<{
    success: boolean
    syncedCount: number
    failedCount: number
  }> {
    // Get all unsynced data for the patient
    const unsyncedData = await prisma.offlineWearableData.findMany({
      where: {
        patientId,
        synced: false,
      },
      orderBy: {
        timestamp: "asc",
      },
    })

    if (unsyncedData.length === 0) {
      return { success: true, syncedCount: 0, failedCount: 0 }
    }

    // Group by device and data type for efficient processing
    const groupedData: Record<string, Record<string, any[]>> = {}

    unsyncedData.forEach((item) => {
      if (!groupedData[item.deviceId]) {
        groupedData[item.deviceId] = {}
      }

      if (!groupedData[item.deviceId][item.dataType]) {
        groupedData[item.deviceId][item.dataType] = []
      }

      groupedData[item.deviceId][item.dataType].push(item)
    })

    let syncedCount = 0
    let failedCount = 0

    // Process each device
    for (const deviceId of Object.keys(groupedData)) {
      // Get device details
      const device = await prisma.wearableDevice.findUnique({
        where: { id: deviceId },
      })

      if (!device) {
        // Mark all data for this device as failed
        const deviceItems = Object.values(groupedData[deviceId]).flat()
        failedCount += deviceItems.length
        continue
      }

      // Create wearable service for this device type
      const wearableService = createWearableService(device.type)

      // Process each data type
      for (const dataType of Object.keys(groupedData[deviceId])) {
        const items = groupedData[deviceId][dataType]

        try {
          // Batch upload data based on type
          switch (dataType) {
            case "sleep":
              await wearableService.batchUploadSleepData(
                patientId,
                items.map((item) => ({ ...item.data, timestamp: item.timestamp })),
              )
              break
            case "activity":
              await wearableService.batchUploadActivityData(
                patientId,
                items.map((item) => ({ ...item.data, timestamp: item.timestamp })),
              )
              break
            case "vitals":
              await wearableService.batchUploadVitalSignsData(
                patientId,
                items.map((item) => ({ ...item.data, timestamp: item.timestamp })),
              )
              break
            default:
              // Unknown data type, mark as failed
              failedCount += items.length
              continue
          }

          // Mark items as synced
          await prisma.offlineWearableData.updateMany({
            where: {
              id: {
                in: items.map((item) => item.id),
              },
            },
            data: {
              synced: true,
              syncedAt: new Date(),
            },
          })

          syncedCount += items.length

          // Log successful sync
          await AuditLogger.log({
            userId: patientId,
            action: "SYNC",
            resource: "WEARABLE_DATA",
            resourceId: deviceId,
            details: {
              dataType,
              count: items.length,
            },
          })
        } catch (error) {
          console.error(`Error syncing ${dataType} data for device ${deviceId}:`, error)
          failedCount += items.length
        }
      }
    }

    // Clear cache for this patient's wearable data
    await RedisCache.clearWithPrefix(`wearable:${patientId}`)

    return {
      success: failedCount === 0,
      syncedCount,
      failedCount,
    }
  }

  /**
   * Get sync status for a patient
   */
  static async getSyncStatus(patientId: string): Promise<{
    lastSyncedAt: Date | null
    pendingCount: number
  }> {
    // Get the most recent successful sync
    const lastSynced = await prisma.offlineWearableData.findFirst({
      where: {
        patientId,
        synced: true,
      },
      orderBy: {
        syncedAt: "desc",
      },
      select: {
        syncedAt: true,
      },
    })

    // Count pending items
    const pendingCount = await prisma.offlineWearableData.count({
      where: {
        patientId,
        synced: false,
      },
    })

    return {
      lastSyncedAt: lastSynced?.syncedAt || null,
      pendingCount,
    }
  }
}

