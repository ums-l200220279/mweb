import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const assessments = [
  {
    id: 1,
    patientName: "John Doe",
    patientId: "P-12345",
    patientAvatar: "/placeholder.svg",
    testType: "MMSE",
    score: 24,
    maxScore: 30,
    date: "Today, 10:30 AM",
    status: "Completed",
    risk: "medium",
  },
  {
    id: 2,
    patientName: "Sarah Smith",
    patientId: "P-12346",
    patientAvatar: "/placeholder.svg",
    testType: "Video Assessment",
    score: 18,
    maxScore: 30,
    date: "Today, 09:15 AM",
    status: "Completed",
    risk: "high",
  },
  {
    id: 3,
    patientName: "Robert Johnson",
    patientId: "P-12347",
    patientAvatar: "/placeholder.svg",
    testType: "MMSE",
    score: 22,
    maxScore: 30,
    date: "Yesterday, 2:45 PM",
    status: "Completed",
    risk: "medium",
  },
  {
    id: 4,
    patientName: "Emily Davis",
    patientId: "P-12348",
    patientAvatar: "/placeholder.svg",
    testType: "MMSE",
    score: 27,
    maxScore: 30,
    date: "Yesterday, 11:20 AM",
    status: "Completed",
    risk: "low",
  },
  {
    id: 5,
    patientName: "Michael Wilson",
    patientId: "P-12349",
    patientAvatar: "/placeholder.svg",
    testType: "Video Assessment",
    score: 15,
    maxScore: 30,
    date: "2 days ago, 3:30 PM",
    status: "Completed",
    risk: "high",
  },
]

const getRiskBadge = (risk: string) => {
  switch (risk) {
    case "high":
      return <Badge variant="destructive">High Risk</Badge>
    case "medium":
      return (
        <Badge variant="warning" className="bg-orange-500 hover:bg-orange-600">
          Medium Risk
        </Badge>
      )
    case "low":
      return (
        <Badge variant="success" className="bg-green-500 hover:bg-green-600">
          Low Risk
        </Badge>
      )
    default:
      return null
  }
}

export default function RecentAssessments() {
  return (
    <div className="space-y-4">
      {assessments.map((assessment) => (
        <div key={assessment.id} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={assessment.patientAvatar} alt={assessment.patientName} />
              <AvatarFallback>{assessment.patientName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{assessment.patientName}</h4>
                <span className="text-xs text-muted-foreground">({assessment.patientId})</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{assessment.testType}</span>
                <span>•</span>
                <span>{assessment.date}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">
                {assessment.score}/{assessment.maxScore}
              </div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
            <div>{getRiskBadge(assessment.risk)}</div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/doctor/assessments/${assessment.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

