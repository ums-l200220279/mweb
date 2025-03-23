import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, FileText, Download } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function ReportsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Messages & Caregiver Notes</CardTitle>
          <CardDescription>Recent communications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium">New message from Jane Smith's caregiver</h4>
                <p className="text-sm text-muted-foreground">Regarding medication schedule changes</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-medium">Updated care plan documentation</h4>
                <p className="text-sm text-muted-foreground">For patient Robert Johnson</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reports & Documentation</CardTitle>
          <CardDescription>Generate and manage reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cognitive">Cognitive Assessment Report</SelectItem>
                  <SelectItem value="progress">Progress Report</SelectItem>
                  <SelectItem value="treatment">Treatment Plan</SelectItem>
                  <SelectItem value="summary">Patient Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">
              <Download className="mr-2 h-4 w-4" /> Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

