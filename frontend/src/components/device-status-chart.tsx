"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "可用", value: 18, color: "#10b981" },
  { name: "已預約", value: 4, color: "#f59e0b" },
  { name: "使用中", value: 2, color: "#3b82f6" },
  { name: "維護中", value: 1, color: "#ef4444" },
]

export function DeviceStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Status</CardTitle>
        <CardDescription>Current status of all laboratory devices</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
