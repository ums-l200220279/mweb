"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function GameSettings({ settings, onSettingsChange, onStartGame, gameType = "divided-attention" }) {
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleChange = (key, value) => {
    const updatedSettings = { ...localSettings, [key]: value }
    setLocalSettings(updatedSettings)
  }

  const handleSave = () => {
    onSettingsChange(localSettings)
    onStartGame()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Game Settings</h2>
        <p className="text-muted-foreground">Customize your training experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="difficulty" className="text-base">
            Difficulty Level
          </Label>
          <RadioGroup
            id="difficulty"
            value={localSettings.difficulty}
            onValueChange={(value) => handleChange("difficulty", value)}
            className="flex flex-col space-y-1 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="easy" id="easy" />
              <Label htmlFor="easy">Easy</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium">Medium</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hard" id="hard" />
              <Label htmlFor="hard">Hard</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="taskType" className="text-base">
            Task Type
          </Label>
          <Select value={localSettings.taskType} onValueChange={(value) => handleChange("taskType", value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select task type" />
            </SelectTrigger>
            <SelectContent>
              {gameType === "reaction" ? (
                <>
                  <SelectItem value="simple">Simple Reaction</SelectItem>
                  <SelectItem value="choice">Choice Reaction</SelectItem>
                  <SelectItem value="go-no-go">Go/No-Go</SelectItem>
                  <SelectItem value="discrimination">Discrimination</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="sound" className="text-base">
            Sound Effects
          </Label>
          <Switch
            id="sound"
            checked={localSettings.soundEnabled}
            onCheckedChange={(checked) => handleChange("soundEnabled", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="visualFeedback" className="text-base">
            Visual Feedback
          </Label>
          <Switch
            id="visualFeedback"
            checked={localSettings.visualFeedback}
            onCheckedChange={(checked) => handleChange("visualFeedback", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="progressBar" className="text-base">
            Show Progress Bar
          </Label>
          <Switch
            id="progressBar"
            checked={localSettings.showProgressBar}
            onCheckedChange={(checked) => handleChange("showProgressBar", checked)}
          />
        </div>
      </div>

      <div className="pt-4 flex justify-center">
        <Button onClick={handleSave} size="lg">
          Start Game
        </Button>
      </div>
    </div>
  )
}

