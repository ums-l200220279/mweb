"use client"

import { useState, useEffect, useRef } from "react"
import { Timer, Brain, Award, RotateCcw, HelpCircle, Settings, Search, Target } from "lucide-react"
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
import { gameAnalytics } from "@/lib/game-analytics"

// Difficulty presets
const DIFFICULTY_PRESETS = {
  beginner: {
    gridSize: 5, // 5x5 grid
    targetCount: 5,
    distractorCount: 20,
    timeLimit: 60,
    targetSymbol: "T",
    distractorSymbols: ["L", "F", "E", "H"],
    assistanceLevel: 3,
  },
  easy: {
    gridSize: 6, // 6x6 grid
    targetCount: 6,
    distractorCount: 30,
    timeLimit: 60,
    targetSymbol: "T",
    distractorSymbols: ["L", "F", "E", "H", "I"],
    assistanceLevel: 2,
  },
  medium: {
    gridSize: 8, // 8x8 grid
    targetCount: 8,
    distractorCount: 56,
    timeLimit: 45,
    targetSymbol: "T",
    distractorSymbols: ["L", "F", "E", "H", "I", "C"],
    assistanceLevel: 1,
  },
  hard: {
    gridSize: 10, // 10x10 grid
    targetCount: 10,
    distractorCount: 90,
    timeLimit: 40,
    targetSymbol: "T",
    distractorSymbols: ["L", "F", "E", "H", "I", "C", "J", "P"],
    assistanceLevel: 0,
  },
  expert: {
    gridSize: 12, // 12x12 grid
    targetCount: 12,
    distractorCount: 132,
    timeLimit: 30,
    targetSymbol: "T",
    distractorSymbols: ["L", "F", "E", "H", "I", "C", "J", "P", "Y", "K"],
    assistanceLevel: 0,
  },
}

// Symbol themes
const SYMBOL_THEMES = {
  letters: {
    targets: ["T", "X", "O", "Z", "Q"],
    distractors: [
      "L",
      "F",
      "E",
      "H",
      "I",
      "C",
      "J",
      "P",
      "Y",
      "K",
      "A",
      "B",
      "D",
      "G",
      "M",
      "N",
      "R",
      "S",
      "U",
      "V",
      "W",
    ],
  },
  shapes: {
    targets: ["●", "★", "◆", "▲", "◼"],
    distractors: ["○", "☆", "◇", "△", "◻", "⬠", "⬡", "⬢", "⬣", "⬤", "⬥", "⬦", "⬧", "⬨", "⬩", "⬪", "⬫", "⬬", "⬭", "⬮"],
  },
  arrows: {
    targets: ["↑", "→", "↓", "←", "↔"],
    distractors: ["↕", "↖", "↗", "↘", "↙", "↚", "↛", "↜", "↝", "↞", "↟", "↠", "↡", "↢", "↣", "↤", "↥", "↦", "↧", "↨"],
  },
  medical: {
    targets: ["🧠", "❤️", "👁️", "👂", "🦷"],
    distractors: [
      "💉",
      "💊",
      "🩺",
      "🩹",
      "🧬",
      "🦴",
      "🫁",
      "🫀",
      "🩸",
      "🧪",
      "🧫",
      "🧬",
      "🔬",
      "🔭",
      "📡",
      "💻",
      "🧮",
      "📊",
      "📈",
      "📉",
    ],
  },
  numbers: {
    targets: ["1", "3", "5", "7", "9"],
    distractors: [
      "0",
      "2",
      "4",
      "6",
      "8",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
    ],
  },
}

// Game item interface
interface GameItem {
  id: number
  symbol: string
  isTarget: boolean
  found: boolean
  row: number
  col: number
}

// Game settings interface
interface GameSettings {
  difficulty: string
  symbolTheme: string
  enableTimer: boolean
  enableHints: boolean
  enableSound: boolean
  enableHighlighting: boolean
}

export default function VisualSearchGame() {
  // Game state
  const [gameItems, setGameItems] = useState<GameItem[]>([])
  const [targetsFound, setTargetsFound] = useState<number>(0)
  const [incorrectClicks, setIncorrectClicks] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameCompleted, setGameCompleted] = useState<boolean>(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(60)
  const [score, setScore] = useState<number>(0)
  const [showHint, setShowHint] = useState<boolean>(false)
  const [hintsRemaining, setHintsRemaining] = useState<number>(3)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(false)
  const [targetSymbol, setTargetSymbol] = useState<string>("T")
  const [gridSize, setGridSize] = useState<number>(8)
  const [lastResponseTime, setLastResponseTime] = useState<number>(0)
  const [averageResponseTime, setAverageResponseTime] = useState<number>(0)
  const [responseTimes, setResponseTimes] = useState<number[]>([])

  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    symbolTheme: "letters",
    enableTimer: true,
    enableHints: true,
    enableSound: true,
    enableHighlighting: true,
  })

  // Refs
  const gameStartTimeRef = useRef<number>(0)
  const lastClickTimeRef = useRef<number>(0)

  // Initialize game
  const initializeGame = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const symbolTheme = SYMBOL_THEMES[settings.symbolTheme as keyof typeof SYMBOL_THEMES]

    // Select random target symbol
    const targetSymbol = symbolTheme.targets[Math.floor(Math.random() * symbolTheme.targets.length)]
    setTargetSymbol(targetSymbol)

    // Set grid size
    const gridSize = difficultySettings.gridSize
    setGridSize(gridSize)

    // Create empty grid
    const totalCells = gridSize * gridSize
    const grid: GameItem[] = []

    // Determine target and distractor counts
    const targetCount = difficultySettings.targetCount
    const distractorCount = Math.min(difficultySettings.distractorCount, totalCells - targetCount)

    // Create array of all possible positions
    const positions: number[] = []
    for (let i = 0; i < totalCells; i++) {
      positions.push(i)
    }

    // Shuffle positions
    positions.sort(() => 0.5 - Math.random())

    // Place targets
    for (let i = 0; i < targetCount; i++) {
      const pos = positions[i]
      const row = Math.floor(pos / gridSize)
      const col = pos % gridSize

      grid.push({
        id: i,
        symbol: targetSymbol,
        isTarget: true,
        found: false,
        row,
        col,
      })
    }

    // Place distractors
    for (let i = 0; i < distractorCount; i++) {
      const pos = positions[i + targetCount]
      const row = Math.floor(pos / gridSize)
      const col = pos % gridSize

      // Select random distractor symbol
      const distractorSymbol = symbolTheme.distractors[Math.floor(Math.random() * symbolTheme.distractors.length)]

      grid.push({
        id: i + targetCount,
        symbol: distractorSymbol,
        isTarget: false,
        found: false,
        row,
        col,
      })
    }

    setGameItems(grid)
    setTargetsFound(0)
    setIncorrectClicks(0)
    setGameStarted(false)
    setGameCompleted(false)
    setTimeRemaining(difficultySettings.timeLimit)
    setScore(0)
    setHintsRemaining(difficultySettings.assistanceLevel)
    setLastResponseTime(0)
    setAverageResponseTime(0)
    setResponseTimes([])

    gameStartTimeRef.current = 0
    lastClickTimeRef.current = 0
  }

  // Initialize game on mount and settings change
  useEffect(() => {
    initializeGame()
  }, [settings])

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

  // Handle item click
  const handleItemClick = (item: GameItem) => {
    // Start game on first click
    if (!gameStarted) {
      setGameStarted(true)
      gameStartTimeRef.current = Date.now()
    }

    // Ignore click if game is over or item is already found
    if (gameCompleted || item.found) return

    // Calculate response time
    const now = Date.now()
    if (lastClickTimeRef.current === 0) {
      lastClickTimeRef.current = gameStartTimeRef.current
    }

    const responseTime = now - lastClickTimeRef.current
    lastClickTimeRef.current = now

    setLastResponseTime(responseTime)
    setResponseTimes((prev) => [...prev, responseTime])

    // Calculate average response time
    const newResponseTimes = [...responseTimes, responseTime]
    const avgTime = newResponseTimes.reduce((sum, time) => sum + time, 0) / newResponseTimes.length
    setAverageResponseTime(avgTime)

    // Handle target click
    if (item.isTarget) {
      // Update game items
      setGameItems(gameItems.map((gi) => (gi.id === item.id ? { ...gi, found: true } : gi)))

      // Update targets found
      const newTargetsFound = targetsFound + 1
      setTargetsFound(newTargetsFound)

      // Calculate score
      const timeBonus = Math.floor(Math.min(5000, responseTime) / 1000)
      const accuracyBonus = 100 - incorrectClicks * 10
      const newScore = score + 100 + timeBonus + accuracyBonus
      setScore(Math.max(0, newScore))

      // Play sound if enabled
      if (settings.enableSound) {
        // Play success sound
        // In a real implementation, this would play a sound
        console.log("Playing success sound")
      }

      // Check if all targets are found
      const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
      if (newTargetsFound >= difficultySettings.targetCount) {
        handleGameComplete()
      }
    } else {
      // Handle distractor click
      setIncorrectClicks(incorrectClicks + 1)

      // Penalty for incorrect click
      const newScore = Math.max(0, score - 25)
      setScore(newScore)

      // Play sound if enabled
      if (settings.enableSound) {
        // Play error sound
        // In a real implementation, this would play a sound
        console.log("Playing error sound")
      }

      // Show feedback
      toast({
        title: "Incorrect",
        description: `That's not a ${targetSymbol}. Keep searching!`,
        variant: "destructive",
      })
    }
  }

  // Handle game completion
  const handleGameComplete = () => {
    setGameCompleted(true)

    // Calculate final score
    const timeBonus = timeRemaining * 10
    const accuracyBonus = Math.max(0, 500 - incorrectClicks * 50)
    const speedBonus = Math.max(0, 500 - Math.floor(averageResponseTime / 10))

    const finalScore = score + timeBonus + accuracyBonus + speedBonus
    setScore(finalScore)

    // Show completion toast
    toast({
      title: "Game Completed!",
      description: `You've found all targets with a score of ${finalScore}!`,
    })

    // Record game session
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const gameSession = {
      id: `vs-${Date.now()}`,
      userId: "current-user", // This would be the actual user ID in a real implementation
      gameId: "visual-search",
      gameName: "Visual Search",
      startTime: new Date(gameStartTimeRef.current),
      endTime: new Date(),
      duration: Math.floor((Date.now() - gameStartTimeRef.current) / 1000),
      score: finalScore,
      difficulty: settings.difficulty,
      completed: true,
      metrics: {
        accuracy: targetsFound / (targetsFound + incorrectClicks),
        responseTime: averageResponseTime,
        correctAnswers: targetsFound,
        incorrectAnswers: incorrectClicks,
        totalItems: difficultySettings.targetCount,
      },
    }

    gameAnalytics.recordGameSession(gameSession)
  }

  // Handle game over (time ran out)
  const handleGameOver = () => {
    setGameCompleted(true)

    toast({
      title: "Time's Up!",
      description: `You found ${targetsFound} targets with a score of ${score}.`,
      variant: "destructive",
    })

    // Record game session
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const gameSession = {
      id: `vs-${Date.now()}`,
      userId: "current-user", // This would be the actual user ID in a real implementation
      gameId: "visual-search",
      gameName: "Visual Search",
      startTime: new Date(gameStartTimeRef.current),
      endTime: new Date(),
      duration: Math.floor((Date.now() - gameStartTimeRef.current) / 1000),
      score: score,
      difficulty: settings.difficulty,
      completed: false,
      metrics: {
        accuracy: targetsFound / (targetsFound + incorrectClicks || 1),
        responseTime: averageResponseTime || 0,
        correctAnswers: targetsFound,
        incorrectAnswers: incorrectClicks,
        totalItems: difficultySettings.targetCount,
      },
    }

    gameAnalytics.recordGameSession(gameSession)
  }

  // Handle hint request
  const handleHint = () => {
    if (hintsRemaining <= 0 || !settings.enableHints) return

    setHintsRemaining(hintsRemaining - 1)
    setShowHint(true)

    // Briefly highlight all targets
    setGameItems(gameItems.map((item) => (item.isTarget && !item.found ? { ...item, highlighted: true } : item)))

    // Hide hint after a short delay
    setTimeout(() => {
      setGameItems(gameItems.map((item) => ({ ...item, highlighted: false })))
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visual Search</h1>
          <p className="text-gray-600 mt-2">Find all target symbols among distractors to improve selective attention</p>
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
                <DialogTitle>How to Play Visual Search</DialogTitle>
                <DialogDescription>
                  Train your selective attention by finding target symbols among distractors.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Game Rules:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Find all instances of the target symbol ({targetSymbol}) in the grid</li>
                    <li>Click on each target symbol to mark it as found</li>
                    <li>Avoid clicking on distractor symbols</li>
                    <li>Complete the search before time runs out</li>
                    <li>Use hints wisely - you have a limited number</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cognitive Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Improves selective attention</li>
                    <li>Enhances visual discrimination</li>
                    <li>Develops visual scanning strategies</li>
                    <li>Trains processing speed</li>
                    <li>Builds sustained attention</li>
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
                <DialogDescription>Customize your Visual Search experience</DialogDescription>
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
                  <h4 className="font-medium">Symbol Theme</h4>
                  <Tabs
                    defaultValue={settings.symbolTheme}
                    onValueChange={(value) => handleSettingsChange({ symbolTheme: value })}
                  >
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="letters">Letters</TabsTrigger>
                      <TabsTrigger value="shapes">Shapes</TabsTrigger>
                      <TabsTrigger value="arrows">Arrows</TabsTrigger>
                      <TabsTrigger value="medical">Medical</TabsTrigger>
                      <TabsTrigger value="numbers">Numbers</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableTimer">Enable Timer</Label>
                      <p className="text-sm text-gray-500">Time limit for completing the search</p>
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
                      <Label htmlFor="enableHighlighting">Enable Highlighting</Label>
                      <p className="text-sm text-gray-500">Highlight found targets</p>
                    </div>
                    <Switch
                      id="enableHighlighting"
                      checked={settings.enableHighlighting}
                      onCheckedChange={(checked) => handleSettingsChange({ enableHighlighting: checked })}
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
                  <Target className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">
                    Targets: {targetsFound}/
                    {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].targetCount}
                  </span>
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

            <div className="mb-4 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <Search className="h-5 w-5 text-indigo-600" />
                <span className="font-medium">
                  Find all instances of: <span className="text-xl font-bold text-indigo-600">{targetSymbol}</span>
                </span>
              </div>
            </div>

            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                maxWidth: `${Math.min(800, gridSize * 50)}px`,
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                const row = Math.floor(index / gridSize)
                const col = index % gridSize

                // Find item at this position
                const item = gameItems.find((item) => item.row === row && item.col === col)

                if (!item) {
                  // Empty cell
                  return (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square bg-gray-50 rounded-md flex items-center justify-center"
                    ></div>
                  )
                }

                return (
                  <div
                    key={item.id}
                    className={`
                      aspect-square rounded-md flex items-center justify-center cursor-pointer
                      ${item.found && settings.enableHighlighting ? "bg-green-100 border border-green-300" : "bg-white border border-gray-200 hover:bg-gray-50"}
                      ${item.highlighted ? "bg-amber-100 border border-amber-300" : ""}
                      transition-all duration-150
                    `}
                    onClick={() => handleItemClick(item)}
                  >
                    <span
                      className={`
                      text-lg font-medium
                      ${item.found && settings.enableHighlighting ? "text-green-600" : "text-gray-800"}
                      ${item.highlighted ? "text-amber-600" : ""}
                    `}
                    >
                      {item.symbol}
                    </span>
                  </div>
                )
              })}
            </div>

            {gameCompleted && (
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
                <div className="flex flex-col items-center text-center">
                  <Award className="h-12 w-12 text-indigo-600 mb-2" />
                  <h3 className="text-xl font-bold text-indigo-900">Game Completed!</h3>
                  <p className="text-indigo-700 mb-4">
                    You found {targetsFound} targets with {incorrectClicks} incorrect clicks and a score of {score}!
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
                  <span>Targets Found</span>
                  <span>
                    {targetsFound}/
                    {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].targetCount}
                  </span>
                </div>
                <Progress
                  value={
                    (targetsFound /
                      DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].targetCount) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span>
                    {targetsFound + incorrectClicks > 0
                      ? `${Math.round((targetsFound / (targetsFound + incorrectClicks)) * 100)}%`
                      : "100%"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Response Time</span>
                  <span>{lastResponseTime > 0 ? `${(lastResponseTime / 1000).toFixed(2)}s` : "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average Response Time</span>
                  <span>{averageResponseTime > 0 ? `${(averageResponseTime / 1000).toFixed(2)}s` : "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Incorrect Clicks</span>
                  <span>{incorrectClicks}</span>
                </div>
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
                <p>
                  Grid Size: {gridSize}×{gridSize}
                </p>
                <p>Targets: {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].targetCount}</p>
                {settings.enableTimer && (
                  <p>
                    Time Limit: {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].timeLimit}s
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Cognitive Benefits</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Selective Attention</span>
                    <span>Primary</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Visual Processing</span>
                    <span>High</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Processing Speed</span>
                    <span>High</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Sustained Attention</span>
                    <span>Medium</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Tips</h3>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">•</div>
                  <div>Scan the grid systematically (left-to-right, top-to-bottom)</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">•</div>
                  <div>Focus on the unique features of the target symbol</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0">•</div>
                  <div>Take your time to avoid incorrect clicks</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

