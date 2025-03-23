"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Brain, Clock, Users } from "lucide-react"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4 pt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">435</div>
              <p className="text-xs text-muted-foreground">+5% from last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24m 13s</div>
              <p className="text-xs text-muted-foreground">+7% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cognitive Tests</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">573</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[200px] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                Chart Placeholder
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user activities across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">User completed cognitive assessment</p>
                      <p className="text-sm text-muted-foreground">{i * 10} minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Detailed analytics and usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex items-center justify-center text-muted-foreground">
            Analytics content will appear here
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports" className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate and view system reports</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex items-center justify-center text-muted-foreground">
            Reports content will appear here
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px] flex items-center justify-center text-muted-foreground">
            Notifications content will appear here
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

