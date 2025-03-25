"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Timer, Brain, Award, RotateCcw, HelpCircle, Settings, Check, X, ArrowRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Word categories
const WORD_CATEGORIES = {
  common: [
    "apple",
    "house",
    "chair",
    "water",
    "table",
    "phone",
    "paper",
    "music",
    "plant",
    "light",
    "clock",
    "bread",
    "shoes",
    "money",
    "glass",
    "window",
    "door",
    "book",
    "pencil",
    "coffee",
    "smile",
    "garden",
    "flower",
    "picture",
  ],
  medical: [
    "brain",
    "heart",
    "blood",
    "nerve",
    "pulse",
    "scan",
    "doctor",
    "nurse",
    "pill",
    "health",
    "patient",
    "therapy",
    "memory",
    "vision",
    "hearing",
    "balance",
    "reflex",
    "muscle",
    "bone",
    "joint",
    "tissue",
    "cell",
    "organ",
    "system",
  ],
  nature: [
    "tree",
    "river",
    "mountain",
    "ocean",
    "forest",
    "flower",
    "cloud",
    "rain",
    "snow",
    "wind",
    "sun",
    "moon",
    "star",
    "bird",
    "fish",
    "insect",
    "grass",
    "leaf",
    "rock",
    "beach",
    "desert",
    "island",
    "valley",
    "hill",
  ],
  abstract: [
    "love",
    "time",
    "peace",
    "hope",
    "dream",
    "idea",
    "truth",
    "beauty",
    "faith",
    "wisdom",
    "courage",
    "freedom",
    "justice",
    "honor",
    "respect",
    "patience",
    "success",
    "happiness",
    "sadness",
    "anger",
    "fear",
    "surprise",
    "trust",
    "doubt",
  ],
}

// Difficulty presets
const DIFFICULTY_PRESETS = {
  beginner: {
    wordCount: 5,
    studyTime: 30,
    recallTime: 60,
    minWordLength: 3,
    maxWordLength: 6,
  },
  easy: {
    wordCount: 8,
    studyTime: 40,
    recallTime: 90,
    minWordLength: 3,
    maxWordLength: 8,
  },
  medium: {
    wordCount: 12,
    studyTime: 45,
    recallTime: 90,
    minWordLength: 4,
    maxWordLength: 8,
  },
  hard: {
    wordCount: 15,
    studyTime: 45,
    recallTime: 90,
    minWordLength: 4,
    maxWordLength: 10,
  },
  expert: {
    wordCount: 20,
    studyTime: 60,
    recallTime: 120,
    minWordLength: 4,
    maxWordLength: 12,
  },
}

// Game phases
type GamePhase = "intro" | "study" | "recall" | "results"

// Game settings interface
interface GameSettings {
  difficulty: string
  wordCategory: string
  enableTimer: boolean
  enableHints: boolean
  enableSound: boolean
  caseSensitive: boolean
}

export default function WordRecallGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro")
  const [words, setWords] = useState<string[]>([])
  const [recalledWords, setRecalledWords] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState<string>("")
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [showInstructions, setShowInstructions] = useState<boolean>(false)
  const [results, setResults] = useState<{
    correct: string[]
    incorrect: string[]
    missed: string[]
  }>({
    correct: [],
    incorrect: [],
    missed: [],
  })

  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    wordCategory: "common",
    enableTimer: true,
    enableHints: true,
    enableSound: true,
    caseSensitive: false,
  })

  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize game
  const initializeGame = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    const wordPool = WORD_CATEGORIES[settings.wordCategory as keyof typeof WORD_CATEGORIES]

    // Filter words by length based on difficulty
    const filteredWords = wordPool.filter(
      (word) => word.length >= difficultySettings.minWordLength && word.length <= difficultySettings.maxWordLength,
    )

    // Select random words
    const selectedWords = [...filteredWords].sort(() => 0.5 - Math.random()).slice(0, difficultySettings.wordCount)

    setWords(selectedWords)
    setRecalledWords([])
    setCurrentInput("")
    setTimeRemaining(difficultySettings.studyTime)
    setScore(0)
    setGamePhase("intro")
    setResults({
      correct: [],
      incorrect: [],
      missed: [],
    })
  }

  // Initialize game on mount and settings change
  useEffect(() => {
    initializeGame()
  }, [settings])

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if ((gamePhase === "study" || gamePhase === "recall") && settings.enableTimer && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            if (gamePhase === "study") {
              startRecallPhase()
            } else if (gamePhase === "recall") {
              endGame()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [gamePhase, settings.enableTimer, timeRemaining])

  // Focus input when entering recall phase
  useEffect(() => {
    if (gamePhase === "recall" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gamePhase])

  // Start study phase
  const startStudyPhase = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    setTimeRemaining(difficultySettings.studyTime)
    setGamePhase("study")
  }

  // Start recall phase
  const startRecallPhase = () => {
    const difficultySettings = DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS]
    setTimeRemaining(difficultySettings.recallTime)
    setGamePhase("recall")
  }

  // Handle word submission
  const handleSubmitWord = () => {
    if (!currentInput.trim()) return

    const normalizedInput = settings.caseSensitive ? currentInput.trim() : currentInput.trim().toLowerCase()

    // Check if word has already been recalled
    if (
      recalledWords.some((word) =>
        settings.caseSensitive ? word === normalizedInput : word.toLowerCase() === normalizedInput.toLowerCase(),
      )
    ) {
      toast({
        title: "Already Recalled",
        description: "You've already recalled this word.",
        variant: "destructive",
      })
      return
    }

    setRecalledWords([...recalledWords, normalizedInput])
    setCurrentInput("")
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitWord()
    }
  }

  // End game and calculate results
  const endGame = () => {
    const normalizedWords = settings.caseSensitive ? words : words.map((word) => word.toLowerCase())

    const normalizedRecalled = settings.caseSensitive ? recalledWords : recalledWords.map((word) => word.toLowerCase())

    // Calculate correct words
    const correct = normalizedRecalled.filter((word) => normalizedWords.includes(word))

    // Calculate incorrect words (words recalled that weren't in the original list)
    const incorrect = normalizedRecalled.filter((word) => !normalizedWords.includes(word))

    // Calculate missed words (words in the original list that weren't recalled)
    const missed = normalizedWords.filter((word) => !normalizedRecalled.includes(word))

    // Calculate score
    const correctPoints = correct.length * 100
    const incorrectPenalty = incorrect.length * 25
    const timeBonus = timeRemaining > 0 ? Math.floor(timeRemaining / 5) * 10 : 0

    const finalScore = Math.max(0, correctPoints - incorrectPenalty + timeBonus)

    setScore(finalScore)
    setResults({
      correct,
      incorrect,
      missed,
    })

    setGamePhase("results")
  }

  // Restart game
  const handleRestart = () => {
    initializeGame()
  }

  // Update settings
  const handleSettingsChange = (newSettings: Partial<GameSettings>) => {
    setSettings({ ...settings, ...newSettings })
  }

  // Render game content based on phase
  const renderGameContent = () => {
    switch (gamePhase) {
      case "intro":
        return (
          <div className="flex flex-col items-center text-center p-8">
            <Brain className="h-16 w-16 text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Word Recall Challenge</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              You will be shown a list of words to memorize. After the study period, try to recall as many words as
              possible.
            </p>
            <div className="space-y-2 mb-8 text-left w-full max-w-md">
              <div className="flex justify-between">
                <span>Difficulty:</span>
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
              </div>
              <div className="flex justify-between">
                <span>Words to Memorize:</span>
                <span>{DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].wordCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Study Time:</span>
                <span>
                  {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].studyTime} seconds
                </span>
              </div>
              <div className="flex justify-between">
                <span>Recall Time:</span>
                <span>
                  {DIFFICULTY_PRESETS[settings.difficulty as keyof typeof DIFFICULTY_PRESETS].recallTime} seconds
                </span>
              </div>
            </div>
            <Button onClick={startStudyPhase} className="w-full max-w-md">
              Start Memorizing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )

      case "study":
        return (
          <div className="flex flex-col items-center p-8">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="h-5 w-5 text-amber-500" />
              <span className={`font-medium ${timeRemaining < 10 ? "text-red-500" : ""}`}>
                Memorize: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center shadow-sm"
                >
                  <span className="text-lg font-medium">{word}</span>
                </div>
              ))}
            </div>

            <Button onClick={startRecallPhase}>
              I'm Ready to Recall
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )

      case "recall":
        return (
          <div className="flex flex-col items-center p-8">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="h-5 w-5 text-amber-500" />
              <span className={`font-medium ${timeRemaining < 10 ? "text-red-500" : ""}`}>
                Recall: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>

            <div className="w-full max-w-md mb-6">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a word you remember..."
                  className="flex-1"
                />
                <Button onClick={handleSubmitWord}>Add</Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 w-full max-w-md mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Words Recalled:</span>
                <span>{recalledWords.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recalledWords.map((word, index) => (
                  <Badge key={index} variant="secondary">
                    {word}
                  </Badge>
                ))}
                {recalledWords.length === 0 && <span className="text-gray-500 text-sm">No words recalled yet</span>}
              </div>
            </div>

            <Button onClick={endGame} variant="outline">
              I'm Done
            </Button>
          </div>
        )

      case "results":
        return (
          <div className="flex flex-col items-center p-8">
            <Award className="h-16 w-16 text-indigo-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Results</h2>
            <p className="text-gray-600 mb-6">
              You scored <span className="font-bold">{score}</span> points!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Correct Words
                  </CardTitle>
                  <CardDescription>Words you correctly recalled</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.correct.map((word, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                        {word}
                      </Badge>
                    ))}
                    {results.correct.length === 0 && <span className="text-gray-500 text-sm">No correct words</span>}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="text-sm text-gray-500">
                    {results.correct.length} of {words.length} words
                  </div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <X className="h-5 w-5 text-red-500" />
                    Incorrect Words
                  </CardTitle>
                  <CardDescription>Words you recalled that weren't in the list</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.incorrect.map((word, index) => (
                      <Badge key={index} className="bg-red-100 text-red-800 hover:bg-red-200">
                        {word}
                      </Badge>
                    ))}
                    {results.incorrect.length === 0 && (
                      <span className="text-gray-500 text-sm">No incorrect words</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="text-sm text-gray-500">{results.incorrect.length} words</div>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-amber-500" />
                    Missed Words
                  </CardTitle>
                  <CardDescription>Words from the list you didn't recall</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.missed.map((word, index) => (
                      <Badge key={index} variant="outline">
                        {word}
                      </Badge>
                    ))}
                    {results.missed.length === 0 && (
                      <span className="text-gray-500 text-sm">You recalled all words!</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="text-sm text-gray-500">
                    {results.missed.length} of {words.length} words
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleRestart}>Play Again</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/games")}>
                Back to Games
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Word Recall</h1>
          <p className="text-gray-600 mt-2">Enhance verbal memory by recalling words from a previously shown list</p>
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
                <DialogTitle>How to Play Word Recall</DialogTitle>
                <DialogDescription>Train your verbal memory by memorizing and recalling words.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Game Rules:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>You will be shown a list of words for a limited time</li>
                    <li>Memorize as many words as you can</li>
                    <li>After the study period, type in all the words you can remember</li>
                    <li>You'll earn points for each correctly recalled word</li>
                    <li>Points will be deducted for incorrect words</li>
                    <li>Complete the recall before time runs out</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Cognitive Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Improves verbal memory</li>
                    <li>Enhances word retrieval</li>
                    <li>Strengthens language processing</li>
                    <li>Builds working memory capacity</li>
                    <li>Improves concentration</li>
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
                <DialogDescription>Customize your Word Recall experience</DialogDescription>
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
                  <h4 className="font-medium">Word Category</h4>
                  <Tabs
                    defaultValue={settings.wordCategory}
                    onValueChange={(value) => handleSettingsChange({ wordCategory: value })}
                  >
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="common">Common</TabsTrigger>
                      <TabsTrigger value="medical">Medical</TabsTrigger>
                      <TabsTrigger value="nature">Nature</TabsTrigger>
                      <TabsTrigger value="abstract">Abstract</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowSettings(false)}>Save Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {gamePhase !== "intro" && (
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">{renderGameContent()}</div>
    </div>
  )
}

