import Image from "next/image"
import { FileText, Users, BarChart3, Award } from "lucide-react"

export function ScientificBackingSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Backed by Science</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            MemoRight is developed in collaboration with neuroscientists and clinical psychologists, based on decades of
            research in cognitive science.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {researchPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">{point.icon}</div>
                <div>
                  <h3 className="text-xl font-medium mb-2">{point.title}</h3>
                  <p className="text-muted-foreground">{point.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-md transform translate-x-4 translate-y-4" />
            <div className="relative bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-medium">Cognitive Improvement Results</h3>
                <p className="text-sm text-muted-foreground">Based on 12-week clinical study with 2,500 participants</p>
              </div>
              <div className="p-6">
                <Image
                  src="/placeholder.svg?height=400&width=500&text=Clinical+Results+Graph"
                  alt="Clinical study results showing cognitive improvement"
                  width={500}
                  height={400}
                  className="rounded-lg"
                />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">37%</p>
                    <p className="text-sm text-muted-foreground">Average improvement in working memory</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-primary">42%</p>
                    <p className="text-sm text-muted-foreground">Average improvement in processing speed</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-muted/30 text-center text-sm text-muted-foreground">
                Results published in Journal of Cognitive Enhancement, 2023
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const researchPoints = [
  {
    title: "Evidence-Based Approach",
    description:
      "Our exercises are based on established neuropsychological tests and cognitive training paradigms validated in peer-reviewed research.",
    icon: <FileText className="h-6 w-6 text-primary" />,
  },
  {
    title: "Clinical Validation",
    description:
      "MemoRight has been validated in clinical studies showing significant improvements in cognitive performance across multiple domains.",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    title: "Adaptive Algorithms",
    description:
      "Our proprietary algorithms adjust difficulty in real-time based on your performance to maintain optimal challenge for neuroplasticity.",
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
  },
  {
    title: "Expert Development",
    description:
      "Developed in collaboration with leading neuroscientists, neuropsychologists, and cognitive rehabilitation specialists.",
    icon: <Award className="h-6 w-6 text-primary" />,
  },
]

