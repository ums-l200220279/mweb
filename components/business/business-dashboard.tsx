"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, LineChart } from "@/components/ui/chart"
import { Users, DollarSign, TrendingUp, UserMinus } from "lucide-react"

// Mock data for demonstration purposes
const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 4200 },
  { name: "Mar", revenue: 4500 },
  { name: "Apr", revenue: 4800 },
  { name: "May", revenue: 5100 },
  { name: "Jun", revenue: 5400 },
  { name: "Jul", revenue: 5700 },
  { name: "Aug", revenue: 6000 },
  { name: "Sep", revenue: 6300 },
  { name: "Oct", revenue: 6600 },
  { name: "Nov", revenue: 6900 },
  { name: "Dec", revenue: 7200 },
]

const userGrowthData = [
  { name: "Jan", users: 120 },
  { name: "Feb", users: 150 },
  { name: "Mar", users: 200 },
  { name: "Apr", users: 250 },
  { name: "May", users: 300 },
  { name: "Jun", users: 350 },
  { name: "Jul", users: 400 },
  { name: "Aug", users: 450 },
  { name: "Sep", users: 500 },
  { name: "Oct", users: 550 },
  { name: "Nov", users: 600 },
  { name: "Dec", users: 650 },
]

const planDistributionData = [
  { name: "Free", value: 45 },
  { name: "Professional", value: 30 },
  { name: "Enterprise", value: 15 },
  { name: "Research", value: 10 },
]

const churnRateData = [
  { name: "Jan", rate: 2.1 },
  { name: "Feb", rate: 2.0 },
  { name: "Mar", rate: 1.9 },
  { name: "Apr", rate: 1.8 },
  { name: "May", rate: 1.7 },
  { name: "Jun", rate: 1.6 },
  { name: "Jul", rate: 1.5 },
  { name: "Aug", rate: 1.4 },
  { name: "Sep", rate: 1.3 },
  { name: "Oct", rate: 1.2 },
  { name: "Nov", rate: 1.1 },
  { name: "Dec", rate: 1.0 },
]

export function BusinessDashboard() {
  const [timeRange, setTimeRange] = useState("yearly")

  // Calculate summary metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalUsers = userGrowthData[userGrowthData.length - 1].users
  const averageChurnRate = churnRateData.reduce((sum, item) => sum + item.rate, 0) / churnRateData.length
  const monthlyRecurringRevenue = revenueData[revenueData.length - 1].revenue

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Business Dashboard</h2>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">+15.3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <UserMinus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageChurnRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">-0.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${monthlyRecurringRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+4.5% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly revenue over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart
                  data={revenueData}
                  index="name"
                  categories={["revenue"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  className="h-80"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly active users over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={userGrowthData}
                  index="name"
                  categories={["users"]}
                  colors={["green"]}
                  valueFormatter={(value) => value.toString()}
                  className="h-80"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue tab content would go here */}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Users tab content would go here */}
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          {/* Retention tab content would go here */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

