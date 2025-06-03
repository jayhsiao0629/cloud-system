"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, UserPlus, Calendar, FileText } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"

const statusColors = {
  "待分派": "bg-yellow-100 text-yellow-800",
  "進行中": "bg-blue-100 text-blue-800",
  "已完成": "bg-green-100 text-green-800",
  "失敗": "bg-red-100 text-red-800",
  "已取消": "bg-gray-100 text-gray-800"
}

export default function TestDetailsPage() {
  const params = useParams()
  const id = params.id as string

  const [testDetails, setTestDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/v1/getTest/${id}`)
      .then(res => res.json())
      .then(data => {
        setTestDetails(data)
      })
      .catch(err => console.error("Fetch test details error:", err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !testDetails) {
    return <p className="text-gray-500">Loading test details...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/group-tests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tests
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{testDetails.display_id}</h1>
            <p className="text-gray-600">{testDetails.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Test
          </Button>
          <Button asChild>
            <Link href={`/tests/${id}/assign`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Users
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <Badge className={statusColors[testDetails.status] ?? "bg-gray-100 text-gray-800"}>{testDetails.status}</Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Method</h3>
              <p className="text-gray-600">{testDetails.method?.name ?? "Loading..."}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Assigned Users</h3>
              {testDetails.users?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {testDetails.users.map((user: any) => (
                    <Badge key={user.id} variant="outline">
                      {user.username}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No users assigned</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{testDetails.description}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="reservations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reservations">Device Reservations</TabsTrigger>
          <TabsTrigger value="reports">Test Reports</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Device Reservations
              </CardTitle>
              <CardDescription>Devices reserved for this test</CardDescription>
            </CardHeader>
            <CardContent>
              {testDetails.deviceReservations?.length > 0 ? (
                <div className="space-y-4">
                  {testDetails.deviceReservations.map((reservation: any) => (
                    <div key={reservation.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{reservation.device.name}</h4>
                          <p className="text-sm text-gray-600">{reservation.device.device_type.name}</p>
                          <p className="text-sm text-gray-600">Reserved by: {reservation.user.username}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Date(reservation.start_time).toLocaleDateString()} - {new Date(reservation.end_time).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(reservation.start_time).toLocaleTimeString()} - {new Date(reservation.end_time).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No device reservations yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Test Reports
              </CardTitle>
              <CardDescription>Progress reports from assigned users</CardDescription>
            </CardHeader>
            <CardContent>
              {testDetails.testReports?.length > 0 ? (
                <div className="space-y-4">
                  {testDetails.testReports.map((report: any) => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">{report.user.username}</Badge>
                        <span className="text-sm text-gray-500">{new Date(report.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700">{report.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reports submitted yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Test Timeline</CardTitle>
              <CardDescription>Key events and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Test Created</p>
                    <p className="text-sm text-gray-600">{new Date(testDetails.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
