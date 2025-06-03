"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Mock data - 組長可以看到實驗室內所有報告
const reports = [
  {
    id: 1,
    task: {
      id: 1,
      name: "溫度應力測試 - 樣品 A",
      project: "先進材料測試專案",
      testType: "溫度測試",
    },
    user: { id: 1, username: "陳雅琳" },
    device: "熱循環箱 A",
    status: "待審核",
    content:
      "溫度循環測試成功完成。樣品在 -40°C 到 85°C 溫度範圍內表現良好穩定性。未觀察到明顯劣化。詳細測量數據已附上。",
    submittedAt: "2024-01-16T14:30:00Z",
    reviewedAt: null,
    reviewComments: "",
    isOverdue: false,
    completedAt: "2024-01-15T17:00:00Z",
    deadline: "2024-01-17T17:00:00Z",
  },
  {
    id: 2,
    task: {
      id: 2,
      name: "電性能分析",
      project: "先進材料測試專案",
      testType: "電性測試",
    },
    user: { id: 2, username: "王志明" },
    device: "示波器 A",
    status: "已核准",
    content: "電性測試完成。所有參數均在規格範圍內。在各種負載條件下電壓穩定性優異。建議用於量產。",
    submittedAt: "2024-01-14T16:20:00Z",
    reviewedAt: "2024-01-15T09:30:00Z",
    reviewComments: "優秀的工作。結果全面且文件完整。",
    isOverdue: false,
    completedAt: "2024-01-14T15:00:00Z",
    deadline: "2024-01-16T17:00:00Z",
  },
  {
    id: 3,
    task: {
      id: 3,
      name: "材料耐久性測試",
      project: "品質評估",
      testType: "物性測試",
    },
    user: { id: 3, username: "李佳慧" },
    device: "萬能試驗機",
    status: "已退回",
    content: "耐久性測試已執行。樣品準備過程中發現一些問題。",
    submittedAt: "2024-01-13T18:45:00Z",
    reviewedAt: "2024-01-14T10:15:00Z",
    reviewComments: "報告缺乏測試條件和測量程序的充分細節。請提供更全面的分析並重新提交。",
    isOverdue: true,
    completedAt: "2024-01-13T17:00:00Z",
    deadline: "2024-01-13T17:00:00Z",
  },
]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewDecision, setReviewDecision] = useState("")
  const [reviewComments, setReviewComments] = useState("")

  const handleReviewReport = () => {
    console.log("Reviewing report:", {
      reportId: selectedReport.id,
      decision: reviewDecision,
      comments: reviewComments,
    })
    setIsReviewDialogOpen(false)
    setSelectedReport(null)
    setReviewDecision("")
    setReviewComments("")
  }

  const openReviewDialog = (report: any) => {
    setSelectedReport(report)
    setReviewComments(report.reviewComments || "")
    setIsReviewDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "待審核":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "已核准":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "已退回":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "待審核":
        return "bg-yellow-100 text-yellow-800"
      case "已核准":
        return "bg-green-100 text-green-800"
      case "已退回":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.task.project.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingReports = reports.filter((r) => r.status === "待審核")
  const approvedReports = reports.filter((r) => r.status === "已核准")
  const rejectedReports = reports.filter((r) => r.status === "已退回")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Report Review</h1>
        <p className="text-gray-600">Review and approve testing reports from your team</p>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedReports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedReports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter((r) => r.isOverdue).length}</div>
          </CardContent>
        </Card>
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
            <Input placeholder="Search reports..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="待審核">Pending Review</SelectItem>
                <SelectItem value="已核准">Approved</SelectItem>
                <SelectItem value="已退回">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedReports.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedReports.length})</TabsTrigger>
          <TabsTrigger value="all">All Reports ({filteredReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Reports Pending Review</CardTitle>
              <CardDescription>Reports waiting for your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.task.name}</p>
                          <p className="text-sm text-gray-600">{report.task.project}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.user.username}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.task.testType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(report.submittedAt).toLocaleDateString()}</p>
                          <p className="text-gray-600">{new Date(report.submittedAt).toLocaleTimeString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          {report.isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openReviewDialog(report)}>
                          <FileText className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Reports</CardTitle>
              <CardDescription>Reports that have been approved</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Approved Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.task.name}</p>
                          <p className="text-sm text-gray-600">{report.task.project}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.user.username}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.task.testType}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {report.reviewedAt && new Date(report.reviewedAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openReviewDialog(report)}>
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Reports</CardTitle>
              <CardDescription>Reports that need to be resubmitted</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Rejected Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.task.name}</p>
                          <p className="text-sm text-gray-600">{report.task.project}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.user.username}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.task.testType}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {report.reviewedAt && new Date(report.reviewedAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openReviewDialog(report)}>
                          <FileText className="h-4 w-4 mr-1" />
                          View
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
              <CardTitle>All Reports ({filteredReports.length})</CardTitle>
              <CardDescription>Complete list of testing reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.task.name}</p>
                          <p className="text-sm text-gray-600">{report.task.project}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.user.username}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.task.testType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                          {report.isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{new Date(report.submittedAt).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openReviewDialog(report)}>
                          <FileText className="h-4 w-4 mr-1" />
                          {report.status === "待審核" ? "Review" : "View"}
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

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Report: {selectedReport?.task.name}</DialogTitle>
            <DialogDescription>Review the testing report and provide feedback</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Task Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Task Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Project: </span>
                  <span className="text-sm">{selectedReport?.task.project}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Test Type: </span>
                  <span className="text-sm">{selectedReport?.task.testType}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">User: </span>
                  <span className="text-sm">{selectedReport?.user.username}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Device: </span>
                  <span className="text-sm">{selectedReport?.device}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Completed: </span>
                  <span className="text-sm">
                    {selectedReport && new Date(selectedReport.completedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Submitted: </span>
                  <span className="text-sm">
                    {selectedReport && new Date(selectedReport.submittedAt).toLocaleString()}
                  </span>
                  {selectedReport?.isOverdue && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div>
              <Label>Report Content</Label>
              <div className="mt-2 p-4 border rounded-lg bg-white min-h-[200px]">
                <p className="text-sm whitespace-pre-wrap">{selectedReport?.content}</p>
              </div>
            </div>

            {/* Review Section */}
            {selectedReport?.status === "待審核" && (
              <>
                <div>
                  <Label htmlFor="review-decision">Review Decision</Label>
                  <Select value={reviewDecision} onValueChange={setReviewDecision}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="已核准">Approve Report</SelectItem>
                      <SelectItem value="已退回">Reject Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="review-comments">Review Comments</Label>
                  <Textarea
                    id="review-comments"
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Provide feedback and comments..."
                    className="min-h-[100px]"
                  />
                </div>
              </>
            )}

            {/* Existing Review Comments */}
            {selectedReport?.reviewComments && selectedReport?.status !== "待審核" && (
              <div>
                <Label>Previous Review Comments</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm">{selectedReport.reviewComments}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Reviewed on: {selectedReport.reviewedAt && new Date(selectedReport.reviewedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Close
            </Button>
            {selectedReport?.status === "待審核" && (
              <Button onClick={handleReviewReport} disabled={!reviewDecision}>
                Submit Review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
