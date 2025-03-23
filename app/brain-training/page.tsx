import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Trophy, Clock, BarChart, Zap, Star, Activity } from "lucide-react"

export const metadata: Metadata = {
  title: "Brain Training | Memoright",
  description: "Improve your cognitive abilities with our scientifically designed brain training games.",
}

export default function BrainTrainingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Brain Training
          </h1>
          <p className="text-muted-foreground mt-2">
            Scientifically designed games to improve cognitive abilities and track your progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/brain-training/progress">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              My Progress
            </Button>
          </Link>
          <Link href="/brain-training/leaderboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {/* Featured Game */}
        <Card className="col-span-full bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Today's Recommended Game</CardTitle>
                <CardDescription>Based on your cognitive profile and progress</CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-1/3 aspect-video md:aspect-square rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Brain className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Pattern Recognition</h3>
                <p className="text-muted-foreground mb-4">
                  Identify patterns and predict what comes next. This game helps improve your logical reasoning and
                  pattern recognition abilities.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">Logic</Badge>
                  <Badge variant="outline">Pattern Recognition</Badge>
                  <Badge variant="outline">Processing Speed</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    5-10 min
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Medium
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/brain-training/games/pattern-recognition" className="w-full">
              <Button className="w-full">Play Now</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Memory Games */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-yellow-100 text-yellow-700">
                <Brain className="h-5 w-5" />
              </div>
              Memory Games
            </CardTitle>
            <CardDescription>Improve memory recall and retention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/brain-training/games/memory-match">
                <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded bg-yellow-100 flex items-center justify-center text-yellow-700 shrink-0">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">Memory Match</h3>
                    <p className="text-sm text-muted-foreground">Find matching pairs of cards</p>
                  </div>
                  <Badge variant="outline">Popular</Badge>
                </div>
              </Link>

              <Link href="/brain-training/games/sequence-recall">
                <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded bg-yellow-100 flex items-center justify-center text-yellow-700 shrink-0">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">Sequence Recall</h3>
                    <p className="text-sm text-muted-foreground">Remember and repeat sequences</p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/brain-training/category/memory" className="w-full">
              <Button variant="outline" className="w-full">
                View All Memory Games
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Attention Games */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-700">
                <Activity className="h-5 w-5" />
              </div>
              Attention Games
            </CardTitle>
            <CardDescription>Enhance focus and concentration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/brain-training/games/attention-focus">
                <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">Attention Focus</h3>
                    <p className="text-sm text-muted-foreground">Identify targets among distractors</p>
                  </div>
                </div>
              </Link>

              <Link href="/brain-training/games/divided-attention">
                <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">Divided Attention</h3>
                    <p className="text-sm text-muted-foreground">Multitask effectively</p>
                  </div>
                  <Badge variant="outline">New</Badge>
                </div>
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/brain-training/category/attention" className="w-full">
              <Button variant="outline" className="w-full">
                View All Attention Games
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Processing Speed Games */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-green-100 text-green-700">
                <Zap className="h-5 w-5" />
              </div>
              Processing Speed
            </CardTitle>
            <CardDescription>Improve mental processing velocity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/brain-training/games/quick-match">
                <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">Quick Match</h3>
                    <p className="text-sm text-muted-foreground">Rapidly identify matching items</p>
                  </div>
                </div>
              </Link>

              <Link href="/brain-training/games/pattern-recognition">
                <div className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="w-12 h-12 rounded bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">Pattern Recognition</h3>
                    <p className="text-sm text-muted-foreground">Identify patterns quickly</p>
                  </div>
                  <Badge variant="outline">Recommended</Badge>
                </div>
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/brain-training/category/processing-speed" className="w-full">
              <Button variant="outline" className="w-full">
                View All Processing Speed Games
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Cognitive Assessment */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Cognitive Assessment</h2>
          <Link href="/brain-training/assessment">
            <Button>Take Assessment</Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="aspect-square bg-primary/10 rounded-full flex items-center justify-center">
                  <Brain className="h-16 w-16 text-primary" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Comprehensive Cognitive Assessment</h3>
                <p className="text-muted-foreground mb-4">
                  Take our scientifically validated cognitive assessment to establish your baseline and get personalized
                  game recommendations. The assessment takes approximately 15-20 minutes to complete.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Memory</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-medium">Baseline</p>
                      <Badge variant="outline">Needed</Badge>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Attention</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-medium">Baseline</p>
                      <Badge variant="outline">Needed</Badge>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Processing</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-medium">Baseline</p>
                      <Badge variant="outline">Needed</Badge>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Executive Function</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-medium">Baseline</p>
                      <Badge variant="outline">Needed</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Your assessment results will help us create a personalized training program tailored to your specific
                  cognitive needs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Training Plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Memory Boost</CardTitle>
              <CardDescription>Enhance memory recall and retention</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>15 minutes daily training</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Focused memory exercises</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Weekly progress reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Personalized difficulty adjustment</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">Recommended for those looking to improve memory function.</p>
            </CardContent>
            <CardFooter>
              <Link href="/brain-training/plans/memory-boost" className="w-full">
                <Button variant="outline" className="w-full">
                  View Plan
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Comprehensive Training</CardTitle>
                <Badge>Popular</Badge>
              </div>
              <CardDescription>Full-spectrum cognitive enhancement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>20 minutes daily training</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Balanced across all cognitive domains</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Detailed analytics and insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Adaptive difficulty progression</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <span>Monthly cognitive assessment</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">Our most popular plan for overall cognitive health.</p>
            </CardContent>
            <CardFooter>
              <Link href="/brain-training/plans/comprehensive" className="w-full">
                <Button className="w-full">View Plan</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Focus & Attention</CardTitle>
              <CardDescription>Sharpen concentration and focus</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>15 minutes daily training</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Attention and focus exercises</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Distraction resistance training</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Performance tracking</span>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Ideal for improving concentration and reducing distractibility.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/brain-training/plans/focus-attention" className="w-full">
                <Button variant="outline" className="w-full">
                  View Plan
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

