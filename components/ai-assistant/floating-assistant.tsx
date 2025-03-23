"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, X, Send, Maximize2, Minimize2, HelpCircle, Brain, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

type ContextInfo = {
  page: string
  pageTitle: string
  userActivity: string[]
  userProfile?: {
    name?: string
    role?: string
    cognitiveStatus?: string
    lastAssessment?: string
    lastGamePlayed?: string
  }
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm Memo, your cognitive health assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [contextInfo, setContextInfo] = useState<ContextInfo>({
    page: "",
    pageTitle: "",
    userActivity: [],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const pathname = usePathname()
  const { toast } = useToast()
  const isMobile = useMobile()

  // Update context when pathname changes
  useEffect(() => {
    updateContextInfo()
  }, [pathname])

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateContextInfo = async () => {
    try {
      // Get page title
      const pageTitle = document.title || "Memoright"

      // Get current path
      const currentPath = pathname || "/"

      // Determine page context based on path
      let pageName = "Home"
      if (currentPath.includes("/dashboard")) {
        pageName = "Dashboard"
      } else if (currentPath.includes("/brain-training")) {
        pageName = "Brain Training"
      } else if (currentPath.includes("/mmse-test")) {
        pageName = "MMSE Test"
      } else if (currentPath.includes("/profile")) {
        pageName = "Profile"
      } else if (currentPath.includes("/settings")) {
        pageName = "Settings"
      }

      // Get user activity (in a real app, this would come from a user activity tracking service)
      const userActivity = []

      // In a real app, we would fetch the user profile from an API
      // For now, we'll use mock data
      const userProfile = {
        name: "John Doe",
        role: "patient",
        cognitiveStatus: "Mild Cognitive Impairment",
        lastAssessment: "2023-03-15",
        lastGamePlayed: "Working Memory Challenge",
      }

      setContextInfo({
        page: pageName,
        pageTitle,
        userActivity,
        userProfile,
      })

      // Add system message with context if this is a new conversation
      if (messages.length === 1 && messages[0].id === "welcome") {
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          role: "system",
          content: `You are Memo, an AI assistant for the Memoright cognitive health platform. The user is currently on the ${pageName} page. Their name is ${userProfile.name} and they have been diagnosed with ${userProfile.cognitiveStatus}. Their last assessment was on ${userProfile.lastAssessment} and they last played ${userProfile.lastGamePlayed}.`,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, systemMessage])
      }
    } catch (error) {
      console.error("Error updating context info:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    try {
      setIsLoading(true)

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")

      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate a response
      await simulateResponse(input, contextInfo)
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const simulateResponse = async (userInput: string, context: ContextInfo) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let responseContent = ""

    // Generate contextual responses based on user input and page context
    const input = userInput.toLowerCase()

    if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      responseContent = `Hello! I'm Memo, your cognitive health assistant. I see you're on the ${context.page} page. How can I help you today?`
    } else if (input.includes("help")) {
      responseContent = `I can help you with various aspects of the Memoright platform. You can ask me about:
      
- Cognitive assessments and tests
- Brain training games and exercises
- Understanding your cognitive health scores
- Recommendations for improving cognitive health
- Navigating the platform
- Setting reminders for exercises or medications

What would you like to know more about?`
    } else if (input.includes("game") || input.includes("brain training") || input.includes("exercise")) {
      responseContent = `Memoright offers several cognitive training games designed to exercise different aspects of your brain:

1. **Number Memory Game** - Tests and improves your short-term memory for numbers
2. **Word Association Game** - Enhances verbal fluency and semantic memory
3. **Pattern Recognition Game** - Improves visual processing and pattern detection
4. **Spatial Memory Game** - Strengthens spatial memory and visual-spatial skills
5. **Working Memory Challenge** - Exercises your working memory with the n-back task

Based on your profile and recent activity, I'd recommend trying the Working Memory Challenge, as it targets areas that could benefit from more training according to your last assessment.

Would you like me to explain how any of these games work in more detail?`
    } else if (input.includes("mmse") || input.includes("test") || input.includes("assessment")) {
      responseContent = `The Mini-Mental State Examination (MMSE) is a 30-point questionnaire used extensively in clinical and research settings to measure cognitive impairment.

Your last MMSE assessment was on ${context.userProfile?.lastAssessment || "N/A"}, and it indicated ${context.userProfile?.cognitiveStatus || "N/A"}.

The MMSE tests five areas of cognitive function:
- Orientation
- Registration
- Attention & Calculation
- Recall
- Language

Would you like to schedule another assessment, or would you like more information about what your results mean?`
    } else if (input.includes("score") || input.includes("result") || input.includes("performance")) {
      responseContent = `Based on your recent activities and assessments, here's a summary of your cognitive performance:

- Overall Cognitive Status: ${context.userProfile?.cognitiveStatus || "N/A"}
- Last Assessment Date: ${context.userProfile?.lastAssessment || "N/A"}
- Last Game Played: ${context.userProfile?.lastGamePlayed || "N/A"}

Your strongest cognitive domains are attention and language processing, while memory recall shows room for improvement.

I recommend focusing on memory exercises, particularly the Number Memory Game and Spatial Memory Game, to strengthen these areas.

Would you like to see more detailed analytics or get personalized recommendations?`
    } else if (input.includes("remind") || input.includes("schedule") || input.includes("calendar")) {
      responseContent = `I can help you set reminders for:

- Daily cognitive exercises
- Medication schedules
- Upcoming appointments
- Assessment schedules

What type of reminder would you like to set up?`
    } else if (input.includes("profile") || input.includes("account") || input.includes("settings")) {
      responseContent = `You can manage your profile and account settings in the Profile and Settings pages.

In your profile, you can update:
- Personal information
- Health information
- Preferences for cognitive exercises
- Notification settings

Would you like me to navigate you to your profile page?`
    } else if (
      context.page === "Brain Training" &&
      (input.includes("how") || input.includes("play") || input.includes("instruction"))
    ) {
      responseContent = `You're currently on the Brain Training page. Here's how to get started:

1. Choose a game from the available options
2. Select your preferred difficulty level
3. Read the instructions carefully before starting
4. Complete the game to receive a cognitive assessment
5. Review your performance and recommendations

Each game targets different cognitive domains, so it's beneficial to try a variety of games for comprehensive training.

Is there a specific game you'd like instructions for?`
    } else if (
      context.page === "MMSE Test" &&
      (input.includes("how") || input.includes("take") || input.includes("instruction"))
    ) {
      responseContent = `You're currently on the MMSE Test page. Here's what you need to know:

The Mini-Mental State Examination consists of 30 questions that assess various aspects of cognition:

- Orientation to time and place (10 points)
- Registration of three words (3 points)
- Attention and calculation (5 points)
- Recall of three words (3 points)
- Language (8 points)
- Visual construction (1 point)

Answer each question to the best of your ability. The test takes about 10-15 minutes to complete.

Would you like me to explain any specific section in more detail?`
    } else if (
      context.page === "Dashboard" &&
      (input.includes("explain") || input.includes("understand") || input.includes("mean"))
    ) {
      responseContent = `You're currently on the Dashboard page, which provides an overview of your cognitive health.

Here's what the different sections mean:

- **Cognitive Score Chart**: Shows your performance across different cognitive domains over time
- **Recent Activities**: Lists your recent assessments and brain training sessions
- **Upcoming Appointments**: Displays any scheduled appointments with healthcare providers
- **Recommendations**: Personalized suggestions based on your cognitive profile

The color coding indicates performance levels:
- Green: Strong performance
- Yellow: Average performance
- Red: Areas that need improvement

Is there a specific section you'd like me to explain in more detail?`
    } else {
      responseContent = `I understand you're asking about "${userInput}". While I'm designed to help with cognitive health and the Memoright platform, I might not have all the specific information you're looking for.

You're currently on the ${context.page} page. Is there something specific about this page or about cognitive health that I can help you with?

You can ask me about:
- Cognitive assessments and brain training games
- Understanding your cognitive scores
- Recommendations for cognitive health
- Navigating the Memoright platform
- Setting reminders for exercises or medications`
    }

    // Add assistant response
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm Memo, your cognitive health assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ])
    updateContextInfo()
  }

  return (
    <>
      {/* Floating button */}
      <Button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 rounded-full p-3 shadow-lg" size="icon">
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={cn("sm:max-w-[425px]", isExpanded && "sm:max-w-[700px] sm:h-[80vh]")}>
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/ai-assistant-avatar.png" alt="Memo" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Brain className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle>Memo</DialogTitle>
                <DialogDescription>Your cognitive health assistant</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleExpand} className="h-8 w-8">
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Context info */}
          <div className="bg-muted text-muted-foreground text-xs rounded-md p-2 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>
              Current page: <span className="font-medium">{contextInfo.page}</span>
              {contextInfo.userProfile &&
                ` • ${contextInfo.userProfile.name} (${contextInfo.userProfile.cognitiveStatus})`}
            </span>
          </div>

          {/* Messages */}
          <ScrollArea className={cn("pr-4", isExpanded ? "h-[calc(80vh-220px)]" : "h-[300px]")}>
            <div className="flex flex-col gap-4">
              {messages
                .filter((m) => m.role !== "system")
                .map((message) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3 text-sm", message.role === "user" ? "flex-row-reverse" : "flex-row")}
                  >
                    <Avatar className="h-8 w-8 mt-0.5">
                      {message.role === "assistant" ? (
                        <>
                          <AvatarImage src="/ai-assistant-avatar.png" alt="Memo" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Brain className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/user-avatar.png" alt="You" />
                          <AvatarFallback className="bg-secondary">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 max-w-[75%]",
                        message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground",
                      )}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                      <div
                        className={cn(
                          "text-xs mt-1",
                          message.role === "assistant" ? "text-muted-foreground" : "text-primary-foreground/80",
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[60px]"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm" onClick={clearConversation} className="text-xs h-7 px-2">
                Clear conversation
              </Button>
              <div className="text-xs text-muted-foreground">Powered by Memoright AI</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

