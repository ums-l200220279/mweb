import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Bell, AlertTriangle, Activity, HelpCircle, MessageSquare } from "lucide-react"
import PatientList from "@/components/caregiver/patient-list"
import PatientActivityFeed from "@/components/caregiver/patient-activity-feed"
import CognitiveScoreChart from "@/components/dashboard/cognitive-score-chart"

export default function CaregiverDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Caregiver Dashboard</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Button>
          <div className="flex items-center space-x-2">
            <Image
              src="/placeholder.svg?height=40&width=40"
              alt="Caregiver Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-slate-500">Caregiver</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Under Care</CardTitle>
            <Users className="h-4 w-4 text-turquoise-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-slate-500 mt-1">2 active, 1 needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-turquoise-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-slate-500 mt-1">Next: Today at 2:00 PM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks for Today</CardTitle>
            <Bell className="h-4 w-4 text-turquoise-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-slate-500 mt-1">2 completed, 3 remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-red-500 mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Overview</CardTitle>
            <CardDescription>Quick summary of your patients</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Cognitive Scores</CardTitle>
            <CardDescription>Trend across all patients</CardDescription>
          </CardHeader>
          <CardContent>
            <CognitiveScoreChart />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="alerts">Emergency Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patient Activities</CardTitle>
              <CardDescription>Activities in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientActivityFeed />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reminders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>Medication and therapy reminders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                  <div className="bg-turquoise-100 p-2 rounded-full">
                    <Bell className="h-5 w-5 text-turquoise-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Medication Reminder: John Doe</h4>
                      <span className="text-xs bg-turquoise-100 text-turquoise-800 px-2 py-1 rounded-full">
                        Today, 2:00 PM
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Donepezil 10mg - with lunch</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                  <div className="bg-turquoise-100 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-turquoise-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Therapy Session: Mary Smith</h4>
                      <span className="text-xs bg-turquoise-100 text-turquoise-800 px-2 py-1 rounded-full">
                        Tomorrow, 10:00 AM
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Cognitive Behavioral Therapy - Dr. Johnson</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Alerts</CardTitle>
              <CardDescription>Alerts requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-red-800">Fall Detected: John Doe</h4>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">10 minutes ago</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      Possible fall detected in the bathroom. Immediate check required.
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" variant="destructive">
                        Contact Emergency
                      </Button>
                      <Button size="sm" variant="outline">
                        Mark as Resolved
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Help Center</CardTitle>
            <CardDescription>Resources and support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link
                href="/caregiver/help"
                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <h4 className="font-medium flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-turquoise-500" />
                  Getting Started Guide
                </h4>
                <p className="text-sm text-slate-500 mt-1">Learn how to use the caregiver dashboard effectively</p>
              </Link>
              <Link
                href="/caregiver/community"
                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <h4 className="font-medium flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-turquoise-500" />
                  Community Support
                </h4>
                <p className="text-sm text-slate-500 mt-1">Connect with other caregivers and share experiences</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-auto py-4 flex flex-col items-center justify-center">
                <Users className="h-5 w-5 mb-2" />
                <span>Add Patient</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <Calendar className="h-5 w-5 mb-2" />
                <span>Schedule Appointment</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <Activity className="h-5 w-5 mb-2" />
                <span>Track Vitals</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                <Bell className="h-5 w-5 mb-2" />
                <span>Set Reminder</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

