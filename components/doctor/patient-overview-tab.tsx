"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, MessageSquare } from "lucide-react"
import Link from "next/link"

const patients = [
  {
    id: "P-001",
    name: "John Doe",
    age: 72,
    diagnosis: "MCI Cognitive Impairment",
    lastAssessment: "2023-09-15",
    score: 24,
    status: "Stable",
    risk: "medium",
    avatar: "/placeholder.svg",
  },
  {
    id: "P-002",
    name: "Sarah Smith",
    age: 68,
    diagnosis: "Alzheimer's Disease",
    lastAssessment: "2023-09-10",
    score: 18,
    status: "Declining",
    risk: "high",
    avatar: "/placeholder.svg",
  },
  {
    id: "P-003",
    name: "Bob Johnson",
    age: 75,
    diagnosis: "Vascular Dementia",
    lastAssessment: "2023-09-12",
    score: 22,
    status: "Stable",
    risk: "medium",
    avatar: "/placeholder.svg",
  },
]

export default function PatientOverviewTab() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <>
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>Overview of all patients under your care</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Last Assessment</TableHead>
                <TableHead>MMSE Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={patient.avatar} alt={patient.name} />
                        <AvatarFallback>{patient.name[0]}</AvatarFallback>
                      </Avatar>
                      {patient.name}
                    </div>
                  </TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.diagnosis}</TableCell>
                  <TableCell>{patient.lastAssessment}</TableCell>
                  <TableCell>{patient.score}/30</TableCell>
                  <TableCell>
                    <Badge variant={patient.risk === "high" ? "destructive" : "secondary"}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/doctor/patients/${patient.id}`}>View Details</Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

