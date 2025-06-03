"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TestsTable } from "@/components/tests-table"
import { DeviceStatusChart } from "@/components/device-status-chart"
import { UserWorkloadChart } from "@/components/user-workload-chart"
import { TestTube, Users, Monitor, Clock } from "lucide-react"

interface Group {
  id: number;
  name: string;
}

export default function Dashboard() {
  const [tests_completed, setTestsCompleted] = useState(0);

  const [active_users, setActiveUsers] = useState(0);
  const [available_devices, setAvailableDevices] = useState(0);

  const [total_devices, setTotalDevices] = useState(0);

  const [average_hours, setAverageHours] = useState(0);

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');

  
  useEffect(() => {
  fetch('/api/v1/getGroups')
    .then((res) => res.json())
    .then((data) => {
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroupId(data[0].id);
      }
    })
    .catch((err) => console.error('api error:', err));
}, []);

  console.log(`${selectedGroupId}`)

  useEffect(() => {
  if (selectedGroupId !== '') {
    fetch(`/api/v1/getDashboard/${selectedGroupId}`)
      .then((res) => res.json())
      .then((data) => {
        setTestsCompleted(data.total_tests_completed)
        setActiveUsers(data.active_users);
        setAvailableDevices(data.available_devices.available)
        setTotalDevices(data.available_devices.total)
        setAverageHours(data.test_time.avg_duration)
      });
    }
}, [selectedGroupId]); // 👈 當 ID 改變時自動執行

  const handleChange = (event) => {
    setSelectedGroupId(event.target.value);
  };

  // Mock data - in real app, this would come from your API
  const stats = {
    totalTests: 156,
    activeUsers: 24,
    availableDevices: 233,
    avgTestTime: 4.2,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of laboratory operations</p>
        <select id="my-select" value={selectedGroupId} onChange={handleChange}>
          {groups.map((group) => (
          <option key={group.name} value={group.id}>
            {group.name}
          </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests Completed</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests_completed}</div>
            <p className="text-xs text-muted-foreground">較上月增加 12%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active_users}</div>
            <p className="text-xs text-muted-foreground">本週新增 2 位</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{available_devices}</div>
            <p className="text-xs text-muted-foreground">Total devices: {total_devices}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Test Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{average_hours}h</div>
            <p className="text-xs text-muted-foreground">較上月減少 0.3 小時</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceStatusChart />
        <UserWorkloadChart />
      </div>

      {/* Recent Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tests</CardTitle>
          <CardDescription>Latest test assignments and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <TestsTable />
        </CardContent>
      </Card>
    </div>
  )
}
