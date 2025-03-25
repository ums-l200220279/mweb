"use client"

import { useState } from "react"
import { useAccessibilitySettings } from "@/lib/accessibility"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings2 } from "lucide-react"

const defaultAccessibilitySettings = {
  fontSize: "normal",
  contrast: "normal",
  reducedMotion: false,
  simplifiedUI: false,
  keyboardNavigation: false,
}

/**
 * Panel pengaturan aksesibilitas
 */
export function AccessibilityPanel() {
  const [settings, updateSettings] = useAccessibilitySettings()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full"
          aria-label="Accessibility Settings"
        >
          <Settings2 className="h-5 w-5" />
          <span className="sr-only">Accessibility Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[350px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle>Accessibility Settings</SheetTitle>
          <SheetDescription>Customize your experience to make the application more accessible.</SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Font Size</h3>
            <RadioGroup
              value={settings.fontSize}
              onValueChange={(value) => updateSettings({ fontSize: value as any })}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="font-normal" />
                <Label htmlFor="font-normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="font-large" />
                <Label htmlFor="font-large">Large</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="x-large" id="font-x-large" />
                <Label htmlFor="font-x-large">Extra Large</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Contrast */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Contrast</h3>
            <RadioGroup
              value={settings.contrast}
              onValueChange={(value) => updateSettings({ contrast: value as any })}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="contrast-normal" />
                <Label htmlFor="contrast-normal">Normal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="contrast-high" />
                <Label htmlFor="contrast-high">High Contrast</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
            />
          </div>

          {/* Simplified UI */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="simplified-ui">Simplified Interface</Label>
              <p className="text-sm text-muted-foreground">Reduce visual complexity</p>
            </div>
            <Switch
              id="simplified-ui"
              checked={settings.simplifiedUI}
              onCheckedChange={(checked) => updateSettings({ simplifiedUI: checked })}
            />
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="keyboard-navigation">Enhanced Keyboard Navigation</Label>
              <p className="text-sm text-muted-foreground">Improve focus indicators and keyboard shortcuts</p>
            </div>
            <Switch
              id="keyboard-navigation"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) => updateSettings({ keyboardNavigation: checked })}
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => updateSettings(defaultAccessibilitySettings)}>
            Reset to Default
          </Button>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

