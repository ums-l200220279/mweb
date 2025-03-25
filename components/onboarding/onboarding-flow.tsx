"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFeedback } from "@/hooks/use-feedback"
import { useRouter } from "next/navigation"

interface OnboardingStep {
  title: string
  description: string
  content: React.ReactNode
}

interface OnboardingFlowProps {
  userRole: "PATIENT" | "DOCTOR" | "CAREGIVER" | "RESEARCHER"
  onComplete: () => void
}

/**
 * Komponen alur onboarding yang komprehensif
 */
export function OnboardingFlow({ userRole, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const feedback = useFeedback()
  const router = useRouter()

  // Cek apakah pengguna sudah pernah melihat onboarding
  useEffect(() => {
    const onboardingSeen = localStorage.getItem(`onboarding-${userRole}`)
    if (onboardingSeen) {
      setHasSeenOnboarding(true)
    }
  }, [userRole])

  // Jika sudah pernah melihat, langsung selesaikan
  useEffect(() => {
    if (hasSeenOnboarding) {
      onComplete()
    }
  }, [hasSeenOnboarding, onComplete])

  // Langkah-langkah onboarding berdasarkan peran
  const steps: OnboardingStep[] = getOnboardingSteps(userRole)

  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Simpan ke localStorage bahwa onboarding sudah dilihat
    localStorage.setItem(`onboarding-${userRole}`, "true")

    // Tampilkan pesan sukses
    feedback.success("You're all set! Welcome to Memoright.")

    // Panggil callback onComplete
    onComplete()
  }

  const handleSkip = () => {
    // Simpan ke localStorage bahwa onboarding sudah dilihat
    localStorage.setItem(`onboarding-${userRole}`, "true")

    // Tampilkan pesan info
    feedback.info("You can always access the help section if you need assistance.")

    // Panggil callback onComplete
    onComplete()
  }

  // Jika sudah pernah melihat, tidak perlu render
  if (hasSeenOnboarding) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent>
          <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>

          <div className="min-h-[300px]">{steps[currentStep].content}</div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tutorial
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
              Previous
            </Button>

            <Button onClick={handleNext}>{currentStep < totalSteps - 1 ? "Next" : "Get Started"}</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

/**
 * Mendapatkan langkah-langkah onboarding berdasarkan peran
 */
function getOnboardingSteps(role: string): OnboardingStep[] {
  switch (role) {
    case "PATIENT":
      return [
        {
          title: "Welcome to Memoright",
          description: "Your personal cognitive health companion",
          content: (
            <div className="space-y-4">
              <p>
                Memoright helps you track and improve your cognitive health through regular assessments and engaging
                exercises.
              </p>
              <img
                src="/placeholder.svg?height=200&width=400"
                alt="Memoright Dashboard Preview"
                className="rounded-lg mx-auto"
              />
            </div>
          ),
        },
        {
          title: "Your Dashboard",
          description: "Everything you need at a glance",
          content: (
            <div className="space-y-4">
              <p>
                Your personalized dashboard shows your cognitive health trends, upcoming assessments, and recommended
                activities.
              </p>
              <img src="/placeholder.svg?height=200&width=400" alt="Patient Dashboard" className="rounded-lg mx-auto" />
            </div>
          ),
        },
        {
          title: "Cognitive Assessments",
          description: "Regular check-ins for your brain health",
          content: (
            <div className="space-y-4">
              <p>Complete short assessments to track different aspects of your cognitive function over time.</p>
              <img
                src="/placeholder.svg?height=200&width=400"
                alt="Assessment Example"
                className="rounded-lg mx-auto"
              />
            </div>
          ),
        },
        {
          title: "Brain Games",
          description: "Fun exercises to keep your mind sharp",
          content: (
            <div className="space-y-4">
              <p>
                Engage with interactive games designed to exercise different cognitive domains like memory, attention,
                and problem-solving.
              </p>
              <img src="/placeholder.svg?height=200&width=400" alt="Brain Games" className="rounded-lg mx-auto" />
            </div>
          ),
        },
        {
          title: "Sharing with Caregivers",
          description: "Keep your support network informed",
          content: (
            <div className="space-y-4">
              <p>
                Easily share your progress with family members, caregivers, or healthcare providers to ensure
                coordinated care.
              </p>
              <img src="/placeholder.svg?height=200&width=400" alt="Sharing Interface" className="rounded-lg mx-auto" />
            </div>
          ),
        },
      ]

    case "DOCTOR":
      return [
        {
          title: "Welcome to Memoright",
          description: "Advanced cognitive health monitoring for healthcare professionals",
          content: (
            <div className="space-y-4">
              <p>
                Memoright provides you with powerful tools to monitor and assess your patients' cognitive health with
                clinical precision.
              </p>
              <img
                src="/placeholder.svg?height=200&width=400"
                alt="Doctor Dashboard Preview"
                className="rounded-lg mx-auto"
              />
            </div>
          ),
        },
        {
          title: "Patient Management",
          description: "Efficiently manage your patient roster",
          content: (
            <div className="space-y-4">
              <p>View all your patients, their assessment history, and cognitive trends in one centralized location.</p>
              <img
                src="/placeholder.svg?height=200&width=400"
                alt="Patient Management"
                className="rounded-lg mx-auto"
              />
            </div>
          ),
        },
        {
          title: "Assessment Tools",
          description: "Standardized cognitive assessments",
          content: (
            <div className="space-y-4">
              <p>
                Administer standardized assessments like MMSE, MOCA, and SLUMS, or create custom assessments tailored to
                your patients' needs.
              </p>
              <img src="/placeholder.svg?height=200&width=400" alt="Assessment Tools" className="rounded-lg mx-auto" />
            </div>
          ),
        },
        {
          title: "Clinical Insights",
          description: "Data-driven cognitive health analysis",
          content: (
            <div className="space-y-4">
              <p>
                Access detailed analytics and longitudinal data to identify trends and make informed clinical decisions.
              </p>
              <img src="/placeholder.svg?height=200&width=400" alt="Clinical Insights" className="rounded-lg mx-auto" />
            </div>
          ),
        },
        {
          title: "Collaborative Care",
          description: "Coordinate with caregivers and other providers",
          content: (
            <div className="space-y-4">
              <p>Share assessments, recommendations, and care plans with other members of your patient's care team.</p>
              <img
                src="/placeholder.svg?height=200&width=400"
                alt="Collaborative Care"
                className="rounded-lg mx-auto"
              />
            </div>
          ),
        },
      ]

    // Tambahkan langkah-langkah untuk peran lain
    default:
      return [
        {
          title: "Welcome to Memoright",
          description: "Your cognitive health platform",
          content: (
            <div className="space-y-4">
              <p>
                Memoright helps you monitor and improve cognitive health through assessments, exercises, and analytics.
              </p>
              <img
                src="/placeholder.svg?height=200&width=400"
                alt="Memoright Overview"
                className="rounded-lg mx-auto"
              />
            </div>
          ),
        },
        {
          title: "Getting Started",
          description: "First steps with Memoright",
          content: (
            <div className="space-y-4">
              <p>Complete your profile, explore the dashboard, and discover the key features of the platform.</p>
              <img src="/placeholder.svg?height=200&width=400" alt="Getting Started" className="rounded-lg mx-auto" />
            </div>
          ),
        },
        {
          title: "Need Help?",
          description: "Support resources",
          content: (
            <div className="space-y-4">
              <p>Access tutorials, FAQs, and contact support if you need assistance using Memoright.</p>
              <img src="/placeholder.svg?height=200&width=400" alt="Help Resources" className="rounded-lg mx-auto" />
            </div>
          ),
        },
      ]
  }
}

