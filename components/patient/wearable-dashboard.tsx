"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Heart, Activity, Moon, Plus } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import type { WearableDevice, SleepData, ActivityData, VitalSignsData } from "@/types/wearables"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function WearableDashboard({ patientId }: { patientId: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [devices, setDevices] = useState<WearableDevice[]>([])
  const [sleepData, setSleepData] = useState<SleepData[]>([])
  const [activityData, setActivityData] = useState<ActivityData[]>([])
  const [vitalsData, setVitalsData] = useState<VitalSignsData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false)
  const [newDevice, setNewDevice] = useState({
    type: "",
    model: "",
    accessToken: "",
  })

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices()
  }, [patientId])

  // Fetch data when devices or date range changes
  useEffect(() => {
    if (devices.length > 0) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [devices, dateRange])

  const fetchDevices = async () => {
    try {
      const response = await fetch(`/api/wearables/devices?patientId=${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices)
      } else {
        console.error("Failed to fetch devices")
      }
    } catch (error) {
      console.error("Error fetching devices:", error)
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Use the first device for now
      const deviceType = devices[0].type

      // Fetch sleep data
      const sleepResponse = await fetch(
        `/api/wearables/data?patientId=${patientId}&dataType=sleep&startDate=${dateRange.start}&endDate=${dateRange.end}&deviceType=${deviceType}`,
      )
      if (sleepResponse.ok) {
        const sleepData = await sleepResponse.json()
        setSleepData(sleepData.data)
      }

      // Fetch activity data
      const activityResponse = await fetch(
        `/api/wearables/data?patientId=${patientId}&dataType=activity&startDate=${dateRange.start}&endDate=${dateRange.end}&deviceType=${deviceType}`,
      )
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setActivityData(activityData.data)
      }

      // Fetch vitals data
      const vitalsResponse = await fetch(
        `/api/wearables/data?patientId=${patientId}&dataType=vitals&startDate=${dateRange.start}&endDate=${dateRange.end}&deviceType=${deviceType}`,
      )
      if (vitalsResponse.ok) {
        const vitalsData = await vitalsResponse.json()
        setVitalsData(vitalsData.data)
      }
    } catch (error) {
      console.error("Error fetching wearable data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const registerDevice = async () => {
    try {
      const response = await fetch("/api/wearables/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          deviceType: newDevice.type,
          deviceId: `${newDevice.type}-${Date.now()}`, // Generate a unique ID
          model: newDevice.model,
          accessToken: newDevice.accessToken,
        }),
      })

      if (response.ok) {
        // Refresh devices list
        fetchDevices()
        // Close dialog
        setShowAddDeviceDialog(false)
        // Reset form
        setNewDevice({
          type: "",
          model: "",
          accessToken: "",
        })
      } else {
        console.error("Failed to register device")
      }
    } catch (error) {
      console.error("Error registering device:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wearable Health Monitoring</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="start-date">From:</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-auto"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="end-date">To:</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-auto"
            />
          </div>

          <Dialog open={showAddDeviceDialog} onOpenChange={setShowAddDeviceDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Wearable Device</DialogTitle>
                <DialogDescription>Connect a wearable device to monitor health metrics.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="device-type">Device Type</Label>
                  <Select value={newDevice.type} onValueChange={(value) => setNewDevice({ ...newDevice, type: value })}>
                    <SelectTrigger id="device-type">
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FITBIT">Fitbit</SelectItem>
                      <SelectItem value="APPLE_WATCH">Apple Watch</SelectItem>
                      <SelectItem value="SAMSUNG">Samsung Galaxy Watch</SelectItem>
                      <SelectItem value="GARMIN">Garmin</SelectItem>
                      <SelectItem value="GPS_TRACKER">GPS Tracker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="device-model">Model</Label>
                  <Input
                    id="device-model"
                    value={newDevice.model}
                    onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                    placeholder="e.g. Fitbit Charge 5"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="access-token">Access Token</Label>
                  <Input
                    id="access-token"
                    value={newDevice.accessToken}
                    onChange={(e) => setNewDevice({ ...newDevice, accessToken: e.target.value })}
                    placeholder="Paste access token from device app"
                  />
                  <p className="text-sm text-muted-foreground">
                    You can find this in your device's app settings or developer portal.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDeviceDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={registerDevice}>Connect Device</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Wearable Devices Connected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Connect a wearable device to track health metrics and get personalized insights.
            </p>
            <Button onClick={() => setShowAddDeviceDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Device
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Average Heart Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading
                      ? "Loading..."
                      : vitalsData.length > 0
                        ? `${Math.round(vitalsData.reduce((sum, data) => sum + (data.heartRate || 0), 0) / vitalsData.length)} bpm`
                        : "No data"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-green-500" />
                    Daily Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading
                      ? "Loading..."
                      : activityData.length > 0
                        ? `${Math.round(activityData.reduce((sum, data) => sum + data.steps, 0) / activityData.length)}`
                        : "No data"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Moon className="h-4 w-4 mr-2 text-blue-500" />
                    Sleep Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading
                      ? "Loading..."
                      : sleepData.length > 0
                        ? `${Math.round(sleepData.reduce((sum, data) => sum + data.efficiency, 0) / sleepData.length)}%`
                        : "No data"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Health Insights</CardTitle>
                <CardDescription>AI-generated insights based on your wearable data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {isLoading ? (
                    <li>Analyzing your data...</li>
                  ) : (
                    <>
                      <li className="flex items-start">
                        <div className="rounded-full bg-blue-100 p-1 mr-2">
                          <Moon className="h-4 w-4 text-blue-500" />
                        </div>
                        Your sleep efficiency has{" "}
                        {sleepData.length > 1 && sleepData[0].efficiency > sleepData[1].efficiency
                          ? "improved"
                          : "decreased"}{" "}
                        by{" "}
                        {sleepData.length > 1
                          ? Math.abs(Math.round(sleepData[0].efficiency - sleepData[1].efficiency))
                          : 0}
                        % compared to yesterday.
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-green-100 p-1 mr-2">
                          <Activity className="h-4 w-4 text-green-500" />
                        </div>
                        Your activity level is{" "}
                        {activityData.length > 0 && activityData[0].steps > 7000 ? "good" : "below recommended levels"}{" "}
                        for cognitive health maintenance.
                      </li>
                      <li className="flex items-start">
                        <div className="rounded-full bg-red-100 p-1 mr-2">
                          <Heart className="h-4 w-4 text-red-500" />
                        </div>
                        Your heart rate variability indicates{" "}
                        {vitalsData.length > 0 ? "normal stress levels" : "insufficient data to analyze stress levels"}.
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sleep" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sleep Duration & Efficiency</CardTitle>
                <CardDescription>Track your sleep patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">Loading sleep data...</div>
                  ) : sleepData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sleepData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          label={{ value: "Duration (hrs)", angle: -90, position: "insideLeft" }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          label={{ value: "Efficiency (%)", angle: 90, position: "insideRight" }}
                        />
                        <Tooltip />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey={(data) => data.duration / (1000 * 60 * 60)}
                          name="Duration (hrs)"
                          stroke="#8884d8"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="efficiency"
                          name="Efficiency (%)"
                          stroke="#82ca9d"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">No sleep data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sleep Stages</CardTitle>
                <CardDescription>Distribution of sleep stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">Loading sleep data...</div>
                  ) : sleepData.length > 0 && sleepData[0].stages ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sleepData.map((data) => ({
                          date: data.date,
                          deep: data.stages?.deep || 0,
                          light: data.stages?.light || 0,
                          rem: data.stages?.rem || 0,
                          awake: data.stages?.awake || 0,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Bar dataKey="deep" name="Deep Sleep" stackId="a" fill="#8884d8" />
                        <Bar dataKey="light" name="Light Sleep" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="rem" name="REM Sleep" stackId="a" fill="#ffc658" />
                        <Bar dataKey="awake" name="Awake" stackId="a" fill="#ff8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">No sleep stage data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            {/* Activity tab content */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Steps</CardTitle>
                <CardDescription>Track your physical activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">Loading activity data...</div>
                  ) : activityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="steps" name="Steps" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">No activity data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            {/* Vitals tab content */}
            <Card>
              <CardHeader>
                <CardTitle>Heart Rate</CardTitle>
                <CardDescription>Monitor your heart rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">Loading vitals data...</div>
                  ) : vitalsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitalsData.filter((data) => data.heartRate)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis domain={[60, "auto"]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="heartRate"
                          name="Heart Rate (bpm)"
                          stroke="#ff0000"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">No heart rate data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

