import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeatureComparison() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How MemoRight Compares</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how our scientifically validated approach to cognitive training stands out from other solutions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left bg-muted/50 rounded-tl-lg">Features</th>
                <th className="p-4 text-center bg-primary/10 border-b-2 border-primary">
                  <div className="font-bold text-xl">MemoRight</div>
                  <div className="text-sm text-muted-foreground">Clinical-grade cognitive training</div>
                </th>
                <th className="p-4 text-center bg-muted/30">
                  <div className="font-medium text-lg">Other Brain Games</div>
                  <div className="text-sm text-muted-foreground">Entertainment-focused</div>
                </th>
                <th className="p-4 text-center bg-muted/30 rounded-tr-lg">
                  <div className="font-medium text-lg">Traditional Methods</div>
                  <div className="text-sm text-muted-foreground">Paper-based exercises</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="p-4 font-medium">{feature.name}</td>
                  <td className="p-4 text-center bg-primary/5">
                    {feature.memoRight ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {feature.otherGames ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {feature.traditional ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" className="group">
            Try MemoRight Free
          </Button>
          <p className="text-sm text-muted-foreground mt-2">No credit card required</p>
        </div>
      </div>
    </section>
  )
}

const features = [
  {
    name: "Clinically Validated Assessments",
    memoRight: true,
    otherGames: false,
    traditional: true,
  },
  {
    name: "Personalized Training Algorithm",
    memoRight: true,
    otherGames: false,
    traditional: false,
  },
  {
    name: "Comprehensive Cognitive Reports",
    memoRight: true,
    otherGames: false,
    traditional: false,
  },
  {
    name: "Adaptive Difficulty Levels",
    memoRight: true,
    otherGames: true,
    traditional: false,
  },
  {
    name: "Progress Tracking & Analytics",
    memoRight: true,
    otherGames: true,
    traditional: false,
  },
  {
    name: "Developed by Neuroscientists",
    memoRight: true,
    otherGames: false,
    traditional: false,
  },
  {
    name: "Engaging Game Experience",
    memoRight: true,
    otherGames: true,
    traditional: false,
  },
  {
    name: "Healthcare Provider Integration",
    memoRight: true,
    otherGames: false,
    traditional: true,
  },
]

