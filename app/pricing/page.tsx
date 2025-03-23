"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { CheckCircle } from "lucide-react"

const pricingPlans = [
  {
    name: "Basic",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    description: "Essential features for individuals",
    features: ["Daily cognitive exercises", "Basic progress tracking", "Monthly cognitive assessment", "Email support"],
  },
  {
    name: "Pro",
    monthlyPrice: 19.99,
    yearlyPrice: 199.99,
    description: "Advanced features for serious brain training",
    features: [
      "All Basic features",
      "Advanced progress analytics",
      "Weekly cognitive assessment",
      "Personalized training plan",
      "Priority email & chat support",
    ],
  },
  {
    name: "Family",
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    description: "Comprehensive care for up to 5 family members",
    features: [
      "All Pro features",
      "Up to 5 user profiles",
      "Family progress dashboard",
      "Caregiver access",
      "24/7 priority support",
      "Quarterly consultation with cognitive specialist",
    ],
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold text-center mb-4 text-turquoise-900">Pricing Plans</h1>
        <p className="text-xl text-center text-turquoise-700 mb-8">
          Choose the perfect plan for your cognitive health journey
        </p>
      </motion.div>

      <motion.div
        className="flex justify-center items-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className={`mr-2 ${isYearly ? "text-turquoise-700" : "text-turquoise-900 font-semibold"}`}>Monthly</span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="bg-turquoise-200 data-[state=checked]:bg-turquoise-500"
        />
        <span className={`ml-2 ${isYearly ? "text-turquoise-900 font-semibold" : "text-turquoise-700"}`}>Yearly</span>
        {isYearly && <span className="ml-2 text-sm text-turquoise-500 font-medium">Save up to 20%</span>}
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-turquoise-900">{plan.name}</CardTitle>
                <CardDescription className="text-turquoise-700">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-4xl font-bold text-turquoise-900 mb-4">
                  ${isYearly ? plan.yearlyPrice.toFixed(2) : plan.monthlyPrice.toFixed(2)}
                  <span className="text-lg font-normal text-turquoise-700">/{isYearly ? "year" : "month"}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-turquoise-700">
                      <CheckCircle className="h-5 w-5 text-turquoise-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-turquoise-500 text-white hover:bg-turquoise-600">Get Started</Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

