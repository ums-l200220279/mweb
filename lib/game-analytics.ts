// This is a simplified version of a game analytics service
// In a real implementation, this would connect to a backend API

interface GameSession {
  id: string
  userId: string
  gameId: string
  gameName: string
  startTime: Date
  endTime: Date
  duration: number
  score: number
  difficulty: string
  completed: boolean
  metrics: Record<string, any>
}

class GameAnalytics {
  private sessions: GameSession[] = []

  // Record a game session
  recordGameSession(session: GameSession): void {
    this.sessions.push(session)

    // In a real implementation, this would send the data to a backend API
    console.log("Recording game session:", session)

    // Store in localStorage for persistence
    this.saveToLocalStorage()
  }

  // Get all sessions for a user
  getUserSessions(userId: string): GameSession[] {
    return this.sessions.filter((session) => session.userId === userId)
  }

  // Get all sessions for a game
  getGameSessions(gameId: string): GameSession[] {
    return this.sessions.filter((session) => session.gameId === gameId)
  }

  // Get user's average score for a game
  getUserAverageScore(userId: string, gameId: string): number {
    const userGameSessions = this.sessions.filter((session) => session.userId === userId && session.gameId === gameId)

    if (userGameSessions.length === 0) return 0

    const totalScore = userGameSessions.reduce((sum, session) => sum + session.score, 0)
    return totalScore / userGameSessions.length
  }

  // Get user's highest score for a game
  getUserHighScore(userId: string, gameId: string): number {
    const userGameSessions = this.sessions.filter((session) => session.userId === userId && session.gameId === gameId)

    if (userGameSessions.length === 0) return 0

    return Math.max(...userGameSessions.map((session) => session.score))
  }

  // Get user's progress over time for a game
  getUserProgressOverTime(userId: string, gameId: string): { date: Date; score: number }[] {
    const userGameSessions = this.sessions.filter((session) => session.userId === userId && session.gameId === gameId)

    return userGameSessions
      .map((session) => ({
        date: session.endTime,
        score: session.score,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // Get user's cognitive metrics
  getUserCognitiveMetrics(userId: string): Record<string, number> {
    const userSessions = this.getUserSessions(userId)

    if (userSessions.length === 0) return {}

    // Aggregate metrics across all games
    const metrics: Record<string, number[]> = {}

    userSessions.forEach((session) => {
      Object.entries(session.metrics).forEach(([key, value]) => {
        if (typeof value === "number") {
          if (!metrics[key]) {
            metrics[key] = []
          }
          metrics[key].push(value)
        }
      })
    })

    // Calculate averages
    const averageMetrics: Record<string, number> = {}

    Object.entries(metrics).forEach(([key, values]) => {
      averageMetrics[key] = values.reduce((sum, value) => sum + value, 0) / values.length
    })

    return averageMetrics
  }

  // Save sessions to localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem("gameAnalytics", JSON.stringify(this.sessions))
    } catch (error) {
      console.error("Failed to save game analytics to localStorage:", error)
    }
  }

  // Load sessions from localStorage
  loadFromLocalStorage(): void {
    try {
      const savedSessions = localStorage.getItem("gameAnalytics")
      if (savedSessions) {
        this.sessions = JSON.parse(savedSessions)

        // Convert string dates back to Date objects
        this.sessions.forEach((session) => {
          session.startTime = new Date(session.startTime)
          session.endTime = new Date(session.endTime)
        })
      }
    } catch (error) {
      console.error("Failed to load game analytics from localStorage:", error)
    }
  }
}

// Create and export a singleton instance
export const gameAnalytics = new GameAnalytics()

// Load saved sessions on initialization
if (typeof window !== "undefined") {
  gameAnalytics.loadFromLocalStorage()
}

