import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Activity, Info, ArrowRight, Clock, Trophy, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function WorkingMemoryPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
              <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Memory Training</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Working Memory Matrix</h1>
          <p className="text-muted-foreground max-w-2xl">
            Train your ability to temporarily hold and manipulate information, a critical skill for learning and
            problem-solving.
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
          <Card className="border-2 border-green-200 dark:border-green-900/30">
            <CardContent className="p-0">
              <div className="h-[600px] flex items-center justify-center bg-muted/20 relative">
                <div className="text-center">
                  <Activity className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Working Memory Matrix</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Remember the sequence of highlighted squares and reproduce it in the correct order.
                  </p>
                  <Button size="lg">
                    Start Game
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Approx. 4 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Working Memory, Attention</span>
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
                <Label>Memory Task Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-border rounded-lg p-4 cursor-pointer bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Forward Recall</h3>
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Remember and reproduce sequences in the same order</p>
                  </div>
                  <div className="border border-border rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Backward Recall</h3>
                      <div className="w-4 h-4 rounded-full border border-border"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Remember sequences and reproduce them in reverse order
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Pattern Matching</h3>
                      <div className="w-4 h-4 rounded-full border border-border"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Remember visual patterns and identify them later</p>
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
                    <Activity className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">7 items</p>
                  <p className="text-sm text-muted-foreground">Memory Capacity</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-sm text-muted-foreground">Recall Accuracy</p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">15/16</p>
                  <p className="text-sm text-muted-foreground">Correct Sequences</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Memory Capacity Trend</h3>
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
                  <p className="ml-2 text-muted-foreground">Memory capacity chart would render here</p>
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
                        <p className="font-medium">{session.capacity}</p>
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
    task: "Forward Recall",
    capacity: "7 items",
    accuracy: "94%",
  },
  {
    date: "Yesterday, 3:15 PM",
    task: "Backward Recall",
    capacity: "6 items",
    accuracy: "88%",
  },
  {
    date: "3 days ago, 11:45 AM",
    task: "Pattern Matching",
    capacity: "8 items",
    accuracy: "92%",
  },
]

