import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Bell, CheckCircle, Clock, PhoneCall, User } from "lucide-react"
import EmergencyAlertSystem from "@/components/caregiver/emergency-alert-system"

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Emergency Alerts</h2>
        <div className="flex items-center space-x-4">
          <Badge variant="destructive" className="flex items-center">
            <AlertTriangle className="mr-1 h-4 w-4" />1 Active Alert
          </Badge>
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Configure Alerts
          </Button>
        </div>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-lg text-red-800">Fall Detected: John Doe</h3>
                <p className="text-sm text-red-700">
                  Possible fall detected in the bathroom. Immediate check required.
                </p>
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>Detected 10 minutes ago</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="destructive" className="flex items-center">
                <PhoneCall className="mr-2 h-4 w-4" />
                Contact Emergency
              </Button>
              <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Resolved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Active Alerts
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Alert History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Alert Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <EmergencyAlertSystem />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>Past alerts and their resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Medication Missed: Mary Smith</h4>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Resolved
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Evening medication (Donepezil) was not taken</p>
                    <div className="flex items-center mt-2 text-xs text-slate-400">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Yesterday, 8:30 PM</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded">
                      <span className="font-medium">Resolution:</span> Called patient and reminded them to take
                      medication
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Unusual Activity: John Doe</h4>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Resolved
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Door opened at unusual hours (3:15 AM)</p>
                    <div className="flex items-center mt-2 text-xs text-slate-400">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>March 12, 3:15 AM</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded">
                      <span className="font-medium">Resolution:</span> Patient was going to the bathroom, no issue found
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Fall Detected: Robert Johnson</h4>
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Resolved
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Fall detected in living room</p>
                    <div className="flex items-center mt-2 text-xs text-slate-400">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>March 10, 11:45 AM</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 bg-slate-100 p-2 rounded">
                      <span className="font-medium">Resolution:</span> Minor fall, patient assisted and checked for
                      injuries, none found
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All History
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>Configure when and how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Alert Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <Label htmlFor="falls">Fall Detection</Label>
                      </div>
                      <Switch id="falls" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-amber-500" />
                        <Label htmlFor="medication">Missed Medication</Label>
                      </div>
                      <Switch id="medication" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-blue-500" />
                        <Label htmlFor="wandering">Wandering Detection</Label>
                      </div>
                      <Switch id="wandering" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-purple-500" />
                        <Label htmlFor="unusual">Unusual Activity Times</Label>
                      </div>
                      <Switch id="unusual" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="app">In-App Notifications</Label>
                      <Switch id="app" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email Notifications</Label>
                      <Switch id="email" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms">SMS Notifications</Label>
                      <Switch id="sms" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone">Phone Calls (for critical alerts)</Label>
                      <Switch id="phone" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

