import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

const patients = [
  { id: 1, name: "John Doe", age: 65, lastAssessment: "2023-05-15", cognitiveScore: 75 },
  { id: 2, name: "Jane Smith", age: 70, lastAssessment: "2023-05-10", cognitiveScore: 82 },
  { id: 3, name: "Bob Johnson", age: 68, lastAssessment: "2023-05-12", cognitiveScore: 78 },
]

export default function PatientList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Last Assessment</TableHead>
          <TableHead>Cognitive Score</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>{patient.name}</TableCell>
            <TableCell>{patient.age}</TableCell>
            <TableCell>{patient.lastAssessment}</TableCell>
            <TableCell>{patient.cognitiveScore}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

