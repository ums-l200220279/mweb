import { Card, CardContent } from "@/components/ui/card"
import { Brain, Utensils, FootprintsIcon as Walk } from "lucide-react"

const recommendations = [
  {
    category: "Brain Training",
    icon: Brain,
    items: ["Complete a 15-minute memory game session", "Practice mindfulness meditation for 10 minutes"],
  },
  {
    category: "Nutrition",
    icon: Utensils,
    items: [
      "Include omega-3 rich foods like salmon or walnuts in your lunch",
      "Have a serving of blueberries as a brain-boosting snack",
    ],
  },
  {
    category: "Physical Activity",
    icon: Walk,
    items: ["Take a 30-minute walk in the park", "Try a gentle yoga session focusing on balance"],
  },
]

export default function DailyRecommendations() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recommendations.map((rec) => (
        <Card key={rec.category}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <rec.icon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{rec.category}</h3>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {rec.items.map((item, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

