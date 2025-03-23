import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notificationService } from "@/lib/notifications/notification-service"

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const url = new URL(req.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const unreadOnly = url.searchParams.get("unreadOnly") === "true"

    let result
    if (unreadOnly) {
      const notifications = await notificationService.getUnreadNotifications(userId)
      result = { notifications, total: notifications.length }
    } else {
      result = await notificationService.getNotifications(userId, page, limit)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { notificationId, markAllRead } = body

    if (markAllRead) {
      const count = await notificationService.markAllAsRead(userId)
      return NextResponse.json({ success: true, count })
    } else if (notificationId) {
      const notification = await notificationService.markAsRead(notificationId)
      return NextResponse.json({ success: true, notification })
    } else {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const notificationId = url.searchParams.get("id")

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 })
    }

    await notificationService.deleteNotification(notificationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}

