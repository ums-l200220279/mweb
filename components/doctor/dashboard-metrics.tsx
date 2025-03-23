import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">245</div>
          <p className="text-xs text-muted-foreground">Active patients under care</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">4 assessments, 8 follow-ups</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average MMSE Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24.5</div>
          <p className="text-xs text-muted-foreground">-0.3 from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}

