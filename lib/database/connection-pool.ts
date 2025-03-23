// Implementasi connection pool untuk database
import { PrismaClient } from "@prisma/client"

export class DatabaseConnectionPool {
  private static readonly MAX_CONNECTIONS = 10
  private static readonly MIN_CONNECTIONS = 2
  private static readonly IDLE_TIMEOUT_MS = 30000 // 30 seconds

  private static pool: PrismaClient[] = []
  private static inUse: Set<PrismaClient> = new Set()
  private static lastCleanup: number = Date.now()

  /**
   * Get a database connection from the pool
   */
  static async getConnection(): Promise<PrismaClient> {
    // Clean up idle connections if needed
    this.cleanupIdleConnections()

    // Check for available connection in the pool
    if (this.pool.length > 0) {
      const client = this.pool.pop()!
      this.inUse.add(client)
      return client
    }

    // Create new connection if under max limit
    if (this.inUse.size < this.MAX_CONNECTIONS) {
      const client = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      })
      this.inUse.add(client)
      return client
    }

    // Wait for a connection to become available
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.pool.length > 0) {
          clearInterval(checkInterval)
          const client = this.pool.pop()!
          this.inUse.add(client)
          resolve(client)
        }
      }, 100)
    })
  }

  /**
   * Release a connection back to the pool
   */
  static releaseConnection(client: PrismaClient): void {
    if (this.inUse.has(client)) {
      this.inUse.delete(client)
      client._lastUsed = Date.now()
      this.pool.push(client)
    }
  }

  /**
   * Clean up idle connections
   */
  private static cleanupIdleConnections(): void {
    const now = Date.now()

    // Only run cleanup every IDLE_TIMEOUT_MS
    if (now - this.lastCleanup < this.IDLE_TIMEOUT_MS) {
      return
    }

    this.lastCleanup = now

    // Keep minimum connections in the pool
    if (this.pool.length <= this.MIN_CONNECTIONS) {
      return
    }

    // Remove idle connections
    const connectionsToKeep: PrismaClient[] = []

    for (const client of this.pool) {
      if (connectionsToKeep.length < this.MIN_CONNECTIONS || now - (client._lastUsed || 0) < this.IDLE_TIMEOUT_MS) {
        connectionsToKeep.push(client)
      } else {
        // Disconnect client
        client.$disconnect()
      }
    }

    this.pool = connectionsToKeep
  }

  /**
   * Close all connections in the pool
   */
  static async closeAll(): Promise<void> {
    // Close all connections in the pool
    for (const client of this.pool) {
      await client.$disconnect()
    }

    // Close all in-use connections
    for (const client of this.inUse) {
      await client.$disconnect()
    }

    this.pool = []
    this.inUse.clear()
  }
}

// Add _lastUsed property to PrismaClient
declare module "@prisma/client" {
  interface PrismaClient {
    _lastUsed?: number
  }
}

