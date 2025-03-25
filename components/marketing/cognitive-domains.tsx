import { Brain, Zap, Activity, Eye, Puzzle, Lightbulb } from "lucide-react"

export function CognitiveDomainsSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Cognitive Training</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            MemoRight targets six key cognitive domains with scientifically designed exercises to provide a complete
            brain training experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {domains.map((domain, index) => (
            <DomainCard
              key={index}
              title={domain.title}
              description={domain.description}
              icon={domain.icon}
              benefits={domain.benefits}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function DomainCard({ title, description, icon, benefits }) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
        <div>
          <h3 className="text-xl font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>

          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const domains = [
  {
    title: "Attention",
    description: "Improve focus and ability to concentrate on specific stimuli while filtering distractions.",
    icon: <Brain className="h-6 w-6 text-primary" />,
    benefits: ["Sustained attention", "Divided attention", "Selective attention"],
  },
  {
    title: "Processing Speed",
    description: "Enhance the speed at which your brain processes information and responds.",
    icon: <Zap className="h-6 w-6 text-primary" />,
    benefits: ["Reaction time", "Information processing", "Decision speed"],
  },
  {
    title: "Memory",
    description: "Strengthen your ability to encode, store, and recall information effectively.",
    icon: <Activity className="h-6 w-6 text-primary" />,
    benefits: ["Working memory", "Short-term memory", "Visual memory"],
  },
  {
    title: "Visual-Spatial Skills",
    description: "Develop your capacity to understand visual representations and spatial relationships.",
    icon: <Eye className="h-6 w-6 text-primary" />,
    benefits: ["Pattern recognition", "Mental rotation", "Spatial navigation"],
  },
  {
    title: "Problem Solving",
    description: "Enhance your ability to analyze situations and develop effective solutions.",
    icon: <Puzzle className="h-6 w-6 text-primary" />,
    benefits: ["Logical reasoning", "Critical thinking", "Strategic planning"],
  },
  {
    title: "Cognitive Flexibility",
    description: "Improve your ability to adapt thinking and shift between different concepts.",
    icon: <Lightbulb className="h-6 w-6 text-primary" />,
    benefits: ["Task switching", "Adaptive thinking", "Mental agility"],
  },
]

