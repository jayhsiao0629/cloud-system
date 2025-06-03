"use client"

import { use, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { set } from "date-fns"

const availableLeaders = [
  { id: 2, username: "leader", email: "leader@test.com" },
  { id: 3, username: "leader2", email: "leader2@test.com" }
]

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [availableLeaders, setAvailableLeaders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentGroup, setCurrentGroup] = useState({
    id: null,
    leader_id: "",
    name: "",
    description: "",
  })

  useEffect(() => {
    fetch("/api/v1/getGroups")
      .then((res) => res.json())
      .then((data) => {
        setGroups(data)
      })
      .catch((error) => {
        console.error("Error fetching groups:", error)
      }
    )

    fetch("/api/v1/getUsers")
      .then((res) => res.json())
      .then((data) => {
        const leaders = data.users.filter(user => user.role.name === "Leader")
        setAvailableLeaders(leaders)
      })
      .catch((error) => {
        console.error("Error fetching leaders:", error)
      })
  }, [])

  const handleOpenCreate = () => {
    setEditMode(false)
    setCurrentGroup({ id: null, leader_id: null, name: "", description: "" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (group) => {
    setEditMode(true)
    setCurrentGroup({
      id: group.id,
      leader_id: group.leader.id,
      name: group.name,
      description: group.description,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id) => {
    if (!confirm("確認要刪除此群組嗎？")) return;
    fetch(`/api/v1/deleteGroup/${id}`, {
      method: "DELETE"
    })
      .then(res => {
        if (!res.ok) throw new Error("Delete failed");
        setGroups((prev) => prev.filter((g) => g.id !== id))
      })
      .catch(err => console.error("Delete error:", err));
  }

  const handleSubmit = () => {
    if (editMode) {
      fetch(`/api/v1/updateGroup/${currentGroup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentGroup.id,
          name: currentGroup.name,
          description: currentGroup.description,
          leader_id: currentGroup.leader_id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setGroups((prev) =>
            prev.map((g) => (g.id === data.id ? { ...g, ...data } : g))
          )
        })
        .catch((error) => {
          console.error("Error updating group:", error)
        })
    } else {
      fetch("/api/v1/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentGroup.name,
          description: currentGroup.description,
          leader_id: currentGroup.leader_id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setGroups((prev) => [...prev, { ...data, memberCount: 0 }]) // Assuming the API returns the new group with an id
        })
        .catch((error) => {
          console.error("Error creating group:", error)
        })
    }
    setIsDialogOpen(false)
  }

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600">Manage test groups and assign leaders</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Group" : "Create Group"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Update group information" : "Set up a new test group"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Group Name</Label>
            <Input
              value={currentGroup.name}
              onChange={(e) => setCurrentGroup((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Label>Description</Label>
            <Textarea
              value={currentGroup.description}
              onChange={(e) => setCurrentGroup((prev) => ({ ...prev, description: e.target.value }))}
            />
            <Label>Group Leader</Label>
            <Select
              value={currentGroup.leader_id}
              onValueChange={(v) => setCurrentGroup((prev) => ({ ...prev, leader_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a leader" />
              </SelectTrigger>
              <SelectContent>
                {availableLeaders.map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>
                    {l.username} ({l.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editMode ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Groups ({filteredGroups.length})</CardTitle>
          <CardDescription>Overview of groups and their leaders</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md mb-4"
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.name}</TableCell>
                  <TableCell>{g.leader ? `${g.leader.username} (${g.leader.email})` : <Badge>No Leader</Badge>}</TableCell>
                  <TableCell><Badge variant="outline">{g.memberCount}</Badge></TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(g)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(g.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
