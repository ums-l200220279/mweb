"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"

const mockPatients = [
  {
    id: "P-12345",
    name: "John Doe",
    age: 72,
    gender: "Male",
    diagnosis: "Mild Cognitive Impairment",
    risk: "medium",
    avatar: "/placeholder.svg",
  },
  {
    id: "P-12346",
    name: "Sarah Smith",
    age: 68,
    gender: "Female",
    diagnosis: "Alzheimer's Disease",
    risk: "high",
    avatar: "/placeholder.svg",
  },
  {
    id: "P-12347",
    name: "Robert Johnson",
    age: 75,
    gender: "Male",
    diagnosis: "Vascular Dementia",
    risk: "medium",
    avatar: "/placeholder.svg",
  },
  {
    id: "P-12348",
    name: "Emily Davis",
    age: 69,
    gender: "Female",
    diagnosis: "Lewy Body Dementia",
    risk: "high",
    avatar: "/placeholder.svg",
  },
]

export default function PatientManagement() {
  const [patients, setPatients] = useState(mockPatients)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>View and manage your patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="search">Search Patients</Label>
            <Input
              id="search"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Table>
            <TableCaption>A list of your patients.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.diagnosis}</TableCell>
                  <TableCell>
                    <Badge variant={patient.risk === "high" ? "destructive" : "secondary"}>{patient.risk}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {filteredPatients.length === 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}>No patients found.</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
      <Button asChild>
        <Link href="/doctor/patients/new">Add New Patient</Link>
      </Button>
    </div>
  )
}

