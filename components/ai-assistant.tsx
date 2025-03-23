"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AIAssistant({ userType }: { userType: "patient" | "caregiver" | "doctor" }) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai" }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [...prev, { text: input, sender: "user" }])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userType }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      setMessages((prev) => [...prev, { text: data.response, sender: "ai" }])
    } catch (error) {
      console.error("Error in AI assistant:", error)
      setMessages((prev) => [...prev, { text: "Sorry, an error occurred. Please try again.", sender: "ai" }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block p-2 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              {message.text}
            </span>
          </div>
        ))}
        {isLoading && <div className="text-center">AI is thinking...</div>}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

