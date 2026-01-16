import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp, Award, BarChart3 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              YearZero
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Level up your life. Transform resolutions into achievements with XP, streaks, and badges.
            </p>
            <p className="text-sm text-muted-foreground/80">
              Start your journey. Every day is a new level.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card className="hover:shadow-lg transition-all hover:scale-105 border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 mx-auto">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Track Resolutions</CardTitle>
                <CardDescription>
                  Set daily or weekly goals with flexible tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 border-orange-200 dark:border-orange-800">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-3 mx-auto">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Build Streaks</CardTitle>
                <CardDescription>
                  Maintain your combo with streak tracking and grace tokens
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 border-yellow-200 dark:border-yellow-800">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mb-3 mx-auto">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Earn XP & Badges</CardTitle>
                <CardDescription>
                  Level up and unlock achievements as you complete resolutions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:scale-105 border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 mx-auto">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Weekly Stats</CardTitle>
                <CardDescription>
                  Analyze your performance and discover patterns
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

