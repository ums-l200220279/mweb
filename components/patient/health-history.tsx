import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { FileText, Download } from "lucide-react"

const cognitiveData = [
  { date: "2024-01", score: 22 },
  { date: "2024-02", score: 23 },
  { date: "2024-03", score: 24 },
  { date: "2024-04", score: 24 },
  { date: "2024-05", score: 25 },
]

const medicalRecords = [
  { id: 1, date: "2024-05-15", type: "MMSE Assessment", result: "Score: 25/30" },
  { id: 2, date: "2024-04-01", type: "Blood Test", result: "Normal" },
  { id: 3, date: "2024-03-10", type: "MRI Scan", result: "No significant abnormalities" },
  { id: 4, date: "2024-02-15", type: "MMSE Assessment", result: "Score: 24/30" },
]

export default function HealthHistory() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Health History</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cognitive Score Trend</CardTitle>
            <CardDescription>Your MMSE score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cognitiveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 30]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>Recent medical examinations and results</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {medicalRecords.map((record) => (
                <li key={record.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{record.type}</p>
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                  </div>
                  <Badge>{record.result}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Full Health Report</CardTitle>
          <CardDescription>Download your comprehensive health report</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Full Report
          </Button>
          <Button className="ml-4">
            <Download className="mr-2 h-4 w-4" />
            Download Latest Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

