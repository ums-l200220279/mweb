import { logger } from "@/lib/observability/logger"
import { metricsService } from "@/lib/observability/metrics"
import { sendAlert } from "@/lib/alerts/alert-service"
import { featureFlagService } from "@/lib/features/feature-flag-service"
import { backupDatabase } from "@/lib/backup/backup-service"
import fs from "fs/promises"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export enum DeploymentStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  ROLLED_BACK = "ROLLED_BACK",
}

export enum RollbackTrigger {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
  SCHEDULED = "SCHEDULED",
}

export enum RollbackStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface RollbackStep {
  id: string
  name: string
  description: string
  order: number
  status: RollbackStatus
  startTime?: Date
  endTime?: Date
  error?: string
  output?: string
  handler: () => Promise<void>
}

export interface Deployment {
  id: string
  version: string
  commitSha: string
  environment: string
  status: DeploymentStatus
  startTime: Date
  endTime?: Date
  features: string[]
  metadata: Record<string, any>
  rollbackPlan?: RollbackPlan
}

export interface RollbackPlan {
  id: string
  deploymentId: string
  status: RollbackStatus
  trigger: RollbackTrigger
  triggeredBy?: string
  startTime?: Date
  endTime?: Date
  steps: RollbackStep[]
  metadata: Record<string, any>
}

/**
 * Rollback Manager
 */
export class RollbackManager {
  private static instance: RollbackManager
  private deployments: Map<string, Deployment> = new Map()
  private readonly deploymentsDirectory: string
  private isInitialized = false

  private constructor() {
    this.deploymentsDirectory = process.env.DEPLOYMENTS_DIR || path.join(process.cwd(), "data", "deployments")
  }

  public static getInstance(): RollbackManager {
    if (!RollbackManager.instance) {
      RollbackManager.instance = new RollbackManager()
    }
    return RollbackManager.instance
  }

  /**
   * Initialize the Rollback Manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // Ensure deployments directory exists
      await fs.mkdir(this.deploymentsDirectory, { recursive: true })

      // Load all deployments from the directory
      const files = await fs.readdir(this.deploymentsDirectory)

      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const deploymentData = await fs.readFile(path.join(this.deploymentsDirectory, file), "utf-8")
            const deployment = JSON.parse(deploymentData) as Deployment
            this.deployments.set(deployment.id, deployment)
          } catch (error) {
            logger.error(`Failed to load deployment from file ${file}:`, error)
          }
        }
      }

      this.isInitialized = true
      logger.info(`Rollback Manager initialized with ${this.deployments.size} deployments`)
    } catch (error) {
      logger.error("Failed to initialize Rollback Manager:", error)
      throw error
    }
  }

  /**
   * Register a new deployment
   */
  public async registerDeployment(deployment: Omit<Deployment, "rollbackPlan">): Promise<Deployment> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Validate deployment
    if (!deployment.id || !deployment.version || !deployment.commitSha || !deployment.environment) {
      throw new Error("Invalid deployment: Missing required fields")
    }

    // Create rollback plan
    const rollbackPlan: RollbackPlan = {
      id: `rollback-${deployment.id}`,
      deploymentId: deployment.id,
      status: RollbackStatus.PENDING,
      trigger: RollbackTrigger.MANUAL,
      steps: [
        {
          id: "backup-database",
          name: "Backup Database",
          description: "Create a backup of the current database state",
          order: 1,
          status: RollbackStatus.PENDING,
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
          id: "disable-features",
          name: "Disable New Features",
          description: "Disable all new features introduced in this deployment",
          order: 2,
          status: RollbackStatus.PENDING,
          handler: async () => {
            try {
              // Disable all features associated with this deployment
              for (const featureKey of deployment.features) {
                await featureFlagService.updateFeatureFlag(featureKey, {
                  enabled: false,
                  description: `Automatically disabled during rollback of deployment ${deployment.id}`,
                })
              }
              return
            } catch (error) {
              logger.error("Feature disabling failed:", error)
              throw new Error("Feature disabling failed")
            }
          },
        },
        {
          id: "revert-code",
          name: "Revert Code",
          description: "Revert code to previous commit",
          order: 3,
          status: RollbackStatus.PENDING,
          handler: async () => {
            try {
              // This is a placeholder for actual code reversion logic
              // In a real system, this would interact with your CI/CD system
              logger.info(`Simulating code reversion for deployment ${deployment.id}`)

              // If running in a real environment with git access, you could do:
              if (process.env.ENABLE_ACTUAL_ROLLBACK === "true") {
                const { stdout, stderr } = await execAsync(`git revert ${deployment.commitSha} --no-commit`)
                logger.info(`Git revert output: ${stdout}`)
                if (stderr) {
                  logger.warn(`Git revert stderr: ${stderr}`)
                }
              } else {
                // Simulate a delay
                await new Promise((resolve) => setTimeout(resolve, 2000))
              }

              return
            } catch (error) {
              logger.error("Code reversion failed:", error)
              throw new Error("Code reversion failed")
            }
          },
        },
        {
          id: "redeploy-previous-version",
          name: "Redeploy Previous Version",
          description: "Trigger deployment of the previous stable version",
          order: 4,
          status: RollbackStatus.PENDING,
          handler: async () => {
            try {
              // This is a placeholder for actual redeployment logic
              // In a real system, this would interact with your CI/CD system
              logger.info(`Simulating redeployment for rollback of ${deployment.id}`)

              // If running in a real environment with deployment access, you could do:
              if (process.env.ENABLE_ACTUAL_ROLLBACK === "true") {
                // Find the previous successful deployment
                const previousDeployments = Array.from(this.deployments.values())
                  .filter(
                    (d) =>
                      d.environment === deployment.environment &&
                      d.status === DeploymentStatus.COMPLETED &&
                      new Date(d.startTime) < new Date(deployment.startTime),
                  )
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

                if (previousDeployments.length > 0) {
                  const previousDeployment = previousDeployments[0]
                  logger.info(
                    `Triggering redeployment of previous version: ${previousDeployment.version} (${previousDeployment.commitSha})`,
                  )

                  // Call your deployment system's API here
                  // For example, if using Vercel:
                  // await fetch('https://api.vercel.com/v1/deployments', { ... });
                } else {
                  logger.warn("No previous successful deployment found to roll back to")
                }
              } else {
                // Simulate a delay
                await new Promise((resolve) => setTimeout(resolve, 3000))
              }

              return
            } catch (error) {
              logger.error("Redeployment failed:", error)
              throw new Error("Redeployment failed")
            }
          },
        },
        {
          id: "verify-rollback",
          name: "Verify Rollback",
          description: "Verify that the rollback was successful",
          order: 5,
          status: RollbackStatus.PENDING,
          handler: async () => {
            try {
              // This is a placeholder for actual verification logic
              logger.info(`Simulating rollback verification for deployment ${deployment.id}`)

              // If running in a real environment, you could do:
              if (process.env.ENABLE_ACTUAL_ROLLBACK === "true") {
                // Perform health checks
                const healthCheckUrl = process.env.HEALTH_CHECK_URL || "http://localhost:3000/api/health"
                const response = await fetch(healthCheckUrl)

                if (!response.ok) {
                  throw new Error(`Health check failed with status: ${response.status}`)
                }

                const healthData = await response.json()
                logger.info(`Health check passed: ${JSON.stringify(healthData)}`)
              } else {
                // Simulate a delay
                await new Promise((resolve) => setTimeout(resolve, 1500))
              }

              return
            } catch (error) {
              logger.error("Rollback verification failed:", error)
              throw new Error("Rollback verification failed")
            }
          },
        },
        {
          id: "notify-stakeholders",
          name: "Notify Stakeholders",
          description: "Send notifications to stakeholders about the rollback status",
          order: 6,
          status: RollbackStatus.PENDING,
          handler: async () => {
            await sendAlert({
              title: `Deployment Rollback Completed: ${deployment.version}`,
              message: `The deployment of version ${deployment.version} to ${deployment.environment} has been rolled back successfully.`,
              level: "info",
              source: "Rollback Manager",
              timestamp: new Date(),
            })
          },
        },
      ],
      metadata: {},
    }

    // Create full deployment with rollback plan
    const fullDeployment: Deployment = {
      ...deployment,
      rollbackPlan,
    }

    // Add deployment to the registry
    this.deployments.set(fullDeployment.id, fullDeployment)

    // Save deployment to disk
    await fs.writeFile(
      path.join(this.deploymentsDirectory, `${fullDeployment.id}.json`),
      JSON.stringify(fullDeployment, null, 2),
      "utf-8",
    )

    logger.info(`Deployment registered: ${fullDeployment.version} (${fullDeployment.id})`)

    // Track metrics
    metricsService.incrementCounter("deployments_registered_total", 1, {
      environment: fullDeployment.environment,
      status: fullDeployment.status,
    })

    return fullDeployment
  }

  /**
   * Get a deployment by ID
   */
  public async getDeployment(deploymentId: string): Promise<Deployment | undefined> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return this.deployments.get(deploymentId)
  }

  /**
   * Get all deployments
   */
  public async getAllDeployments(): Promise<Deployment[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return Array.from(this.deployments.values())
  }

  /**
   * Update deployment status
   */
  public async updateDeploymentStatus(deploymentId: string, status: DeploymentStatus): Promise<Deployment> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const deployment = this.deployments.get(deploymentId)
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`)
    }

    // Update status
    deployment.status = status

    // If completed or failed, set end time
    if (status === DeploymentStatus.COMPLETED || status === DeploymentStatus.FAILED) {
      deployment.endTime = new Date()
    }

    // Save updated deployment
    await this.saveDeployment(deployment)

    logger.info(`Deployment status updated: ${deployment.id} -> ${status}`)

    // Track metrics
    metricsService.incrementCounter("deployment_status_updates_total", 1, {
      deployment_id: deploymentId,
      status,
    })

    // If deployment failed, check if we should automatically roll back
    if (status === DeploymentStatus.FAILED && process.env.ENABLE_AUTO_ROLLBACK === "true") {
      logger.info(`Deployment failed, triggering automatic rollback: ${deploymentId}`)
      await this.rollbackDeployment(deploymentId, RollbackTrigger.AUTOMATIC)
    }

    return deployment
  }

  /**
   * Rollback a deployment
   */
  public async rollbackDeployment(
    deploymentId: string,
    trigger: RollbackTrigger,
    triggeredBy?: string,
  ): Promise<Deployment> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const deployment = this.deployments.get(deploymentId)
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`)
    }

    // Check if deployment has a rollback plan
    if (!deployment.rollbackPlan) {
      throw new Error(`Deployment has no rollback plan: ${deploymentId}`)
    }

    // Check if rollback is already in progress
    if (deployment.rollbackPlan.status === RollbackStatus.IN_PROGRESS) {
      throw new Error(`Rollback is already in progress: ${deploymentId}`)
    }

    // Update rollback plan status
    deployment.rollbackPlan.status = RollbackStatus.IN_PROGRESS
    deployment.rollbackPlan.trigger = trigger
    deployment.rollbackPlan.triggeredBy = triggeredBy
    deployment.rollbackPlan.startTime = new Date()

    // Save updated deployment
    await this.saveDeployment(deployment)

    logger.info(`Rolling back deployment: ${deployment.version} (${deployment.id})`)

    // Track metrics
    metricsService.incrementCounter("deployment_rollbacks_total", 1, {
      deployment_id: deploymentId,
      trigger,
      environment: deployment.environment,
    })

    // Send notification that rollback has started
    await sendAlert({
      title: `Deployment Rollback Started: ${deployment.version}`,
      message: `Rollback of deployment ${deployment.version} to ${deployment.environment} has started.`,
      level: "warning",
      source: "Rollback Manager",
      timestamp: new Date(),
    })

    try {
      // Execute rollback steps in order
      for (const step of deployment.rollbackPlan.steps.sort((a, b) => a.order - b.order)) {
        // Update step status
        step.status = RollbackStatus.IN_PROGRESS
        step.startTime = new Date()

        // Save updated deployment
        await this.saveDeployment(deployment)

        logger.info(`Executing rollback step: ${step.name} (${step.id})`)

        try {
          // Execute step handler
          await step.handler()

          // Update step status
          step.status = RollbackStatus.COMPLETED
          step.endTime = new Date()

          logger.info(`Rollback step completed: ${step.name} (${step.id})`)
        } catch (error) {
          // Update step status
          step.status = RollbackStatus.FAILED
          step.endTime = new Date()
          step.error = error instanceof Error ? error.message : String(error)

          logger.error(`Rollback step failed: ${step.name} (${step.id})`, error)

          // Track metrics
          metricsService.incrementCounter("rollback_step_failures_total", 1, {
            deployment_id: deploymentId,
            step_id: step.id,
            step_name: step.name,
          })

          // Send notification about step failure
          await sendAlert({
            title: `Rollback Step Failed: ${step.name}`,
            message: `Deployment rollback step failed: ${step.error}`,
            level: "error",
            source: "Rollback Manager",
            timestamp: new Date(),
          })

          // Mark rollback as failed
          deployment.rollbackPlan.status = RollbackStatus.FAILED
          deployment.rollbackPlan.endTime = new Date()

          // Save updated deployment
          await this.saveDeployment(deployment)

          throw error
        }
      }

      // Check if all steps are completed
      const allStepsCompleted = deployment.rollbackPlan.steps.every((step) => step.status === RollbackStatus.COMPLETED)

      // Update rollback plan status
      deployment.rollbackPlan.status = allStepsCompleted ? RollbackStatus.COMPLETED : RollbackStatus.FAILED
      deployment.rollbackPlan.endTime = new Date()

      // Update deployment status
      deployment.status = allStepsCompleted ? DeploymentStatus.ROLLED_BACK : DeploymentStatus.FAILED

      // Save updated deployment
      await this.saveDeployment(deployment)

      logger.info(
        `Deployment rollback ${deployment.rollbackPlan.status.toLowerCase()}: ${deployment.version} (${deployment.id})`,
      )

      // Track metrics
      metricsService.incrementCounter("deployment_rollback_completions_total", 1, {
        deployment_id: deploymentId,
        status: deployment.rollbackPlan.status,
        environment: deployment.environment,
      })

      // Send notification that rollback has completed
      await sendAlert({
        title: `Deployment Rollback ${deployment.rollbackPlan.status}: ${deployment.version}`,
        message: `Rollback of deployment ${deployment.version} to ${deployment.environment} has ${deployment.rollbackPlan.status.toLowerCase()}.`,
        level: deployment.rollbackPlan.status === RollbackStatus.COMPLETED ? "info" : "error",
        source: "Rollback Manager",
        timestamp: new Date(),
      })

      return deployment
    } catch (error) {
      // Rollback execution failed
      logger.error(`Deployment rollback failed: ${deployment.version} (${deployment.id})`, error)

      // Update rollback plan status if not already updated
      if (deployment.rollbackPlan.status !== RollbackStatus.FAILED) {
        deployment.rollbackPlan.status = RollbackStatus.FAILED
        deployment.rollbackPlan.endTime = new Date()

        // Save updated deployment
        await this.saveDeployment(deployment)
      }

      throw error
    }
  }

  /**
   * Save a deployment to disk
   */
  private async saveDeployment(deployment: Deployment): Promise<void> {
    // Update deployment in memory
    this.deployments.set(deployment.id, deployment)

    // Save deployment to disk
    await fs.writeFile(
      path.join(this.deploymentsDirectory, `${deployment.id}.json`),
      JSON.stringify(deployment, null, 2),
      "utf-8",
    )
  }

  /**
   * Check deployment health and trigger automatic rollback if needed
   */
  public async checkDeploymentHealth(deploymentId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const deployment = this.deployments.get(deploymentId)
    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`)
    }

    // Skip if deployment is not in progress or already completed
    if (deployment.status !== DeploymentStatus.IN_PROGRESS && deployment.status !== DeploymentStatus.COMPLETED) {
      return true
    }

    try {
      logger.info(`Checking health of deployment: ${deployment.version} (${deployment.id})`)

      // Check application health
      const healthCheckUrl = process.env.HEALTH_CHECK_URL || "http://localhost:3000/api/health"
      const response = await fetch(healthCheckUrl)

      if (!response.ok) {
        logger.error(`Health check failed for deployment ${deploymentId}: ${response.status}`)

        // Track metrics
        metricsService.incrementCounter("deployment_health_check_failures_total", 1, {
          deployment_id: deploymentId,
          status_code: response.status.toString(),
          environment: deployment.environment,
        })

        // If auto-rollback is enabled, trigger rollback
        if (process.env.ENABLE_AUTO_ROLLBACK === "true") {
          logger.warn(`Triggering automatic rollback for deployment ${deploymentId} due to failed health check`)
          await this.rollbackDeployment(deploymentId, RollbackTrigger.AUTOMATIC, "health-check")
        }

        return false
      }

      // Check error rate
      const errorRate = await this.getErrorRate()
      const errorRateThreshold = Number.parseFloat(process.env.ERROR_RATE_THRESHOLD || "0.05") // 5% by default

      if (errorRate > errorRateThreshold) {
        logger.error(
          `Error rate too high for deployment ${deploymentId}: ${errorRate.toFixed(4)} > ${errorRateThreshold}`,
        )

        // Track metrics
        metricsService.incrementCounter("deployment_error_rate_failures_total", 1, {
          deployment_id: deploymentId,
          error_rate: errorRate.toFixed(4),
          threshold: errorRateThreshold.toString(),
          environment: deployment.environment,
        })

        // If auto-rollback is enabled, trigger rollback
        if (process.env.ENABLE_AUTO_ROLLBACK === "true") {
          logger.warn(`Triggering automatic rollback for deployment ${deploymentId} due to high error rate`)
          await this.rollbackDeployment(deploymentId, RollbackTrigger.AUTOMATIC, "error-rate")
        }

        return false
      }

      // Check response time
      const responseTime = await this.getAverageResponseTime()
      const responseTimeThreshold = Number.parseFloat(process.env.RESPONSE_TIME_THRESHOLD || "500") // 500ms by default

      if (responseTime > responseTimeThreshold) {
        logger.error(
          `Response time too high for deployment ${deploymentId}: ${responseTime.toFixed(2)}ms > ${responseTimeThreshold}ms`,
        )

        // Track metrics
        metricsService.incrementCounter("deployment_response_time_failures_total", 1, {
          deployment_id: deploymentId,
          response_time: responseTime.toFixed(2),
          threshold: responseTimeThreshold.toString(),
          environment: deployment.environment,
        })

        // If auto-rollback is enabled, trigger rollback
        if (process.env.ENABLE_AUTO_ROLLBACK === "true") {
          logger.warn(`Triggering automatic rollback for deployment ${deploymentId} due to high response time`)
          await this.rollbackDeployment(deploymentId, RollbackTrigger.AUTOMATIC, "response-time")
        }

        return false
      }

      logger.info(`Deployment health check passed: ${deployment.version} (${deployment.id})`)
      return true
    } catch (error) {
      logger.error(`Error checking deployment health: ${deploymentId}`, error)

      // Track metrics
      metricsService.incrementCounter("deployment_health_check_errors_total", 1, {
        deployment_id: deploymentId,
        error_type: error instanceof Error ? error.name : "unknown",
        environment: deployment.environment,
      })

      // If auto-rollback is enabled, trigger rollback
      if (process.env.ENABLE_AUTO_ROLLBACK === "true") {
        logger.warn(`Triggering automatic rollback for deployment ${deploymentId} due to health check error`)
        await this.rollbackDeployment(deploymentId, RollbackTrigger.AUTOMATIC, "health-check-error")
      }

      return false
    }
  }

  /**
   * Get current error rate
   */
  private async getErrorRate(): Promise<number> {
    try {
      // In a real implementation, this would query your metrics system
      // For example, Prometheus, Datadog, etc.

      // For demonstration purposes, we'll use a random value with a bias towards low error rates
      const randomErrorRate = Math.random() * 0.1 // 0-10% error rate
      return randomErrorRate
    } catch (error) {
      logger.error("Error getting error rate:", error)
      return 0 // Default to 0 in case of error
    }
  }

  /**
   * Get average response time
   */
  private async getAverageResponseTime(): Promise<number> {
    try {
      // In a real implementation, this would query your metrics system
      // For example, Prometheus, Datadog, etc.

      // For demonstration purposes, we'll use a random value with a bias towards normal response times
      const baseResponseTime = 200 // 200ms base
      const randomVariation = Math.random() * 400 // 0-400ms variation
      return baseResponseTime + randomVariation
    } catch (error) {
      logger.error("Error getting average response time:", error)
      return 0 // Default to 0 in case of error
    }
  }
}

// Export singleton instance
export const rollbackManager = RollbackManager.getInstance()

