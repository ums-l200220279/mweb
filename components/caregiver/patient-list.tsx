"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, AlertTriangle, Activity, Calendar, MessageSquare } from "lucide-react"

const patients = [
  {
    id: 1,
    name: "John Doe",
    age: 72,
    condition: "Mild Alzheimer's",
    lastActivity: "10 minutes ago",
    status: "needs-attention",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Mary Smith",
    age: 68,
    condition: "Early Dementia",
    lastActivity: "2 hours ago",
    status: "stable",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Robert Johnson",
    age: 75,
    condition: "Moderate Alzheimer's",
    lastActivity: "1 day ago",
    status: "stable",
    image: "/placeholder.svg?height=40&width=40",
  },
]

export default function PatientList() {
  const [patientData, setPatientData] = useState(patients)

  return (
    <div className="space-y-4">
      {patientData.map((patient) => (
        <Card key={patient.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Image
                src={patient.image || "/placeholder.svg"}
                alt={patient.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">{patient.name}</h4>
                  {patient.status === "needs-attention" && <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />}
                </div>
                <p className="text-sm text-slate-500">
                  Age: {patient.age} • {patient.condition}
                </p>
                <div className="flex items-center mt-1">
                  <Badge
                    variant={patient.status === "stable" ? "outline" : "destructive"}
                    className={patient.status === "stable" ? "bg-green-50 text-green-700 hover:bg-green-50" : ""}
                  >
                    {patient.status === "stable" ? "Stable" : "Needs Attention"}
                  </Badge>
                  <span className="text-xs text-slate-400 ml-2">Last active: {patient.lastActivity}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Activity className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Schedule Appointment</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Send Message</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
      <Button variant="outline" className="w-full">
        View All Patients
      </Button>
    </div>
  )
}

