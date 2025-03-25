import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Zap, Activity, Eye, Puzzle, Lightbulb, Calendar, ArrowRight, Clock, Trophy } from "lucide-react"
import Link from "next/link"
import { CognitiveScoreChart } from "@/components/dashboard/cognitive-score-chart"
import { DomainProgressChart } from "@/components/dashboard/domain-progress-chart"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { TrainingCalendar } from "@/components/dashboard/training-calendar"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cognitive Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and see your cognitive improvements over time</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Training History
          </Button>
          <Button>
            Start Training
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cognitive Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">850</div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                +12%
              </div>
            </div>
            <Progress value={85} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Training Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">14 days</div>
              <Trophy className="h-5 w-5 text-yellow-500" />
            </div>
            <Progress value={70} className="h-1 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">6 days until next milestone</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Training Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">12h 45m</div>
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <Progress value={60} className="h-1 mt-2" />
            <p className="text-xs text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Games Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">87</div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500">
                +8 this week
              </div>
            </div>
            <Progress value={75} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Cognitive Score Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Performance</CardTitle>
              <CardDescription>Your cognitive score trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <CognitiveScoreChart />
            </CardContent>
          </Card>

          {/* Domain Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Domain Progress</CardTitle>
              <CardDescription>Your performance across different cognitive domains</CardDescription>
            </CardHeader>
            <CardContent>
              <DomainProgressChart />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {domains.map((domain) => (
                  <div key={domain.name} className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-${domain.color}/10`}>{domain.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{domain.name}</p>
                        <span className={`text-xs text-${domain.color}-600`}>+{domain.improvement}%</span>
                      </div>
                      <Progress value={domain.score} className="h-1 mt-1 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest training sessions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivities />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Recommended Training */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Recommended Training</CardTitle>
              <CardDescription>Personalized for your cognitive profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedGames.map((game, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-3 rounded-lg bg-${game.color}/10`}>{game.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{game.name}</h3>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{game.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{game.domain}</span>
                      <Link href={game.href}>
                        <Button variant="ghost" size="sm" className="h-8">
                          Play
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2">
                View All Recommendations
              </Button>
            </CardContent>
          </Card>

          {/* Training Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Training Calendar</CardTitle>
              <CardDescription>Your training consistency</CardDescription>
            </CardHeader>
            <CardContent>
              <TrainingCalendar />
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Milestones you've reached</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                    <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2">
                View All Achievements
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const domains = [
  {
    name: "Attention",
    score: 85,
    improvement: 12,
    color: "purple",
    icon: <Brain className="h-4 w-4 text-purple-500" />,
  },
  {
    name: "Processing Speed",
    score: 92,
    improvement: 18,
    color: "orange",
    icon: <Zap className="h-4 w-4 text-orange-500" />,
  },
  {
    name: "Memory",
    score: 78,
    improvement: 8,
    color: "green",
    icon: <Activity className="h-4 w-4 text-green-500" />,
  },
  {
    name: "Visual-Spatial",
    score: 82,
    improvement: 10,
    color: "blue",
    icon: <Eye className="h-4 w-4 text-blue-500" />,
  },
  {
    name: "Problem Solving",
    score: 75,
    improvement: 15,
    color: "red",
    icon: <Puzzle className="h-4 w-4 text-red-500" />,
  },
  {
    name: "Cognitive Flexibility",
    score: 80,
    improvement: 9,
    color: "yellow",
    icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
  },
]

const recommendedGames = [
  {
    name: "Divided Attention Challenge",
    description: "Improve your ability to handle multiple tasks simultaneously",
    domain: "Attention",
    duration: "5 min",
    color: "purple",
    icon: <Brain className="h-5 w-5 text-purple-500" />,
    href: "/games/divided-attention",
  },
  {
    name: "Speed Processing Test",
    description: "Enhance your information processing speed",
    domain: "Processing Speed",
    duration: "3 min",
    color: "orange",
    icon: <Zap className="h-5 w-5 text-orange-500" />,
    href: "/games/reaction-time",
  },
  {
    name: "Working Memory Matrix",
    description: "Train your ability to hold and manipulate information",
    domain: "Memory",
    duration: "4 min",
    color: "green",
    icon: <Activity className="h-5 w-5 text-green-500" />,
    href: "/games/working-memory",
  },
]

const achievements = [
  {
    name: "7-Day Streak Master",
    date: "Completed yesterday",
  },
  {
    name: "Processing Speed Champion",
    date: "Completed 3 days ago",
  },
  {
    name: "Memory Master - Level 5",
    date: "Completed last week",
  },
]

