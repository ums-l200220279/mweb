// Client-side API functions for game-related operations

/**
 * Start a new game session
 */
export async function startGameSession(gameId: string, difficulty: string): Promise<any> {
  const response = await fetch("/api/games/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gameId, difficulty }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to start game session")
  }

  return response.json()
}

/**
 * Complete a game session
 */
export async function completeGameSession(sessionId: string, score: number, metrics: any): Promise<any> {
  const response = await fetch(`/api/games/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ score, metrics }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to complete game session")
  }

  return response.json()
}

/**
 * Get user's game history
 */
export async function getUserGameHistory(limit = 10): Promise<any> {
  const response = await fetch(`/api/games/history?limit=${limit}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch game history")
  }

  return response.json()
}

/**
 * Get game recommendations
 */
export async function getGameRecommendations(): Promise<any> {
  const response = await fetch("/api/games/recommendations")

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch game recommendations")
  }

  return response.json()
}

/**
 * Get adaptive difficulty settings
 */
export async function getAdaptiveDifficulty(gameId: string): Promise<any> {
  const response = await fetch(`/api/games/adaptive-difficulty?gameId=${gameId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch adaptive difficulty")
  }

  return response.json()
}

/**
 * Get cognitive scores
 */
export async function getCognitiveScores(timeRange: "week" | "month" | "year" = "month"): Promise<any> {
  const response = await fetch(`/api/cognitive/scores?timeRange=${timeRange}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to fetch cognitive scores")
  }

  return response.json()
}

