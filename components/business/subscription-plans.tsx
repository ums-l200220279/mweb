"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionTier, getMonetizationService } from "@/lib/business/monetization-service"

export function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const monetizationService = getMonetizationService()
  const plans = monetizationService.getSubscriptionPlans()

  const handleSubscribe = (tier: SubscriptionTier) => {
    // In a real implementation, this would redirect to a checkout page
    console.log(`Subscribing to ${tier} plan with ${billingCycle} billing`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">Select the plan that best fits your needs</p>
      </div>

      <Tabs defaultValue="monthly" className="w-full max-w-5xl mx-auto">
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="monthly" onClick={() => setBillingCycle("monthly")}>
              Monthly
            </TabsTrigger>
            <TabsTrigger value="annual" onClick={() => setBillingCycle("annual")}>
              Annual{" "}
              <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5 dark:bg-green-900 dark:text-green-100">
                Save up to 25%
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const pricing = monetizationService.calculateSubscriptionPrice(plan.tier, "monthly")

              return (
                <Card
                  key={plan.id}
                  className={plan.tier === SubscriptionTier.ENTERPRISE ? "border-primary shadow-md" : ""}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.tier === SubscriptionTier.FREE
                        ? "Basic cognitive monitoring"
                        : plan.tier === SubscriptionTier.PROFESSIONAL
                          ? "For healthcare professionals"
                          : plan.tier === SubscriptionTier.ENTERPRISE
                            ? "For healthcare organizations"
                            : "For academic institutions"}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">${pricing.finalPrice.toFixed(2)}</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="h-80 overflow-y-auto">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Up to {plan.features.maxPatients} patients</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{plan.features.maxHistoricalData} months of historical data</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.advancedAnalytics ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.aiPredictions ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>AI-powered predictions</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.anomalyDetection ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Anomaly detection</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.dataExport ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Data export</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.apiAccess ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>API access</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.customReports ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Custom reports</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.multiUserAccess ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Multi-user access</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.dedicatedSupport ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Dedicated support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.tier === SubscriptionTier.ENTERPRISE ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.tier)}
                    >
                      {plan.tier === SubscriptionTier.FREE ? "Get Started" : "Subscribe"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="annual" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const pricing = monetizationService.calculateSubscriptionPrice(plan.tier, "annual")

              const monthlyEquivalent = (pricing.finalPrice / 12).toFixed(2)

              return (
                <Card
                  key={plan.id}
                  className={plan.tier === SubscriptionTier.ENTERPRISE ? "border-primary shadow-md" : ""}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.tier === SubscriptionTier.FREE
                        ? "Basic cognitive monitoring"
                        : plan.tier === SubscriptionTier.PROFESSIONAL
                          ? "For healthcare professionals"
                          : plan.tier === SubscriptionTier.ENTERPRISE
                            ? "For healthcare organizations"
                            : "For academic institutions"}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">${monthlyEquivalent}</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                      {plan.tier !== SubscriptionTier.FREE && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Billed annually (${pricing.finalPrice.toFixed(2)})
                          {plan.annualDiscount > 0 && (
                            <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5 dark:bg-green-900 dark:text-green-100">
                              Save {plan.annualDiscount}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="h-80 overflow-y-auto">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Up to {plan.features.maxPatients} patients</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{plan.features.maxHistoricalData} months of historical data</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.advancedAnalytics ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.aiPredictions ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>AI-powered predictions</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.anomalyDetection ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Anomaly detection</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.dataExport ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Data export</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.apiAccess ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>API access</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.customReports ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Custom reports</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.multiUserAccess ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Multi-user access</span>
                      </li>
                      <li className="flex items-start">
                        {plan.features.dedicatedSupport ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                        )}
                        <span>Dedicated support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.tier === SubscriptionTier.ENTERPRISE ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.tier)}
                    >
                      {plan.tier === SubscriptionTier.FREE ? "Get Started" : "Subscribe"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-2">Need a custom plan?</h3>
        <p className="text-muted-foreground mb-4">
          Contact our sales team for a tailored solution that meets your specific requirements
        </p>
        <Button variant="outline">Contact Sales</Button>
      </div>
    </div>
  )
}

