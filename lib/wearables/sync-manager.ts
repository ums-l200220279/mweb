import { createClient } from "@/lib/supabase/client"
import { encryptData, decryptData } from "@/lib/security/encryption"
import { logger } from "@/lib/monitoring/logger"
import { cache } from "@/lib/cache/redis"

// Supported wearable providers
export type WearableProvider = "fitbit" | "apple_health" | "google_fit" | "samsung_health"

// Wearable data structure
export interface WearableData {
  steps: number
  heartRate: {
    avg: number
    min: number
    max: number
  }
  sleep: {
    deep: number // minutes
    light: number // minutes
    rem: number // minutes
    awake: number // minutes
    total: number // minutes
  }
  activeMinutes: number
  caloriesBurned: number
  timestamp: string
}

// Connection status
export interface ConnectionStatus {
  provider: WearableProvider
  connected: boolean
  lastSynced: string | null
  error?: string
}

// Provider-specific API clients
import { FitbitClient } from "./providers/fitbit"
import { AppleHealthClient } from "./providers/apple-health"
import { GoogleFitClient } from "./providers/google-fit"
import { SamsungHealthClient } from "./providers/samsung-health"

export class WearableSyncManager {
  private userId: string
  private supabase = createClient()
  private providers: Record<WearableProvider, any> = {
    fitbit: new FitbitClient(),
    apple_health: new AppleHealthClient(),
    google_fit: new GoogleFitClient(),
    samsung_health: new SamsungHealthClient(),
  }

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Connect a wearable provider
   */
  async connect(provider: WearableProvider, authData: any): Promise<boolean> {
    try {
      logger.info(`Connecting ${provider} for user ${this.userId}`)

      // Encrypt sensitive auth data before storing
      const encryptedAuthData = encryptData(JSON.stringify(authData))

      // Store connection in database
      const { error } = await this.supabase.from("wearable_connections").upsert({
        user_id: this.userId,
        provider,
        auth_data: encryptedAuthData,
        connected_at: new Date().toISOString(),
      })

      if (error) {
        logger.error(`Failed to store ${provider} connection for user ${this.userId}`, { error })
        throw new Error(`Failed to connect ${provider}: ${error.message}`)
      }

      // Initialize provider with auth data
      await this.providers[provider].initialize(authData)

      // Perform initial sync
      await this.syncProvider(provider)

      logger.info(`Successfully connected ${provider} for user ${this.userId}`)
      return true
    } catch (error) {
      logger.error(`Error connecting ${provider} for user ${this.userId}`, { error })

      // Store connection error
      await this.supabase
        .from("wearable_connections")
        .update({
          error_message: error.message,
          last_error_at: new Date().toISOString(),
        })
        .match({ user_id: this.userId, provider })

      return false
    }
  }

  /**
   * Disconnect a wearable provider
   */
  async disconnect(provider: WearableProvider): Promise<boolean> {
    try {
      logger.info(`Disconnecting ${provider} for user ${this.userId}`)

      // Remove connection from database
      const { error } = await this.supabase
        .from("wearable_connections")
        .update({
          disconnected_at: new Date().toISOString(),
          connected: false,
        })
        .match({ user_id: this.userId, provider })

      if (error) {
        logger.error(`Failed to disconnect ${provider} for user ${this.userId}`, { error })
        throw new Error(`Failed to disconnect ${provider}: ${error.message}`)
      }

      logger.info(`Successfully disconnected ${provider} for user ${this.userId}`)
      return true
    } catch (error) {
      logger.error(`Error disconnecting ${provider} for user ${this.userId}`, { error })
      return false
    }
  }

  /**
   * Get connection status for all providers
   */
  async getConnectionStatus(): Promise<ConnectionStatus[]> {
    try {
      // Get connections from database
      const { data, error } = await this.supabase
        .from("wearable_connections")
        .select("provider, connected, last_synced_at, error_message")
        .eq("user_id", this.userId)

      if (error) {
        logger.error(`Failed to get connection status for user ${this.userId}`, { error })
        throw new Error(`Failed to get connection status: ${error.message}`)
      }

      // Map to connection status objects
      return data.map((conn) => ({
        provider: conn.provider as WearableProvider,
        connected: conn.connected,
        lastSynced: conn.last_synced_at,
        error: conn.error_message,
      }))
    } catch (error) {
      logger.error(`Error getting connection status for user ${this.userId}`, { error })
      return []
    }
  }

  /**
   * Sync data from all connected providers
   */
  async syncAll(): Promise<Record<WearableProvider, WearableData | null>> {
    try {
      logger.info(`Starting sync for all providers for user ${this.userId}`)

      // Get connected providers
      const { data, error } = await this.supabase
        .from("wearable_connections")
        .select("provider, auth_data")
        .eq("user_id", this.userId)
        .eq("connected", true)

      if (error) {
        logger.error(`Failed to get connected providers for user ${this.userId}`, { error })
        throw new Error(`Failed to get connected providers: ${error.message}`)
      }

      // Initialize result object
      const result: Record<WearableProvider, WearableData | null> = {
        fitbit: null,
        apple_health: null,
        google_fit: null,
        samsung_health: null,
      }

      // Sync each connected provider
      for (const connection of data) {
        const provider = connection.provider as WearableProvider
        const authData = JSON.parse(decryptData(connection.auth_data))

        // Initialize provider with auth data
        await this.providers[provider].initialize(authData)

        // Sync provider
        result[provider] = await this.syncProvider(provider)
      }

      logger.info(`Completed sync for all providers for user ${this.userId}`)
      return result
    } catch (error) {
      logger.error(`Error syncing all providers for user ${this.userId}`, { error })
      throw error
    }
  }

  /**
   * Sync data from a specific provider
   */
  async syncProvider(provider: WearableProvider): Promise<WearableData | null> {
    try {
      logger.info(`Syncing ${provider} for user ${this.userId}`)

      // Get auth data for provider
      const { data, error } = await this.supabase
        .from("wearable_connections")
        .select("auth_data")
        .eq("user_id", this.userId)
        .eq("provider", provider)
        .eq("connected", true)
        .single()

      if (error) {
        logger.error(`Failed to get auth data for ${provider} for user ${this.userId}`, { error })
        throw new Error(`Failed to get auth data for ${provider}: ${error.message}`)
      }

      // Decrypt auth data
      const authData = JSON.parse(decryptData(data.auth_data))

      // Initialize provider with auth data
      await this.providers[provider].initialize(authData)

      // Fetch data from provider
      const wearableData = await this.providers[provider].fetchData()

      // Store data in database
      const { error: storeError } = await this.supabase.from("wearable_data").insert({
        user_id: this.userId,
        provider,
        data: wearableData,
        synced_at: new Date().toISOString(),
      })

      if (storeError) {
        logger.error(`Failed to store data for ${provider} for user ${this.userId}`, { error: storeError })
        throw new Error(`Failed to store data for ${provider}: ${storeError.message}`)
      }

      // Update last synced timestamp
      await this.supabase
        .from("wearable_connections")
        .update({
          last_synced_at: new Date().toISOString(),
          error_message: null,
          last_error_at: null,
        })
        .match({ user_id: this.userId, provider })

      // Cache the latest data
      await cache.set(
        `wearable:${this.userId}:${provider}:latest`,
        JSON.stringify(wearableData),
        60 * 60, // 1 hour
      )

      logger.info(`Successfully synced ${provider} for user ${this.userId}`)
      return wearableData
    } catch (error) {
      logger.error(`Error syncing ${provider} for user ${this.userId}`, { error })

      // Store sync error
      await this.supabase
        .from("wearable_connections")
        .update({
          error_message: error.message,
          last_error_at: new Date().toISOString(),
        })
        .match({ user_id: this.userId, provider })

      return null
    }
  }

  /**
   * Get latest data from a specific provider
   */
  async getLatestData(provider: WearableProvider): Promise<WearableData | null> {
    try {
      // Try to get from cache first
      const cachedData = await cache.get(`wearable:${this.userId}:${provider}:latest`)
      if (cachedData) {
        return JSON.parse(cachedData)
      }

      // Get from database if not in cache
      const { data, error } = await this.supabase
        .from("wearable_data")
        .select("data")
        .eq("user_id", this.userId)
        .eq("provider", provider)
        .order("synced_at", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No data found
          return null
        }
        logger.error(`Failed to get latest data for ${provider} for user ${this.userId}`, { error })
        throw new Error(`Failed to get latest data for ${provider}: ${error.message}`)
      }

      // Cache the data
      await cache.set(
        `wearable:${this.userId}:${provider}:latest`,
        JSON.stringify(data.data),
        60 * 60, // 1 hour
      )

      return data.data
    } catch (error) {
      logger.error(`Error getting latest data for ${provider} for user ${this.userId}`, { error })
      return null
    }
  }

  /**
   * Get historical data from a specific provider
   */
  async getHistoricalData(provider: WearableProvider, startDate: string, endDate: string): Promise<WearableData[]> {
    try {
      // Get from database
      const { data, error } = await this.supabase
        .from("wearable_data")
        .select("data, synced_at")
        .eq("user_id", this.userId)
        .eq("provider", provider)
        .gte("synced_at", startDate)
        .lte("synced_at", endDate)
        .order("synced_at", { ascending: true })

      if (error) {
        logger.error(`Failed to get historical data for ${provider} for user ${this.userId}`, { error })
        throw new Error(`Failed to get historical data for ${provider}: ${error.message}`)
      }

      return data.map((item) => item.data)
    } catch (error) {
      logger.error(`Error getting historical data for ${provider} for user ${this.userId}`, { error })
      return []
    }
  }

  /**
   * Get aggregated data across all providers
   */
  async getAggregatedData(
    startDate: string,
    endDate: string,
  ): Promise<{
    steps: number
    activeMinutes: number
    caloriesBurned: number
    avgHeartRate: number
    sleepQuality: number
  }> {
    try {
      // Get data from all providers
      const { data, error } = await this.supabase
        .from("wearable_data")
        .select("data, provider")
        .eq("user_id", this.userId)
        .gte("synced_at", startDate)
        .lte("synced_at", endDate)

      if (error) {
        logger.error(`Failed to get aggregated data for user ${this.userId}`, { error })
        throw new Error(`Failed to get aggregated data: ${error.message}`)
      }

      // Initialize aggregation
      let totalSteps = 0
      let totalActiveMinutes = 0
      let totalCaloriesBurned = 0
      const heartRateReadings: number[] = []
      let totalSleepQuality = 0
      let sleepQualityReadings = 0

      // Process data from each provider
      for (const item of data) {
        const wearableData = item.data as WearableData

        // Aggregate steps
        totalSteps += wearableData.steps

        // Aggregate active minutes
        totalActiveMinutes += wearableData.activeMinutes

        // Aggregate calories burned
        totalCaloriesBurned += wearableData.caloriesBurned

        // Aggregate heart rate
        heartRateReadings.push(wearableData.heartRate.avg)

        // Calculate sleep quality (deep + rem) / total
        const sleepQuality = (wearableData.sleep.deep + wearableData.sleep.rem) / wearableData.sleep.total
        if (!isNaN(sleepQuality)) {
          totalSleepQuality += sleepQuality
          sleepQualityReadings++
        }
      }

      // Calculate averages
      const avgHeartRate =
        heartRateReadings.length > 0
          ? heartRateReadings.reduce((sum, val) => sum + val, 0) / heartRateReadings.length
          : 0

      const avgSleepQuality = sleepQualityReadings > 0 ? totalSleepQuality / sleepQualityReadings : 0

      return {
        steps: totalSteps,
        activeMinutes: totalActiveMinutes,
        caloriesBurned: totalCaloriesBurned,
        avgHeartRate,
        sleepQuality: avgSleepQuality,
      }
    } catch (error) {
      logger.error(`Error getting aggregated data for user ${this.userId}`, { error })
      return {
        steps: 0,
        activeMinutes: 0,
        caloriesBurned: 0,
        avgHeartRate: 0,
        sleepQuality: 0,
      }
    }
  }

  /**
   * Handle offline sync (when device was offline)
   */
  async handleOfflineSync(provider: WearableProvider, offlineData: WearableData[]): Promise<boolean> {
    try {
      logger.info(`Processing offline sync for ${provider} for user ${this.userId}`)

      // Store each data point
      for (const dataPoint of offlineData) {
        const { error } = await this.supabase.from("wearable_data").insert({
          user_id: this.userId,
          provider,
          data: dataPoint,
          synced_at: dataPoint.timestamp,
          is_offline_sync: true,
        })

        if (error) {
          logger.error(`Failed to store offline data point for ${provider} for user ${this.userId}`, { error })
          throw new Error(`Failed to store offline data: ${error.message}`)
        }
      }

      // Update last synced timestamp
      await this.supabase
        .from("wearable_connections")
        .update({
          last_synced_at: new Date().toISOString(),
          error_message: null,
          last_error_at: null,
        })
        .match({ user_id: this.userId, provider })

      logger.info(`Successfully processed offline sync for ${provider} for user ${this.userId}`)
      return true
    } catch (error) {
      logger.error(`Error processing offline sync for ${provider} for user ${this.userId}`, { error })
      return false
    }
  }

  /**
   * Correlate wearable data with cognitive performance
   */
  async correlateWithCognitivePerformance(
    startDate: string,
    endDate: string,
  ): Promise<{
    correlations: {
      steps: number
      sleep: number
      activeMinutes: number
      heartRate: number
    }
    insights: string[]
  }> {
    try {
      // Get wearable data
      const wearableData = await this.getAggregatedData(startDate, endDate)

      // Get cognitive performance data
      const { data, error } = await this.supabase
        .from("game_sessions")
        .select("score, game_type, completed_at")
        .eq("user_id", this.userId)
        .gte("completed_at", startDate)
        .lte("completed_at", endDate)

      if (error) {
        logger.error(`Failed to get cognitive data for user ${this.userId}`, { error })
        throw new Error(`Failed to get cognitive data: ${error.message}`)
      }

      // Calculate average cognitive score
      const avgScore = data.length > 0 ? data.reduce((sum, session) => sum + session.score, 0) / data.length : 0

      // Calculate correlations (simplified for demo)
      // In a real implementation, this would use more sophisticated statistical methods
      const correlations = {
        steps: calculateCorrelation(wearableData.steps, avgScore),
        sleep: calculateCorrelation(wearableData.sleepQuality, avgScore),
        activeMinutes: calculateCorrelation(wearableData.activeMinutes, avgScore),
        heartRate: calculateCorrelation(wearableData.avgHeartRate, avgScore),
      }

      // Generate insights
      const insights = generateInsights(correlations, wearableData, avgScore)

      return {
        correlations,
        insights,
      }
    } catch (error) {
      logger.error(`Error correlating wearable data with cognitive performance for user ${this.userId}`, { error })
      return {
        correlations: {
          steps: 0,
          sleep: 0,
          activeMinutes: 0,
          heartRate: 0,
        },
        insights: ["Unable to generate insights due to insufficient data."],
      }
    }
  }
}

// Helper function to calculate correlation (simplified)
function calculateCorrelation(a: number, b: number): number {
  // This is a placeholder for a real correlation calculation
  // In a real implementation, this would use Pearson correlation or similar
  return Math.min(Math.max((a * b) / (a + b + 1), -1), 1)
}

// Helper function to generate insights
function generateInsights(
  correlations: { steps: number; sleep: number; activeMinutes: number; heartRate: number },
  wearableData: any,
  avgScore: number,
): string[] {
  const insights: string[] = []

  // Generate insights based on correlations
  if (correlations.sleep > 0.5) {
    insights.push(
      "Your cognitive performance shows a strong positive correlation with sleep quality. Prioritizing good sleep may help improve your brain training results.",
    )
  }

  if (correlations.steps > 0.5) {
    insights.push(
      "Higher step counts correlate with better cognitive performance. Regular walking may be beneficial for your brain health.",
    )
  }

  if (correlations.activeMinutes > 0.5) {
    insights.push(
      "Active minutes show a strong correlation with cognitive performance. Try to incorporate more physical activity into your daily routine.",
    )
  }

  if (correlations.heartRate < -0.3) {
    insights.push(
      "Lower resting heart rate correlates with better cognitive performance. Cardiovascular health may be important for your brain function.",
    )
  }

  // Add general insight if no specific correlations found
  if (insights.length === 0) {
    insights.push(
      "No strong correlations found between wearable data and cognitive performance. Continue collecting data for more personalized insights.",
    )
  }

  return insights
}

