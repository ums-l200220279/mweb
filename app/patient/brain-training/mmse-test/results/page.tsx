import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle, AlertTriangle } from "lucide-react"

export default function MMSETestResultsPage({ searchParams }: { searchParams: { score: string } }) {
  const score = Number.parseInt(searchParams.score)

  const getResultDetails = (score: number) => {
    if (score >= 24) {
      return {
        status: "Normal Cognitive Function",
        description: "Your cognitive function appears to be within the normal range.",
        color: "bg-green-500",
        icon: CheckCircle,
      }
    } else if (score >= 19) {
      return {
        status: "Mild Cognitive Impairment",
        description: "You may have mild cognitive impairment. It's recommended to consult with your doctor.",
        color: "bg-yellow-500",
        icon: AlertTriangle,
      }
    } else {
      return {
        status: "Significant Cognitive Impairment",
        description:
          "Your results suggest significant cognitive impairment. Please consult with your doctor immediately.",
        color: "bg-red-500",
        icon: AlertTriangle,
      }
    }
  }

  const result = getResultDetails(score)

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>MMSE Test Results</CardTitle>
          <CardDescription>Your cognitive assessment results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-2 py-6">
            <div className={`rounded-full ${result.color} p-4`}>
              <result.icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-medium">Score: {score}/30</h3>
            <Badge className={result.color}>{result.status}</Badge>
            <p className="text-center text-muted-foreground max-w-md">{result.description}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/patient/brain-training">Back to Brain Training</Link>
          </Button>
          <Button asChild>
            <Link href="/patient/dashboard">View Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

