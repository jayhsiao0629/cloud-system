"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "陳雅琳", tests: 8 },
  { name: "王志明", tests: 6 },
  { name: "李佳慧", tests: 5 },
  { name: "張大偉", tests: 4 },
  { name: "劉美玲", tests: 3 },
  { name: "黃建華", tests: 2 },
]

export function UserWorkloadChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Workload</CardTitle>
        <CardDescription>Number of active tests per user</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="tests" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
