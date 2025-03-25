"use client"

import { useState, useEffect, useCallback } from "react"
import { Shuffle, Timer, Brain, Award, RotateCcw, HelpCircle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import AdaptiveDifficultyEngine from "../adaptive-difficulty-engine"

// Card themes
const CARD_THEMES = {
  shapes: ["circle", "square", "triangle", "star", "heart", "diamond", "pentagon", "hexagon", "octagon", "cross"],
  animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵"],
  food: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥"],
  nature: ["🌲", "🌴", "🌵", "🌷", "🌹", "🌺", "🌸", "🌼", "🌻", "🍄", "⭐", "☀️", "🌙", "⛅", "❄️"],
  cognitive: ["🧠", "👁️", "👂", "👄", "👃", "🖐️", "🦶", "❤️", "🫁", "🫀", "🦴", "🦷", "👀", "🧿", "🔍"],
}

// Difficulty presets
const DIFFICULTY_PRESETS = {
  beginner: {
    level: 1,
    timeConstraint: 120,
    complexity: 1,
    distractorLevel: 0,
    itemCount: 6, // 3 pairs
    assistanceLevel: 8,
  },
  easy: {
    level: 2,
    timeConstraint: 90,
    complexity: 2,
    distractorLevel: 1,
    itemCount: 12, // 6 pairs
    assistanceLevel: 5,
  },
  medium: {
    level: 5,
    timeConstraint: 60,
    complexity: 5,
    distractorLevel: 3,
    itemCount: 16, // 8 pairs
    assistanceLevel: 3,
  },
  hard: {
    level: 7,
    timeConstraint: 45,
    complexity: 7,
    distractorLevel: 5,
    itemCount: 24, // 12 pairs
    assistanceLevel: 1,
  },
  expert: {
    level: 10,
    timeConstraint: 30,
    complexity: 10,
    distractorLevel: 8,
    itemCount: 36, // 18 pairs
    assistanceLevel: 0,
  },
}

// Card interface
interface MemoryCard {
  id: number
  content: string
  flipped: boolean
  matched: boolean
  theme: string
}

// Game settings interface
interface GameSettings {
  difficulty: string
  cardTheme: string
  enableTimer: boolean
  enableHints: boolean
  enableSound: boolean
  enableAnimations: boolean
  adaptiveDifficulty: boolean
}

export default function MemoryMatchGame() {
  // Game state
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(60)
  const [score, setScore] = useState<number>(0)
  const [showHint, setShowHint] = useState<boolean>(false)
  const [hintsRemaining, setHintsRemaining] = useState<number>(3)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(false)

  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    cardTheme: "cognitive",
    enableTimer: true,
    enableHints: true,
    enableSound: true,
    enableAnimations: true,
    adaptiveDifficulty: true,
  })

  // Initialize adaptive difficulty engine
  const difficultyEngine = new AdaptiveDifficultyEngine()

  // Mock cognitive profile for demonstration
  const mockProfile = {
    memory: 65,
    attention: 70,
    processing: 60,
    executive: 75,
    language: 80,
    visualSpatial: 65,
  }

  // Initialize game
  const initializeGame = useCallback(() => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const cardCount = difficultySettings.itemCount
    const pairCount = cardCount / 2

    // Select random items from the chosen theme
    const theme = CARD_THEMES[settings.cardTheme as keyof typeof CARD_THEMES]
    const selectedItems = [...theme].sort(() => 0.5 - Math.random()).slice(0, pairCount)

    // Create pairs and shuffle
    const cardPairs = [...selectedItems, ...selectedItems]
      .map((content, index) => ({
        id: index,
        content,
        flipped: false,
        matched: false,
        theme: settings.cardTheme,
      }))
      .sort(() => 0.5 - Math.random())

    setCards(cardPairs)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setGameStarted(false)
    setGameCompleted(false)
    setTimeRemaining(difficultySettings.timeConstraint)
    setScore(0)
    setHintsRemaining(difficultySettings.assistanceLevel)
  }, [settings])

  // Initialize game on mount and settings change
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameStarted && !gameCompleted && settings.enableTimer && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            handleGameOver()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [gameStarted, gameCompleted, settings.enableTimer, timeRemaining])

  // Handle card click
  const handleCardClick = (id: number) => {
    // Start game on first card click
    if (!gameStarted) {
      setGameStarted(true)
    }

    // Ignore click if game is over or card is already flipped/matched
    if (gameCompleted || flippedCards.length >= 2) return

    const clickedCard = cards.find((card) => card.id === id)
    if (!clickedCard || clickedCard.flipped || clickedCard.matched) return

    // Flip the card
    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    // Update cards state
    setCards(cards.map((card) => (card.id === id ? { ...card, flipped: true } : card)))

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)

      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find((card) => card.id === firstId)
      const secondCard = cards.find((card) => card.id === secondId)

      if (firstCard?.content === secondCard?.content) {
        // Match found
        setTimeout(() => {
          setCards(
            cards.map((card) => (card.id === firstId || card.id === secondId ? { ...card, matched: true } : card)),
          )
          setMatchedPairs(matchedPairs + 1)
          setFlippedCards([])

          // Calculate score bonus
          const timeBonus = Math.floor(timeRemaining / 5)
          const newScore = score + 100 + timeBonus
          setScore(newScore)

          // Check if game is completed
          if (matchedPairs + 1 === cards.length / 2) {
            handleGameComplete()
          }
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards(
            cards.map((card) => (card.id === firstId || card.id === secondId ? { ...card, flipped: false } : card)),
          )
          setFlippedCards([])

          // Penalty for wrong match
          const newScore = Math.max(0, score - 10)
          setScore(newScore)
        }, 1000)
      }
    }
  }

  // Handle game completion
  const handleGameComplete = () => {
    setGameCompleted(true)

    // Calculate final score
    const timeBonus = timeRemaining * 5
    const movesEfficiency = cards.length / 2 / moves
    const efficiencyBonus = Math.floor(movesEfficiency * 100)

    const finalScore = score + timeBonus + efficiencyBonus
    setScore(finalScore)

    // Show completion toast
    toast({
      title: "Game Completed!",
      description: `You've completed the game with a score of ${finalScore}!`,
    })

    // TODO: Save score to database
  }

  // Handle game over (time ran out)
  const handleGameOver = () => {
    setGameCompleted(true)

    toast({
      title: "Time's Up!",
      description: `You matched ${matchedPairs} pairs with a score of ${score}.`,
      variant: "destructive",
    })
  }

  // Handle hint request
  const handleHint = () => {
    if (hintsRemaining <= 0 || !settings.enableHints) return

    setHintsRemaining(hintsRemaining - 1)
    setShowHint(true)

    // Briefly show all unmatched cards
    setCards(cards.map((card) => (!card.matched ? { ...card, flipped: true } : card)))

    // Hide them again after a short delay
    setTimeout(() => {
      setCards(
        cards.map((card) => (!card.matched && !flippedCards.includes(card.id) ? { ...card, flipped: false } : card)),
      )
      setShowHint(false)
    }, 1000)
  }

  // Restart game
  const handleRestart = () => {
    initializeGame()
  }

  // Update settings
  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    setSettings({ ...settings, ...newSettings })
  }

  // Calculate grid columns based on card count
  const getGridColumns = () => {
    const cardCount = cards.length
    if (cardCount <= 12) return "grid-cols-3 sm:grid-cols-4"
    if (cardCount <= 16) return "grid-cols-4"
    if (cardCount <= 24) return "grid-cols-4 sm:grid-cols-6"
    return "grid-cols-4 sm:grid-cols-6"
  }

  // Render card content based on theme
  const renderCardContent = (card: MemoryCard) => {
    if (card.theme === "shapes") {
      // Render SVG shapes
      switch (card.content) {
        case "circle":
          return <div className="w-12 h-12 rounded-full bg-indigo-500"></div>
        case "square":
          return <div className="w-12 h-12 bg-emerald-500"></div>
        case "triangle":
          return (
            <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-b-[40px] border-l-transparent border-r-transparent border-b-amber-500"></div>
          )
        default:
          return <div className="text-4xl">{card.content}</div>
      }
    }

    // For emoji themes
    return <div className="text-4xl">{card.content}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Memory Match</h1>
          <p className="text-gray-600 mt-2">Test and improve your visual memory by matching pairs of cards</p>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Instructions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How to Play Memory Match</DialogTitle>
                <DialogDescription>Train your memory by finding matching pairs of cards.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Game Rules:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Click on cards to flip them over</li>
                    <li>Find all matching pairs to complete the game</li>
                    <li>Only two cards can be flipped at once</li>
                    <li>If the cards match, they stay face up</li>
                    <li>If they don't match, they flip back face down</li>
                    <li>Complete the game before time runs out</li>
                    <li>Use hints wisely - you have a limited number</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cognitive Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Improves visual memory</li>
                    <li>Enhances concentration and attention</li>
                    <li>Develops pattern recognition</li>
                    <li>Trains working memory capacity</li>
                    <li>Builds cognitive flexibility</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowInstructions(false)}>Got it</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Game Settings</DialogTitle>
                <DialogDescription>Customize your Memory Match experience</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Difficulty</h4>
                  <Tabs
                    defaultValue={settings.difficulty}
                    onValueChange={(value) => handleSettingsChange({ difficulty: value })}
                  >
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="beginner">Beginner</TabsTrigger>
                      <TabsTrigger value="easy">Easy</TabsTrigger>
                      <TabsTrigger value="medium">Medium</TabsTrigger>
                      <TabsTrigger value="hard">Hard</TabsTrigger>
                      <TabsTrigger value="expert">Expert</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Card Theme</h4>
                  <Tabs
                    defaultValue={settings.cardTheme}
                    onValueChange={(value) => handleSettingsChange({ cardTheme: value })}
                  >
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="cognitive">Brain</TabsTrigger>
                      <TabsTrigger value="animals">Animals</TabsTrigger>
                      <TabsTrigger value="food">Food</TabsTrigger>
                      <TabsTrigger value="nature">Nature</TabsTrigger>
                      <TabsTrigger value="shapes">Shapes</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableTimer">Enable Timer</Label>
                      <p className="text-sm text-gray-500">Time limit for completing the game</p>
                    </div>
                    <Switch
                      id="enableTimer"
                      checked={settings.enableTimer}
                      onCheckedChange={(checked) => handleSettingsChange({ enableTimer: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableHints">Enable Hints</Label>
                      <p className="text-sm text-gray-500">Allow using hints during gameplay</p>
                    </div>
                    <Switch
                      id="enableHints"
                      checked={settings.enableHints}
                      onCheckedChange={(checked) => handleSettingsChange({ enableHints: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableSound">Enable Sound</Label>
                      <p className="text-sm text-gray-500">Play sound effects during the game</p>
                    </div>
                    <Switch
                      id="enableSound"
                      checked={settings.enableSound}
                      onCheckedChange={(checked) => handleSettingsChange({ enableSound: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableAnimations">Enable Animations</Label>
                      <p className="text-sm text-gray-500">Show card flip animations</p>
                    </div>
                    <Switch
                      id="enableAnimations"
                      checked={settings.enableAnimations}
                      onCheckedChange={(checked) => handleSettingsChange({ enableAnimations: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="adaptiveDifficulty">Adaptive Difficulty</Label>
                      <p className="text-sm text-gray-500">Adjust difficulty based on performance</p>
                    </div>
                    <Switch
                      id="adaptiveDifficulty"
                      checked={settings.adaptiveDifficulty}
                      onCheckedChange={(checked) => handleSettingsChange({ adaptiveDifficulty: checked })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowSettings(false)}>Save Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                {settings.enableTimer && (
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-amber-500" />
                    <span className={`font-medium ${timeRemaining < 10 ? "text-red-500" : ""}`}>
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Shuffle className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">Moves: {moves}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald-500" />
                  <span className="font-medium">Score: {score}</span>
                </div>
              </div>

              {settings.enableHints && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHint}
                  disabled={hintsRemaining <= 0 || showHint || gameCompleted}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Hint ({hintsRemaining})
                </Button>
              )}
            </div>

            <div className={`grid ${getGridColumns()} gap-4`}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`aspect-square cursor-pointer transition-all duration-300 ${
                    settings.enableAnimations ? "transform perspective-500 preserve-3d" : ""
                  }`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div
                    className={`w-full h-full rounded-lg ${
                      card.flipped || card.matched ? "bg-white border-2 border-indigo-200 shadow-sm" : "bg-indigo-600"
                    } flex items-center justify-center ${
                      settings.enableAnimations && (card.flipped || card.matched) ? "rotate-y-180" : ""
                    } transition-all duration-300`}
                  >
                    {(card.flipped || card.matched) && renderCardContent(card)}
                  </div>
                </div>
              ))}
            </div>

            {gameCompleted && (
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                <div className="flex flex-col items-center text-center">
                  <Award className="h-12 w-12 text-indigo-600 mb-2" />
                  <h3 className="text-xl font-bold text-indigo-900">Game Completed!</h3>
                  <p className="text-indigo-700 mb-4">
                    You matched all {cards.length / 2} pairs in {moves} moves with a score of {score}!
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={handleRestart}>Play Again</Button>
                    <Button variant="outline" onClick={() => (window.location.href = "/games")}>
                      Back to Games
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Game Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Pairs Matched</span>
                  <span>
                    {matchedPairs}/{cards.length / 2}
                  </span>
                </div>
                <Progress value={(matchedPairs / (cards.length / 2)) * 100} className="h-2" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Difficulty</h3>
              <Badge
                className={`
                ${settings.difficulty === "beginner" ? "bg-green-100 text-green-800" : ""}
                ${settings.difficulty === "easy" ? "bg-blue-100 text-blue-800" : ""}
                ${settings.difficulty === "medium" ? "bg-amber-100 text-amber-800" : ""}
                ${settings.difficulty === "hard" ? "bg-orange-100 text-orange-800" : ""}
                ${settings.difficulty === "expert" ? "bg-red-100 text-red-800" : ""}
              `}
              >
                {settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)}
              </Badge>
              <div className="mt-2 text-sm text-gray-500">
                <p>Cards: {cards.length}</p>
                <p>Pairs: {cards.length / 2}</p>
                {settings.enableTimer && (
                  <p>
                    Time Limit:{" "}
                    {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].timeConstraint}s
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Cognitive Benefits</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Visual Memory</span>
                    <span>Primary</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Attention</span>
                    <span>High</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Processing Speed</span>
                    <span>Medium</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Executive Function</span>
                    <span>Medium</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "50%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Tips</h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">•</div>
                  <div>Focus on card positions to improve your spatial memory</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">•</div>
                  <div>Try to create mental associations for each card</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">•</div>
                  <div>Take your time on difficult levels to reduce errors</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

