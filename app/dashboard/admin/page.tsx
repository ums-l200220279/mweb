"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Activity, Users, Bell, FileText, Settings, Database, Shield, Server } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import SystemHealth from "@/components/dashboard/system-health"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleNotificationClick = () => {
    toast({
      title: "System notifications",
      description: "You have 2 unread system alerts",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">System overview and management for Wednesday, March 14</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={handleNotificationClick}>
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              2
            </span>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/admin/settings">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin User" />
            <AvatarFallback>AU</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500 font-medium">↑ 12%</span> from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">435</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500 font-medium">↑ 5%</span> from last hour
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.7%</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500 font-medium">↑ 0.2%</span> from yesterday
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-2">All systems secure</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <SystemHealth />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>System Usage</CardTitle>
                <CardDescription>User activity over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  System usage chart will appear here
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown by role and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                  User distribution chart will appear here
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Events</CardTitle>
              <CardDescription>Recent system activities and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    event: "Database Backup Completed",
                    timestamp: "Today, 03:00 AM",
                    status: "success",
                    details: "Automatic daily backup completed successfully",
                    icon: <Database className="h-4 w-4" />,
                  },
                  {
                    event: "System Update Applied",
                    timestamp: "Yesterday, 11:30 PM",
                    status: "success",
                    details: "Version 2.4.1 update applied successfully",
                    icon: <Server className="h-4 w-4" />,
                  },
                  {
                    event: "Unusual Login Activity",
                    timestamp: "Yesterday, 2:15 PM",
                    status: "warning",
                    details: "Multiple failed login attempts for admin account",
                    icon: <Shield className="h-4 w-4" />,
                  },
                  {
                    event: "High CPU Usage Detected",
                    timestamp: "Yesterday, 10:45 AM",
                    status: "warning",
                    details: "CPU usage exceeded 85% for more than 10 minutes",
                    icon: <Activity className="h-4 w-4" />,
                  },
                  {
                    event: "New User Registration Spike",
                    timestamp: "Mar 12, 2025, 3:30 PM",
                    status: "info",
                    details: "50+ new user registrations in one hour",
                    icon: <Users className="h-4 w-4" />,
                  },
                ].map((event, i) => (
                  <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                    <div
                      className={`p-2 rounded-full ${
                        event.status === "success"
                          ? "bg-green-100"
                          : event.status === "warning"
                            ? "bg-amber-100"
                            : "bg-blue-100"
                      }`}
                    >
                      {event.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.event}</h4>
                        <Badge
                          variant={
                            event.status === "success"
                              ? "outline"
                              : event.status === "warning"
                                ? "default"
                                : "secondary"
                          }
                          className={event.status === "success" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {event.status === "success" ? "Success" : event.status === "warning" ? "Warning" : "Info"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All System Events
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search users..." className="w-[300px]" />
                    <Button variant="outline" size="sm">
                      Search
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b">
                    <div>User</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Last Active</div>
                    <div>Created</div>
                    <div>Actions</div>
                  </div>
                  {[
                    {
                      name: "John Doe",
                      email: "john@example.com",
                      role: "Patient",
                      status: "active",
                      lastActive: "Today, 9:30 AM",
                      created: "Jan 15, 2025",
                      image: "/placeholder.svg?height=32&width=32",
                    },
                    {
                      name: "Dr. Sarah Smith",
                      email: "sarah@example.com",
                      role: "Doctor",
                      status: "active",
                      lastActive: "Today, 10:15 AM",
                      created: "Dec 10, 2024",
                      image: "/placeholder.svg?height=32&width=32",
                    },
                    {
                      name: "Mary Johnson",
                      email: "mary@example.com",
                      role: "Caregiver",
                      status: "active",
                      lastActive: "Yesterday, 3:45 PM",
                      created: "Feb 5, 2025",
                      image: "/placeholder.svg?height=32&width=32",
                    },
                    {
                      name: "Robert Wilson",
                      email: "robert@example.com",
                      role: "Admin",
                      status: "active",
                      lastActive: "Today, 8:20 AM",
                      created: "Nov 20, 2024",
                      image: "/placeholder.svg?height=32&width=32",
                    },
                    {
                      name: "Emily Davis",
                      email: "emily@example.com",
                      role: "Patient",
                      status: "inactive",
                      lastActive: "Mar 1, 2025",
                      created: "Jan 25, 2025",
                      image: "/placeholder.svg?height=32&width=32",
                    },
                  ].map((user, i) => (
                    <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b items-center">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div>{user.role}</div>
                      <div>
                        <Badge
                          variant={user.status === "active" ? "outline" : "secondary"}
                          className={user.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div>{user.lastActive}</div>
                      <div>{user.created}</div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Disable
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <div className="text-sm text-muted-foreground">Page 1 of 10</div>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>System security status and recent events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-green-600">Secure</div>
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">2FA enabled for all admin accounts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Data Encryption</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-green-600">Active</div>
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">AES-256 encryption for all sensitive data</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-green-600">Compliant</div>
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">HIPAA and GDPR compliant</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Recent Security Events</h3>
                <div className="space-y-4">
                  {[
                    {
                      event: "Failed Login Attempt",
                      ip: "192.168.1.105",
                      timestamp: "Today, 11:42 AM",
                      details: "3 failed attempts for user admin@example.com",
                      severity: "medium",
                    },
                    {
                      event: "Password Changed",
                      ip: "192.168.1.42",
                      timestamp: "Today, 10:15 AM",
                      details: "Password changed for user doctor@example.com",
                      severity: "low",
                    },
                    {
                      event: "New Admin User Created",
                      ip: "192.168.1.1",
                      timestamp: "Yesterday, 3:30 PM",
                      details: "New admin account created: support@example.com",
                      severity: "high",
                    },
                  ].map((event, i) => (
                    <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          event.severity === "high"
                            ? "bg-red-500"
                            : event.severity === "medium"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{event.event}</h4>
                          <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">IP: {event.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Security Audit Log
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Server and application performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">CPU Usage</h3>
                    <span className="text-sm">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Memory Usage</h3>
                    <span className="text-sm">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Disk Space</h3>
                    <span className="text-sm">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Network Load</h3>
                    <span className="text-sm">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">System Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Server Version</span>
                    <span>Memoright v2.4.1</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Operating System</span>
                    <span>Ubuntu 24.04 LTS</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Database</span>
                    <span>PostgreSQL 16.2</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Last Backup</span>
                    <span>Today, 03:00 AM</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Uptime</span>
                    <span>15 days, 7 hours</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">System Logs</Button>
              <Button>Run Diagnostics</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button size="lg" className="h-24" asChild>
          <Link href="/dashboard/admin/users">
            <Users className="mr-2 h-6 w-6" />
            User Management
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/admin/security">
            <Shield className="mr-2 h-6 w-6" />
            Security Center
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/admin/system">
            <Server className="mr-2 h-6 w-6" />
            System Settings
          </Link>
        </Button>

        <Button size="lg" variant="outline" className="h-24" asChild>
          <Link href="/dashboard/admin/reports">
            <FileText className="mr-2 h-6 w-6" />
            Generate Reports
          </Link>
        </Button>
      </div>
    </div>
  )
}

