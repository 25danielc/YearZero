"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface WeeklyChartsProps {
  weeklyData: Array<{
    week: string
    completionRate: number
    xp: number
    total: number
    done: number
    partial: number
  }>
}

export function WeeklyCharts({ weeklyData }: WeeklyChartsProps) {
  const chartData = weeklyData.map((d) => ({
    week: new Date(d.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    completion: Number(d.completionRate.toFixed(1)),
    xp: d.xp,
  }))

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Completion Rate</CardTitle>
          <CardDescription>Last 8 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#8884d8"
                name="Completion %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>XP Earned</CardTitle>
          <CardDescription>Last 8 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="xp" fill="#82ca9d" name="XP" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

