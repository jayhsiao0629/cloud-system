"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Monitor } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data - in real app, this would come from your API
const scheduleData = [
  {
    id: 1,
    title: "溫度應力測試",
    testId: "T-001",
    user: "陳雅琳",
    device: "熱循環箱 A",
    startTime: "2024-01-15T09:00:00Z",
    endTime: "2024-01-15T17:00:00Z",
    status: "進行中",
    type: "test",
  },
  {
    id: 2,
    title: "電性能測試",
    testId: "T-002",
    user: "王志明",
    device: "示波器 A",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T14:00:00Z",
    status: "已排程",
    type: "test",
  },
  {
    id: 3,
    title: "設備維護",
    device: "萬能試驗機",
    startTime: "2024-01-16T08:00:00Z",
    endTime: "2024-01-16T12:00:00Z",
    status: "已排程",
    type: "maintenance",
  },
  {
    id: 4,
    title: "材料分析",
    testId: "T-003",
    user: "李佳慧",
    device: "萬用電表 B",
    startTime: "2024-01-16T13:00:00Z",
    endTime: "2024-01-16T16:00:00Z",
    status: "已排程",
    type: "test",
  },
]

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

const devices = ["熱循環箱 A", "示波器 A", "萬用電表 B", "萬能試驗機", "信號產生器 C"]

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date("2024-01-15"))
  const [viewMode, setViewMode] = useState("day")
  const [selectedDevice, setSelectedDevice] = useState("all")

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    }
    setCurrentDate(newDate)
  }

  const getEventsForTimeSlot = (timeSlot: string, device: string) => {
    const currentDateStr = currentDate.toISOString().split("T")[0]
    return scheduleData.filter((event) => {
      const eventStart = new Date(event.startTime)
      const eventEnd = new Date(event.endTime)
      const slotTime = new Date(`${currentDateStr}T${timeSlot}:00:00Z`)

      const matchesDevice = selectedDevice === "all" || event.device === device
      const matchesTime = eventStart <= slotTime && eventEnd > slotTime
      const matchesDate = eventStart.toDateString() === currentDate.toDateString()

      return matchesDevice && matchesTime && matchesDate
    })
  }

  const filteredDevices = selectedDevice === "all" ? devices : [selectedDevice]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600">Laboratory equipment and test scheduling</p>
        </div>
        <div className="flex space-x-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Book Time
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">{formatDate(currentDate)}</h2>
              <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                {devices.map((device) => (
                  <SelectItem key={device} value={device}>
                    {device}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Schedule Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Schedule</CardTitle>
          <CardDescription>Equipment reservations and test schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 gap-4">
              {/* Time Header */}
              <div className="grid grid-cols-12 gap-2 mb-4">
                <div className="col-span-2 font-semibold text-sm text-gray-600">Time</div>
                {filteredDevices.slice(0, 10).map((device) => (
                  <div key={device} className="font-semibold text-sm text-gray-600 text-center">
                    {device}
                  </div>
                ))}
              </div>

              {/* Schedule Rows */}
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-12 gap-2 min-h-[60px]">
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm font-medium text-gray-700">{timeSlot}</div>
                  </div>
                  {filteredDevices.slice(0, 10).map((device) => {
                    const events = getEventsForTimeSlot(timeSlot, device)
                    return (
                      <div key={device} className="border rounded-lg p-2 min-h-[60px]">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className={`p-2 rounded text-xs ${
                              event.type === "maintenance"
                                ? "bg-red-100 text-red-800"
                                : event.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            {event.user && (
                              <div className="flex items-center mt-1">
                                <User className="h-3 w-3 mr-1" />
                                <span className="truncate">{event.user}</span>
                              </div>
                            )}
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>
                                {new Date(event.startTime).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -
                                {new Date(event.endTime).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduleData
                .filter((event) => event.type === "test")
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{event.testId}</p>
                      <p className="text-xs text-gray-600">{event.user}</p>
                    </div>
                    <Badge variant={event.status === "In Progress" ? "default" : "secondary"}>{event.status}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Device Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {devices.slice(0, 4).map((device) => {
                const utilization = Math.floor(Math.random() * 100)
                return (
                  <div key={device}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{device}</span>
                      <span>{utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${utilization}%` }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduleData
                .filter((event) => event.type === "maintenance")
                .map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Monitor className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="font-medium text-sm">{event.device}</p>
                      <p className="text-xs text-gray-600">{new Date(event.startTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
