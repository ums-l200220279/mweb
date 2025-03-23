"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, X } from "lucide-react"

export default function CustomerSupportChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([{ text: "Hello! How can I assist you today?", sender: "bot" }])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }])
      setInput("")
      // Here you would typically send the message to your chatbot API
      // and then add the response to the messages
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "Thank you for your message. A support agent will get back to you soon.", sender: "bot" },
        ])
      }, 1000)
    }
  }

  return (
    <>
      {!isOpen && (
        <Button className="fixed bottom-4 right-4 rounded-full p-4" onClick={() => setIsOpen(true)}>
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 w-80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Customer Support</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="h-64 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-2 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                <span
                  className={`inline-block rounded-lg px-3 py-2 ${
                    message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.text}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  )
}

