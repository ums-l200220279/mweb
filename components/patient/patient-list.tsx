"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Patient {
  id: string
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
  diagnosis: string | null
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  status: "ACTIVE" | "INACTIVE"
  cognitiveScores: Array<{
    score: number
    date: string
  }>
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function PatientList() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPatients(pagination.page)
  }, [pagination.page])

  const fetchPatients = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patients?page=${page}&limit=${pagination.limit}`)

      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }

      const data = await response.json()
      setPatients(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-green-100 text-green-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "HIGH":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latest Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No patients found
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.user.name || "N/A"}</TableCell>
                      <TableCell>{patient.diagnosis || "Not diagnosed"}</TableCell>
                      <TableCell>
                        <Badge className={getRiskLevelColor(patient.riskLevel)}>{patient.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {patient.cognitiveScores && patient.cognitiveScores.length > 0
                          ? patient.cognitiveScores[0].score
                          : "No score"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/patients/${patient.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {pagination.totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                    />
                  </PaginationItem>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => handlePageChange(page)} isActive={page === pagination.page}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                      disabled={pagination.page === pagination.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

