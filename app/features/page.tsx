import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Gamepad2, Bell, Users, LineChartIcon as ChartLine, Shield } from "lucide-react"

const features = [
  {
    title: "AI-Powered Cognitive Assessment",
    description: "Advanced algorithms analyze your cognitive function through interactive tests and daily activities.",
    icon: Brain,
    image:
      "https://images.unsplash.com/photo-1633613286991-611fe299c4be?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
  {
    title: "Personalized Brain Training",
    description: "Tailored exercises and games designed to improve your specific cognitive abilities.",
    icon: Gamepad2,
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=2025&ixlib=rb-4.0.3",
  },
  {
    title: "Real-time Monitoring",
    description: "Continuous tracking of your cognitive health with instant alerts for any significant changes.",
    icon: Bell,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
  {
    title: "Caregiver and Doctor Collaboration",
    description: "Seamless communication platform for patients, caregivers, and healthcare professionals.",
    icon: Users,
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
  {
    title: "Progress Tracking",
    description: "Detailed reports and visualizations of your cognitive health journey over time.",
    icon: ChartLine,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
  {
    title: "Data Security and Privacy",
    description: "State-of-the-art encryption and privacy measures to keep your health data safe and secure.",
    icon: Shield,
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3",
  },
]

export default function FeaturesPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Our Features</h1>
      <p className="text-xl text-center text-muted-foreground mb-12">
        Discover how Memoright is revolutionizing cognitive health care
      </p>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="overflow-hidden">
            <Image
              src={feature.image || "/placeholder.svg"}
              alt={feature.title}
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <feature.icon className="h-6 w-6 text-primary" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

