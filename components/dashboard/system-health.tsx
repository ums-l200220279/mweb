import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const systemMetrics = [
  { name: "CPU Usage", value: 45 },
  { name: "Memory Usage", value: 60 },
  { name: "Disk Space", value: 75 },
  { name: "Network Load", value: 30 },
]

export default function SystemHealth() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {systemMetrics.map((metric) => (
        <Card key={metric.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}%</div>
            <Progress value={metric.value} className="mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

