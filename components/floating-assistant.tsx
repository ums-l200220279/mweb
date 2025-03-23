"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useFeatureFlag } from "@/hooks/use-feature-flag"
import { useUser } from "@/hooks/use-user"
import { useTelemetry } from "@/hooks/use-telemetry"
import { useAccessibility } from "@/hooks/use-accessibility"

import {
  Bot,
  X,
  Send,
  Minimize2,
  Maximize2,
  MessageSquare,
  HelpCircle,
  Settings,
  Sparkles,
  Lightbulb,
  Brain,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  Loader2,
} from "lucide-react"

// Types for the assistant
interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  feedback?: "positive" | "negative"
}

interface AssistantAction {
  type: string
  payload: any
  label: string
}

interface AssistantContext {
  page: string
  user?: {
    id: string
    name: string
    role: string
    preferences: Record<string, any>
  }
  recentActivities?: Array<{
    type: string
    timestamp: Date
    details: any
  }>
  cognitiveStatus?: {
    lastAssessment: Date
    score: number
    trend: "improving" | "stable" | "declining"
  }
}

interface SuggestionCategory {
  id: string
  label: string
  icon: React.ReactNode
  suggestions: string[]
}

// Helper function to get page context
const getPageContext = (pathname: string): string => {
  const routes: Record<string, string> = {
    "/": "Home page - Overview of cognitive health dashboard",
    "/dashboard": "Dashboard - Personal cognitive health metrics and trends",
    "/games": "Cognitive Games - List of available cognitive assessment games",
    "/games/memory": "Memory Game - Test and improve your memory skills",
    "/games/attention": "Attention Game - Test and improve your attention skills",
    "/games/processing": "Processing Speed Game - Test and improve your processing speed",
    "/games/executive": "Executive Function Game - Test and improve your executive function",
    "/games/language": "Language Skills Game - Test and improve your language skills",
    "/games/mmse": "MMSE Test - Mini-Mental State Examination",
    "/profile": "User Profile - Personal information and preferences",
    "/reports": "Reports - Detailed cognitive assessment reports",
    "/settings": "Settings - Application preferences and configuration",
    "/help": "Help Center - Guides and support resources",
  }

  return routes[pathname] || `Page at ${pathname} - Memoright cognitive health application`
}

// Suggestion categories
const suggestionCategories: SuggestionCategory[] = [
  {
    id: "general",
    label: "General",
    icon: <HelpCircle className="h-4 w-4" />,
    suggestions: [
      "How does Memoright help with cognitive health?",
      "What games are available for assessment?",
      "How often should I take cognitive tests?",
      "Can you explain my latest results?",
      "What's the difference between the games?",
    ],
  },
  {
    id: "games",
    label: "Games",
    icon: <Brain className="h-4 w-4" />,
    suggestions: [
      "How do I play the memory game?",
      "Which game is best for attention training?",
      "What is the MMSE test measuring?",
      "How long does each game take to complete?",
      "Can I practice before taking an assessment?",
    ],
  },
  {
    id: "health",
    label: "Health",
    icon: <Activity className="h-4 w-4" />,
    suggestions: [
      "What lifestyle changes improve cognitive health?",
      "How does sleep affect cognitive function?",
      "What foods are good for brain health?",
      "How does exercise impact cognitive decline?",
      "What are early signs of cognitive impairment?",
    ],
  },
  {
    id: "technical",
    label: "Technical",
    icon: <Settings className="h-4 w-4" />,
    suggestions: [
      "How do I export my data?",
      "Can I share my results with my doctor?",
      "How to change notification settings?",
      "Is my health data secure?",
      "How to connect wearable devices?",
    ],
  },
]

// System prompt for the assistant
const systemPrompt = `
You are Memo, an AI assistant for Memoright, an application focused on cognitive health monitoring and early dementia detection.

Your primary goals are to:
1. Help users understand their cognitive health metrics and test results
2. Guide users through cognitive assessment games and exercises
3. Provide evidence-based information about cognitive health, memory, and dementia
4. Assist with technical questions about using the Memoright application
5. Offer supportive and empathetic responses to health concerns

Important guidelines:
- Be concise and clear in your responses
- For medical questions, emphasize that you're not a medical professional and encourage users to consult healthcare providers
- Maintain a supportive, encouraging tone
- Respect user privacy and confidentiality
- When discussing cognitive decline or dementia, be sensitive and compassionate
- Provide actionable suggestions when appropriate
- Cite scientific sources when discussing health information

You have access to the user's current page context and basic profile information to provide relevant assistance.
`

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedTab, setSelectedTab] = useState("chat")
  const [availableActions, setAvailableActions] = useState<AssistantAction[]>([])
  const [context, setContext] = useState<AssistantContext | null>(null)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [speechRecognition, setSpeechRecognition] = useState<any>(null)
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { toast } = useToast()
  const assistantEnabled = useFeatureFlag("ai-assistant")
  const { user } = useUser()
  const { trackEvent } = useTelemetry()
  const { preferences } = useAccessibility()

  // AI Chat integration
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error, append, reload, stop } =
    useChat({
      api: "/api/assistant",
      initialMessages: [
        {
          id: "system-1",
          role: "system",
          content: systemPrompt,
        },
      ],
      body: {
        context,
      },
      onResponse: () => {
        setIsGeneratingResponse(true)
        trackEvent("assistant_response_started")
      },
      onFinish: () => {
        setIsGeneratingResponse(false)
        trackEvent("assistant_response_completed")

        // Auto-scroll to bottom
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      },
    })

  // Initialize context based on current page
  useEffect(() => {
    if (pathname) {
      setContext((prevContext) => ({
        ...prevContext,
        page: getPageContext(pathname),
      }))
    }
  }, [pathname])

  // Initialize user context
  useEffect(() => {
    if (user) {
      setContext((prevContext) => ({
        ...prevContext,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          preferences: user.preferences || {},
        },
      }))
    }
  }, [user])

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSpeechSynthesis(window.speechSynthesis)

      // Initialize speech recognition if available
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        setSpeechRecognition(new SpeechRecognition())
      }
    }

    return () => {
      if (speechSynthesis) {
        speechSynthesis.cancel()
      }
      if (speechRecognition) {
        speechRecognition.abort()
      }
    }
  }, [])

  // Configure speech recognition
  useEffect(() => {
    if (speechRecognition) {
      speechRecognition.continuous = false
      speechRecognition.interimResults = false
      speechRecognition.lang = "en-US"

      speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        handleInputChange({ target: { value: transcript } } as any)
        setIsListening(false)
      }

      speechRecognition.onerror = () => {
        setIsListening(false)
        toast({
          title: "Speech Recognition Error",
          description: "There was an error with speech recognition. Please try again.",
          variant: "destructive",
        })
      }

      speechRecognition.onend = () => {
        setIsListening(false)
      }
    }
  }, [speechRecognition, handleInputChange, toast])

  // Track when assistant is opened
  useEffect(() => {
    if (isOpen) {
      trackEvent("assistant_opened")
    } else {
      trackEvent("assistant_closed")
    }
  }, [isOpen, trackEvent])

  // Handle actions based on assistant responses
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === "assistant") {
      // Parse potential actions from the message
      // This is a simplified implementation - in a real app, you might have a more structured way
      // to communicate actions between the assistant and the UI
      const actionMatches = lastMessage.content.match(/\[ACTION:([^\]]+)\]/g)
      if (actionMatches) {
        const newActions = actionMatches.map((match) => {
          const actionData = match.replace(/\[ACTION:|ACTION:|ACTION\]|\]/g, "").trim()
          try {
            const parsed = JSON.parse(actionData)
            return {
              type: parsed.type,
              payload: parsed.payload,
              label: parsed.label || parsed.type,
            }
          } catch (e) {
            return {
              type: "unknown",
              payload: actionData,
              label: "Perform action",
            }
          }
        })

        setAvailableActions(newActions)
      } else {
        setAvailableActions([])
      }
    }
  }, [messages])

  // Handle text-to-speech
  const speakText = (text: string) => {
    if (speechSynthesis) {
      // Cancel any ongoing speech
      speechSynthesis.cancel()

      // Clean the text (remove markdown, code blocks, etc.)
      const cleanText = text
        .replace(/```[\s\S]*?```/g, "Code snippet omitted in speech.")
        .replace(/\[.*?\]$$.*?$$/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#{1,6}\s?(.*)/g, "$1")
        .replace(/\[ACTION:.*?\]/g, "")
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanText)

      // Set voice preferences if available
      const voices = speechSynthesis.getVoices()
      if (voices.length > 0) {
        // Try to find a female voice for the assistant
        const femaleVoice = voices.find(
          (voice) =>
            voice.name.includes("Female") ||
            voice.name.includes("female") ||
            voice.name.includes("Samantha") ||
            voice.name.includes("Google UK English Female"),
        )

        if (femaleVoice) {
          utterance.voice = femaleVoice
        }
      }

      // Adjust speech rate and pitch based on accessibility preferences
      if (preferences) {
        if (preferences.speechRate) {
          utterance.rate = preferences.speechRate
        }
        if (preferences.speechPitch) {
          utterance.pitch = preferences.speechPitch
        }
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => {
        setIsSpeaking(false)
        toast({
          title: "Speech Synthesis Error",
          description: "There was an error with text-to-speech. Please try again.",
          variant: "destructive",
        })
      }

      speechSynthesis.speak(utterance)
    } else {
      toast({
        title: "Text-to-Speech Unavailable",
        description: "Your browser does not support text-to-speech functionality.",
        variant: "destructive",
      })
    }
  }

  // Start speech recognition
  const startListening = () => {
    if (speechRecognition) {
      try {
        speechRecognition.start()
        setIsListening(true)
      } catch (error) {
        toast({
          title: "Speech Recognition Error",
          description: "Could not start speech recognition. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser does not support speech recognition functionality.",
        variant: "destructive",
      })
    }
  }

  // Stop speech synthesis
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Toggle the assistant open/closed
  const toggleAssistant = () => {
    setIsOpen((prev) => !prev)
    if (!isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  // Toggle expanded/collapsed view
  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
    trackEvent("assistant_toggle_expanded", { expanded: !isExpanded })
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as any)

    // Auto-submit after a short delay
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>
      handleSubmit(fakeEvent)
    }, 100)

    trackEvent("assistant_suggestion_used", { suggestion })
  }

  // Execute an action
  const executeAction = (action: AssistantAction) => {
    trackEvent("assistant_action_executed", { actionType: action.type })

    switch (action.type) {
      case "navigate":
        // Handle navigation
        window.location.href = action.payload.url
        break

      case "openGame":
        // Handle opening a game
        window.location.href = `/games/${action.payload.gameId}`
        break

      case "showReport":
        // Handle showing a report
        window.location.href = `/reports/${action.payload.reportId}`
        break

      case "scheduleReminder":
        // Handle scheduling a reminder
        toast({
          title: "Reminder Scheduled",
          description: `Reminder set for ${new Date(action.payload.time).toLocaleString()}`,
        })
        break

      default:
        toast({
          title: "Action Not Implemented",
          description: `The action "${action.type}" is not implemented yet.`,
          variant: "destructive",
        })
    }
  }

  // Provide message feedback
  const provideFeedback = (messageId: string, feedback: "positive" | "negative") => {
    // Update the message with feedback
    setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg)))

    // Send feedback to the server
    fetch("/api/assistant/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageId,
        feedback,
        sessionId: user?.id || "anonymous",
      }),
    }).catch((error) => {
      console.error("Error sending feedback:", error)
    })

    trackEvent("assistant_feedback_provided", { feedback })

    toast({
      title: feedback === "positive" ? "Thank You!" : "Feedback Received",
      description:
        feedback === "positive"
          ? "We appreciate your positive feedback!"
          : "We'll use your feedback to improve the assistant.",
    })
  }

  // Copy message to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to Clipboard",
          description: "The message has been copied to your clipboard.",
        })
        trackEvent("assistant_message_copied")
      },
      () => {
        toast({
          title: "Copy Failed",
          description: "Failed to copy the message. Please try again.",
          variant: "destructive",
        })
      },
    )
  }

  // If the feature flag is disabled, don't render the assistant
  if (!assistantEnabled) {
    return null
  }

  return (
    <>
      {/* Floating button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleAssistant}
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg",
                  isOpen ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground",
                )}
                aria-label={isOpen ? "Close assistant" : "Open assistant"}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{isOpen ? "Close assistant" : "Open Memo, your AI assistant"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Assistant panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-4 z-50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "flex flex-col shadow-xl border-primary/20",
                isExpanded ? "w-[90vw] h-[80vh] max-w-3xl" : "w-80 sm:w-96 h-[500px]",
              )}
            >
              <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 border-b">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">Memo</h3>
                    <p className="text-xs text-muted-foreground">AI Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleExpanded}
                    aria-label={isExpanded ? "Minimize assistant" : "Expand assistant"}
                  >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleAssistant}
                    aria-label="Close assistant"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
                <TabsList className="px-3 pt-2 justify-start border-b rounded-none bg-transparent">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-primary/10">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="data-[state=active]:bg-primary/10">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Suggestions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
                  <ScrollArea className="flex-1 p-3" ref={chatContainerRef}>
                    {messages.length <= 1 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Sparkles className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-medium text-lg mb-1">How can I help you today?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Ask me anything about cognitive health, games, or using Memoright.
                        </p>
                        <div className="grid grid-cols-1 gap-2 w-full">
                          {suggestionCategories[0].suggestions.slice(0, 3).map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="justify-start text-left h-auto py-2 px-3"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.slice(1).map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex flex-col max-w-[90%] rounded-lg p-3",
                              message.role === "user"
                                ? "ml-auto bg-primary text-primary-foreground"
                                : "mr-auto bg-muted",
                            )}
                          >
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                            {message.role === "assistant" && (
                              <div className="flex items-center justify-end gap-1 mt-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                                  onClick={() => speakText(message.content)}
                                  disabled={isSpeaking}
                                  aria-label="Read aloud"
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                                  onClick={() => copyToClipboard(message.content)}
                                  aria-label="Copy to clipboard"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-6 w-6 rounded-full opacity-70 hover:opacity-100",
                                    message.feedback === "positive" && "text-green-500 opacity-100",
                                  )}
                                  onClick={() => provideFeedback(message.id, "positive")}
                                  aria-label="Helpful"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-6 w-6 rounded-full opacity-70 hover:opacity-100",
                                    message.feedback === "negative" && "text-red-500 opacity-100",
                                  )}
                                  onClick={() => provideFeedback(message.id, "negative")}
                                  aria-label="Not helpful"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}

                        {isGeneratingResponse && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        )}

                        {availableActions.length > 0 && (
                          <div className="flex flex-wrap gap-2 my-2">
                            {availableActions.map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => executeAction(action)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {error && (
                          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                            <p>Error: {error.message || "Something went wrong. Please try again."}</p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => reload()}>
                              <RotateCcw className="h-3 w-3 mr-1" /> Retry
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>

                  <CardFooter className="p-3 pt-2 border-t">
                    {isSpeaking && (
                      <div className="absolute -top-8 left-0 right-0 bg-background border-t p-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Speaking...</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={stopSpeaking}>
                          <VolumeX className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex items-end w-full gap-2">
                      <Textarea
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask me anything..."
                        className="min-h-10 resize-none"
                        rows={1}
                        disabled={isLoading || isGeneratingResponse}
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={startListening}
                          disabled={isListening || isLoading || isGeneratingResponse}
                        >
                          {isListening ? <Mic className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="submit"
                          size="icon"
                          className="h-10 w-10"
                          disabled={!input.trim() || isLoading || isGeneratingResponse}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </CardFooter>
                </TabsContent>

                <TabsContent value="suggestions" className="flex-1 flex flex-col p-0 m-0">
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-4">
                      {suggestionCategories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center gap-1">
                            {category.icon}
                            <h4 className="text-sm font-medium">{category.label}</h4>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {category.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="justify-start text-left h-auto py-2 px-3"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">You can also ask about:</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => handleSuggestionClick("How to interpret my test results?")}
                          >
                            Test results
                          </Badge>
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => handleSuggestionClick("What's my cognitive trend?")}
                          >
                            Cognitive trends
                          </Badge>
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => handleSuggestionClick("How to share results with my doctor?")}
                          >
                            Sharing with doctors
                          </Badge>
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => handleSuggestionClick("What's the MMSE test?")}
                          >
                            MMSE test
                          </Badge>
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/10"
                            onClick={() => handleSuggestionClick("How to improve my memory?")}
                          >
                            Memory improvement
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Add API route for the assistant
export async function createAssistantAPIRoute() {
  return `
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { openai } from '@ai-sdk/openai'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logging'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Parse the request
    const { messages, context } = await req.json()

    // Log the interaction
    logger.info('Assistant API called', {
      userId: session.user.id,
      messageCount: messages.length,
      context: context?.page || 'unknown',
    })

    // Get user's cognitive data if available
    let cognitiveData = null
    try {
      cognitiveData = await prisma.cognitiveAssessment.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      })
    } catch (error) {
      logger.error('Error fetching cognitive data', { error })
    }

    // Enhance the system message with user context
    const enhancedMessages = [...messages]
    if (cognitiveData && enhancedMessages[0].role === 'system') {
      enhancedMessages[0].content += \`
Current user cognitive data:
- Last assessment: \${cognitiveData.createdAt}
- Overall score: \${cognitiveData.overallScore}/100
- Memory score: \${cognitiveData.memoryScore}/100
- Attention score: \${cognitiveData.attentionScore}/100
- Processing speed: \${cognitiveData.processingSpeedScore}/100
- Executive function: \${cognitiveData.executiveFunctionScore}/100
\`
    }

    // Add page context if available
    if (context?.page && enhancedMessages[0].role === 'system') {
      enhancedMessages[0].content += \`
Current page context: \${context.page}
\`
    }

    // Generate the response stream
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: enhancedMessages.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      stream: true,
    })

    // Create a stream and return it
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    logger.error('Assistant API error', { error })
    return new Response('Error processing your request', { status: 500 })
  }
}
`
}

// Add API route for assistant feedback
export async function createAssistantFeedbackAPIRoute() {
  return `
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logging'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Parse the request
    const { messageId, feedback, sessionId } = await req.json()

    // Validate the request
    if (!messageId || !feedback || !['positive', 'negative'].includes(feedback)) {
      return new Response('Invalid request', { status: 400 })
    }

    // Store the feedback
    await prisma.assistantFeedback.create({
      data: {
        messageId,
        feedback,
        userId: session.user.id,
        sessionId: sessionId || session.user.id,
      },
    })

    // Log the feedback
    logger.info('Assistant feedback received', {
      userId: session.user.id,
      messageId,
      feedback,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    logger.error('Assistant feedback API error', { error })
    return new Response('Error processing your request', { status: 500 })
  }
}
`
}

