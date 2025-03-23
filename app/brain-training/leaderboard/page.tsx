import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, Trophy, Medal, Users, Calendar, Filter } from "lucide-react"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { FriendsLeaderboard } from "@/components/leaderboard/friends-leaderboard"

export const metadata: Metadata = {
  title: "Leaderboard | Brain Training | Memoright",
  description: "See how you compare with others in brain training games",
}

export default function LeaderboardPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/brain-training">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Brain Training
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground mt-1">See how you compare with others in brain training games.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>

            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>This Week</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Your Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">#12</div>
              <div className="text-sm text-muted-foreground mt-1">Top 5% of all users</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Medal className="h-4 w-4 text-primary" />
                Best Game
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Memory Match</div>
              <div className="text-sm text-muted-foreground mt-1">Rank #8 with 1,250 points</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">#1</div>
              <div className="text-sm text-muted-foreground mt-1">Among 8 connected friends</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="global">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Global Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Friends Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Global Rankings</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                  <LeaderboardTable />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Friends Rankings</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                  <FriendsLeaderboard />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

