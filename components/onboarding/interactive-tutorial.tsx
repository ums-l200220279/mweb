"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"

type TutorialStep = {
  id: string
  title: string
  description: string
  image?: string
  action?: {
    label: string
    onClick: () => void
  }
  isInteractive?: boolean
  component?: React.ReactNode
}

interface InteractiveTutorialProps {
  userId: string
  onComplete: () => void
  initialStep?: number
  className?: string
}

export function InteractiveTutorial({ userId, onComplete, initialStep = 0, className }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [completed, setCompleted] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Define tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      id: "welcome",
      title: "Welcome to Memoright",
      description: "Your personal brain training platform. Let's take a quick tour to help you get started.",
      image: "/placeholder.svg?height=200&width=400",
      action: {
        label: "Get Started",
        onClick: () => {
          trackEvent("onboarding_started", { userId })
        },
      },
    },
    {
      id: "brain-games",
      title: "Brain Training Games",
      description:
        "Explore our collection of scientifically designed games that help improve your cognitive abilities.",
      image: "/placeholder.svg?height=200&width=400",
      component: (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {["Memory Match", "Pattern Recognition", "Word Recall", "Spatial Reasoning"].map((game) => (
            <Card key={game} className="p-3 cursor-pointer hover:bg-accent transition-colors">
              <CardTitle className="text-sm">{game}</CardTitle>
              <CardDescription className="text-xs">Train your brain</CardDescription>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: "progress-tracking",
      title: "Track Your Progress",
      description: "Monitor your cognitive improvement over time with detailed analytics and insights.",
      image: "/placeholder.svg?height=200&width=400",
      component: (
        <div className="mt-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Memory</span>
                <span>78/100</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Attention</span>
                <span>65/100</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Problem Solving</span>
                <span>82/100</span>
              </div>
              <Progress value={82} className="h-2" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "leaderboard",
      title: "Compete on Leaderboards",
      description:
        "Challenge yourself and compete with others to stay motivated on your cognitive improvement journey.",
      image: "/placeholder.svg?height=200&width=400",
      component: (
        <div className="mt-4 space-y-2">
          {[
            { name: "Alex J.", score: 9850 },
            { name: "You", score: 9320, isUser: true },
            { name: "Morgan T.", score: 9150 },
            { name: "Jamie L.", score: 8920 },
          ].map((user, index) => (
            <div
              key={user.name}
              className={cn(
                "flex items-center justify-between p-2 rounded-md",
                user.isUser ? "bg-primary/10" : "bg-card",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{index + 1}.</span>
                <span className={user.isUser ? "font-bold" : ""}>{user.name}</span>
              </div>
              <span className="font-mono">{user.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "wearable",
      title: "Connect Your Wearable",
      description: "Integrate with your fitness tracker to correlate physical activity with cognitive performance.",
      image: "/placeholder.svg?height=200&width=400",
      isInteractive: true,
      component: (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            { name: "Fitbit", icon: "⌚" },
            { name: "Apple Health", icon: "🍎" },
            { name: "Google Fit", icon: "🏃" },
            { name: "Samsung Health", icon: "📱" },
          ].map((device) => (
            <Button
              key={device.name}
              variant="outline"
              className="flex flex-col h-20 gap-1"
              onClick={() => {
                toast({
                  title: "Wearable Connected",
                  description: `${device.name} has been successfully connected.`,
                })
                setCompleted([...completed, "wearable"])
                trackEvent("wearable_connected", { userId, device: device.name })
              }}
            >
              <span className="text-xl">{device.icon}</span>
              <span className="text-xs">{device.name}</span>
            </Button>
          ))}
        </div>
      ),
    },
    {
      id: "personalization",
      title: "Personalize Your Experience",
      description: "Set your goals and preferences to get a tailored brain training experience.",
      image: "/placeholder.svg?height=200&width=400",
      isInteractive: true,
      component: (
        <div className="mt-4 space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Training Focus</h4>
            <div className="grid grid-cols-2 gap-2">
              {["Memory", "Focus", "Problem Solving", "Speed"].map((focus) => (
                <Button
                  key={focus}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Preference Saved",
                      description: `Your focus on ${focus} has been saved.`,
                    })
                    setCompleted([...completed, "personalization"])
                    trackEvent("preference_set", { userId, focus })
                  }}
                >
                  {focus}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Training Schedule</h4>
            <div className="grid grid-cols-3 gap-2">
              {["Daily", "Every Other Day", "Weekends"].map((schedule) => (
                <Button
                  key={schedule}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Schedule Set",
                      description: `Your ${schedule} schedule has been set.`,
                    })
                    setCompleted([...completed, "personalization"])
                    trackEvent("schedule_set", { userId, schedule })
                  }}
                >
                  {schedule}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "You've completed the onboarding process. Start your brain training journey now!",
      image: "/placeholder.svg?height=200&width=400",
      action: {
        label: "Start Training",
        onClick: () => {
          trackEvent("onboarding_completed", { userId })
          onComplete()
          router.push("/brain-training/games")
        },
      },
    },
  ]

  // Calculate progress
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  // Handle next step
  const handleNext = () => {
    if (isAnimating) return

    const currentStepData = tutorialSteps[currentStep]

    // Check if current step is interactive and not completed
    if (currentStepData.isInteractive && !completed.includes(currentStepData.id)) {
      toast({
        title: "Action Required",
        description: "Please complete the action before proceeding.",
        variant: "destructive",
      })
      return
    }

    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsAnimating(false)
      }, 300)
    } else {
      onComplete()
      trackEvent("onboarding_completed", { userId })
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (isAnimating || currentStep === 0) return

    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStep(currentStep - 1)
      setIsAnimating(false)
    }, 300)
  }

  // Handle skip
  const handleSkip = () => {
    toast({
      title: "Onboarding Skipped",
      description: "You can always access the tutorial from the help menu.",
    })
    trackEvent("onboarding_skipped", { userId, step: currentStep })
    onComplete()
  }

  // Save progress to server
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await fetch("/api/onboarding/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            step: currentStep,
            completed,
          }),
        })
      } catch (error) {
        console.error("Failed to save onboarding progress:", error)
      }
    }

    saveProgress()
  }, [currentStep, completed, userId])

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{tutorialSteps[currentStep].title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip
          </Button>
        </div>
        <Progress value={progress} className="h-1" />
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CardDescription className="text-base mb-4">{tutorialSteps[currentStep].description}</CardDescription>

            {tutorialSteps[currentStep].image && (
              <div className="flex justify-center mb-4">
                <img
                  src={tutorialSteps[currentStep].image || "/placeholder.svg"}
                  alt={tutorialSteps[currentStep].title}
                  className="rounded-lg"
                />
              </div>
            )}

            {tutorialSteps[currentStep].component}

            {tutorialSteps[currentStep].action && (
              <Button
                className="w-full mt-4"
                onClick={() => {
                  tutorialSteps[currentStep].action?.onClick()
                  setCompleted([...completed, tutorialSteps[currentStep].id])
                }}
              >
                {tutorialSteps[currentStep].action.label}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {tutorialSteps.map((_, index) => (
            <span
              key={index}
              className={cn("w-2 h-2 rounded-full", currentStep === index ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>

        <Button onClick={handleNext}>
          {currentStep < tutorialSteps.length - 1 ? (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Complete
              <Check className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

