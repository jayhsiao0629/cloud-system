"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, Bell, Shield, Database, Users } from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    testAssignments: true,
    deviceAvailable: true,
    maintenanceReminders: true,
    systemAlerts: false,
  })

  const [systemSettings, setSystemSettings] = useState({
    autoAssignment: true,
    maxTestsPerUser: "5",
    defaultTestDuration: "4",
    maintenanceInterval: "30",
  })

  const handleSaveSettings = () => {
    // In real app, this would make an API call
    console.log("Saving settings:", { notifications, systemSettings })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">系統設定</h1>
        <p className="text-gray-600">配置系統偏好設定和實驗室政策</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">一般設定</TabsTrigger>
          <TabsTrigger value="notifications">通知設定</TabsTrigger>
          <TabsTrigger value="users">用戶管理</TabsTrigger>
          <TabsTrigger value="system">系統設定</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                實驗室配置
              </CardTitle>
              <CardDescription>基本實驗室設定和政策</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lab-name">實驗室名稱</Label>
                  <Input id="lab-name" defaultValue="先進材料測試實驗室" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lab-code">實驗室代碼</Label>
                  <Input id="lab-code" defaultValue="AMTL-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-tests">每位用戶最大測試數</Label>
                  <Select
                    value={systemSettings.maxTestsPerUser}
                    onValueChange={(value) => setSystemSettings((prev) => ({ ...prev, maxTestsPerUser: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 個測試</SelectItem>
                      <SelectItem value="5">5 個測試</SelectItem>
                      <SelectItem value="7">7 個測試</SelectItem>
                      <SelectItem value="10">10 個測試</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-duration">預設測試時間 (小時)</Label>
                  <Select
                    value={systemSettings.defaultTestDuration}
                    onValueChange={(value) => setSystemSettings((prev) => ({ ...prev, defaultTestDuration: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 小時</SelectItem>
                      <SelectItem value="4">4 小時</SelectItem>
                      <SelectItem value="8">8 小時</SelectItem>
                      <SelectItem value="24">24 小時</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">自動化設定</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自動分派測試</Label>
                    <p className="text-sm text-gray-600">自動將測試分派給合格的用戶</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoAssignment}
                    onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, autoAssignment: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                通知偏好設定
              </CardTitle>
              <CardDescription>配置何時以及如何接收通知</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>測試分派</Label>
                    <p className="text-sm text-gray-600">當測試分派給用戶時通知</p>
                  </div>
                  <Switch
                    checked={notifications.testAssignments}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, testAssignments: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>設備可用</Label>
                    <p className="text-sm text-gray-600">當預約的設備變為可用時通知</p>
                  </div>
                  <Switch
                    checked={notifications.deviceAvailable}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, deviceAvailable: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>維護提醒</Label>
                    <p className="text-sm text-gray-600">關於即將到來的設備維護通知</p>
                  </div>
                  <Switch
                    checked={notifications.maintenanceReminders}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, maintenanceReminders: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>系統警報</Label>
                    <p className="text-sm text-gray-600">關於系統錯誤和重要問題的通知</p>
                  </div>
                  <Switch
                    checked={notifications.systemAlerts}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, systemAlerts: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                用戶管理
              </CardTitle>
              <CardDescription>配置用戶角色和權限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">角色權限</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">實驗室管理員</p>
                      <p className="text-sm text-gray-600">完整系統存取權限和用戶管理</p>
                    </div>
                    <Button variant="outline" size="sm">
                      配置
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">組長</p>
                      <p className="text-sm text-gray-600">分派測試和管理團隊成員</p>
                    </div>
                    <Button variant="outline" size="sm">
                      配置
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">技術員</p>
                      <p className="text-sm text-gray-600">執行測試和提交報告</p>
                    </div>
                    <Button variant="outline" size="sm">
                      配置
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                系統配置
              </CardTitle>
              <CardDescription>進階系統設定和維護</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maintenance-interval">維護間隔 (天)</Label>
                  <Select
                    value={systemSettings.maintenanceInterval}
                    onValueChange={(value) => setSystemSettings((prev) => ({ ...prev, maintenanceInterval: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 天</SelectItem>
                      <SelectItem value="14">14 天</SelectItem>
                      <SelectItem value="30">30 天</SelectItem>
                      <SelectItem value="90">90 天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">備份頻率</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">每小時</SelectItem>
                      <SelectItem value="daily">每日</SelectItem>
                      <SelectItem value="weekly">每週</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">系統操作</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">匯出資料</Button>
                  <Button variant="outline">系統備份</Button>
                  <Button variant="outline">清除快取</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          <Save className="h-4 w-4 mr-2" />
          儲存設定
        </Button>
      </div>
    </div>
  )
}
