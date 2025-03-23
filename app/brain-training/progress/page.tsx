import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, Brain, Trophy, Calendar, Activity, ArrowUp, ArrowDown } from "lucide-react"
import { CognitiveScoreChart } from "@/components/progress/cognitive-score-chart"
import { GamePerformanceTable } from "@/components/progress/game-performance-table"
import { AchievementsList } from "@/components/progress/achievements-list"

export const metadata: Metadata = {
  title: "Progress | Brain Training | Memoright",
  description: "Track your cognitive improvements and brain training progress over time",
}

export default function ProgressPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/brain-training">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Brain Training
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your cognitive improvements and brain training achievements over time.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Cognitive Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">78</div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">12%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">7</div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span>2 new this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5 days</div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <span>Best: 14 days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cognitive">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="cognitive" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Cognitive Scores</span>
              <span className="sm:hidden">Scores</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Game Performance</span>
              <span className="sm:hidden">Games</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Achievements</span>
              <span className="sm:hidden">Rewards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cognitive" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Cognitive Performance</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Week
                    </Button>
                    <Button variant="default" size="sm">
                      Month
                    </Button>
                    <Button variant="outline" size="sm">
                      Year
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                  <CognitiveScoreChart />
                </Suspense>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Strongest Areas</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span>Memory</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span>Visual Processing</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "78%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span>Attention</span>
                        <span className="font-medium">72%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: "72%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span>Processing Speed</span>
                        <span className="font-medium">58%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: "58%" }} />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">5%</span>
                        <span className="ml-1">improvement</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span>Executive Function</span>
                        <span className="font-medium">62%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: "62%" }} />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-red-500 font-medium">2%</span>
                        <span className="ml-1">decline</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1 text-sm">
                        <span>Language</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "65%" }} />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">3%</span>
                        <span className="ml-1">improvement</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Recent Game Performance</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                  <GamePerformanceTable />
                </Suspense>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Memory Match Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Games Played</span>
                      <span className="font-medium">24</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Best Score</span>
                      <span className="font-medium">1,250</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Completion</span>
                      <span className="font-medium">85%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Fastest Time</span>
                      <span className="font-medium">1:24</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Improvement Rate</span>
                      <span className="font-medium text-green-500">+12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Pattern Recognition Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Games Played</span>
                      <span className="font-medium">18</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Best Score</span>
                      <span className="font-medium">980</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Longest Pattern</span>
                      <span className="font-medium">9 colors</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                      <span className="font-medium">1.2s</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Improvement Rate</span>
                      <span className="font-medium text-green-500">+8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Your Achievements</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                  <AchievementsList />
                </Suspense>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Next Achievements</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Memory Master</h4>
                        <p className="text-sm text-muted-foreground">
                          Complete Memory Match on hard difficulty with 100% accuracy
                        </p>
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden w-full">
                          <div className="h-full bg-primary rounded-full" style={{ width: "70%" }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">70% complete</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Consistent Learner</h4>
                        <p className="text-sm text-muted-foreground">Maintain a 14-day training streak</p>
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden w-full">
                          <div className="h-full bg-primary rounded-full" style={{ width: "35%" }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">5/14 days</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Achievement Stats</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Achievements</span>
                      <span className="font-medium">7/20</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bronze Tier</span>
                      <span className="font-medium">4/6</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Silver Tier</span>
                      <span className="font-medium">2/6</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Gold Tier</span>
                      <span className="font-medium">1/5</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Platinum Tier</span>
                      <span className="font-medium">0/3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

