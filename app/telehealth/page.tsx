import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Clock, Video, MessageSquare, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function TelehealthPage() {
  // Sample data for upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: "Dr. Sarah Johnson",
      specialty: "Neurologist",
      date: "March 10, 2025",
      time: "10:00 AM",
      type: "Video Consultation",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      specialty: "Geriatric Psychiatrist",
      date: "March 15, 2025",
      time: "2:30 PM",
      type: "Video Consultation",
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  // Sample data for past consultations
  const pastConsultations = [
    {
      id: 101,
      doctorName: "Dr. Emily Rodriguez",
      specialty: "Cognitive Specialist",
      date: "February 25, 2025",
      time: "11:15 AM",
      type: "Video Consultation",
      notes: "Available",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 102,
      doctorName: "Dr. James Wilson",
      specialty: "Neuropsychologist",
      date: "February 10, 2025",
      time: "3:00 PM",
      type: "Video Consultation",
      notes: "Available",
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  // Sample data for specialists
  const specialists = [
    {
      id: 201,
      name: "Dr. Lisa Thompson",
      specialty: "Neurologist",
      experience: "15 years",
      rating: 4.9,
      nextAvailable: "March 8, 2025",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 202,
      name: "Dr. Robert Garcia",
      specialty: "Geriatric Psychiatrist",
      experience: "12 years",
      rating: 4.8,
      nextAvailable: "March 7, 2025",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 203,
      name: "Dr. Jennifer Lee",
      specialty: "Cognitive Specialist",
      experience: "10 years",
      rating: 4.7,
      nextAvailable: "March 9, 2025",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 204,
      name: "Dr. David Kim",
      specialty: "Neuropsychologist",
      experience: "14 years",
      rating: 4.9,
      nextAvailable: "March 6, 2025",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Telehealth Services</h1>
        <p className="text-lg text-muted-foreground">
          Connect with cognitive health specialists from the comfort of your home
        </p>
      </div>

      <Tabs defaultValue="appointments" className="mb-12">
        <TabsList className="mb-6">
          <TabsTrigger value="appointments">My Appointments</TabsTrigger>
          <TabsTrigger value="specialists">Find Specialists</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Consultation</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{appointment.doctorName}</CardTitle>
                          <CardDescription>{appointment.specialty}</CardDescription>
                        </div>
                        <Badge className="bg-primary">{appointment.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar>
                          <AvatarImage src={appointment.image} alt={appointment.doctorName} />
                          <AvatarFallback>
                            {appointment.doctorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/20 pt-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">You don't have any upcoming appointments</p>
                  <Button>Schedule a Consultation</Button>
                </CardContent>
              </Card>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Past Consultations</h2>
            {pastConsultations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {pastConsultations.map((consultation) => (
                  <Card key={consultation.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{consultation.doctorName}</CardTitle>
                          <CardDescription>{consultation.specialty}</CardDescription>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {consultation.date}, {consultation.time}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={consultation.image} alt={consultation.doctorName} />
                          <AvatarFallback>
                            {consultation.doctorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            {consultation.type}
                          </Badge>
                          <div className="text-sm">
                            <span className="font-medium">Notes:</span> {consultation.notes}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Summary
                      </Button>
                      <Button variant="secondary" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Doctor
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No past consultations found</p>
                </CardContent>
              </Card>
            )}
          </section>
        </TabsContent>

        <TabsContent value="specialists" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Cognitive Health Specialists</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Sort By
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {specialists.map((specialist) => (
              <Card key={specialist.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 p-4 flex justify-center items-center bg-muted/20">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={specialist.image} alt={specialist.name} />
                      <AvatarFallback className="text-xl">
                        {specialist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="md:w-2/3 p-4">
                    <h3 className="font-bold text-lg">{specialist.name}</h3>
                    <p className="text-primary font-medium">{specialist.specialty}</p>
                    <div className="my-2 text-sm">
                      <div className="flex justify-between">
                        <span>Experience:</span>
                        <span className="font-medium">{specialist.experience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-medium">{specialist.rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Available:</span>
                        <span className="font-medium">{specialist.nextAvailable}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button size="sm">Book Appointment</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button variant="outline">Load More Specialists</Button>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Select Date & Time</h2>
              <Card>
                <CardContent className="pt-6">
                  <Calendar mode="single" className="rounded-md border mx-auto" />
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Available Time Slots</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm">
                        9:00 AM
                      </Button>
                      <Button variant="outline" size="sm">
                        10:30 AM
                      </Button>
                      <Button variant="outline" size="sm">
                        11:45 AM
                      </Button>
                      <Button variant="outline" size="sm">
                        1:15 PM
                      </Button>
                      <Button variant="outline" size="sm">
                        2:30 PM
                      </Button>
                      <Button variant="outline" size="sm">
                        4:00 PM
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Consultation Details</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Consultation Type</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="justify-start">
                          <Video className="h-4 w-4 mr-2" />
                          Video Call
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Text Chat
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Select Specialist</h3>
                      <div className="space-y-2">
                        {specialists.slice(0, 3).map((specialist) => (
                          <div key={specialist.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={specialist.image} alt={specialist.name} />
                                <AvatarFallback>
                                  {specialist.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{specialist.name}</p>
                                <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Reason for Visit</h3>
                      <textarea
                        className="w-full min-h-[100px] p-3 border rounded-md"
                        placeholder="Briefly describe your symptoms or concerns..."
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Schedule Consultation</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <section className="mt-12 bg-primary/5 p-6 rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Why Choose Memoright Telehealth?</h2>
          <p className="text-muted-foreground">Expert care for cognitive health, accessible from anywhere</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Specialized Care</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Connect with specialists in neurology, geriatric psychiatry, and cognitive health</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Convenience</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Schedule appointments at your convenience and consult from the comfort of your home</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Comprehensive Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>Integrated with your cognitive assessments and training for holistic care</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/telehealth/faq">
            <Button variant="link">Frequently Asked Questions</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}

