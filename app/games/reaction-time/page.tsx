import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Zap, Info, ArrowRight, Clock, Trophy, BarChart3 } from "lucide-react"
import Link from "next/link"
import ReactionTimeGame from "@/components/games/reaction-time-game"

export default function ReactionTimePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-full">
              <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Processing Speed</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reaction Time Challenge</h1>
          <p className="text-muted-foreground max-w-2xl">
            Enhance your processing speed and response time with various reaction challenges designed to improve neural
            pathways.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Info className="mr-2 h-4 w-4" />
            How to Play
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="play" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="play">Play</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="play" className="space-y-4">
          <Card className="border-2 border-orange-200 dark:border-orange-900/30">
            <CardContent className="p-0">
              <div className="h-[600px] flex items-center justify-center bg-muted/20 relative">
                <ReactionTimeGame
                  settings={{
                    difficulty: 2,
                    taskType: "simple",
                    soundEnabled: true,
                    visualFeedback: true,
                    showProgressBar: true,
                  }}
                  onComplete={(results) => {
                    console.log("Game completed with results:", results)
                    // In a real implementation, this would save results and update the UI
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Approx. 3 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Processing Speed, Attention</span>
              </div>
            </div>
            <Button>
              Start Game
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Customize your training experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <span className="text-sm font-medium">Medium</span>
                </div>
                <Slider id="difficulty" defaultValue={[2]} max={4} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Easy</span>
                  <span>Hard</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Task Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-border rounded-lg p-4 cursor-pointer bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Simple Reaction</h3>
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Respond as quickly as possible to a single stimulus</p>
                  </div>
                  <div className="border border-border rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Choice Reaction</h3>
                      <div className="w-4 h-4 rounded-full border border-border"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose between different responses based on the stimulus
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Go/No-Go</h3>
                      <div className="w-4 h-4 rounded-full border border-border"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Respond to certain stimuli but inhibit response to others
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Enable audio feedback during the game</p>
                  </div>
                  <Switch id="sound" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="visual-feedback">Visual Feedback</Label>
                    <p className="text-sm text-muted-foreground">Show visual cues for correct/incorrect responses</p>
                  </div>
                  <Switch id="visual-feedback" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="progress-bar">Progress Bar</Label>
                    <p className="text-sm text-muted-foreground">Show progress during the game</p>
                  </div>
                  <Switch id="progress-bar" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply Settings & Start Game</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Performance</CardTitle>
              <CardDescription>Track your progress over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold">245ms</p>
                  <p className="text-sm text-muted-foreground">Average Reaction Time</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold">97%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">18/20</p>
                  <p className="text-sm text-muted-foreground">Correct Trials</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Reaction Time Trend</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Week
                    </Button>
                    <Button variant="outline" size="sm" className="bg-muted/50">
                      Month
                    </Button>
                    <Button variant="outline" size="sm">
                      All Time
                    </Button>
                  </div>
                </div>

                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Reaction time chart would render here</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Recent Sessions</h3>
                <div className="border border-border rounded-lg divide-y divide-border">
                  {recentSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{session.date}</p>
                        <p className="text-sm text-muted-foreground">Task: {session.task}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{session.reactionTime}</p>
                        <p className="text-sm text-muted-foreground">{session.accuracy} accuracy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Export Results</Button>
              <Button>
                Start New Game
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const recentSessions = [
  {
    date: "Today, 10:30 AM",
    task: "Simple Reaction",
    reactionTime: "245ms",
    accuracy: "97%",
  },
  {
    date: "Yesterday, 3:15 PM",
    task: "Choice Reaction",
    reactionTime: "320ms",
    accuracy: "92%",
  },
  {
    date: "3 days ago, 11:45 AM",
    task: "Go/No-Go",
    reactionTime: "275ms",
    accuracy: "95%",
  },
]

