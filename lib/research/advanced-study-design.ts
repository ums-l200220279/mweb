/**
 * Advanced Study Design Service
 *
 * Provides functionality for designing complex research studies including
 * randomized controlled trials, crossover studies, and factorial designs.
 */

import { logger } from "@/lib/monitoring/logger"
import { getStudyManagementService } from "./study-management"

export enum StudyDesignType {
  OBSERVATIONAL = "observational",
  CASE_CONTROL = "case_control",
  COHORT = "cohort",
  RCT = "randomized_controlled_trial",
  CROSSOVER = "crossover",
  FACTORIAL = "factorial",
  ADAPTIVE = "adaptive",
  N_OF_1 = "n_of_1",
}

export enum RandomizationMethod {
  SIMPLE = "simple",
  BLOCK = "block",
  STRATIFIED = "stratified",
  MINIMIZATION = "minimization",
  CLUSTER = "cluster",
  COVARIATE_ADAPTIVE = "covariate_adaptive",
}

export enum BlindingType {
  OPEN_LABEL = "open_label",
  SINGLE_BLIND = "single_blind",
  DOUBLE_BLIND = "double_blind",
  TRIPLE_BLIND = "triple_blind",
}

export interface StudyArm {
  id: string
  name: string
  description: string
  type: "experimental" | "control" | "placebo" | "standard_care"
  intervention?: string
  targetSize: number
  currentSize: number
}

export interface RandomizationConfig {
  method: RandomizationMethod
  ratio?: number[] // e.g., [1, 1] for 1:1, [2, 1] for 2:1
  blockSize?: number[] // for block randomization
  stratificationFactors?: string[] // for stratified randomization
  seed?: number // for reproducibility
}

export interface StudyDesign {
  id: string
  studyId: string
  type: StudyDesignType
  arms: StudyArm[]
  phases?: Array<{
    id: string
    name: string
    duration: number // in days
    description: string
    arms: string[] // arm IDs
  }>
  randomization?: RandomizationConfig
  blinding: BlindingType
  primaryOutcomes: string[]
  secondaryOutcomes: string[]
  powerAnalysis?: {
    effectSize: number
    alpha: number
    power: number
    sampleSize: number
    adjustments: string[]
  }
}

export class AdvancedStudyDesignService {
  private studyManagementService = getStudyManagementService()

  /**
   * Create a new study design
   */
  public async createStudyDesign(studyId: string, designData: Omit<StudyDesign, "id">): Promise<StudyDesign> {
    try {
      logger.info(`Creating study design for study: ${studyId}`)

      // In a real implementation, this would save to a database
      const design: StudyDesign = {
        ...designData,
        id: `design_${Date.now()}`,
        studyId,
      }

      return design
    } catch (error) {
      logger.error(`Failed to create study design for study: ${studyId}`, error)
      throw new Error("Failed to create study design")
    }
  }

  /**
   * Calculate required sample size based on power analysis
   */
  public calculateSampleSize(
    effectSize: number,
    alpha = 0.05,
    power = 0.8,
    designType: StudyDesignType,
    additionalParams: Record<string, any> = {},
  ): number {
    try {
      logger.info(`Calculating sample size for study design: ${designType}`)

      // In a real implementation, this would use statistical formulas
      // For demonstration purposes, we're using simplified calculations

      let baseSampleSize: number

      // Calculate base sample size using simplified formula
      // (actual implementation would use proper statistical methods)
      baseSampleSize = Math.ceil(16 / (effectSize * effectSize))

      // Adjust for study design
      switch (designType) {
        case StudyDesignType.RCT:
          // For two-arm RCT
          baseSampleSize = Math.ceil(baseSampleSize * 2)
          break

        case StudyDesignType.CROSSOVER:
          // Crossover designs typically require fewer participants
          baseSampleSize = Math.ceil(baseSampleSize * 0.6)
          break

        case StudyDesignType.FACTORIAL:
          // Factorial designs need to account for multiple factors
          const factors = additionalParams.factors || 2
          baseSampleSize = Math.ceil(baseSampleSize * Math.pow(2, factors - 1))
          break

        case StudyDesignType.ADAPTIVE:
          // Adaptive designs often start with smaller samples
          baseSampleSize = Math.ceil(baseSampleSize * 0.7)
          break

        default:
          // No adjustment for other designs
          break
      }

      // Adjust for multiple comparisons if needed
      if (additionalParams.multipleComparisons) {
        // Bonferroni correction
        const comparisons = additionalParams.comparisons || 1
        const adjustedAlpha = alpha / comparisons

        // Recalculate with adjusted alpha
        // (simplified approximation)
        baseSampleSize = Math.ceil(baseSampleSize * 1.2)
      }

      // Adjust for expected dropout
      if (additionalParams.dropoutRate) {
        const dropoutRate = additionalParams.dropoutRate
        baseSampleSize = Math.ceil(baseSampleSize / (1 - dropoutRate))
      }

      return baseSampleSize
    } catch (error) {
      logger.error("Failed to calculate sample size", error)
      throw new Error("Failed to calculate sample size")
    }
  }

  /**
   * Generate a randomization sequence
   */
  public generateRandomizationSequence(
    config: RandomizationConfig,
    participantCount: number,
  ): Array<{ participantId: number; armIndex: number }> {
    try {
      logger.info(`Generating randomization sequence using method: ${config.method}`)

      const sequence: Array<{ participantId: number; armIndex: number }> = []

      // Set random seed if provided
      const seed = config.seed || Date.now()
      const random = this.seededRandom(seed)

      // Default to 1:1 ratio if not specified
      const ratio = config.ratio || [1, 1]
      const totalRatio = ratio.reduce((sum, r) => sum + r, 0)

      switch (config.method) {
        case RandomizationMethod.SIMPLE:
          // Simple randomization
          for (let i = 1; i <= participantCount; i++) {
            const armIndex = this.weightedRandomSelection(ratio, totalRatio, random)
            sequence.push({ participantId: i, armIndex })
          }
          break

        case RandomizationMethod.BLOCK:
          // Block randomization
          const blockSize = config.blockSize?.[0] || 4

          // Generate blocks
          const blocks = Math.ceil(participantCount / blockSize)

          for (let block = 0; block < blocks; block++) {
            const blockSequence: number[] = []

            // Create a balanced block
            for (let i = 0; i < ratio.length; i++) {
              for (let j = 0; j < ratio[i]; j++) {
                blockSequence.push(i)
                if (blockSequence.length >= blockSize) break
              }
              if (blockSequence.length >= blockSize) break
            }

            // Fill remaining slots if needed
            while (blockSequence.length < blockSize) {
              blockSequence.push(this.weightedRandomSelection(ratio, totalRatio, random))
            }

            // Shuffle the block
            this.shuffleArray(blockSequence, random)

            // Add to sequence
            for (let i = 0; i < blockSize; i++) {
              const participantId = block * blockSize + i + 1
              if (participantId <= participantCount) {
                sequence.push({ participantId, armIndex: blockSequence[i] })
              }
            }
          }
          break

        case RandomizationMethod.STRATIFIED:
          // For demonstration purposes, we're simplifying stratified randomization
          // In a real implementation, this would account for stratification factors

          // Fallback to block randomization
          return this.generateRandomizationSequence({ ...config, method: RandomizationMethod.BLOCK }, participantCount)

        default:
          // Fallback to simple randomization
          return this.generateRandomizationSequence({ ...config, method: RandomizationMethod.SIMPLE }, participantCount)
      }

      return sequence
    } catch (error) {
      logger.error("Failed to generate randomization sequence", error)
      throw new Error("Failed to generate randomization sequence")
    }
  }

  /**
   * Create a seeded random number generator
   */
  private seededRandom(seed: number): () => number {
    let state = seed

    return () => {
      state = (state * 9301 + 49297) % 233280
      return state / 233280
    }
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  private shuffleArray(array: any[], random: () => number): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  /**
   * Select an arm index based on weighted randomization
   */
  private weightedRandomSelection(weights: number[], totalWeight: number, random: () => number): number {
    const r = random() * totalWeight
    let cumulativeWeight = 0

    for (let i = 0; i < weights.length; i++) {
      cumulativeWeight += weights[i]
      if (r < cumulativeWeight) {
        return i
      }
    }

    return weights.length - 1
  }

  /**
   * Generate a study protocol based on study design
   */
  public async generateProtocol(designId: string): Promise<string> {
    try {
      logger.info(`Generating protocol for study design: ${designId}`)

      // In a real implementation, this would generate a protocol document
      // For demonstration purposes, we're returning a mock protocol URL

      return `https://api.memoright.com/study-designs/${designId}/protocol.pdf`
    } catch (error) {
      logger.error(`Failed to generate protocol for study design: ${designId}`, error)
      throw new Error("Failed to generate study protocol")
    }
  }
}

// Create a singleton instance
let advancedStudyDesignServiceInstance: AdvancedStudyDesignService | null = null

export const getAdvancedStudyDesignService = (): AdvancedStudyDesignService => {
  if (!advancedStudyDesignServiceInstance) {
    advancedStudyDesignServiceInstance = new AdvancedStudyDesignService()
  }

  return advancedStudyDesignServiceInstance
}

