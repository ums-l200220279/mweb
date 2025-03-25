"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccessibilitySettings } from "@/lib/accessibility"
import { useFeedback } from "@/hooks/use-feedback"
import { Volume2, VolumeX, HelpCircle } from "lucide-react"

interface AccessibleGameProps {
  gameType: "MEMORY" | "ATTENTION" | "EXECUTIVE" | "LANGUAGE" | "VISUOSPATIAL"
  difficulty: "EASY" | "MEDIUM" | "HARD" | "ADAPTIVE"
  onComplete: (score: number, metrics: Record<string, number>) => void
}

/**
 * Komponen permainan kognitif yang aksesibel
 */
export function AccessibleGame({ gameType, difficulty, onComplete }: AccessibleGameProps) {
  const [settings] = useAccessibilitySettings()
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState<"ready" | "playing" | "paused" | "completed">("ready")
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const feedback = useFeedback()

  // Referensi untuk audio
  const correctAudioRef = useRef<HTMLAudioElement | null>(null)
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null)
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)

  // Inisialisasi audio
  useEffect(() => {
    correctAudioRef.current = new Audio("/sounds/correct.mp3")
    incorrectAudioRef.current = new Audio("/sounds/incorrect.mp3")
    backgroundAudioRef.current = new Audio("/sounds/background.mp3")

    // Loop audio latar belakang
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.loop = true
    }

    return () => {
      // Cleanup audio saat komponen unmount
      correctAudioRef.current?.pause()
      incorrectAudioRef.current?.pause()
      backgroundAudioRef.current?.pause()
    }
  }, [])

  // Efek untuk audio latar belakang
  useEffect(() => {
    if (gameState === "playing" && audioEnabled && backgroundAudioRef.current) {
      backgroundAudioRef.current.play().catch((e) => console.error("Audio playback failed:", e))
    } else if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause()
    }
  }, [gameState, audioEnabled])

  // Fungsi untuk memainkan audio
  const playAudio = (type: "correct" | "incorrect") => {
    if (!audioEnabled) return

    if (type === "correct" && correctAudioRef.current) {
      correctAudioRef.current.currentTime = 0
      correctAudioRef.current.play().catch((e) => console.error("Audio playback failed:", e))
    } else if (type === "incorrect" && incorrectAudioRef.current) {
      incorrectAudioRef.current.currentTime = 0
      incorrectAudioRef.current.play().catch((e) => console.error("Audio playback failed:", e))
    }
  }

  // Fungsi untuk memulai permainan
  const startGame = () => {
    setGameState("playing")
    setShowInstructions(false)
    feedback.info("Game started!")
  }

  // Fungsi untuk menjeda permainan
  const pauseGame = () => {
    setGameState("paused")
    feedback.info("Game paused. Take your time!")
  }

  // Fungsi untuk melanjutkan permainan
  const resumeGame = () => {
    setGameState("playing")
  }

  // Fungsi untuk menyelesaikan permainan
  const completeGame = () => {
    setGameState("completed")

    // Hitung metrik tambahan
    const metrics = {
      accuracy: calculateAccuracy(),
      timeSpent: calculateTimeSpent(),
      levelsCompleted: level,
    }

    // Panggil callback onComplete
    onComplete(score, metrics)

    // Tampilkan pesan sukses
    feedback.success(`Game completed! Your score: ${score}`)
  }

  // Fungsi untuk menghitung akurasi (contoh)
  const calculateAccuracy = () => {
    // Implementasi perhitungan akurasi
    return 85 // Contoh nilai
  }

  // Fungsi untuk menghitung waktu yang dihabiskan (contoh)
  const calculateTimeSpent = () => {
    // Implementasi perhitungan waktu
    return 120 // Contoh nilai dalam detik
  }

  // Fungsi untuk menangani jawaban benar
  const handleCorrectAnswer = () => {
    playAudio("correct")
    setScore(score + 10)

    // Jika skor mencapai threshold, naik level
    if (score % 50 === 0) {
      setLevel(level + 1)
      feedback.success(`Level up! You're now at level ${level + 1}`)
    }
  }

  // Fungsi untuk menangani jawaban salah
  const handleIncorrectAnswer = () => {
    playAudio("incorrect")
    setLives(lives - 1)

    // Jika lives habis, selesaikan permainan
    if (lives <= 1) {
      completeGame()
    } else {
      feedback.warning(`Oops! You have ${lives - 1} lives remaining`)
    }
  }

  // Render konten permainan berdasarkan tipe
  const renderGameContent = () => {
    switch (gameType) {
      case "MEMORY":
        return (
          <MemoryGameContent
            difficulty={difficulty}
            onCorrect={handleCorrectAnswer}
            onIncorrect={handleIncorrectAnswer}
            settings={settings}
          />
        )
      case "ATTENTION":
        return (
          <AttentionGameContent
            difficulty={difficulty}
            onCorrect={handleCorrectAnswer}
            onIncorrect={handleIncorrectAnswer}
            settings={settings}
          />
        )
      // Implementasi untuk tipe permainan lainnya
      default:
        return <div>Game type not implemented yet</div>
    }
  }

  // Render instruksi permainan
  const renderInstructions = () => {
    switch (gameType) {
      case "MEMORY":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Memory Match Game</h3>
            <p>Find matching pairs of cards by flipping them over two at a time.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Click on a card to flip it over</li>
              <li>Try to find the matching pair</li>
              <li>If the cards match, they stay face up</li>
              <li>If they don't match, they flip back over</li>
              <li>Find all pairs to complete the level</li>
            </ul>
          </div>
        )
      case "ATTENTION":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Attention Challenge</h3>
            <p>Focus on the target symbols and respond quickly when they appear.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Watch for the target symbol shown at the start</li>
              <li>Press the button when you see the target symbol</li>
              <li>Avoid pressing for other symbols</li>
              <li>Respond as quickly as you can</li>
            </ul>
          </div>
        )
      // Instruksi untuk tipe permainan lainnya
      default:
        return <p>Instructions not available for this game type.</p>
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {gameType === "MEMORY"
              ? "Memory Match"
              : gameType === "ATTENTION"
                ? "Attention Challenge"
                : gameType === "EXECUTIVE"
                  ? "Executive Function Test"
                  : gameType === "LANGUAGE"
                    ? "Word Association"
                    : "Visual Perception"}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
              aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
            >
              {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInstructions(!showInstructions)}
              aria-label="Show instructions"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Game status information - accessible to screen readers */}
        <div className="sr-only" aria-live="polite">
          {`Current level: ${level}, Score: ${score}, Lives remaining: ${lives}`}
        </div>

        {/* Game status bar */}
        <div className="flex justify-between mb-4 p-2 bg-muted rounded-md">
          <div>
            <span className="font-medium">Level:</span> {level}
          </div>
          <div>
            <span className="font-medium">Score:</span> {score}
          </div>
          <div>
            <span className="font-medium">Lives:</span> {lives}
          </div>
        </div>

        {/* Instructions or game content */}
        {showInstructions ? (
          <div className="bg-card p-4 rounded-md border">{renderInstructions()}</div>
        ) : (
          <div
            className={`game-container min-h-[400px] ${settings.reducedMotion ? "reduced-motion" : ""} ${settings.contrast === "high" ? "high-contrast" : ""}`}
            style={{
              fontSize: settings.fontSize === "normal" ? "1rem" : settings.fontSize === "large" ? "1.25rem" : "1.5rem",
            }}
          >
            {gameState === "ready" && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p>Ready to start the game?</p>
                <Button onClick={startGame}>Start Game</Button>
              </div>
            )}

            {gameState === "playing" && renderGameContent()}

            {gameState === "paused" && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p>Game paused</p>
                <Button onClick={resumeGame}>Resume</Button>
              </div>
            )}

            {gameState === "completed" && (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <h3 className="text-xl font-bold">Game Completed!</h3>
                <p className="text-lg">Your final score: {score}</p>
                <p>Accuracy: {calculateAccuracy()}%</p>
                <p>Time spent: {calculateTimeSpent()} seconds</p>
                <p>Levels completed: {level}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {gameState === "playing" ? (
          <Button variant="outline" onClick={pauseGame}>
            Pause
          </Button>
        ) : gameState === "paused" ? (
          <Button variant="outline" onClick={resumeGame}>
            Resume
          </Button>
        ) : gameState === "completed" ? (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Play Again
          </Button>
        ) : (
          <Button variant="outline" disabled={showInstructions} onClick={() => setShowInstructions(true)}>
            Instructions
          </Button>
        )}

        {gameState !== "completed" && !showInstructions && (
          <Button variant="destructive" onClick={completeGame}>
            End Game
          </Button>
        )}

        {(gameState === "ready" || showInstructions) && (
          <Button onClick={startGame}>{gameState === "ready" ? "Start Game" : "Continue"}</Button>
        )}
      </CardFooter>
    </Card>
  )
}

// Komponen untuk permainan memori
function MemoryGameContent({
  difficulty,
  onCorrect,
  onIncorrect,
  settings,
}: {
  difficulty: string
  onCorrect: () => void
  onIncorrect: () => void
  settings: any
}) {
  // Implementasi permainan memori
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Kartu permainan memori */}
      {Array.from({ length: 16 }).map((_, index) => (
        <div
          key={index}
          className="aspect-square bg-primary/10 rounded-md flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
          onClick={() => {
            // Logika untuk membalik kartu
            Math.random() > 0.7 ? onCorrect() : onIncorrect()
          }}
          role="button"
          aria-label={`Card ${index + 1}`}
          tabIndex={0}
        >
          <span className="text-2xl">?</span>
        </div>
      ))}
    </div>
  )
}

// Komponen untuk permainan perhatian
function AttentionGameContent({
  difficulty,
  onCorrect,
  onIncorrect,
  settings,
}: {
  difficulty: string
  onCorrect: () => void
  onIncorrect: () => void
  settings: any
}) {
  // Implementasi permainan perhatian
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-2xl font-bold">Target Symbol: ★</div>

      <div className="text-6xl">★</div>

      <div className="flex space-x-4">
        <Button size="lg" onClick={onCorrect} className="h-16 w-32">
          Match
        </Button>

        <Button size="lg" variant="outline" onClick={onIncorrect} className="h-16 w-32">
          No Match
        </Button>
      </div>
    </div>
  )
}

