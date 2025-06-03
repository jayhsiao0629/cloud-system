"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Users, TestTube } from "lucide-react"
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
import { set } from "date-fns"

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: "", description: "" })
  const [editingSkill, setEditingSkill] = useState(null)

  useEffect(() => {
    fetch("/api/v1/getSkills")
      .then(res => res.json())
      .then(data => setSkills(data))
      .catch(err => console.error("Fetch devices error:", err))
  }, [])

  const handleCreateSkill = () => {
    setIsCreateDialogOpen(false)
    fetch("/api/v1/createSkill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSkill),
    })
      .then((res) => res.json())
      .then((data) => {
        setSkills((prev) => [...prev, { ...data, id: Date.now() }]) // Assuming the API returns the created skill
      })
      .catch((err) => console.error("Create skill error:", err))
   
    setNewSkill({ name: "", description: "" })
  }

  const handleEditSkill = (skill) => {
    setEditingSkill(skill)
    setIsEditDialogOpen(true)
  }

  const handleUpdateSkill = () => {
    setSkills((prev) => prev.map((s) => (s.id === editingSkill.id ? editingSkill : s)))
    setIsEditDialogOpen(false)
    setEditingSkill(null)
  }

  const handleDeleteSkill = (skillId) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId))
  }

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
          <p className="text-gray-600">Manage technical skills and competencies</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Skill</DialogTitle>
              <DialogDescription>Add a new technical skill to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input
                  id="skill-name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter skill name"
                />
              </div>
              <div>
                <Label htmlFor="skill-description">Description</Label>
                <Textarea
                  id="skill-description"
                  value={newSkill.description}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter skill description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSkill}>Create Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Skill Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Skill</DialogTitle>
              <DialogDescription>Update skill information</DialogDescription>
            </DialogHeader>
            {editingSkill && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-skill-name">Skill Name</Label>
                  <Input
                    id="edit-skill-name"
                    value={editingSkill.name}
                    onChange={(e) =>
                      setEditingSkill((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-skill-description">Description</Label>
                  <Textarea
                    id="edit-skill-description"
                    value={editingSkill.description}
                    onChange={(e) =>
                      setEditingSkill((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSkill}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search skills by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Skills Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Skills ({filteredSkills.length})</CardTitle>
          <CardDescription>Technical competencies and their usage</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Compatible Methods</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSkills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell className="font-medium">{skill.name}</TableCell>
                  <TableCell>{skill.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {skill.methods.map((method) => (
                        <Badge key={method.id} variant="outline" className="text-xs">
                          {method.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditSkill(skill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSkill(skill.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
