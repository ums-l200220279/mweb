"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

const notifications = [
  {
    id: 1,
    title: "New MMSE Test Result",
    description: "Patient John Doe completed MMSE test with score 24/30",
    time: "5 minutes ago",
    isUrgent: true,
  },
  {
    id: 2,
    title: "Appointment Reminder",
    description: "Video consultation with Sarah Smith at 2:00 PM today",
    time: "30 minutes ago",
    isUrgent: false,
  },
  {
    id: 3,
    title: "Cognitive Decline Alert",
    description: "Patient Robert Johnson shows significant decline in memory function",
    time: "2 hours ago",
    isUrgent: true,
  },
  {
    id: 4,
    title: "New Message from Caregiver",
    description: "Emily Davis (caregiver) sent a message regarding medication schedule",
    time: "3 hours ago",
    isUrgent: false,
  },
  {
    id: 5,
    title: "Assessment Due Reminder",
    description: "Monthly assessment for patient Michael Brown is due in 2 days",
    time: "5 hours ago",
    isUrgent: false,
  },
]

export default function NotificationCenter() {
  const [unreadCount, setUnreadCount] = useState(notifications.length)

  const handleNotificationClick = (id: number) => {
    // In a real app, you would mark the notification as read here
    setUnreadCount((prevCount) => Math.max(0, prevCount - 1))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="cursor-pointer"
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className={`flex items-start gap-2 p-2 ${notification.isUrgent ? "bg-red-50" : ""}`}>
                <div className={`mt-1 h-2 w-2 rounded-full ${notification.isUrgent ? "bg-red-500" : "bg-blue-500"}`} />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <p className="text-xs text-muted-foreground">{notification.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center text-center">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

