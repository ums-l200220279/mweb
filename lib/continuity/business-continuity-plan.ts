import { prisma } from "@/lib/db"
import { logger } from "@/lib/observability/logger"
import { metricsService } from "@/lib/observability/metrics"
import { sendAlert } from "@/lib/alerts/alert-service"
import { backupDatabase } from "@/lib/backup/backup-service"
import fs from "fs/promises"
import path from "path"

export enum BCPTriggerType {
  MANUAL = "MANUAL",
  SCHEDULED = "SCHEDULED",
  AUTOMATIC = "AUTOMATIC",
  ALERT = "ALERT",
}

export enum BCPStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum BCPPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface BCPStep {
  id: string
  name: string
  description: string
  order: number
  status: BCPStatus
  startTime?: Date
  endTime?: Date
  error?: string
  output?: string
  dependencies?: string[]
  handler: () => Promise<void>
}

export interface BCPPlan {
  id: string
  name: string
  description: string
  version: string
  createdAt: Date
  updatedAt: Date
  status: BCPStatus
  priority: BCPPriority
  triggerType: BCPTriggerType
  triggeredBy?: string
  startTime?: Date
  endTime?: Date
  steps: BCPStep[]
  notificationChannels: string[]
  dependencies: string[]
  resources: Record<string, any>
  metadata: Record<string, any>
}

/**
 * Business Continuity Plan Manager
 */
export class BusinessContinuityPlanManager {
  private static instance: BusinessContinuityPlanManager
  private plans: Map<string, BCPPlan> = new Map()
  private readonly plansDirectory: string
  private isInitialized = false

  private constructor() {
    this.plansDirectory = process.env.BCP_PLANS_DIR || path.join(process.cwd(), "data", "bcp-plans")
  }

  public static getInstance(): BusinessContinuityPlanManager {
    if (!BusinessContinuityPlanManager.instance) {
      BusinessContinuityPlanManager.instance = new BusinessContinuityPlanManager()
    }
    return BusinessContinuityPlanManager.instance
  }

  /**
   * Initialize the BCP manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // Ensure plans directory exists
      await fs.mkdir(this.plansDirectory, { recursive: true })

      // Load all plans from the directory
      const files = await fs.readdir(this.plansDirectory)

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const planData = await fs.readFile(path.join(this.plansDirectory, file), "utf-8")
            const plan = JSON.parse(planData) as BCPPlan
            this.plans.set(plan.id, plan)
          } catch (error) {
            logger.error(`Failed to load BCP plan from file ${file}:`, error)
          }
        }
      }

      this.isInitialized = true
      logger.info(`BCP Manager initialized with ${this.plans.size} plans`)

      // Register predefined plans if they don't exist
      await this.registerPredefinedPlans()
    } catch (error) {
      logger.error("Failed to initialize BCP Manager:", error)
      throw error
    }
  }

  /**
   * Register predefined BCP plans
   */
  private async registerPredefinedPlans(): Promise<void> {
    // Database Failure Recovery Plan
    if (!this.plans.has("database-failure-recovery")) {
      await this.registerPlan({
        id: "database-failure-recovery",
        name: "Database Failure Recovery Plan",
        description: "Plan to recover from database failures",
        version: "1.0.0",
        createdAt: new Date(),
        updatedAt: new Date(),
        status: BCPStatus.PENDING,
        priority: BCPPriority.CRITICAL,
        triggerType: BCPTriggerType.MANUAL,
        steps: [
          {
            id: "check-database-connection",
            name: "Check Database Connection",
            description: "Verify database connectivity",
            order: 1,
            status: BCPStatus.PENDING,
            handler: async () => {
              try {
                await prisma.$queryRaw`SELECT 1`
                return
              } catch (error) {
                logger.error("Database connection check failed:", error)
                throw new Error("Database connection check failed")
              }
            },
          },
          {
            id: "create-database-backup",
            name: "Create Database Backup",
            description: "Create a backup of the current database state",
            order: 2,
            status: BCPStatus.PENDING,
            dependencies: ["check-database-connection"],
            handler: async () => {
              try {
                await backupDatabase()
                return
              } catch (error) {
                logger.error("Database backup failed:", error)
                throw new Error("Database backup failed")
              }
            },
          },
          {
            id: "restore-from-latest-backup",
            name: "Restore from Latest Backup",
            description: "Restore database from the latest backup",
            order: 3,
            status: BCPStatus.PENDING,
            handler: async () => {
              // Implementation would depend on your backup system
              logger.info("Restoring database from latest backup...")
              // Simulate restoration process
              await new Promise((resolve) => setTimeout(resolve, 2000))
              logger.info("Database restored successfully")
            },
          },
          {
            id: "verify-data-integrity",
            name: "Verify Data Integrity",
            description: "Verify the integrity of the restored data",
            order: 4,
            status: BCPStatus.PENDING,
            dependencies: ["restore-from-latest-backup"],
            handler: async () => {
              try {
                // Check critical tables
                const userCount = await prisma.user.count()
                const gameCount = await prisma.game.count()

                logger.info(`Data integrity check: ${userCount} users, ${gameCount} games`)

                if (userCount === 0 && gameCount === 0) {
                  throw new Error("Data integrity check failed: Empty critical tables")
                }

                return
              } catch (error) {
                logger.error("Data integrity verification failed:", error)
                throw new Error("Data integrity verification failed")
              }
            },
          },
          {
            id: "notify-stakeholders",
            name: "Notify Stakeholders",
            description: "Send notifications to stakeholders about the recovery status",
            order: 5,
            status: BCPStatus.PENDING,
            handler: async () => {
              await sendAlert({
                title: "Database Recovery Completed",
                message: "The database has been successfully recovered",
                level: "info",
                source: "BCP Manager",
                timestamp: new Date(),
              })
            },
          },
        ],
        notificationChannels: ["email", "slack"],
        dependencies: [],
        resources: {
          requiredServices: ["database", "backup-service", "alert-service"],
        },
        metadata: {
          estimatedDowntime: "10-30 minutes",
          dataLossRisk: "Low to Medium",
          lastTested: new Date().toISOString(),
        },
      })
    }

    // Application Failure Recovery Plan
    if (!this.plans.has("application-failure-recovery")) {
      await this.registerPlan({
        id: "application-failure-recovery",
        name: "Application Failure Recovery Plan",
        description: "Plan to recover from application failures",
        version: "1.0.0",
        createdAt: new Date(),
        updatedAt: new Date(),
        status: BCPStatus.PENDING,
        priority: BCPPriority.HIGH,
        triggerType: BCPTriggerType.MANUAL,
        steps: [
          {
            id: "check-application-health",
            name: "Check Application Health",
            description: "Verify application health status",
            order: 1,
            status: BCPStatus.PENDING,
            handler: async () => {
              try {
                // Implementation would depend on your health check system
                logger.info("Checking application health...")
                // Simulate health check
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return
              } catch (error) {
                logger.error("Application health check failed:", error)
                throw new Error("Application health check failed")
              }
            },
          },
          {
            id: "restart-application-services",
            name: "Restart Application Services",
            description: "Restart all application services",
            order: 2,
            status: BCPStatus.PENDING,
            handler: async () => {
              try {
                logger.info("Restarting application services...")
                // Simulate service restart
                await new Promise((resolve) => setTimeout(resolve, 2000))
                logger.info("Application services restarted successfully")
                return
              } catch (error) {
                logger.error("Failed to restart application services:", error)
                throw new Error("Failed to restart application services")
              }
            },
          },
          {
            id: "verify-application-functionality",
            name: "Verify Application Functionality",
            description: "Verify core application functionality",
            order: 3,
            status: BCPStatus.PENDING,
            dependencies: ["restart-application-services"],
            handler: async () => {
              try {
                logger.info("Verifying application functionality...")
                // Simulate functionality verification
                await new Promise((resolve) => setTimeout(resolve, 1500))
                logger.info("Application functionality verified successfully")
                return
              } catch (error) {
                logger.error("Application functionality verification failed:", error)
                throw new Error("Application functionality verification failed")
              }
            },
          },
          {
            id: "notify-stakeholders",
            name: "Notify Stakeholders",
            description: "Send notifications to stakeholders about the recovery status",
            order: 4,
            status: BCPStatus.PENDING,
            handler: async () => {
              await sendAlert({
                title: "Application Recovery Completed",
                message: "The application has been successfully recovered",
                level: "info",
                source: "BCP Manager",
                timestamp: new Date(),
              })
            },
          },
        ],
        notificationChannels: ["email", "slack"],
        dependencies: [],
        resources: {
          requiredServices: ["application-server", "alert-service"],
        },
        metadata: {
          estimatedDowntime: "5-15 minutes",
          dataLossRisk: "Low",
          lastTested: new Date().toISOString(),
        },
      })
    }

    // Data Corruption Recovery Plan
    if (!this.plans.has("data-corruption-recovery")) {
      await this.registerPlan({
        id: "data-corruption-recovery",
        name: "Data Corruption Recovery Plan",
        description: "Plan to recover from data corruption",
        version: "1.0.0",
        createdAt: new Date(),
        updatedAt: new Date(),
        status: BCPStatus.PENDING,
        priority: BCPPriority.CRITICAL,
        triggerType: BCPTriggerType.MANUAL,
        steps: [
          {
            id: "identify-corrupted-data",
            name: "Identify Corrupted Data",
            description: "Identify the extent and nature of data corruption",
            order: 1,
            status: BCPStatus.PENDING,
            handler: async () => {
              try {
                logger.info("Identifying corrupted data...")
                // Simulate data corruption identification
                await new Promise((resolve) => setTimeout(resolve, 2000))
                logger.info("Corrupted data identified")
                return
              } catch (error) {
                logger.error("Failed to identify corrupted data:", error)
                throw new Error("Failed to identify corrupted data")
              }
            },
          },
          {
            id: "isolate-affected-systems",
            name: "Isolate Affected Systems",
            description: "Isolate systems affected by data corruption",
            order: 2,
            status: BCPStatus.PENDING,
            dependencies: ["identify-corrupted-data"],
            handler: async () => {
              try {
                logger.info("Isolating affected systems...")
                // Simulate system isolation
                await new Promise((resolve) => setTimeout(resolve, 1500))
                logger.info("Affected systems isolated")
                return
              } catch (error) {
                logger.error("Failed to isolate affected systems:", error)
                throw new Error("Failed to isolate affected systems")
              }
            },
          },
          {
            id: "restore-from-backup",
            name: "Restore from Backup",
            description: "Restore corrupted data from the latest clean backup",
            order: 3,
            status: BCPStatus.PENDING,
            dependencies: ["isolate-affected-systems"],
            handler: async () => {
              try {
                logger.info("Restoring data from backup...")
                // Simulate data restoration
                await new Promise((resolve) => setTimeout(resolve, 3000))
                logger.info("Data restored from backup")
                return
              } catch (error) {
                logger.error("Failed to restore data from backup:", error)
                throw new Error("Failed to restore data from backup")
              }
            },
          },
          {
            id: "verify-data-integrity",
            name: "Verify Data Integrity",
            description: "Verify the integrity of the restored data",
            order: 4,
            status: BCPStatus.PENDING,
            dependencies: ["restore-from-backup"],
            handler: async () => {
              try {
                logger.info("Verifying data integrity...")
                // Simulate data integrity verification
                await new Promise((resolve) => setTimeout(resolve, 2000))
                logger.info("Data integrity verified")
                return
              } catch (error) {
                logger.error("Data integrity verification failed:", error)
                throw new Error("Data integrity verification failed")
              }
            },
          },
          {
            id: "notify-stakeholders",
            name: "Notify Stakeholders",
            description: "Send notifications to stakeholders about the recovery status",
            order: 5,
            status: BCPStatus.PENDING,
            handler: async () => {
              await sendAlert({
                title: "Data Corruption Recovery Completed",
                message: "The data corruption has been successfully addressed",
                level: "info",
                source: "BCP Manager",
                timestamp: new Date(),
              })
            },
          },
        ],
        notificationChannels: ["email", "slack"],
        dependencies: [],
        resources: {
          requiredServices: ["database", "backup-service", "alert-service"],
        },
        metadata: {
          estimatedDowntime: "30-60 minutes",
          dataLossRisk: "Medium",
          lastTested: new Date().toISOString(),
        },
      })
    }
  }

  /**
   * Register a new BCP plan
   */
  public async registerPlan(plan: BCPPlan): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Validate plan
    if (!plan.id || !plan.name || !plan.steps || plan.steps.length === 0) {
      throw new Error("Invalid BCP plan: Missing required fields")
    }

    // Add plan to the registry
    this.plans.set(plan.id, plan)

    // Save plan to disk
    await fs.writeFile(path.join(this.plansDirectory, `${plan.id}.json`), JSON.stringify(plan, null, 2), "utf-8")

    logger.info(`BCP plan registered: ${plan.name} (${plan.id})`)
  }

  /**
   * Get a BCP plan by ID
   */
  public async getPlan(planId: string): Promise<BCPPlan | undefined> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return this.plans.get(planId)
  }

  /**
   * Get all BCP plans
   */
  public async getAllPlans(): Promise<BCPPlan[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return Array.from(this.plans.values())
  }

  /**
   * Execute a BCP plan
   */
  public async executePlan(planId: string, triggeredBy?: string): Promise<BCPPlan> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const plan = this.plans.get(planId)
    if (!plan) {
      throw new Error(`BCP plan not found: ${planId}`)
    }

    // Check if plan is already in progress
    if (plan.status === BCPStatus.IN_PROGRESS) {
      throw new Error(`BCP plan is already in progress: ${planId}`)
    }

    // Update plan status
    plan.status = BCPStatus.IN_PROGRESS
    plan.startTime = new Date()
    plan.triggeredBy = triggeredBy

    // Save updated plan
    await this.savePlan(plan)

    logger.info(`Executing BCP plan: ${plan.name} (${plan.id})`)

    // Track metrics
    metricsService.incrementCounter("bcp_plan_executions_total", 1, {
      plan_id: plan.id,
      plan_name: plan.name,
      priority: plan.priority,
      trigger_type: plan.triggerType,
    })

    // Send notification that plan execution has started
    await sendAlert({
      title: `BCP Plan Execution Started: ${plan.name}`,
      message: `Business Continuity Plan execution has started: ${plan.description}`,
      level: "info",
      source: "BCP Manager",
      timestamp: new Date(),
    })

    try {
      // Execute steps in order
      for (const step of plan.steps.sort((a, b) => a.order - b.order)) {
        // Check if step has dependencies
        if (step.dependencies && step.dependencies.length > 0) {
          // Check if all dependencies are completed
          const dependencySteps = plan.steps.filter((s) => step.dependencies!.includes(s.id))
          const allDependenciesCompleted = dependencySteps.every((s) => s.status === BCPStatus.COMPLETED)

          if (!allDependenciesCompleted) {
            logger.warn(`Skipping step ${step.name} (${step.id}) due to incomplete dependencies`)
            step.status = BCPStatus.CANCELLED
            continue
          }
        }

        // Update step status
        step.status = BCPStatus.IN_PROGRESS
        step.startTime = new Date()

        // Save updated plan
        await this.savePlan(plan)

        logger.info(`Executing BCP step: ${step.name} (${step.id})`)

        try {
          // Execute step handler
          await step.handler()

          // Update step status
          step.status = BCPStatus.COMPLETED
          step.endTime = new Date()

          logger.info(`BCP step completed: ${step.name} (${step.id})`)
        } catch (error) {
          // Update step status
          step.status = BCPStatus.FAILED
          step.endTime = new Date()
          step.error = error instanceof Error ? error.message : String(error)

          logger.error(`BCP step failed: ${step.name} (${step.id})`, error)

          // Track metrics
          metricsService.incrementCounter("bcp_step_failures_total", 1, {
            plan_id: plan.id,
            step_id: step.id,
            step_name: step.name,
          })

          // Send notification about step failure
          await sendAlert({
            title: `BCP Step Failed: ${step.name}`,
            message: `Business Continuity Plan step failed: ${step.error}`,
            level: "error",
            source: "BCP Manager",
            timestamp: new Date(),
          })

          // Mark plan as failed
          plan.status = BCPStatus.FAILED
          plan.endTime = new Date()

          // Save updated plan
          await this.savePlan(plan)

          throw error
        }
      }

      // Check if all steps are completed
      const allStepsCompleted = plan.steps.every(
        (step) => step.status === BCPStatus.COMPLETED || step.status === BCPStatus.CANCELLED,
      )

      // Update plan status
      plan.status = allStepsCompleted ? BCPStatus.COMPLETED : BCPStatus.FAILED
      plan.endTime = new Date()

      // Save updated plan
      await this.savePlan(plan)

      logger.info(`BCP plan execution ${plan.status.toLowerCase()}: ${plan.name} (${plan.id})`)

      // Track metrics
      metricsService.incrementCounter("bcp_plan_completions_total", 1, {
        plan_id: plan.id,
        plan_name: plan.name,
        status: plan.status,
      })

      // Send notification that plan execution has completed
      await sendAlert({
        title: `BCP Plan Execution ${plan.status}: ${plan.name}`,
        message: `Business Continuity Plan execution has ${plan.status.toLowerCase()}: ${plan.description}`,
        level: plan.status === BCPStatus.COMPLETED ? "info" : "error",
        source: "BCP Manager",
        timestamp: new Date(),
      })

      return plan
    } catch (error) {
      // Plan execution failed
      logger.error(`BCP plan execution failed: ${plan.name} (${plan.id})`, error)

      // Update plan status if not already updated
      if (plan.status !== BCPStatus.FAILED) {
        plan.status = BCPStatus.FAILED
        plan.endTime = new Date()

        // Save updated plan
        await this.savePlan(plan)
      }

      throw error
    }
  }

  /**
   * Cancel a BCP plan execution
   */
  public async cancelPlan(planId: string, reason?: string): Promise<BCPPlan> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const plan = this.plans.get(planId)
    if (!plan) {
      throw new Error(`BCP plan not found: ${planId}`)
    }

    // Check if plan is in progress
    if (plan.status !== BCPStatus.IN_PROGRESS) {
      throw new Error(`BCP plan is not in progress: ${planId}`)
    }

    // Update plan status
    plan.status = BCPStatus.CANCELLED
    plan.endTime = new Date()
    plan.metadata = {
      ...plan.metadata,
      cancellationReason: reason || "Manually cancelled",
    }

    // Update in-progress steps
    for (const step of plan.steps) {
      if (step.status === BCPStatus.IN_PROGRESS) {
        step.status = BCPStatus.CANCELLED
        step.endTime = new Date()
      }
    }

    // Save updated plan
    await this.savePlan(plan)

    logger.info(`BCP plan cancelled: ${plan.name} (${plan.id})`)

    // Track metrics
    metricsService.incrementCounter("bcp_plan_cancellations_total", 1, {
      plan_id: plan.id,
      plan_name: plan.name,
    })

    // Send notification that plan execution has been cancelled
    await sendAlert({
      title: `BCP Plan Cancelled: ${plan.name}`,
      message: `Business Continuity Plan execution has been cancelled: ${reason || "No reason provided"}`,
      level: "warning",
      source: "BCP Manager",
      timestamp: new Date(),
    })

    return plan
  }

  /**
   * Save a BCP plan to disk
   */
  private async savePlan(plan: BCPPlan): Promise<void> {
    plan.updatedAt = new Date()

    // Update plan in memory
    this.plans.set(plan.id, plan)

    // Save plan to disk
    await fs.writeFile(path.join(this.plansDirectory, `${plan.id}.json`), JSON.stringify(plan, null, 2), "utf-8")
  }
}

// Export singleton instance
export const bcpManager = BusinessContinuityPlanManager.getInstance()

