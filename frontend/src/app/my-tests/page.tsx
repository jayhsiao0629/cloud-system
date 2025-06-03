"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, AlertTriangle, CheckCircle, PlayCircle, FileText, Calendar, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Device,
  myTestsAtom,
  Test
} from "./atoms"
import { useAtom } from "jotai"
import DeviceReservationDialog from "@/components/device-reservation-dialog"
import Swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content';
import { set } from "date-fns"
import { isArray } from "util"

const MySwal = withReactContent(Swal)

// Mock data - 只顯示當前用戶的任務
const myTestsMock: Test[] = [
  {
    id: 1,
    name: "溫度應力測試 - 樣品 A",
    display_id: "TST-001",
    project: "先進材料測試專案",
    status: "In Progress",
    created_at: "2024-01-18T09:00:00Z",
    deadline: "2024-01-20T17:00:00Z",
    instructions: "執行 -40°C 到 85°C 的溫度循環測試。每 30 分鐘記錄一次測量值。",
    method: {
      id: 1,
      name: "溫度測試",
      devices: [
        { id: 1, name: "熱循環箱 A" }
      ]
    },
    report: {
      status: "Draft",
      content: "初始設定完成。溫度循環進行中...",
      submittedAt: null,
    },
    isOverdue: false,
  },
  {
    id: 2,
    name: "電性能分析",
    display_id: "TST-002",
    project: "先進材料測試專案",
    status: "Not Started",
    created_at: "2024-01-19T10:00:00Z",
    deadline: "2024-01-22T17:00:00Z",
    instructions: "在各種電壓條件下測量電性特性。使用標準測試協議。",
    method: {
      id: 2,
      name: "電性測試",
      devices: [
        { id: 2, name: "示波器 A" }
      ]
    },
    report: {
      status: "Not Started",
      content: "",
      submittedAt: null,
    },
    isOverdue: false,
  },
  {
    id: 3,
    name: "材料耐久性測試",
    display_id: "TST-003",
    project: "品質評估",
    status: "Completed",
    created_at: "2024-01-15T08:00:00Z",
    deadline: "2024-01-17T17:00:00Z",
    instructions: "對提供的樣品執行拉伸強度和疲勞測試。",
    method: {
      id: 3,
      name: "物性測試",
      devices: [
        { id: 3, name: "萬能試驗機" }
      ]
    },
    report: {
      status: "Submitted",
      content: "所有測試成功完成。結果顯示材料符合規格要求。",
      submittedAt: "2024-01-16T14:30:00Z",
    },
    isOverdue: true,
  },
]

export default function MyTestsPage() {
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportContent, setReportContent] = useState("")
  const [testStatus, setTestStatus] = useState("")
  const [reportId, setReportId] = useState<string | null>(null);
  const [myTests, setMyTests] = useAtom(myTestsAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateReport, setIsCreateReport] = useState(false);
  const [isReservationDialogOpen, setReservationDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUserId = localStorage.getItem("currentUserId") || ""
      if (!savedUserId) {
        console.error("No user ID found in localStorage")
        setMyTests(myTestsMock) // 如果沒有用戶ID，使用mock數據
        return
      }
      setIsLoading(true)
      fetch(`/api/v1/getUser/${savedUserId}/test`)
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data)) {
            console.error("Invalid data format:", data)
            setMyTests(myTestsMock) // 如果數據格式不正確，使用mock數據
            return
          }
          setMyTests(data)
        })
        .catch((err) => {
          console.error("Fetch tasks error:", err)
          setMyTests(myTestsMock) // 如果有錯誤，清空任務列表
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [setMyTests])

  useEffect(() => {
    async function fetchTestReport() {
      if (selectedTest) {
        try {

          const response = await fetch(`/api/v1/getTestReport/${selectedTest.id}`)
          let data = await response.json()
          console.log("Fetched test report:", data)
          const savedUserId = localStorage.getItem("currentUserId")
          const report = Array.isArray(data) ? data.filter((item: any) => item.user_id == savedUserId)[0] : null;
          if (!report) {
            setIsCreateReport(true)
            setReportId(null)
            setReportContent("")
            setTestStatus(selectedTest.status)
          } else {
            setReportId(report?.id ?? null)
            setReportContent(report?.content ?? "")
            setTestStatus(selectedTest.status)
          }
        } catch (error) {
          console.error("Error fetching test report:", error)
        }
      }
    }
    fetchTestReport()
  }, [selectedTest])
    

  const handleUpdateTest = () => {
    fetch(`/api/v1/updateTest/${selectedTest.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: testStatus,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Update response:", data)
        // 更新本地狀態
        setMyTests((prevTests) =>
          prevTests.map((test) =>
            test.id === selectedTest.id ? { ...test, status: testStatus } : test
          )
        )
      })
      .catch((err) => {
        console.error("Update test error:", err)
      })
    if (isCreateReport) {
      handleCreateReport()
    }
    else {
      handleUpdateReport()
    }
  }

  const handleCreateReport = () => {
    fetch(`/api/v1/createTestReport/${selectedTest.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: reportContent,
        user_id: localStorage.getItem("currentUserId"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Create report response:", data)
        // 更新本地狀態
        setMyTests((prevTests) =>
          prevTests.map((test) =>
            test.id === selectedTest.id ? { ...test, reports: data } : test
          )
        )
        setIsReportDialogOpen(false)
        setSelectedTest(null)
        setReportId(null)
        setReportContent("")
        setTestStatus("")
      })
      .catch((err) => {
        console.error("Create report error:", err)
      })
  }
  const handleUpdateReport = () => {
    fetch(`/api/v1/updateTestReport/${reportId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: reportContent,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // 更新本地狀態
        setMyTests((prevTests) =>
          prevTests.map((test) =>
            test.id === selectedTest.id ? { ...test, status: testStatus, report: { content: reportContent } } : test
          )
        )
      })
      .catch((err) => {
        console.error("Update report error:", err)
      })
    setIsReportDialogOpen(false)
    setSelectedTest(null)
    setReportId(null)
    setReportContent("")
    setTestStatus("")
  }

  const handleDeleteReport = () => {
    MySwal.fire({
      title: "Are you sure?",
      html: <div>
        
        Delete report for Test 
        <p>{selectedTest.name}({selectedTest.display_id}) </p>
        permanently.
        <br />
        This action cannot be undone.`
        
      </div>,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/v1/deleteTestReport/${reportId}`, {
          method: "DELETE",
        })
          .then(() => {
            // 更新本地狀態
            setMyTests((prevTests) =>
              prevTests.map((test) =>
                test.id === selectedTest.id ? { ...test, reports: null } : test
              )
            )
            setIsReportDialogOpen(false)
            setSelectedTest(null)
            setReportId(null)
            setReportContent("")
            setTestStatus("")
          })
          .catch((err) => {
            console.error("Delete report error:", err)
          })
      }
    })
  }

  const openReportDialog = (test: Test) => {
    setSelectedTest(test)
    setTestStatus(test.status)
    setIsReportDialogOpen(true)
  }

  const openReservationDialog = (test: Test) => {
    setSelectedTest(test)
    setReservationDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Not Started":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "In Progress":
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800"
      case "InProgress":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pendingTests = myTests.filter((task) => {
    return true;
  })

  const upcomingTasks = myTests.filter((task) => {
    const taskDate = new Date(task.created_at)
    const today = new Date()
    return taskDate > today
  })

  const completedTasks = myTestsMock.filter((task) => task.status === "Completed")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">View and manage your assigned testing tasks</p>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTestsMock.filter((t) => t.status === "In Progress").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTestsMock.filter((t) => t.isOverdue).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today ({pendingTests.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          <TabsTrigger value="all">All Tasks ({myTestsMock.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>Tasks scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingTests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Test Method</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Create Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                          <p className="text-gray-600">Loading tasks...</p>
                        </TableCell>
                      </TableRow>
                    ):null}
                    {pendingTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{test.name}</p>
                            <p className="text-sm text-gray-600">{test.display_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(test.status)}
                            <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{test.method?.name}</Badge>
                        </TableCell>
                        <TableCell>
                          {test.method.devices.map((device) => (
                            <Badge key={device.id} variant="secondary" className="mr-1">
                              {device.name}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>
                              {new Date(test.created_at).toLocaleTimeString()}
                            </p>
                            <p className="text-gray-600">Deadline: {new Date(test.deadline).toLocaleDateString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="flex space-x-2">

                          <Button variant="outline" size="sm" onClick={() => openReportDialog(test)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openReservationDialog(test)}>
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tasks scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks scheduled for future dates</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead>Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.name}</p>
                            <p className="text-sm text-gray-600">{task.project}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{task.testType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.device}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(task.startTime).toLocaleDateString()}</p>
                            <p className="text-gray-600">
                              {new Date(task.startTime).toLocaleTimeString()} -{" "}
                              {new Date(task.endTime).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{new Date(task.deadline).toLocaleDateString()}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>Your completed testing tasks and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead>Report Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.name}</p>
                          <p className="text-sm text-gray-600">{task.project}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{task.testType}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{new Date(task.endTime).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {/* <Badge variant={task.report.status === "Submitted" ? "default" : "secondary"}>
                            {task.report.status}
                          </Badge> */}
                          {task.isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openReportDialog(task)}>
                          <FileText className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All My Tasks</CardTitle>
              <CardDescription>Complete list of your assigned tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTestsMock.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{task.name}</p>
                          <p className="text-sm text-gray-600">{task.project}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{task.testType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.device}</Badge>
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
                        <Button variant="outline" size="sm" onClick={() => openReportDialog(task)}>
                          <FileText className="h-4 w-4 mr-1" />
                          {task.status === "Completed" ? "View" : "Update"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Update Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        {
          selectedTest ? (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              
              <DialogTitle>
                <Button onClick={handleDeleteReport} variant="destructive" className="mr-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
                Update Test: {selectedTest?.name}
              </DialogTitle>
              <DialogDescription>Update test status and submit your testing report</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Task Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Task Instructions</h3>
                <p className="text-sm text-gray-700">{selectedTest?.instructions}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="text-sm font-medium">Device: </span>
                    {selectedTest.method.devices.map((device: Device) => (
                      <Badge key={device.id} variant="secondary" className="mr-1">
                        {device.name}
                      </Badge>
                    ))}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Test Method: </span>
                    <span className="text-sm">{selectedTest.method?.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Deadline: </span>
                    <span className="text-sm">{selectedTest && new Date(selectedTest.deadline).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Time Slot: </span>
                    <span className="text-sm">
                      {selectedTest && new Date(selectedTest.startTime).toLocaleTimeString()} -{" "}
                      {selectedTest && new Date(selectedTest.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <Label htmlFor="test-status">Test Status</Label>
                <Select value={testStatus} onValueChange={setTestStatus} disabled={selectedTest?.status === "Completed"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Report Content */}
              <div>
                <Label htmlFor="report-content">Test Report</Label>
                <Textarea
                  id="report-content"
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Enter your test results, observations, and conclusions..."
                  className="min-h-[200px] mt-2"
                />
                <p className="text-sm text-gray-600 mt-2">
                  {/* {selectedTest?.report.status === "Submitted" && selectedTest?.report.submittedAt && (
                    <>
                      Report submitted on: {new Date(selectedTest.report.submittedAt).toLocaleString()}
                      {selectedTest.isOverdue && <span className="text-red-600 ml-2">(Submitted after deadline)</span>}
                    </>
                  )} */}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTest}
              >
                {selectedTest?.status === "Completed" ? 
                  isCreateReport ? "Create Report" : "Update Report"
                : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
          ) : (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Update Task</DialogTitle>
                <DialogDescription>Select a task to update</DialogDescription>
              </DialogHeader>
            </DialogContent>
          )}
      </Dialog>
      <DeviceReservationDialog
        open={isReservationDialogOpen} // This should be controlled by a state if you want to open it
        onOpenChange={setReservationDialogOpen} // Implement your close logic
        devices={[]} // Pass the devices you want to reserve
        onReserve={() => {}} // Implement your reservation logic
      />
    </div>
  )
}
