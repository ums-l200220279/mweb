import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Assessments() {
  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Patient Assessments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
          <CardDescription>View and manage recent patient assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add a list or table of recent assessments here */}
          <p>No recent assessments found.</p>
        </CardContent>
      </Card>
      <Button asChild>
        <Link href="/doctor/assessments/new">Start New Assessment</Link>
      </Button>
    </div>
  )
}

