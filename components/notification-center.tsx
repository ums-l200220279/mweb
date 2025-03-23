"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Notification, NotificationPriority } from "@/types/notifications"
import { formatDistanceToNow } from "date-fns"

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch notifications when popover opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Poll for new notifications every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        fetchUnreadCount()
      }
    }, 60000)

    // Initial fetch
    fetchUnreadCount()

    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("/api/notifications?unreadOnly=true")
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.notifications.length)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, read: true } : notification,
          ),
        )
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllRead: true }),
      })

      if (response.ok) {
        setNotifications(
          notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const updatedNotifications = notifications.filter((notification) => notification.id !== notificationId)
        setNotifications(updatedNotifications)

        // Update unread count if needed
        const deletedNotification = notifications.find((n) => n.id === notificationId)
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(Math.max(0, unreadCount - 1))
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500"
      case "HIGH":
        return "bg-orange-500"
      case "NORMAL":
        return "bg-blue-500"
      case "LOW":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
            <CardDescription>
              {isLoading
                ? "Loading notifications..."
                : notifications.length === 0
                  ? "No notifications"
                  : `You have ${unreadCount} unread notifications`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b last:border-b-0 ${!notification.read ? "bg-muted/50" : ""}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <Badge className={`mr-2 ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </Badge>
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-2 flex justify-center">
            <Button
              variant="link"
              size="sm"
              className="text-xs"
              onClick={() => (window.location.href = "/notifications")}
            >
              View all notifications
            </Button>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

