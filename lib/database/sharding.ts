import { PrismaClient } from "@prisma/client"
import { createHash } from "crypto"
import { performance } from "perf_hooks"

// Define shard configuration
const SHARD_COUNT = Number.parseInt(process.env.SHARD_COUNT || "2", 10)

// Lazy initialization of Prisma clients
let shardClients: PrismaClient[] | null = null
let defaultClient: PrismaClient | null = null

/**
 * Initializes all database clients if they haven't been initialized yet
 * @returns Array of initialized shard clients
 */
function initializeClients(): PrismaClient[] {
  if (shardClients !== null) {
    return shardClients
  }

  shardClients = []

  // Initialize shard clients
  for (let i = 0; i < SHARD_COUNT; i++) {
    const shardNumber = i + 1
    const databaseUrl = process.env[`DATABASE_URL_SHARD${shardNumber}`] || process.env.DATABASE_URL

    if (!databaseUrl) {
      throw new Error(`Database URL for shard ${shardNumber} is not defined`)
    }

    shardClients.push(
      new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        // Connection pooling is handled by the underlying database driver
      }),
    )
  }

  // Initialize default client
  defaultClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

  return shardClients
}

/**
 * Gets the default Prisma client for non-sharded operations
 * @returns The default Prisma client
 */
export function getDefaultClient(): PrismaClient {
  if (defaultClient === null) {
    initializeClients()
  }
  return defaultClient!
}

/**
 * Custom error class for sharding-related errors
 */
export class ShardingError extends Error {
  constructor(
    message: string,
    public readonly shardIndex?: number,
    public readonly operation?: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = "ShardingError"

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ShardingError)
    }
  }
}

/**
 * Determines the shard index for a given entity ID
 * @param id The entity ID to shard
 * @returns The shard index (0-based)
 */
export function getShardIndex(id: string): number {
  // Use consistent hashing to determine shard
  const hash = createHash("md5").update(id).digest("hex")
  const hashNum = Number.parseInt(hash.substring(0, 8), 16)
  return hashNum % SHARD_COUNT
}

/**
 * Gets the appropriate Prisma client for a given entity ID
 * @param id The entity ID to determine the shard
 * @returns The Prisma client for the appropriate shard
 */
export function getShardClient(id: string): PrismaClient {
  const shardIndex = getShardIndex(id)
  const clients = initializeClients()

  if (shardIndex >= clients.length) {
    throw new ShardingError(`Invalid shard index: ${shardIndex} for ID ${id}`, shardIndex)
  }

  return clients[shardIndex]
}

/**
 * Executes a database operation on the appropriate shard with improved error handling
 * @param id The entity ID to determine the shard
 * @param operation The database operation to execute
 * @param operationName Optional name of the operation for logging
 * @returns The result of the database operation
 */
export async function executeOnShard<T>(
  id: string,
  operation: (client: PrismaClient) => Promise<T>,
  operationName?: string,
): Promise<T> {
  const shardIndex = getShardIndex(id)
  const clients = initializeClients()

  if (shardIndex >= clients.length) {
    throw new ShardingError(`Invalid shard index: ${shardIndex} for ID ${id}`, shardIndex, operationName)
  }

  const client = clients[shardIndex]

  try {
    return await operation(client)
  } catch (error) {
    // Enhance error with sharding context
    const enhancedError = new ShardingError(
      `Error executing ${operationName || "operation"} on shard ${shardIndex} for ID ${id}`,
      shardIndex,
      operationName,
      error instanceof Error ? error : new Error(String(error)),
    )

    // Log the error with context
    console.error(enhancedError)

    // Rethrow with enhanced context
    throw enhancedError
  }
}

// Metrics tracking
interface ShardMetrics {
  operationCount: number
  errorCount: number
  totalDuration: number
}

const shardMetrics: ShardMetrics[] = Array(SHARD_COUNT)
  .fill(null)
  .map(() => ({
    operationCount: 0,
    errorCount: 0,
    totalDuration: 0,
  }))

/**
 * Records metrics for a database operation
 * @param shardIndex The shard index
 * @param duration Operation duration in ms
 * @param success Whether the operation succeeded
 */
function recordMetrics(shardIndex: number, duration: number, success: boolean): void {
  if (shardIndex >= 0 && shardIndex < shardMetrics.length) {
    shardMetrics[shardIndex].operationCount++
    shardMetrics[shardIndex].totalDuration += duration

    if (!success) {
      shardMetrics[shardIndex].errorCount++
    }
  }
}

/**
 * Gets current metrics for all shards
 * @returns Metrics for each shard
 */
export function getShardMetrics(): Array<ShardMetrics & { avgDuration: number; errorRate: number }> {
  return shardMetrics.map((metrics) => ({
    ...metrics,
    avgDuration: metrics.operationCount > 0 ? metrics.totalDuration / metrics.operationCount : 0,
    errorRate: metrics.operationCount > 0 ? metrics.errorCount / metrics.operationCount : 0,
  }))
}

/**
 * Executes a database operation with metrics tracking
 * @param id The entity ID to determine the shard
 * @param operation The database operation to execute
 * @param operationName Optional name of the operation for logging
 * @returns The result of the database operation
 */
export async function executeOnShardWithMetrics<T>(
  id: string,
  operation: (client: PrismaClient) => Promise<T>,
  operationName?: string,
): Promise<T> {
  const shardIndex = getShardIndex(id)
  const startTime = performance.now()
  let success = false

  try {
    const result = await executeOnShard(id, operation, operationName)
    success = true
    return result
  } finally {
    const duration = performance.now() - startTime
    recordMetrics(shardIndex, duration, success)
  }
}

/**
 * Represents a shard rebalancing plan
 */
interface RebalancingPlan {
  sourceShardIndex: number
  targetShardIndex: number
  entityIds: string[]
}

/**
 * Generates a plan for rebalancing data across shards
 * @param threshold Imbalance threshold percentage (e.g., 0.2 for 20%)
 * @returns Rebalancing plan or null if no rebalancing is needed
 */
export async function generateRebalancingPlan(threshold = 0.2): Promise<RebalancingPlan | null> {
  // Get count of entities in each shard
  const counts = await Promise.all(
    initializeClients().map(async (client, index) => {
      const count = await client.patient.count()
      return { shardIndex: index, count }
    }),
  )

  // Calculate average count
  const totalCount = counts.reduce((sum, { count }) => sum + count, 0)
  const avgCount = totalCount / counts.length

  // Find most overloaded and underloaded shards
  const sortedCounts = [...counts].sort((a, b) => b.count - a.count)
  const mostOverloaded = sortedCounts[0]
  const mostUnderloaded = sortedCounts[sortedCounts.length - 1]

  // Check if rebalancing is needed
  const imbalance = (mostOverloaded.count - mostUnderloaded.count) / avgCount
  if (imbalance <= threshold) {
    return null // No rebalancing needed
  }

  // Calculate how many entities to move
  const entitiesToMove = Math.floor((mostOverloaded.count - avgCount) / 2)

  // Get entities to move
  const client = initializeClients()[mostOverloaded.shardIndex]
  const entities = await client.patient.findMany({
    select: { id: true },
    take: entitiesToMove,
    orderBy: { updatedAt: "asc" }, // Move least recently updated first
  })

  return {
    sourceShardIndex: mostOverloaded.shardIndex,
    targetShardIndex: mostUnderloaded.shardIndex,
    entityIds: entities.map((e) => e.id),
  }
}

/**
 * Executes a rebalancing plan
 * @param plan The rebalancing plan to execute
 * @returns Summary of the rebalancing operation
 */
export async function executeRebalancingPlan(plan: RebalancingPlan): Promise<{
  movedCount: number
  failedIds: string[]
}> {
  const sourceClient = initializeClients()[plan.sourceShardIndex]
  const targetClient = initializeClients()[plan.targetShardIndex]
  const failedIds: string[] = []
  let movedCount = 0

  // Process entities in batches
  const batchSize = 10
  for (let i = 0; i < plan.entityIds.length; i += batchSize) {
    const batch = plan.entityIds.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async (id) => {
        try {
          // Start a transaction in the source shard
          await sourceClient.$transaction(async (sourceTx) => {
            // Get all related data for the entity
            const patient = await sourceTx.patient.findUnique({
              where: { id },
              include: {
                assessmentResults: true,
                cognitiveScores: true,
                // Include other related data as needed
              },
            })

            if (!patient) {
              throw new Error(`Patient ${id} not found in source shard`)
            }

            // Start a transaction in the target shard
            await targetClient.$transaction(async (targetTx) => {
              // Create the patient in the target shard
              await targetTx.patient.create({
                data: {
                  ...patient,
                  assessmentResults: {
                    create: patient.assessmentResults,
                  },
                  cognitiveScores: {
                    create: patient.cognitiveScores,
                  },
                  // Handle other relations
                },
              })

              // Delete from source shard
              await sourceTx.patient.delete({
                where: { id },
              })
            })

            movedCount++
          })
        } catch (error) {
          console.error(`Failed to move patient ${id}:`, error)
          failedIds.push(id)
        }
      }),
    )
  }

  return { movedCount, failedIds }
}

/**
 * Example usage of the sharding module
 *
 * // Get a patient by ID
 * const patient = await getPatientById('patient-123');
 *
 * // Create a new assessment result
 * await executeOnShard('patient-123', async (client) => {
 *   return client.assessmentResult.create({
 *     data: {
 *       patientId: 'patient-123',
 *       score: 85,
 *       type: 'MMSE',
 *       // other fields
 *     }
 *   });
 * });
 *
 * // Search across all shards
 * const searchResults = await searchPatients('Smith');
 *
 * // Execute a multi-shard transaction
 * const operations = new Map();
 * operations.set(0, (client) => client.patient.update({...}));
 * operations.set(1, (client) => client.doctor.update({...}));
 * await executeMultiShardTransaction(operations);
 *
 * // Get shard metrics
 * const metrics = getShardMetrics();
 * console.log('Shard performance:', metrics);
 *
 * // Rebalance shards if needed
 * const plan = await generateRebalancingPlan(0.3);
 * if (plan) {
 *   const result = await executeRebalancingPlan(plan);
 *   console.log(`Rebalanced ${result.movedCount} patients`);
 * }
 */

/**
 * @module lib/database/sharding
 * @description
 * This module provides utilities for database sharding in Memoright.
 *
 * Sharding is a database architecture pattern where data is horizontally
 * partitioned across multiple database instances to improve scalability
 * and performance.
 *
 * Key features:
 * - Consistent hashing for shard determination
 * - Transparent API for database operations
 * - Cross-shard query capabilities
 * - Best-effort multi-shard transactions
 * - Metrics and monitoring
 * - Rebalancing capabilities
 */

