"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Eye, UserPlus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const statusColors = {
  待分派: "bg-yellow-100 text-yellow-800",
  進行中: "bg-blue-100 text-blue-800",
  已完成: "bg-green-100 text-green-800",
  失敗: "bg-red-100 text-red-800",
  已取消: "bg-gray-100 text-gray-800",
}

export function TestsTable() {
  const [tests, setTests] = useState([])
  const [groups, setGroups] = useState([])
  const [methods, setMethods] = useState([])
  const [editingTest, setEditingTest] = useState(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetch("/api/v1/getTests")
      .then(res => res.json())
      .then(data => setTests(data))
      .catch(err => console.error("Fetch devices error:", err))

    fetch("/api/v1/getGroups")
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(err => console.error("Fetch groups error:", err))

    fetch("/api/v1/getMethods")
      .then(res => res.json())
      .then(data => setMethods(data))
      .catch(err => console.error("Fetch methods error:", err))
  }, [])

  const handleEdit = (test) => {
    setEditingTest(test)
    setIsEditDialogOpen(true)
  }

  const handleUpdateTest = () => {
    fetch(`/api/v1/updateTest/${editingTest.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: editingTest.description,
        display_id: editingTest.display_id,
        group_id: editingTest.group_id,
        method_id: editingTest.method_id,
        name: editingTest.name,
        status: editingTest.status,
      }),
    })
      .then(res => res.json())
      .then((data) => {
        setTests(prev => prev.map(t => t.id === data.id ? data : t))
        setIsEditDialogOpen(false)
      })
      .catch(err => console.error("更新失敗:", err))
  }

  const handleDelete = (test) => {
    setEditingTest(test)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    fetch(`/api/v1/deleteTest/${editingTest.id}`, {
      method: "DELETE"
    })
      .then(res => {
        if (!res.ok) throw new Error("刪除失敗")
        setTests(prev => prev.filter(t => t.id !== editingTest.id))
        setIsDeleteDialogOpen(false)
      })
      .catch(err => console.error("刪除錯誤:", err))
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Test ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Group Name</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned Users</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test.id}>
              <TableCell className="font-medium">{test.display_id}</TableCell>
              <TableCell>{test.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {groups.find(group => group.id === test.group_id)?.name || "Unknown Group"}
                </Badge>
              </TableCell>
              <TableCell>{test.method.name}</TableCell>
              <TableCell>
                <Badge className={statusColors[test.status as keyof typeof statusColors]}>{test.status}</Badge>
              </TableCell>
              <TableCell>
                {test.users.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {test.users.map((user) => (
                      <Badge key={user.id} variant="outline" className="text-xs">
                        {user.username}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/group-tests/${test.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(test)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(test)}><Trash2 className="h-4 w-4" /></Button>
                  {test.users.length === 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/group-tests/${test.id}/assign`}><UserPlus className="h-4 w-4" /></Link>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯測試</DialogTitle>
            <DialogDescription>修改測試資訊</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Display ID</Label>
            <Input value={editingTest?.display_id || ''} onChange={(e) => setEditingTest(prev => ({ ...prev, display_id: e.target.value }))} placeholder="例如: T-0001-0002" />

            <Label>Name</Label>
            <Input value={editingTest?.name || ''} onChange={(e) => setEditingTest(prev => ({ ...prev, name: e.target.value }))} />

            <Label>Description</Label>
            <Textarea value={editingTest?.description || ''} onChange={(e) => setEditingTest(prev => ({ ...prev, description: e.target.value }))} />

            <Label>Status</Label>
            <Select value={editingTest?.status || ''} onValueChange={(v) => setEditingTest(prev => ({ ...prev, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            <Label>Group</Label>
            <Select value={editingTest?.group_id?.toString() || ''} onValueChange={(v) => setEditingTest(prev => ({ ...prev, group_id: parseInt(v) }))}>
              <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
              <SelectContent>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id.toString()}>{group.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Method</Label>
            <Select value={editingTest?.method_id?.toString() || ''} onValueChange={(v) => setEditingTest(prev => ({ ...prev, method_id: parseInt(v) }))}>
              <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent>
                {methods.map(method => (
                  <SelectItem key={method.id} value={method.id.toString()}>{method.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>取消</Button>
            <Button onClick={handleUpdateTest}>儲存變更</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>刪除確認</DialogTitle>
            <DialogDescription>確認要刪除此測試嗎？此操作無法還原。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmDelete}>確認刪除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
