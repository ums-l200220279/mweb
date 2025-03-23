"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { startGameSession, completeGameSession, getAdaptiveDifficulty } from "@/lib/api/game-api"

type Difficulty = "easy" | "medium" | "hard" | "adaptive"

interface GameSessionContextValue {
  sessionId: string | null
  difficulty: Difficulty
  setDifficulty: (difficulty: Difficulty) => void
  adaptiveLevel: number
  handleGameComplete: (score: number, metrics: any) => Promise<void>
  loading: boolean
  error: string | null
}

const GameSessionContext = createContext<GameSessionContextValue | undefined>(undefined)

interface GameSessionProviderProps {
  children: (contextValue: GameSessionContextValue) => ReactNode
  gameId: string
}

export function GameSessionProvider({ children, gameId }: GameSessionProviderProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [adaptiveLevel, setAdaptiveLevel] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load adaptive difficulty level if needed
  useEffect(() => {
    if (difficulty === "adaptive") {
      loadAdaptiveDifficulty()
    }
  }, [difficulty])

  // Start a new game session when difficulty changes
  useEffect(() => {
    startNewSession()
  }, [difficulty])

  const loadAdaptiveDifficulty = async () => {
    try {
      setLoading(true)
      const data = await getAdaptiveDifficulty(gameId)
      setAdaptiveLevel(data.currentLevel)
    } catch (err) {
      console.error("Failed to load adaptive difficulty:", err)
      setError("Failed to load adaptive difficulty settings")
      toast({
        title: "Error",
        description: "Failed to load adaptive difficulty settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startNewSession = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await startGameSession(gameId, difficulty)
      setSessionId(data.id)
    } catch (err) {
      console.error("Failed to start game session:", err)
      setError("Failed to start game session")
      toast({
        title: "Error",
        description: "Failed to start game session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGameComplete = async (score: number, metrics: any) => {
    if (!sessionId) return

    try {
      setLoading(true)

      const data = await completeGameSession(sessionId, score, metrics)

      // Show success toast
      toast({
        title: "Game Completed",
        description: `Your score: ${score}. Results saved successfully!`,
      })

      // Start a new session for the next game
      startNewSession()

      // If adaptive difficulty, update the level
      if (difficulty === "adaptive") {
        loadAdaptiveDifficulty()
      }

      return data
    } catch (err) {
      console.error("Failed to complete game session:", err)
      setError("Failed to save game results")
      toast({
        title: "Error",
        description: "Failed to save game results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const value: GameSessionContextValue = {
    sessionId,
    difficulty,
    setDifficulty,
    adaptiveLevel,
    handleGameComplete,
    loading,
    error,
  }

  return <GameSessionContext.Provider value={value}>{children(value)}</GameSessionContext.Provider>
}

export function useGameSession() {
  const context = useContext(GameSessionContext)
  if (context === undefined) {
    throw new Error("useGameSession must be used within a GameSessionProvider")
  }
  return context
}

