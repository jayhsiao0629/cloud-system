"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Filter, UserPlus, Bot, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Checkbox } from "@/components/ui/checkbox"

// Mock data
const tasks = [
  {
    id: 1,
    name: "溫度應力測試 - 樣品 A",
    project: { id: 1, name: "先進材料測試專案" },
    testType: "temperature",
    status: "Assigned",
    assignedUser: { id: 1, username: "陳雅琳", skills: ["temperature", "electrical"] },
    assignedDevice: { id: 1, name: "熱循環箱 A", supportedTypes: ["temperature"] },
    deadline: "2024-01-20T17:00:00Z",
    deviceCount: 1,
    startTime: "2024-01-18T09:00:00Z",
    endTime: "2024-01-18T17:00:00Z",
    instructions: "執行 -40°C 到 85°C 的溫度循環測試",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "電性能分析",
    project: { id: 1, name: "先進材料測試專案" },
    testType: "electrical",
    status: "Unassigned",
    assignedUser: null,
    assignedDevice: null,
    deadline: "2024-01-22T17:00:00Z",
    deviceCount: 2,
    startTime: null,
    endTime: null,
    instructions: "在各種條件下測量電性特性",
    createdAt: "2024-01-15T11:00:00Z",
  },
]

const availableUsers = [
  {
    id: 1,
    username: "陳雅琳",
    skills: ["temperature", "electrical"],
    currentTasks: 2,
    allowedDevices: ["熱循環箱 A", "示波器 A"],
  },
  {
    id: 2,
    username: "王志明",
    skills: ["physical", "temperature"],
    currentTasks: 1,
    allowedDevices: ["萬能試驗機", "熱循環箱 A"],
  },
]

const availableDevices = [
  {
    id: 1,
    name: "熱循環箱 A",
    supportedTypes: ["temperature"],
    status: "Available",
  },
  {
    id: 2,
    name: "示波器 A",
    supportedTypes: ["electrical"],
    status: "Occupied",
  },
]

const testTypes = [
  { id: "temperature", name: "溫度測試" },
  { id: "electrical", name: "電性測試" },
  { id: "physical", name: "物性測試" },
]

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [assignmentMode, setAssignmentMode] = useState<"manual" | "auto">("manual")
  const [newTask, setNewTask] = useState({
    name: "",
    projectId: "",
    testType: "",
    deadline: "",
    deviceCount: 1,
    instructions: "",
  })
  const [assignment, setAssignment] = useState({
    userId: "",
    deviceId: "",
    startTime: "",
    endTime: "",
  })

  const handleCreateTask = () => {
    console.log("Creating task:", newTask)
    setIsCreateDialogOpen(false)
    setNewTask({ name: "", projectId: "", testType: "", deadline: "", deviceCount: 1, instructions: "" })
  }

  const handleAssignTask = () => {
    if (assignmentMode === "auto") {
      // 自動派工邏輯
      console.log("Auto-assigning task:", selectedTask.id)
    } else {
      // 手動派工邏輯
      console.log("Manual assignment:", { taskId: selectedTask.id, assignment })
    }
    setIsAssignDialogOpen(false)
    setSelectedTask(null)
    setAssignment({ userId: "", deviceId: "", startTime: "", endTime: "" })
  }

  const checkAssignmentValidity = () => {
    if (assignmentMode === "auto") return true

    const user = availableUsers.find((u) => u.id.toString() === assignment.userId)
    const device = availableDevices.find((d) => d.id.toString() === assignment.deviceId)

    if (!user || !device || !selectedTask) return false

    // 檢查技能匹配
    const hasRequiredSkill = user.skills.includes(selectedTask.testType)
    // 檢查設備支援
    const deviceSupportsTest = device.supportedTypes.includes(selectedTask.testType)
    // 檢查設備權限
    const userCanUseDevice = user.allowedDevices.includes(device.name)
    // 檢查設備可用性
    const deviceAvailable = device.status === "Available"

    return hasRequiredSkill && deviceSupportsTest && userCanUseDevice && deviceAvailable
  }

  const getValidationErrors = () => {
    const errors = []
    if (assignmentMode === "manual" && assignment.userId && assignment.deviceId && selectedTask) {
      const user = availableUsers.find((u) => u.id.toString() === assignment.userId)
      const device = availableDevices.find((d) => d.id.toString() === assignment.deviceId)

      if (user && !user.skills.includes(selectedTask.testType)) {
        errors.push("User lacks required skill")
      }
      if (device && !device.supportedTypes.includes(selectedTask.testType)) {
        errors.push("Device doesn't support test type")
      }
      if (user && device && !user.allowedDevices.includes(device.name)) {
        errors.push("User not authorized for this device")
      }
      if (device && device.status !== "Available") {
        errors.push("Device is not available")
      }
    }
    return errors
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Assign and manage testing tasks</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Add a new testing task to a project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-name">Task Name</Label>
                <Input
                  id="task-name"
                  value={newTask.name}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter task name"
                />
              </div>
              <div>
                <Label htmlFor="test-type">Test Type</Label>
                <Select
                  value={newTask.testType}
                  onValueChange={(value) => setNewTask((prev) => ({ ...prev, testType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="device-count">Required Device Count</Label>
                <Input
                  id="device-count"
                  type="number"
                  min="1"
                  value={newTask.deviceCount}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, deviceCount: Number.parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newTask.instructions}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Enter task instructions"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>Testing tasks and their assignment status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{task.name}</p>
                      <p className="text-sm text-gray-600">{task.project.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{testTypes.find((t) => t.id === task.testType)?.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        task.status === "Completed"
                          ? "default"
                          : task.status === "In Progress"
                            ? "secondary"
                            : task.status === "Assigned"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.assignedUser ? (
                      <div>
                        <p className="font-medium">{task.assignedUser.username}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.assignedUser.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.assignedDevice ? (
                      <Badge variant="outline">{task.assignedDevice.name}</Badge>
                    ) : (
                      <span className="text-gray-500">No device</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{new Date(task.deadline).toLocaleDateString()}</span>
                      {new Date(task.deadline) < new Date() && task.status !== "Completed" && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {task.status === "Unassigned" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task)
                            setIsAssignDialogOpen(true)
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>Assign "{selectedTask?.name}" to a user and device</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Assignment Mode Selection */}
            <div>
              <Label>Assignment Mode</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="manual"
                    checked={assignmentMode === "manual"}
                    onCheckedChange={() => setAssignmentMode("manual")}
                  />
                  <Label htmlFor="manual" className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Manual Assignment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto"
                    checked={assignmentMode === "auto"}
                    onCheckedChange={() => setAssignmentMode("auto")}
                  />
                  <Label htmlFor="auto" className="flex items-center">
                    <Bot className="h-4 w-4 mr-1" />
                    Auto Assignment
                  </Label>
                </div>
              </div>
            </div>

            {assignmentMode === "manual" && (
              <>
                {/* User Selection */}
                <div>
                  <Label htmlFor="assign-user">Select User</Label>
                  <Select
                    value={assignment.userId}
                    onValueChange={(value) => setAssignment((prev) => ({ ...prev, userId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{user.username}</span>
                            <div className="flex space-x-1 ml-2">
                              {user.skills.includes(selectedTask?.testType) ? (
                                <Badge variant="default" className="text-xs">
                                  ✓ Skill
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  ✗ Skill
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Device Selection */}
                <div>
                  <Label htmlFor="assign-device">Select Device</Label>
                  <Select
                    value={assignment.deviceId}
                    onValueChange={(value) => setAssignment((prev) => ({ ...prev, deviceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDevices.map((device) => (
                        <SelectItem key={device.id} value={device.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{device.name}</span>
                            <div className="flex space-x-1 ml-2">
                              {device.supportedTypes.includes(selectedTask?.testType) ? (
                                <Badge variant="default" className="text-xs">
                                  ✓ Compatible
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  ✗ Incompatible
                                </Badge>
                              )}
                              <Badge
                                variant={device.status === "Available" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {device.status}
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={assignment.startTime}
                      onChange={(e) => setAssignment((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="datetime-local"
                      value={assignment.endTime}
                      onChange={(e) => setAssignment((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Validation Errors */}
                {getValidationErrors().length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-800">Assignment Issues:</span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {getValidationErrors().map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {assignmentMode === "auto" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-800">Auto Assignment</span>
                </div>
                <p className="text-sm text-blue-700">
                  The system will automatically find the best user and device combination based on:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 mt-2">
                  <li>Required skills and user capabilities</li>
                  <li>Device compatibility and availability</li>
                  <li>Current workload distribution</li>
                  <li>Optimal scheduling</li>
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTask} disabled={assignmentMode === "manual" && !checkAssignmentValidity()}>
              {assignmentMode === "auto" ? "Auto Assign" : "Assign Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
