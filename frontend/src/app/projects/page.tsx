"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Eye, Calendar, Users, TestTube } from "lucide-react"
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
import Link from "next/link"

// Mock data - 組長只能看到自己實驗室的專案
const projects = [
  {
    id: 1,
    name: "先進材料測試專案",
    description: "新型複合材料的全面測試",
    laboratory: { id: 1, name: "電子實驗室" },
    status: "進行中",
    taskCount: 8,
    completedTasks: 3,
    deadline: "2024-02-15T23:59:59Z",
    createdBy: "陳雅琳",
    createdAt: "2024-01-10T09:00:00Z",
  },
  {
    id: 2,
    name: "溫度耐受性研究",
    description: "評估元件在極端溫度下的性能表現",
    laboratory: { id: 1, name: "電子實驗室" },
    status: "規劃中",
    taskCount: 5,
    completedTasks: 0,
    deadline: "2024-03-01T23:59:59Z",
    createdBy: "陳雅琳",
    createdAt: "2024-01-15T14:30:00Z",
  },
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    deadline: "",
  })

  const handleCreateProject = () => {
    console.log("Creating project:", newProject)
    setIsCreateDialogOpen(false)
    setNewProject({ name: "", description: "", deadline: "" })
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "進行中":
        return "bg-green-100 text-green-800"
      case "規劃中":
        return "bg-yellow-100 text-yellow-800"
      case "已完成":
        return "bg-blue-100 text-blue-800"
      case "暫停":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your laboratory projects and tasks</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Set up a new project with multiple testing tasks</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProject.name}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={newProject.description}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                />
              </div>
              <div>
                <Label htmlFor="project-deadline">Deadline</Label>
                <Input
                  id="project-deadline"
                  type="datetime-local"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search projects by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter((p) => p.status === "進行中").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.taskCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (projects.reduce((sum, p) => sum + p.completedTasks, 0) /
                  projects.reduce((sum, p) => sum + p.taskCount, 0)) *
                  100,
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects ({filteredProjects.length})</CardTitle>
          <CardDescription>Projects in your laboratory</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(project.completedTasks / project.taskCount) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {project.completedTasks}/{project.taskCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{new Date(project.deadline).toLocaleDateString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{project.taskCount} tasks</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/projects/${project.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/projects/${project.id}/tasks`}>
                          <TestTube className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
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
