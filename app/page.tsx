import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Zap, Activity, ArrowRight, Trophy, Clock, Sparkles, CheckCircle, Users, FileText } from "lucide-react"
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel"
import { ScientificBackingSection } from "@/components/marketing/scientific-backing"
import { FeatureComparison } from "@/components/marketing/feature-comparison"
import { CognitiveDomainsSection } from "@/components/marketing/cognitive-domains"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-background/80 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-muted/50 text-sm font-medium mb-2">
                <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
                <span>Clinically validated cognitive assessment & training</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                Enhance your <span className="text-primary">cognitive health</span> with precision
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl">
                Personalized brain training based on neuroscience research, designed by cognitive health experts to
                improve memory, attention, and processing speed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="group">
                  Take Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline">
                  Explore Training Games
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <Image
                        src={`/placeholder.svg?height=32&width=32&text=${i}`}
                        alt="User avatar"
                        width={32}
                        height={32}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">250,000+</span> users improving their cognitive health
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm">Clinically validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm">Personalized training</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-sm">Progress tracking</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-md" />
                <div className="absolute inset-2 bg-background rounded-xl overflow-hidden border border-border">
                  <Image
                    src="/placeholder.svg?height=500&width=500&text=Brain+Training+Visualization"
                    alt="Interactive brain training visualization"
                    width={500}
                    height={500}
                    className="object-cover"
                  />
                </div>

                {/* Floating stats cards */}
                <div className="absolute -top-4 -left-4 bg-background rounded-lg p-3 shadow-lg border border-border">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cognitive Score</p>
                      <p className="font-medium">850 pts</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-background rounded-lg p-3 shadow-lg border border-border">
                  <div className="flex items-center gap-2">
                    <div className="bg-secondary/10 p-2 rounded-full">
                      <Clock className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Processing Speed</p>
                      <p className="font-medium">245 ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cognitive Domains Section */}
      <CognitiveDomainsSection />

      {/* Assessment Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <Image
                src="/placeholder.svg?height=500&width=600&text=Cognitive+Assessment+Visualization"
                alt="Comprehensive cognitive assessment visualization"
                width={600}
                height={500}
                className="rounded-xl border border-border shadow-lg"
              />
            </div>
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-muted/50 text-sm font-medium mb-2">
                <FileText className="h-3.5 w-3.5 mr-2 text-primary" />
                <span>Comprehensive Assessment</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight">Start with a scientific cognitive assessment</h2>

              <p className="text-lg text-muted-foreground">
                Our comprehensive assessment evaluates 6 key cognitive domains through engaging tasks designed by
                neuroscientists and clinical psychologists.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Scientifically Validated</h3>
                    <p className="text-muted-foreground">
                      Based on established neuropsychological tests used in clinical settings
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Personalized Insights</h3>
                    <p className="text-muted-foreground">
                      Receive detailed analysis of your cognitive strengths and areas for improvement
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-0.5">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Tailored Training Plan</h3>
                    <p className="text-muted-foreground">
                      Get a customized training program based on your assessment results
                    </p>
                  </div>
                </div>
              </div>

              <Button size="lg" className="group">
                Take Free Assessment
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Scientifically Designed Training Games</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each game targets specific cognitive domains with adaptive difficulty to provide optimal challenge for
              your brain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <GameCard
              title="Divided Attention"
              description="Improve your ability to monitor and respond to multiple stimuli simultaneously."
              icon={<Brain className="h-8 w-8" />}
              href="/games/divided-attention"
              color="from-purple-500 to-indigo-500"
              metrics={[
                { label: "Focus", value: "85%" },
                { label: "Multitasking", value: "92%" },
              ]}
              domain="Attention"
            />

            <GameCard
              title="Reaction Time"
              description="Enhance your processing speed and response time with various reaction challenges."
              icon={<Zap className="h-8 w-8" />}
              href="/games/reaction-time"
              color="from-orange-500 to-red-500"
              metrics={[
                { label: "Speed", value: "245ms" },
                { label: "Accuracy", value: "97%" },
              ]}
              domain="Processing Speed"
            />

            <GameCard
              title="Working Memory"
              description="Train your ability to temporarily hold and manipulate information."
              icon={<Activity className="h-8 w-8" />}
              href="/games/working-memory"
              color="from-green-500 to-emerald-500"
              metrics={[
                { label: "Capacity", value: "7 items" },
                { label: "Recall", value: "94%" },
              ]}
              domain="Memory"
            />
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg">
              View All Training Games
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Scientific Backing Section */}
      <ScientificBackingSection />

      {/* Testimonials Section */}
      <TestimonialCarousel testimonials={testimonials} />

      {/* Feature Comparison */}
      <FeatureComparison />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-4">Ready to enhance your cognitive abilities?</h2>
                <p className="mb-6">
                  Start with a free cognitive assessment and get a personalized training plan based on your results.
                </p>
                <Button size="lg" variant="secondary" className="group">
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              <div className="relative w-full max-w-xs aspect-square">
                <Image
                  src="/placeholder.svg?height=300&width=300&text=Brain+Visualization"
                  alt="Brain visualization"
                  width={300}
                  height={300}
                  className="object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function GameCard({ title, description, icon, href, color, metrics, domain }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
      <div className={`p-6 bg-gradient-to-br ${color} bg-opacity-10 relative overflow-hidden`}>
        <div
          className="absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            backgroundImage: `linear-gradient(to bottom right, var(--${color.split(" ")[0].substring(5)}), var(--${color.split(" ")[1].substring(3)}))`,
          }}
        />
        <div className="flex justify-between items-start">
          <div className="bg-background rounded-full p-4 shadow-sm">{icon}</div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background border border-border">
            {domain}
          </span>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-2 px-2">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="font-medium">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button className="w-full group-hover:bg-primary/90 transition-colors duration-300">
            Start Training
            <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

const testimonials = [
  {
    quote:
      "As a neuropsychologist, I'm impressed by the scientific validity of MemoRight's assessments. I've recommended it to many of my patients for continued cognitive training.",
    author: "Dr. Sarah Johnson, Ph.D.",
    role: "Clinical Neuropsychologist",
    rating: 5,
    image: "/placeholder.svg?height=80&width=80&text=SJ",
  },
  {
    quote:
      "After my mild concussion, my doctor recommended MemoRight to help with my cognitive recovery. The personalized training has made a noticeable difference in my attention and memory.",
    author: "Michael Chen",
    role: "Recovery Patient",
    rating: 5,
    image: "/placeholder.svg?height=80&width=80&text=MC",
  },
  {
    quote:
      "As a senior concerned about cognitive decline, I've been using MemoRight for 6 months. My processing speed and memory scores have improved significantly.",
    author: "Robert Williams",
    role: "Retired Teacher, 68",
    rating: 5,
    image: "/placeholder.svg?height=80&width=80&text=RW",
  },
  {
    quote:
      "We've implemented MemoRight in our senior living community as part of our cognitive health program. Our residents enjoy the games and we've seen measurable improvements.",
    author: "Jennifer Lopez",
    role: "Director of Wellness, Golden Years Living",
    rating: 4,
    image: "/placeholder.svg?height=80&width=80&text=JL",
  },
]

