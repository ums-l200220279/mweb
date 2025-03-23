"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Bell, User, Lock, Globe, Shield, Download } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and settings</p>
        </div>

        <Tabs defaultValue="profile" onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <TabsList className="flex flex-col h-auto p-0 bg-transparent">
                <TabsTrigger value="profile" className="justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="account" className="justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                  <Lock className="mr-2 h-4 w-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="preferences" className="justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                  <Globe className="mr-2 h-4 w-4" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="privacy" className="justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="data" className="justify-start px-3 py-2 h-9 data-[state=active]:bg-muted">
                  <Download className="mr-2 h-4 w-4" />
                  Data Export
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1">
              <TabsContent value="profile" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2 sm:mt-4">
                        <Button variant="outline" size="sm">
                          Change Avatar
                        </Button>
                        <Button variant="ghost" size="sm">
                          Remove Avatar
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" defaultValue="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" defaultValue="Doe" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="john.doe@example.com" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input id="dob" type="date" defaultValue="1970-01-01" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account security and login information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch id="two-factor" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sessions">Active Sessions</Label>
                          <p className="text-sm text-muted-foreground">
                            Manage devices where you're currently logged in
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Control how and when you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Email Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-test-reminders">Test Reminders</Label>
                          <Switch id="email-test-reminders" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-exercise-reminders">Exercise Reminders</Label>
                          <Switch id="email-exercise-reminders" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-results">Test Results</Label>
                          <Switch id="email-results" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-newsletter">Newsletter</Label>
                          <Switch id="email-newsletter" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Push Notifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-test-reminders">Test Reminders</Label>
                          <Switch id="push-test-reminders" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-exercise-reminders">Exercise Reminders</Label>
                          <Switch id="push-exercise-reminders" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-results">Test Results</Label>
                          <Switch id="push-results" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="push-achievements">Achievements</Label>
                          <Switch id="push-achievements" defaultChecked />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Notification Schedule</h3>
                      <div className="space-y-2">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="quiet-hours-start">Quiet Hours Start</Label>
                            <Select defaultValue="22:00">
                              <SelectTrigger id="quiet-hours-start">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="20:00">8:00 PM</SelectItem>
                                <SelectItem value="21:00">9:00 PM</SelectItem>
                                <SelectItem value="22:00">10:00 PM</SelectItem>
                                <SelectItem value="23:00">11:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quiet-hours-end">Quiet Hours End</Label>
                            <Select defaultValue="07:00">
                              <SelectTrigger id="quiet-hours-end">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="06:00">6:00 AM</SelectItem>
                                <SelectItem value="07:00">7:00 AM</SelectItem>
                                <SelectItem value="08:00">8:00 AM</SelectItem>
                                <SelectItem value="09:00">9:00 AM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Reset to Default</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Customize your app experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Display</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="theme">Theme</Label>
                            <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                          </div>
                          <Select defaultValue="system">
                            <SelectTrigger id="theme" className="w-40">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Language and Region</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="language">Language</Label>
                            <p className="text-sm text-muted-foreground">Select your preferred language</p>
                          </div>
                          <Select defaultValue="en">
                            <SelectTrigger id="language" className="w-40">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="timezone">Time Zone</Label>
                            <p className="text-sm text-muted-foreground">Set your local time zone</p>
                          </div>
                          <Select defaultValue="utc-8">
                            <SelectTrigger id="timezone" className="w-40">
                              <SelectValue placeholder="Select time zone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                              <SelectItem value="utc-7">Mountain Time (UTC-7)</SelectItem>
                              <SelectItem value="utc-6">Central Time (UTC-6)</SelectItem>
                              <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Accessibility</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="font-size">Font Size</Label>
                            <p className="text-sm text-muted-foreground">Adjust text size for better readability</p>
                          </div>
                          <Select defaultValue="medium">
                            <SelectTrigger id="font-size" className="w-40">
                              <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="x-large">Extra Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="reduced-motion">Reduced Motion</Label>
                            <p className="text-sm text-muted-foreground">Minimize animations throughout the app</p>
                          </div>
                          <Switch id="reduced-motion" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="high-contrast">High Contrast</Label>
                            <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                          </div>
                          <Switch id="high-contrast" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Reset to Default</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your data and privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Data Sharing</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="share-with-healthcare">Share with Healthcare Providers</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow your data to be shared with your healthcare team
                            </p>
                          </div>
                          <Switch id="share-with-healthcare" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="share-with-caregivers">Share with Caregivers</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow your data to be shared with designated caregivers
                            </p>
                          </div>
                          <Switch id="share-with-caregivers" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="share-for-research">Share for Research</Label>
                            <p className="text-sm text-muted-foreground">
                              Contribute anonymized data to improve cognitive health research
                            </p>
                          </div>
                          <Switch id="share-for-research" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Connected Accounts</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Google Fit</p>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Connect
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Apple Health</p>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Connect
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Electronic Health Record</p>
                            <p className="text-sm text-muted-foreground">Connected via MyChart</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Reset to Default</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>Download your data or delete your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Export Your Data</h3>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of your data in various formats. This includes your test results, exercise
                        history, and personal information.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          Export as PDF
                        </Button>
                        <Button variant="outline" size="sm">
                          Export as CSV
                        </Button>
                        <Button variant="outline" size="sm">
                          Export as JSON
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Account Deletion</h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

