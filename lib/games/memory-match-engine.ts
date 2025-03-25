"use client"

import { useState, useCallback } from "react"

// Types
export type CardType = {
  id: number
  imageUrl: string
  isFlipped: boolean
  isMatched: boolean
}

export type DifficultySettings = {
  pairs: number
  timeLimit: number
}

export const DIFFICULTY_LEVELS: Record<string, DifficultySettings> = {
  easy: { pairs: 6, timeLimit: 60 },
  medium: { pairs: 8, timeLimit: 90 },
  hard: { pairs: 12, timeLimit: 120 },
}

export type GameState = {
  cards: CardType[]
  flippedCards: number[]
  matchedPairs: number
  moves: number
  gameStarted: boolean
  gameOver: boolean
  timeLeft: number
  score: number
  loading: boolean
}

export type UseMemoryGameProps = {
  onGameWin?: (score: number) => void
  onGameOver?: (score: number) => void
}

export function useMemoryGame({ onGameWin, onGameOver }: UseMemoryGameProps = {}) {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    gameStarted: false,
    gameOver: false,
    timeLeft: 0,
    score: 0,
    loading: false,
  })

  const [difficulty, setDifficulty] = useState<string>("easy")

  // Initialize game
  const initializeGame = useCallback(async () => {
    setGameState((prev) => ({ ...prev, loading: true }))

    try {
      const { pairs } = DIFFICULTY_LEVELS[difficulty]

      // Create card pairs
      const cardImages = Array.from({ length: pairs }, (_, i) => ({
        id: i,
        imageUrl: `/placeholder.svg?height=80&width=80&text=${i + 1}`,
      }))

      // Create pairs and shuffle
      const newCards = [...cardImages, ...cardImages].map((card, index) => ({
        ...card,
        id: index,
        isFlipped: false,
        isMatched: false,
      }))

      // Fisher-Yates shuffle
      for (let i = newCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newCards[i], newCards[j]] = [newCards[j], newCards[i]]
      }

      setGameState({
        cards: newCards,
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        gameStarted: true,
        gameOver: false,
        timeLeft: DIFFICULTY_LEVELS[difficulty].timeLimit,
        score: 0,
        loading: false,
      })
    } catch (error) {
      console.error("Error initializing game:", error)
      setGameState((prev) => ({ ...prev, loading: false }))
    }
  }, [difficulty])

  // Handle card click
  const handleCardClick = useCallback(
    (id: number) => {
      setGameState((prev) => {
        // Ignore if game not started or card already flipped/matched
        if (!prev.gameStarted || prev.gameOver || prev.flippedCards.length >= 2) return prev

        const clickedCard = prev.cards.find((card) => card.id === id)
        if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return prev

        // Flip the card
        const newFlippedCards = [...prev.flippedCards, id]
        const newCards = prev.cards.map((card) => (card.id === id ? { ...card, isFlipped: true } : card))

        // If two cards are flipped, check for match
        if (newFlippedCards.length === 2) {
          const [firstId, secondId] = newFlippedCards
          const firstCard = newCards.find((card) => card.id === firstId)
          const secondCard = newCards.find((card) => card.id === secondId)

          if (firstCard && secondCard && firstCard.imageUrl === secondCard.imageUrl) {
            // Match found
            const newMatchedPairs = prev.matchedPairs + 1
            const newScore = prev.score + 10 * Math.ceil(prev.timeLeft / 10)

            // Update matched cards
            const matchedCards = newCards.map((card) =>
              card.id === firstId || card.id === secondId ? { ...card, isMatched: true } : card,
            )

            // Check if all pairs are matched
            if (newMatchedPairs === DIFFICULTY_LEVELS[difficulty].pairs) {
              // Calculate final score
              const timeBonus = prev.timeLeft * 5
              const movesBonus = Math.max(0, 100 - (prev.moves + 1) * 5)
              const finalScore = newScore + timeBonus + movesBonus

              // Call game win callback
              if (onGameWin) {
                setTimeout(() => onGameWin(finalScore), 300)
              }

              return {
                ...prev,
                cards: matchedCards,
                flippedCards: [],
                matchedPairs: newMatchedPairs,
                moves: prev.moves + 1,
                gameOver: true,
                gameStarted: false,
                score: finalScore,
              }
            }

            return {
              ...prev,
              cards: matchedCards,
              flippedCards: [],
              matchedPairs: newMatchedPairs,
              moves: prev.moves + 1,
              score: newScore,
            }
          } else {
            // No match, schedule cards to flip back
            setTimeout(() => {
              setGameState((current) => ({
                ...current,
                cards: current.cards.map((card) =>
                  newFlippedCards.includes(card.id) && !card.isMatched ? { ...card, isFlipped: false } : card,
                ),
                flippedCards: [],
              }))
            }, 1000)

            return {
              ...prev,
              cards: newCards,
              flippedCards: newFlippedCards,
              moves: prev.moves + 1,
            }
          }
        }

        return {
          ...prev,
          cards: newCards,
          flippedCards: newFlippedCards,
        }
      })
    },
    [difficulty, onGameWin],
  )

  // Handle time tick
  const handleTimeTick = useCallback(() => {
    setGameState((prev) => {
      if (!prev.gameStarted || prev.gameOver || prev.timeLeft <= 0) return prev

      const newTimeLeft = prev.timeLeft - 1

      if (newTimeLeft === 0) {
        // Game over due to time
        if (onGameOver) {
          onGameOver(prev.score)
        }

        return {
          ...prev,
          timeLeft: 0,
          gameOver: true,
          gameStarted: false,
        }
      }

      return {
        ...prev,
        timeLeft: newTimeLeft,
      }
    })
  }, [onGameOver])

  return {
    ...gameState,
    difficulty,
    setDifficulty,
    initializeGame,
    handleCardClick,
    handleTimeTick,
  }
}

