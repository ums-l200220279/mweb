import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const cognitiveData = [
  { month: "Jan", score: 24.5 },
  { month: "Feb", score: 24.3 },
  { month: "Mar", score: 24.0 },
  { month: "Apr", score: 23.8 },
  { month: "May", score: 23.5 },
  { month: "Jun", score: 23.2 },
]

export default function CognitiveAnalysisTab() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cognitive Score Trends</CardTitle>
          <CardDescription>Average MMSE scores across all patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cognitiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 30]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Predictions</CardTitle>
          <CardDescription>Machine learning insights for cognitive decline patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">8 Patients</div>
                  <p className="text-xs text-muted-foreground">Show high risk of rapid decline</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Treatment Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">85%</div>
                  <p className="text-xs text-muted-foreground">Positive response to current treatment</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

