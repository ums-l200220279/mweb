import Stripe from "stripe"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/monitoring/logger"
import { cache } from "@/lib/cache/redis"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Subscription tiers
export enum SubscriptionTier {
  FREE = "free",
  BASIC = "basic",
  PREMIUM = "premium",
  ENTERPRISE = "enterprise",
}

// Subscription features
export interface SubscriptionFeatures {
  maxGamesPerDay: number
  advancedAnalytics: boolean
  personalizedTraining: boolean
  prioritySupport: boolean
  teamAccess: boolean
  customBranding: boolean
  apiAccess: boolean
}

// Subscription plan details
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  tier: SubscriptionTier
  price: number
  interval: "month" | "year"
  features: SubscriptionFeatures
  stripePriceId: string
}

// Subscription status
export enum SubscriptionStatus {
  ACTIVE = "active",
  PAST_DUE = "past_due",
  UNPAID = "unpaid",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  TRIALING = "trialing",
}

// Customer details
export interface CustomerDetails {
  id: string
  email: string
  name: string
  phone?: string
  address?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postal_code: string
    country: string
  }
  metadata?: Record<string, string>
}

// Subscription details
export interface SubscriptionDetails {
  id: string
  customerId: string
  status: SubscriptionStatus
  plan: SubscriptionPlan
  currentPeriodStart: number
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
  canceledAt?: number
  trialStart?: number
  trialEnd?: number
}

// Invoice details
export interface InvoiceDetails {
  id: string
  customerId: string
  subscriptionId: string
  amount: number
  amountPaid: number
  currency: string
  status: "draft" | "open" | "paid" | "uncollectible" | "void"
  created: number
  dueDate?: number
  pdfUrl?: string
  hostedInvoiceUrl?: string
}

// Payment method details
export interface PaymentMethodDetails {
  id: string
  type: "card" | "bank_account" | "other"
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  isDefault: boolean
}

/**
 * Stripe service for handling payments and subscriptions
 */
export class StripeService {
  private supabase = createClient()

  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      // Try to get from cache first
      const cachedPlans = await cache.get("subscription:plans")
      if (cachedPlans) {
        return JSON.parse(cachedPlans)
      }

      // Get plans from database
      const { data, error } = await this.supabase.from("subscription_plans").select("*")

      if (error) {
        logger.error("Failed to get subscription plans", { error })
        throw new Error(`Failed to get subscription plans: ${error.message}`)
      }

      // Map to subscription plan objects
      const plans: SubscriptionPlan[] = data.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        tier: plan.tier as SubscriptionTier,
        price: plan.price,
        interval: plan.interval as "month" | "year",
        features: plan.features as SubscriptionFeatures,
        stripePriceId: plan.stripe_price_id,
      }))

      // Cache the plans
      await cache.set("subscription:plans", JSON.stringify(plans), 60 * 60 * 24) // 24 hours

      return plans
    } catch (error) {
      logger.error("Error getting subscription plans", { error })
      throw error
    }
  }

  /**
   * Get a specific subscription plan by ID
   */
  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan> {
    try {
      // Get all plans
      const plans = await this.getSubscriptionPlans()

      // Find the plan with the matching ID
      const plan = plans.find((p) => p.id === planId)

      if (!plan) {
        throw new Error(`Subscription plan not found: ${planId}`)
      }

      return plan
    } catch (error) {
      logger.error(`Error getting subscription plan ${planId}`, { error })
      throw error
    }
  }

  /**
   * Create a new customer in Stripe
   */
  async createCustomer(userId: string, email: string, name: string): Promise<string> {
    try {
      logger.info(`Creating Stripe customer for user ${userId}`)

      // Create customer in Stripe
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      })

      // Store customer ID in database
      const { error } = await this.supabase
        .from("users")
        .update({
          stripe_customer_id: customer.id,
        })
        .eq("id", userId)

      if (error) {
        logger.error(`Failed to store Stripe customer ID for user ${userId}`, { error })
        throw new Error(`Failed to store Stripe customer ID: ${error.message}`)
      }

      logger.info(`Successfully created Stripe customer for user ${userId}`)
      return customer.id
    } catch (error) {
      logger.error(`Error creating Stripe customer for user ${userId}`, { error })
      throw error
    }
  }

  /**
   * Get customer details from Stripe
   */
  async getCustomer(customerId: string): Promise<CustomerDetails> {
    try {
      // Get customer from Stripe
      const customer = await stripe.customers.retrieve(customerId)

      if (customer.deleted) {
        throw new Error(`Customer ${customerId} has been deleted`)
      }

      // Map to customer details
      return {
        id: customer.id,
        email: customer.email || "",
        name: customer.name || "",
        phone: customer.phone || undefined,
        address: customer.address
          ? {
              line1: customer.address.line1 || "",
              line2: customer.address.line2 || undefined,
              city: customer.address.city || "",
              state: customer.address.state || undefined,
              postal_code: customer.address.postal_code || "",
              country: customer.address.country || "",
            }
          : undefined,
        metadata: customer.metadata || {},
      }
    } catch (error) {
      logger.error(`Error getting Stripe customer ${customerId}`, { error })
      throw error
    }
  }

  /**
   * Update customer details in Stripe
   */
  async updateCustomer(customerId: string, details: Partial<Omit<CustomerDetails, "id">>): Promise<CustomerDetails> {
    try {
      // Update customer in Stripe
      const customer = await stripe.customers.update(customerId, {
        email: details.email,
        name: details.name,
        phone: details.phone,
        address: details.address,
        metadata: details.metadata,
      })

      // Map to customer details
      return {
        id: customer.id,
        email: customer.email || "",
        name: customer.name || "",
        phone: customer.phone || undefined,
        address: customer.address
          ? {
              line1: customer.address.line1 || "",
              line2: customer.address.line2 || undefined,
              city: customer.address.city || "",
              state: customer.address.state || undefined,
              postal_code: customer.address.postal_code || "",
              country: customer.address.country || "",
            }
          : undefined,
        metadata: customer.metadata || {},
      }
    } catch (error) {
      logger.error(`Error updating Stripe customer ${customerId}`, { error })
      throw error
    }
  }

  /**
   * Create a checkout session for a subscription
   */
  async createCheckoutSession(
    userId: string,
    customerId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    try {
      logger.info(`Creating checkout session for user ${userId} and plan ${planId}`)

      // Get the subscription plan
      const plan = await this.getSubscriptionPlan(planId)

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planId,
        },
      })

      logger.info(`Successfully created checkout session for user ${userId} and plan ${planId}`)
      return session.url || ""
    } catch (error) {
      logger.error(`Error creating checkout session for user ${userId} and plan ${planId}`, { error })
      throw error
    }
  }

  /**
   * Create a customer portal session
   */
  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string> {
    try {
      // Create customer portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })

      return session.url
    } catch (error) {
      logger.error(`Error creating customer portal session for customer ${customerId}`, { error })
      throw error
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    try {
      // Get subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      // Get the plan details
      const { data: prices } = await this.supabase
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", subscription.items.data[0].price.id)
        .single()

      if (!prices) {
        throw new Error(`Subscription plan not found for price ${subscription.items.data[0].price.id}`)
      }

      // Map to subscription details
      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status as SubscriptionStatus,
        plan: {
          id: prices.id,
          name: prices.name,
          description: prices.description,
          tier: prices.tier as SubscriptionTier,
          price: prices.price,
          interval: prices.interval as "month" | "year",
          features: prices.features as SubscriptionFeatures,
          stripePriceId: prices.stripe_price_id,
        },
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at || undefined,
        trialStart: subscription.trial_start || undefined,
        trialEnd: subscription.trial_end || undefined,
      }
    } catch (error) {
      logger.error(`Error getting subscription ${subscriptionId}`, { error })
      throw error
    }
  }

  /**
   * Get all subscriptions for a customer
   */
  async getCustomerSubscriptions(customerId: string): Promise<SubscriptionDetails[]> {
    try {
      // Get subscriptions from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
      })

      // Get all plans
      const { data: plans } = await this.supabase.from("subscription_plans").select("*")

      if (!plans) {
        throw new Error("Failed to get subscription plans")
      }

      // Map to subscription details
      return Promise.all(
        subscriptions.data.map(async (subscription) => {
          const priceId = subscription.items.data[0].price.id
          const plan = plans.find((p) => p.stripe_price_id === priceId)

          if (!plan) {
            throw new Error(`Subscription plan not found for price ${priceId}`)
          }

          return {
            id: subscription.id,
            customerId: subscription.customer as string,
            status: subscription.status as SubscriptionStatus,
            plan: {
              id: plan.id,
              name: plan.name,
              description: plan.description,
              tier: plan.tier as SubscriptionTier,
              price: plan.price,
              interval: plan.interval as "month" | "year",
              features: plan.features as SubscriptionFeatures,
              stripePriceId: plan.stripe_price_id,
            },
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at || undefined,
            trialStart: subscription.trial_start || undefined,
            trialEnd: subscription.trial_end || undefined,
          }
        }),
      )
    } catch (error) {
      logger.error(`Error getting subscriptions for customer ${customerId}`, { error })
      throw error
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<SubscriptionDetails> {
    try {
      logger.info(`Canceling subscription ${subscriptionId}`)

      let subscription

      if (cancelAtPeriodEnd) {
        // Cancel at period end
        subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })
      } else {
        // Cancel immediately
        subscription = await stripe.subscriptions.cancel(subscriptionId)
      }

      // Get the plan details
      const { data: plan } = await this.supabase
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", subscription.items.data[0].price.id)
        .single()

      if (!plan) {
        throw new Error(`Subscription plan not found for price ${subscription.items.data[0].price.id}`)
      }

      logger.info(`Successfully canceled subscription ${subscriptionId}`)

      // Map to subscription details
      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status as SubscriptionStatus,
        plan: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          tier: plan.tier as SubscriptionTier,
          price: plan.price,
          interval: plan.interval as "month" | "year",
          features: plan.features as SubscriptionFeatures,
          stripePriceId: plan.stripe_price_id,
        },
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at || undefined,
        trialStart: subscription.trial_start || undefined,
        trialEnd: subscription.trial_end || undefined,
      }
    } catch (error) {
      logger.error(`Error canceling subscription ${subscriptionId}`, { error })
      throw error
    }
  }

  /**
   * Get invoices for a customer
   */
  async getCustomerInvoices(customerId: string): Promise<InvoiceDetails[]> {
    try {
      // Get invoices from Stripe
      const invoices = await stripe.invoices.list({
        customer: customerId,
      })

      // Map to invoice details
      return invoices.data.map((invoice) => ({
        id: invoice.id,
        customerId: invoice.customer as string,
        subscriptionId: invoice.subscription as string,
        amount: invoice.total,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status as "draft" | "open" | "paid" | "uncollectible" | "void",
        created: invoice.created,
        dueDate: invoice.due_date || undefined,
        pdfUrl: invoice.invoice_pdf || undefined,
        hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
      }))
    } catch (error) {
      logger.error(`Error getting invoices for customer ${customerId}`, { error })
      throw error
    }
  }

  /**
   * Get a specific invoice
   */
  async getInvoice(invoiceId: string): Promise<InvoiceDetails> {
    try {
      // Get invoice from Stripe
      const invoice = await stripe.invoices.retrieve(invoiceId)

      // Map to invoice details
      return {
        id: invoice.id,
        customerId: invoice.customer as string,
        subscriptionId: invoice.subscription as string,
        amount: invoice.total,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status as "draft" | "open" | "paid" | "uncollectible" | "void",
        created: invoice.created,
        dueDate: invoice.due_date || undefined,
        pdfUrl: invoice.invoice_pdf || undefined,
        hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
      }
    } catch (error) {
      logger.error(`Error getting invoice ${invoiceId}`, { error })
      throw error
    }
  }

  /**
   * Get payment methods for a customer
   */
  async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethodDetails[]> {
    try {
      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      })

      // Get the default payment method
      const customer = await stripe.customers.retrieve(customerId)
      const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method as string | undefined

      // Map to payment method details
      return paymentMethods.data.map((method) => ({
        id: method.id,
        type: method.type,
        card: method.card
          ? {
              brand: method.card.brand,
              last4: method.card.last4,
              expMonth: method.card.exp_month,
              expYear: method.card.exp_year,
            }
          : undefined,
        isDefault: method.id === defaultPaymentMethodId,
      }))
    } catch (error) {
      logger.error(`Error getting payment methods for customer ${customerId}`, { error })
      throw error
    }
  }

  /**
   * Set default payment method for a customer
   */
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      logger.info(`Setting default payment method ${paymentMethodId} for customer ${customerId}`)

      // Set default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })

      logger.info(`Successfully set default payment method ${paymentMethodId} for customer ${customerId}`)
      return true
    } catch (error) {
      logger.error(`Error setting default payment method ${paymentMethodId} for customer ${customerId}`, { error })
      throw error
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      logger.info(`Deleting payment method ${paymentMethodId}`)

      // Delete payment method
      await stripe.paymentMethods.detach(paymentMethodId)

      logger.info(`Successfully deleted payment method ${paymentMethodId}`)
      return true
    } catch (error) {
      logger.error(`Error deleting payment method ${paymentMethodId}`, { error })
      throw error
    }
  }

  /**
   * Handle webhook events from Stripe
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      logger.info(`Handling Stripe webhook event ${event.type}`)

      switch (event.type) {
        case "customer.subscription.created":
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break
        default:
          logger.info(`Unhandled Stripe webhook event ${event.type}`)
      }
    } catch (error) {
      logger.error(`Error handling Stripe webhook event ${event.type}`, { error })
      throw error
    }
  }

  /**
   * Handle subscription created event
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    try {
      logger.info(`Handling subscription created event for subscription ${subscription.id}`)

      // Get the customer
      const customer = await stripe.customers.retrieve(subscription.customer as string)

      if (customer.deleted) {
        throw new Error(`Customer ${subscription.customer} has been deleted`)
      }

      // Get the user ID from customer metadata
      const userId = customer.metadata.userId

      if (!userId) {
        throw new Error(`User ID not found in customer metadata for customer ${subscription.customer}`)
      }

      // Get the price ID
      const priceId = subscription.items.data[0].price.id

      // Get the subscription plan
      const { data: plan, error } = await this.supabase
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", priceId)
        .single()

      if (error || !plan) {
        throw new Error(`Subscription plan not found for price ${priceId}`)
      }

      // Update user subscription in database
      const { error: updateError } = await this.supabase.from("user_subscriptions").upsert({
        user_id: userId,
        subscription_id: subscription.id,
        plan_id: plan.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (updateError) {
        throw new Error(`Failed to update user subscription: ${updateError.message}`)
      }

      // Update user tier in database
      const { error: userUpdateError } = await this.supabase
        .from("users")
        .update({
          subscription_tier: plan.tier,
        })
        .eq("id", userId)

      if (userUpdateError) {
        throw new Error(`Failed to update user tier: ${userUpdateError.message}`)
      }

      logger.info(`Successfully handled subscription created event for subscription ${subscription.id}`)
    } catch (error) {
      logger.error(`Error handling subscription created event for subscription ${subscription.id}`, { error })
      throw error
    }
  }

  /**
   * Handle subscription updated event
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      logger.info(`Handling subscription updated event for subscription ${subscription.id}`)

      // Get the subscription from database
      const { data: existingSubscription, error } = await this.supabase
        .from("user_subscriptions")
        .select("user_id")
        .eq("subscription_id", subscription.id)
        .single()

      if (error || !existingSubscription) {
        throw new Error(`Subscription ${subscription.id} not found in database`)
      }

      // Get the price ID
      const priceId = subscription.items.data[0].price.id

      // Get the subscription plan
      const { data: plan, error: planError } = await this.supabase
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", priceId)
        .single()

      if (planError || !plan) {
        throw new Error(`Subscription plan not found for price ${priceId}`)
      }

      // Update user subscription in database
      const { error: updateError } = await this.supabase
        .from("user_subscriptions")
        .update({
          plan_id: plan.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("subscription_id", subscription.id)

      if (updateError) {
        throw new Error(`Failed to update user subscription: ${updateError.message}`)
      }

      // Update user tier in database
      const { error: userUpdateError } = await this.supabase
        .from("users")
        .update({
          subscription_tier: plan.tier,
        })
        .eq("id", existingSubscription.user_id)

      if (userUpdateError) {
        throw new Error(`Failed to update user tier: ${userUpdateError.message}`)
      }

      logger.info(`Successfully handled subscription updated event for subscription ${subscription.id}`)
    } catch (error) {
      logger.error(`Error handling subscription updated event for subscription ${subscription.id}`, { error })
      throw error
    }
  }

  /**
   * Handle subscription deleted event
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      logger.info(`Handling subscription deleted event for subscription ${subscription.id}`)

      // Get the subscription from database
      const { data: existingSubscription, error } = await this.supabase
        .from("user_subscriptions")
        .select("user_id")
        .eq("subscription_id", subscription.id)
        .single()

      if (error || !existingSubscription) {
        throw new Error(`Subscription ${subscription.id} not found in database`)
      }

      // Update user subscription in database
      const { error: updateError } = await this.supabase
        .from("user_subscriptions")
        .update({
          status: "canceled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("subscription_id", subscription.id)

      if (updateError) {
        throw new Error(`Failed to update user subscription: ${updateError.message}`)
      }

      // Update user tier in database
      const { error: userUpdateError } = await this.supabase
        .from("users")
        .update({
          subscription_tier: "free",
        })
        .eq("id", existingSubscription.user_id)

      if (userUpdateError) {
        throw new Error(`Failed to update user tier: ${userUpdateError.message}`)
      }

      logger.info(`Successfully handled subscription deleted event for subscription ${subscription.id}`)
    } catch (error) {
      logger.error(`Error handling subscription deleted event for subscription ${subscription.id}`, { error })
      throw error
    }
  }

  /**
   * Handle invoice payment succeeded event
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      logger.info(`Handling invoice payment succeeded event for invoice ${invoice.id}`)

      // Store invoice in database
      const { error } = await this.supabase.from("invoices").upsert({
        invoice_id: invoice.id,
        customer_id: invoice.customer as string,
        subscription_id: invoice.subscription as string,
        amount: invoice.total,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created_at: new Date(invoice.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw new Error(`Failed to store invoice: ${error.message}`)
      }

      logger.info(`Successfully handled invoice payment succeeded event for invoice ${invoice.id}`)
    } catch (error) {
      logger.error(`Error handling invoice payment succeeded event for invoice ${invoice.id}`, { error })
      throw error
    }
  }

  /**
   * Handle invoice payment failed event
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      logger.info(`Handling invoice payment failed event for invoice ${invoice.id}`)

      // Store invoice in database
      const { error } = await this.supabase.from("invoices").upsert({
        invoice_id: invoice.id,
        customer_id: invoice.customer as string,
        subscription_id: invoice.subscription as string,
        amount: invoice.total,
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        created_at: new Date(invoice.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw new Error(`Failed to store invoice: ${error.message}`)
      }

      // Get the customer
      const customer = await stripe.customers.retrieve(invoice.customer as string)

      if (customer.deleted) {
        throw new Error(`Customer ${invoice.customer} has been deleted`)
      }

      // Get the user ID from customer metadata
      const userId = customer.metadata.userId

      if (!userId) {
        throw new Error(`User ID not found in customer metadata for customer ${invoice.customer}`)
      }

      // Send notification to user
      // This would typically be implemented with a notification service
      logger.info(`Sending payment failed notification to user ${userId}`)

      logger.info(`Successfully handled invoice payment failed event for invoice ${invoice.id}`)
    } catch (error) {
      logger.error(`Error handling invoice payment failed event for invoice ${invoice.id}`, { error })
      throw error
    }
  }
}

