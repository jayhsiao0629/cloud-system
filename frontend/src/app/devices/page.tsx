"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Filter, Edit, Trash2, Settings, Calendar } from "lucide-react"
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

const statusColors = {
  可用: "bg-green-100 text-green-800",
  已預約: "bg-yellow-100 text-yellow-800",
  使用中: "bg-blue-100 text-blue-800",
  維護中: "bg-red-100 text-red-800",
  故障: "bg-red-100 text-red-800",
}

export default function DevicesPage() {
  const [devices, setDevices] = useState([])
  const [deviceTypes, setDeviceTypes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState(null)

  const [newDevice, setNewDevice] = useState({
    name: "",
    device_type_id: "",
    description: "",
    previous_maintenance_date: new Date().toISOString().split("T")[0],
    next_maintenance_date: new Date().toISOString().split("T")[0],
    position: "",
    status: "Available",
  })

  useEffect(() => {
    fetch("/api/v1/getDevices")
      .then(res => res.json())
      .then(data => setDevices(data))
      .catch(err => console.error("Fetch devices error:", err))

    fetch("/api/v1/getDevicesTypes")
      .then(res => res.json())
      .then(data => setDeviceTypes(data))
      .catch(err => console.error("Fetch types error:", err))
  }, [])

  const handleCreateDevice = () => {
    setIsCreateDialogOpen(false)
    fetch("/api/v1/createDevice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDevice),
    })
      .then(res => res.json())
      .then(data => setDevices(prev => [...prev, data]))
      .catch(err => console.error("Create error:", err))

    setNewDevice({
      name: "",
      device_type_id: "",
      description: "",
      previous_maintenance_date: new Date().toISOString().split("T")[0],
      next_maintenance_date: new Date().toISOString().split("T")[0],
      position: "",
      status: "可用",
    })
  }

  const handleEditDevice = (device) => {
    setEditingDevice(device)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    fetch(`/api/v1/updateDevice/${editingDevice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingDevice),
    })
      .then(res => res.json())
      .then(data => {
        setDevices(prev => prev.map(d => (d.id === data.id ? data : d)))
        setIsEditDialogOpen(false)
      })
      .catch(err => console.error("Update error:", err))
  }

  const handleDeleteDevice = (id) => {
    if (!confirm("確認要刪除此使用者嗎？")) return;
    fetch(`/api/v1/deleteDevice/${id}`, { method: "DELETE" })
      .then(() => setDevices(prev => prev.filter(d => d.id !== id)))
      .catch(err => console.error("Delete error:", err))
  }

  const filteredDevices = devices.filter(device => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || device.status === statusFilter
    const matchesType = typeFilter === "all" || device.device_type.name === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600">Manage laboratory equipment and their availability</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>Register a new device in the laboratory system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter device name"
                />
              </div>
              <div>
                <Label htmlFor="device-type">Device Type</Label>
                <Select
                  value={newDevice.device_type_id}
                  onValueChange={(value) => setNewDevice((prev) => ({ ...prev, device_type_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="device-description">Description</Label>
                <Textarea
                  id="device-description"
                  value={newDevice.description}
                  onChange={(e) => setNewDevice((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter device description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateDevice}>Add Device</Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Search devices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="可用">Available</SelectItem>
                <SelectItem value="已預約">Reserved</SelectItem>
                <SelectItem value="使用中">Occupied</SelectItem>
                <SelectItem value="維護中">Maintenance</SelectItem>
                <SelectItem value="故障">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {deviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleClearFilters} variant="outline">Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Devices ({filteredDevices.length})</CardTitle>
          <CardDescription>Laboratory equipment and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-gray-600">{device.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{device.device_type.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[device.status]}>{device.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(device.updated_at).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditDevice(device)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteDevice(device.id)}>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>Modify device information</DialogDescription>
          </DialogHeader>
          {editingDevice && (
            <div className="space-y-4">
              <div>
                <Label>Device Name</Label>
                <Input
                  value={editingDevice.name}
                  onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Device Type</Label>
                <Select
                  value={editingDevice.device_type.id.toString()}
                  onValueChange={(value) => setEditingDevice({ ...editingDevice, device_type: { id: parseInt(value), name: deviceTypes.find(t => t.id.toString() === value)?.name || "" } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingDevice.description}
                  onChange={(e) => setEditingDevice({ ...editingDevice, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editingDevice.status}
                  onValueChange={(value) => setEditingDevice({ ...editingDevice, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusColors).map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
