"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GroupTestsTable } from "@/components/group-tests-table"
import { Plus, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">測試管理</h1>
          <p className="text-gray-600">管理和監控群組內的所有測試</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            篩選條件
          </CardTitle>
          <CardDescription>依狀態、方法或搜尋關鍵字篩選測試</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="搜尋測試..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="依狀態篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有狀態</SelectItem>
                <SelectItem value="pending">待分派</SelectItem>
                <SelectItem value="in-progress">進行中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="failed">失敗</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="依方法篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有方法</SelectItem>
                <SelectItem value="temperature">溫度測試</SelectItem>
                <SelectItem value="electrical">電性測試</SelectItem>
                <SelectItem value="physical">物性測試</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">清除篩選</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>所有測試</CardTitle>
          <CardDescription>實驗室測試完整清單</CardDescription>
        </CardHeader>
        <CardContent>
          <GroupTestsTable />
        </CardContent>
      </Card>
    </div>
  )
}
