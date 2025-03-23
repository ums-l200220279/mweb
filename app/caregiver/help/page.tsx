import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, HelpCircle, MessageSquare, PlayCircle, Search, Video, Clock } from "lucide-react"

export default function HelpCenterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Help Center</h2>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-turquoise-500 to-blue-600 rounded-lg opacity-20" />
        <Card className="border-0 bg-transparent">
          <CardContent className="p-6 md:p-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">How can we help you today?</h3>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Search our knowledge base or browse through our guides to find the information you need
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input className="pl-10 py-6 text-base" placeholder="Search for guides, tutorials, FAQs..." />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="guides">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center">
            <PlayCircle className="mr-2 h-4 w-4" />
            Video Tutorials
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Essential guides for new caregivers</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Setting up your caregiver account
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Adding a patient to your care list
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Understanding the dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Setting up medication reminders
                    </Link>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  View All Guides
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Care</CardTitle>
                <CardDescription>Managing daily care routines</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Creating effective daily routines
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Medication management strategies
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Nutrition and meal planning
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Managing sleep disturbances
                    </Link>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  View All Guides
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Situations</CardTitle>
                <CardDescription>Handling urgent situations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Responding to falls
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Managing wandering behavior
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      Handling medication emergencies
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="flex items-center text-sm text-turquoise-600 hover:underline">
                      <FileText className="mr-2 h-4 w-4" />
                      When to call emergency services
                    </Link>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-4">
                  View All Guides
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-0">
                <div className="relative aspect-video rounded-md overflow-hidden mb-2">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <Video className="h-12 w-12 text-slate-400" />
                    <div className="absolute inset-0 bg-black/5" />
                    <Button variant="default" size="icon" className="absolute">
                      <PlayCircle className="h-10 w-10" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base">Dashboard Tutorial</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-slate-500">
                  Learn how to navigate and use the caregiver dashboard effectively
                </p>
                <div className="flex items-center mt-2 text-xs text-slate-400">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>10:25 minutes</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <div className="relative aspect-video rounded-md overflow-hidden mb-2">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <Video className="h-12 w-12 text-slate-400" />
                    <div className="absolute inset-0 bg-black/5" />
                    <Button variant="default" size="icon" className="absolute">
                      <PlayCircle className="h-10 w-10" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base">Setting Up Reminders</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-slate-500">How to create and manage medication and appointment reminders</p>
                <div className="flex items-center mt-2 text-xs text-slate-400">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>7:15 minutes</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <div className="relative aspect-video rounded-md overflow-hidden mb-2">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <Video className="h-12 w-12 text-slate-400" />
                    <div className="absolute inset-0 bg-black/5" />
                    <Button variant="default" size="icon" className="absolute">
                      <PlayCircle className="h-10 w-10" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base">Emergency Alert System</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-slate-500">How to set up and respond to emergency alerts</p>
                <div className="flex items-center mt-2 text-xs text-slate-400">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>8:45 minutes</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-center mt-6">
            <Button variant="outline">View All Video Tutorials</Button>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">How do I add a new patient to my care list?</h4>
                  <p className="text-sm text-slate-600">
                    To add a new patient, go to your dashboard and click on "Add Patient" button. Fill in the required
                    information and click "Save". You can then invite the patient or their family member to connect with
                    you through the platform.
                  </p>
                </div>
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">How do I set up medication reminders?</h4>
                  <p className="text-sm text-slate-600">
                    Navigate to your patient's profile, select the "Medications" tab, and click "Add Medication". Enter
                    the medication details including name, dosage, frequency, and timing. The system will automatically
                    send reminders based on your settings.
                  </p>
                </div>
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">What should I do if I receive an emergency alert?</h4>
                  <p className="text-sm text-slate-600">
                    When you receive an emergency alert, check the details to understand the nature of the emergency.
                    Contact the patient immediately using the provided contact options. If you cannot reach them or the
                    situation is serious, use the "Contact Emergency Services" button to get immediate help.
                  </p>
                </div>
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-2">How can I track my patient's cognitive health over time?</h4>
                  <p className="text-sm text-slate-600">
                    The dashboard provides cognitive health tracking through various assessments and daily activities.
                    View the "Cognitive Scores" chart to see trends over time. You can also access detailed reports by
                    clicking on "View Reports" in the patient's profile.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">How do I join a group therapy session?</h4>
                  <p className="text-sm text-slate-600">
                    Go to the "Community Support" section and select the "Group Therapy" tab. Browse available sessions
                    and click "Join Session" for the one you want to attend. You'll receive a confirmation email with a
                    link to join the virtual session at the scheduled time.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6">
                View All FAQs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get help from our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="Enter the subject of your inquiry" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe your issue or question in detail"
                    />
                  </div>
                  <Button className="w-full">Submit Ticket</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Support Options</CardTitle>
                <CardDescription>Additional ways to get help</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-turquoise-500" />
                    <div>
                      <h4 className="font-medium">Live Chat</h4>
                      <p className="text-sm text-slate-500 mt-1">Chat with our support team in real-time</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    <Video className="h-6 w-6 text-turquoise-500" />
                    <div>
                      <h4 className="font-medium">Schedule a Demo</h4>
                      <p className="text-sm text-slate-500 mt-1">Book a one-on-one demo with our team</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Book Demo
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    <HelpCircle className="h-6 w-6 text-turquoise-500" />
                    <div>
                      <h4 className="font-medium">Phone Support</h4>
                      <p className="text-sm text-slate-500 mt-1">Call us directly for urgent issues</p>
                      <p className="text-sm font-medium mt-2">+1 (800) 123-4567</p>
                      <p className="text-xs text-slate-500">Available Mon-Fri, 9AM-5PM EST</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

