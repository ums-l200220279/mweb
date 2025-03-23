/**
 * Monetization Service
 *
 * Handles subscription management, billing, and feature access control
 * based on subscription tiers.
 */

import { logger } from "@/lib/monitoring/logger"
import { encrypt } from "@/lib/security/encryption"

export enum SubscriptionTier {
  FREE = "free",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
  RESEARCH = "research",
}

export interface SubscriptionFeatures {
  maxPatients: number
  maxHistoricalData: number // in months
  advancedAnalytics: boolean
  aiPredictions: boolean
  anomalyDetection: boolean
  dataExport: boolean
  apiAccess: boolean
  customReports: boolean
  multiUserAccess: boolean
  dedicatedSupport: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: number // monthly price in USD
  annualDiscount: number // percentage discount for annual billing
  features: SubscriptionFeatures
}

// Define subscription plans
const subscriptionPlans: Record<SubscriptionTier, SubscriptionPlan> = {
  [SubscriptionTier.FREE]: {
    id: "plan_free",
    name: "Free",
    tier: SubscriptionTier.FREE,
    price: 0,
    annualDiscount: 0,
    features: {
      maxPatients: 5,
      maxHistoricalData: 3,
      advancedAnalytics: false,
      aiPredictions: false,
      anomalyDetection: false,
      dataExport: false,
      apiAccess: false,
      customReports: false,
      multiUserAccess: false,
      dedicatedSupport: false,
    },
  },
  [SubscriptionTier.PROFESSIONAL]: {
    id: "plan_professional",
    name: "Professional",
    tier: SubscriptionTier.PROFESSIONAL,
    price: 49.99,
    annualDiscount: 15,
    features: {
      maxPatients: 50,
      maxHistoricalData: 12,
      advancedAnalytics: true,
      aiPredictions: true,
      anomalyDetection: false,
      dataExport: true,
      apiAccess: false,
      customReports: false,
      multiUserAccess: true,
      dedicatedSupport: false,
    },
  },
  [SubscriptionTier.ENTERPRISE]: {
    id: "plan_enterprise",
    name: "Enterprise",
    tier: SubscriptionTier.ENTERPRISE,
    price: 199.99,
    annualDiscount: 20,
    features: {
      maxPatients: 500,
      maxHistoricalData: 60,
      advancedAnalytics: true,
      aiPredictions: true,
      anomalyDetection: true,
      dataExport: true,
      apiAccess: true,
      customReports: true,
      multiUserAccess: true,
      dedicatedSupport: true,
    },
  },
  [SubscriptionTier.RESEARCH]: {
    id: "plan_research",
    name: "Research",
    tier: SubscriptionTier.RESEARCH,
    price: 99.99,
    annualDiscount: 25,
    features: {
      maxPatients: 1000,
      maxHistoricalData: 120,
      advancedAnalytics: true,
      aiPredictions: true,
      anomalyDetection: true,
      dataExport: true,
      apiAccess: true,
      customReports: true,
      multiUserAccess: true,
      dedicatedSupport: false,
    },
  },
}

export interface Subscription {
  id: string
  organizationId: string
  planId: string
  tier: SubscriptionTier
  startDate: Date
  endDate: Date
  isActive: boolean
  isTrial: boolean
  paymentMethod: {
    type: "credit_card" | "invoice" | "paypal"
    lastFour?: string
    expiryDate?: string
    billingAddress?: string
  }
  billingCycle: "monthly" | "annual"
  autoRenew: boolean
}

export class MonetizationService {
  private paymentGatewayApiKey: string

  constructor(paymentGatewayApiKey: string) {
    this.paymentGatewayApiKey = encrypt(paymentGatewayApiKey)
  }

  /**
   * Get all available subscription plans
   */
  public getSubscriptionPlans(): SubscriptionPlan[] {
    return Object.values(subscriptionPlans)
  }

  /**
   * Get a specific subscription plan by tier
   */
  public getSubscriptionPlan(tier: SubscriptionTier): SubscriptionPlan {
    return subscriptionPlans[tier]
  }

  /**
   * Check if a feature is available for a given subscription tier
   */
  public isFeatureAvailable(tier: SubscriptionTier, featureName: keyof SubscriptionFeatures): boolean {
    const plan = this.getSubscriptionPlan(tier)
    return !!plan.features[featureName]
  }

  /**
   * Create a new subscription for an organization
   */
  public async createSubscription(
    organizationId: string,
    tier: SubscriptionTier,
    billingCycle: "monthly" | "annual",
    paymentDetails: any,
  ): Promise<Subscription> {
    try {
      logger.info(`Creating ${tier} subscription for organization ${organizationId}`)

      // In a real implementation, this would integrate with a payment gateway
      // For demonstration purposes, we're simulating the subscription creation

      const plan = this.getSubscriptionPlan(tier)
      const startDate = new Date()
      const endDate = new Date()

      if (billingCycle === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1)
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1)
      }

      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        organizationId,
        planId: plan.id,
        tier,
        startDate,
        endDate,
        isActive: true,
        isTrial: false,
        paymentMethod: {
          type: "credit_card",
          lastFour: paymentDetails.lastFour,
          expiryDate: paymentDetails.expiryDate,
          billingAddress: paymentDetails.billingAddress,
        },
        billingCycle,
        autoRenew: true,
      }

      // In a real implementation, this would save to a database

      return subscription
    } catch (error) {
      logger.error("Failed to create subscription", error)
      throw new Error("Failed to create subscription")
    }
  }

  /**
   * Calculate the price for a subscription
   */
  public calculateSubscriptionPrice(
    tier: SubscriptionTier,
    billingCycle: "monthly" | "annual",
  ): { basePrice: number; discount: number; finalPrice: number } {
    const plan = this.getSubscriptionPlan(tier)

    if (billingCycle === "monthly") {
      return {
        basePrice: plan.price,
        discount: 0,
        finalPrice: plan.price,
      }
    } else {
      const annualBasePrice = plan.price * 12
      const discountAmount = (annualBasePrice * plan.annualDiscount) / 100
      const finalPrice = annualBasePrice - discountAmount

      return {
        basePrice: annualBasePrice,
        discount: discountAmount,
        finalPrice,
      }
    }
  }

  /**
   * Generate an invoice for a subscription
   */
  public async generateInvoice(subscriptionId: string): Promise<string> {
    // In a real implementation, this would generate an actual invoice
    // For demonstration purposes, we're returning a mock invoice URL

    return `https://api.memoright.com/invoices/${subscriptionId}.pdf`
  }
}

// Create a singleton instance
let monetizationServiceInstance: MonetizationService | null = null

export const getMonetizationService = (): MonetizationService => {
  if (!monetizationServiceInstance) {
    // In a real implementation, this would use an environment variable
    const paymentGatewayApiKey = process.env.PAYMENT_GATEWAY_API_KEY || "test_key"
    monetizationServiceInstance = new MonetizationService(paymentGatewayApiKey)
  }

  return monetizationServiceInstance
}

