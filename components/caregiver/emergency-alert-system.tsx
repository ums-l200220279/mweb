"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, PhoneCall, User, MapPin, Pill } from "lucide-react"

const initialAlerts = [
  {
    id: 1,
    patient: "John Doe",
    type: "fall",
    location: "Bathroom",
    time: "10 minutes ago",
    description: "Possible fall detected in the bathroom. Immediate check required.",
    severity: "high",
    isExpanded: false,
  },
  {
    id: 2,
    patient: "Mary Smith",
    type: "medication",
    location: "Kitchen",
    time: "30 minutes ago",
    description: "Morning medication (Rivastigmine) has not been taken yet.",
    severity: "medium",
    isExpanded: false,
  },
  {
    id: 3,
    patient: "Robert Johnson",
    type: "wandering",
    location: "Outside",
    time: "45 minutes ago",
    description: "Patient has left the designated safe area. Current location is being tracked.",
    severity: "high",
    isExpanded: false,
  },
]

export default function EmergencyAlertSystem() {
  const [alerts, setAlerts] = useState(initialAlerts)

  const toggleExpand = (id: number) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, isExpanded: !alert.isExpanded } : alert)))
  }

  const resolveAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "fall":
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      case "medication":
        return <Pill className="h-6 w-6 text-amber-600" />
      case "wandering":
        return <User className="h-6 w-6 text-blue-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-red-600" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-amber-200 bg-amber-50"
      case "low":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-slate-200 bg-slate-50"
    }
  }

  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Active Alerts</h3>
            <p className="text-slate-500 mt-2">All patients are currently safe and accounted for.</p>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert) => (
          <Card key={alert.id} className={getAlertColor(alert.severity)}>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3 rounded-full ${alert.severity === "high" ? "bg-red-100" : alert.severity === "medium" ? "bg-amber-100" : "bg-blue-100"}`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h3
                        className={`font-medium text-lg ${alert.severity === "high" ? "text-red-800" : alert.severity === "medium" ? "text-amber-800" : "text-blue-800"}`}
                      >
                        {alert.type === "fall"
                          ? "Fall Detected"
                          : alert.type === "medication"
                            ? "Medication Alert"
                            : "Wandering Alert"}
                        : {alert.patient}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`mt-1 sm:mt-0 ${
                          alert.severity === "high"
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : alert.severity === "medium"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        }`}
                      >
                        {alert.severity === "high"
                          ? "High Priority"
                          : alert.severity === "medium"
                            ? "Medium Priority"
                            : "Low Priority"}
                      </Badge>
                    </div>
                    <p
                      className={`text-sm mt-1 ${alert.severity === "high" ? "text-red-700" : alert.severity === "medium" ? "text-amber-700" : "text-blue-700"}`}
                    >
                      {alert.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{alert.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        <span>Location: {alert.location}</span>
                      </div>
                    </div>

                    {alert.isExpanded && (
                      <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
                        <h4 className="font-medium mb-2">Response Options:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`check-${alert.id}`}
                              name={`response-${alert.id}`}
                              className="mr-2"
                            />
                            <label htmlFor={`check-${alert.id}`}>I'll check on the patient</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`call-${alert.id}`}
                              name={`response-${alert.id}`}
                              className="mr-2"
                            />
                            <label htmlFor={`call-${alert.id}`}>I'm calling the patient</label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`emergency-${alert.id}`}
                              name={`response-${alert.id}`}
                              className="mr-2"
                            />
                            <label htmlFor={`emergency-${alert.id}`}>Contacting emergency services</label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {alert.severity === "high" && (
                    <Button variant="destructive" className="flex items-center">
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Contact Emergency
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className={`${
                      alert.severity === "high"
                        ? "border-red-200 text-red-700 hover:bg-red-100"
                        : alert.severity === "medium"
                          ? "border-amber-200 text-amber-700 hover:bg-amber-100"
                          : "border-blue-200 text-blue-700 hover:bg-blue-100"
                    }`}
                    onClick={() => toggleExpand(alert.id)}
                  >
                    {alert.isExpanded ? "Hide Options" : "Respond"}
                  </Button>
                  <Button
                    variant="outline"
                    className={`${
                      alert.severity === "high"
                        ? "border-red-200 text-red-700 hover:bg-red-100"
                        : alert.severity === "medium"
                          ? "border-amber-200 text-amber-700 hover:bg-amber-100"
                          : "border-blue-200 text-blue-700 hover:bg-blue-100"
                    }`}
                    onClick={() => resolveAlert(alert.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

