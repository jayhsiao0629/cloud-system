"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TestsTable } from "@/components/tests-table"
import { Plus, Filter } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TestsPage() {
  const [groups, setGroups] = useState([])
  const [methods, setMethods] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    method_id: "",
    group_id: "",
    display_id: "",
    status: "Pending",
  })

  useEffect(() => {
    fetch("/api/v1/getGroups")
      .then((res) => res.json())
      .then((data) => {
        setGroups(data)
      })
      .catch((err) => console.error("Fetch groups error:", err))

    fetch("/api/v1/getMethods")
      .then((res) => res.json())
      .then((data) => {
        setMethods(data)
      })
      .catch((err) => console.error("Fetch methods error:", err))
  }, [])

  const handleCreateTest = () => {
    setIsCreateDialogOpen(false)

    fetch("/api/v1/createTest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTest),
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.reload();
        setNewTest({
          name: "",
          description: "",
          method_id: "",
          group_id: "",
          display_id: "",
          status: "Pending",
        })
      })
      .catch((err) => {
        console.error("新增測試失敗:", err)
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">測試管理</h1>
          <p className="text-gray-600">管理和監控所有實驗室測試</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              建立測試
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>建立新測試</DialogTitle>
              <DialogDescription>請填寫測試資訊</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label>展示 ID </Label>
              <Input
                value={newTest.display_id}
                onChange={(e) => setNewTest(prev => ({ ...prev, display_id: e.target.value }))}
                placeholder="例如: T-0001-0002"
              />

              <Label>測試名稱</Label>
              <Input value={newTest.name} onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))} />

              <Label>測試方法</Label>
              <Select value={newTest.method_id} onValueChange={(v) => setNewTest(prev => ({ ...prev, method_id: v }))}>
                <SelectTrigger><SelectValue placeholder="選擇方法" /></SelectTrigger>
                <SelectContent>
                  {methods.map(method => (
                    <SelectItem key={method.id} value={method.id.toString()}>{method.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>分派群組</Label>
              <Select value={newTest.group_id} onValueChange={(v) => setNewTest(prev => ({ ...prev, group_id: v }))}>
                <SelectTrigger><SelectValue placeholder="選擇群組" /></SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>說明</Label>
              <Textarea value={newTest.description} onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
              <Button onClick={handleCreateTest}>建立</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                {methods.map(method => (
                  <SelectItem key={method.id} value={method.id.toString()}>{method.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setMethodFilter("all")
            }}>清除篩選</Button>
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
          <TestsTable />
        </CardContent>
      </Card>
    </div>
  )
}
