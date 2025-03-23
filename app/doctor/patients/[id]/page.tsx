import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Phone, Mail, Video, Activity, Pill, Brain, MessageSquare, ChevronLeft } from "lucide-react"
import Link from "next/link"
import PatientCognitiveChart from "@/components/doctor/patient-cognitive-chart"

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch patient data based on the ID
  const patientId = params.id

  // Mock patient data
  const patient = {
    id: patientId,
    name: "John Doe",
    age: 72,
    gender: "Male",
    dateOfBirth: "May 15, 1952",
    diagnosis: "Mild Cognitive Impairment",
    lastScore: 24,
    lastAssessment: "May 10, 2024",
    status: "stable",
    avatar: "/placeholder.svg",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA",
    caregiver: {
      name: "Jane Doe",
      relationship: "Daughter",
      phone: "+1 (555) 987-6543",
      email: "jane.doe@example.com",
    },
    medicalHistory: [
      "Hypertension (diagnosed 2010)",
      "Type 2 Diabetes (diagnosed 2015)",
      "Hip Replacement Surgery (2018)",
    ],
    medications: [
      { name: "Donepezil", dosage: "5mg", frequency: "Once daily", startDate: "Jan 15, 2024" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily", startDate: "Mar 10, 2015" },
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", startDate: "Sep 5, 2010" },
    ],
    assessments: [
      { date: "May 10, 2024", type: "MMSE", score: 24, notes: "Showing improvement in orientation and recall" },
      { date: "Apr 10, 2024", type: "MMSE", score: 23, notes: "Stable cognitive function" },
      { date: "Mar 10, 2024", type: "MMSE", score: 22, notes: "Slight improvement in attention" },
      { date: "Feb 10, 2024", type: "MMSE", score: 21, notes: "Difficulty with recall and calculation" },
      { date: "Jan 10, 2024", type: "MMSE", score: 20, notes: "Initial assessment - moderate impairment" },
    ],
    therapies: [
      {
        name: "Memory Exercises",
        frequency: "Daily",
        startDate: "Jan 15, 2024",
        notes: "Focus on name-face association",
      },
      {
        name: "Physical Activity",
        frequency: "3 times weekly",
        startDate: "Jan 20, 2024",
        notes: "Light walking for 30 minutes",
      },
      {
        name: "Social Engagement",
        frequency: "Weekly",
        startDate: "Feb 1, 2024",
        notes: "Community senior center activities",
      },
    ],
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/doctor/patients">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{patient.name}</CardTitle>
              <CardDescription>{patient.id}</CardDescription>
              <div className="mt-2">
                {patient.status === "stable" && <Badge className="bg-green-500 hover:bg-green-600">Stable</Badge>}
                {patient.status === "needs-monitoring" && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">Needs Monitoring</Badge>
                )}
                {patient.status === "high-risk" && <Badge variant="destructive">High Risk</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Age:</div>
                  <div>{patient.age}</div>
                  <div className="font-medium">Gender:</div>
                  <div>{patient.gender}</div>
                  <div className="font-medium">Date of Birth:</div>
                  <div>{patient.dateOfBirth}</div>
                  <div className="font-medium">Diagnosis:</div>
                  <div>{patient.diagnosis}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.address}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Caregiver Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Name:</div>
                  <div>{patient.caregiver.name}</div>
                  <div className="font-medium">Relationship:</div>
                  <div>{patient.caregiver.relationship}</div>
                  <div className="font-medium">Phone:</div>
                  <div>{patient.caregiver.phone}</div>
                  <div className="font-medium">Email:</div>
                  <div className="truncate">{patient.caregiver.email}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href={`/doctor/assessments/new?patient=${patient.id}`}>
                    <Activity className="mr-2 h-4 w-4" />
                    Start New Assessment
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/doctor/communication?patient=${patient.id}`}>
                    <Video className="mr-2 h-4 w-4" />
                    Schedule Video Call
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/doctor/communication?patient=${patient.id}&type=message`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Caregiver
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Health Timeline</CardTitle>
              <CardDescription>MMSE score progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientCognitiveChart assessments={patient.assessments} />
            </CardContent>
          </Card>

          <Tabs defaultValue="assessments">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="therapies">Therapies</TabsTrigger>
            </TabsList>

            <TabsContent value="assessments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment History</CardTitle>
                  <CardDescription>Previous cognitive assessments and results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patient.assessments.map((assessment, index) => (
                      <div key={index} className="flex items-start justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-blue-100 p-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{assessment.type} Assessment</h4>
                              <Badge variant="outline">{assessment.score}/30</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{assessment.date}</span>
                            </div>
                            <p className="mt-2 text-sm">{assessment.notes}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/doctor/assessments/details?id=${index}&patient=${patient.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Medical History</CardTitle>
                  <CardDescription>Patient's medical conditions and history</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {patient.medicalHistory.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/doctor/patients/${patient.id}/edit-medical`}>Edit Medical History</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                  <CardDescription>Prescribed medications and dosages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patient.medications.map((medication, index) => (
                      <div key={index} className="flex items-start justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-green-100 p-2">
                            <Pill className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{medication.name}</h4>
                              <Badge variant="outline">{medication.dosage}</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{medication.frequency}</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Started: {medication.startDate}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/doctor/patients/${patient.id}/add-medication`}>Add Medication</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="therapies" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prescribed Therapies</CardTitle>
                  <CardDescription>Cognitive and physical therapies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patient.therapies.map((therapy, index) => (
                      <div key={index} className="flex items-start justify-between rounded-lg border p-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-purple-100 p-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{therapy.name}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{therapy.frequency}</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Started: {therapy.startDate}</p>
                            <p className="mt-2 text-sm">{therapy.notes}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/doctor/patients/${patient.id}/add-therapy`}>Add Therapy</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

