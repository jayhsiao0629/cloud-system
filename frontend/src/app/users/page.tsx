"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Filter, Edit, Trash2, UserCheck, Users, UserRoundX } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { group } from "console"

const availableRoles = [
  { id: 1, engName: "Admin", chiName: "實驗室管理員" },
  { id: 2, engName: "Leader", chiName: "實驗室組長" },
  { id: 3, engName: "Tester", chiName: "實驗室成員" },
]

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignGroupOpen, setIsAssignGroupOpen] = useState(false);
  const [isRemoveGroupOpen, setIsRemoveGroupOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "",
    skill_ids: []
  });
  const [assignedGroupId, setAssignedGroupId] = useState("");
  const [currentGroupOptions, setCurrentGroupOptions] = useState([]);

  useEffect(() => {
    fetch("/api/v1/getUsers")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users)
        console.log(data.users);
      })
      .catch(err => console.error('Fetch error:', err));

    fetch("/api/v1/getSkills")
      .then(res => res.json())
      .then(data => setAvailableSkills(data))
      .catch(err => console.error('Fetch error:', err));

    fetch("/api/v1/getGroups")
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const handleSkillToggle = (skillId: number) => {
    setNewUser((prev) => ({
      ...prev,
      skill_ids: prev.skill_ids.includes(skillId)
        ? prev.skill_ids.filter((id) => id !== skillId)
        : [...prev.skill_ids, skillId],
    }));
  };

  const handleAssignGroup = () => {
    fetch(`/api/v1/assignUserToGroup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUserId, group_id: assignedGroupId }),
    })
      .then(res => res.json())
      .then(data => {
        setSelectedUserId(null);
        setAssignedGroupId("");
        window.location.reload();
      })
      .catch(err => console.error("Assign group error:", err));
  }

  const handleRemoveGroup = () => {
    const target_group_id = groups.find(g => g.name === selectedGroupName).id;

    fetch(`/api/v1/removeUserFromGroup`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: selectedUserId, group_id: target_group_id }),
    })
      .then(res => res.json())
      .then(data => {
        setIsRemoveGroupOpen(false);
        setSelectedGroupId(null);
        window.location.reload();
      })
      .catch(err => console.error("Remove group error:", err));
  };

  const handleOpenAssignGroup = (userId) => {
    setSelectedUserId(userId);
    setIsAssignGroupOpen(true);
  }

  const handleCreateUser = () => {
    setIsCreateDialogOpen(false);
    fetch("/api/v1/createUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
      .then(res => res.json())
      .then(data => setUsers((prev) => [...prev, data.user]))
      .catch(err => console.error("Create error:", err));
    setNewUser({ username: "", email: "", password: "", role_id: "", skill_ids: [] });
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setNewUser({
      username: user.username,
      email: user.email,
      password: "",
      role_id: user.role.id.toString(),
      skill_ids: user.skills.map((s) => s.id)
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUserId) return;
    setIsEditDialogOpen(false);
    fetch(`/api/v1/updateUser/${editingUserId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
      .then(res => res.json())
      .then(data => setUsers((prev) => prev.map(u => u.id === editingUserId ? data.user : u)))
      .catch(err => console.error("Update error:", err))
    setNewUser({ username: "", email: "", password: "", role_id: "", skill_ids: [] });
  };

  const handleDeleteUser = (userId) => {
    if (!confirm("確認要刪除此使用者嗎？")) return;
    fetch(`/api/v1/deleteUser/${userId}`, {
      method: "DELETE"
    })
      .then(res => {
        if (!res.ok) throw new Error("Delete failed");
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      })
      .catch(err => console.error("Delete error:", err));
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role.id === parseInt(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage laboratory personnel and their skills</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user to the laboratory system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Username</Label>
              <Input value={newUser.username} onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))} />
              <Label>Email</Label>
              <Input value={newUser.email} onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))} />
              <Label>Password</Label>
              <Input value={newUser.password} type="password" onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))} />
              <Label>Role</Label>
              <Select value={newUser.role_id} onValueChange={(v) => setNewUser(prev => ({ ...prev, role_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>{role.chiName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label>Skills</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {availableSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Checkbox id={`create-${skill.name}`} checked={newUser.skill_ids.includes(skill.id)} onCheckedChange={() => handleSkillToggle(skill.id)} />
                    <Label htmlFor={`create-${skill.name}`}>{skill.name}</Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Modify user details and skills</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={newUser.username} onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))} placeholder="Username" />
            <Input value={newUser.email} onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" />
            <Select value={newUser.role_id} onValueChange={(v) => setNewUser(prev => ({ ...prev, role_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>{role.chiName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {availableSkills.map((skill) => (
                <div key={skill.id} className="flex items-center space-x-2">
                  <Checkbox id={skill.name} checked={newUser.skill_ids.includes(skill.id)} onCheckedChange={() => handleSkillToggle(skill.id)} />
                  <Label htmlFor={skill.name}>{skill.name}</Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Group Dialog */}
      <Dialog open={isAssignGroupOpen} onOpenChange={setIsAssignGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Group</DialogTitle>
            <DialogDescription>Assign this user to a group</DialogDescription>
          </DialogHeader>
          <Select
            value={assignedGroupId?.toString() || ""}
            onValueChange={(v) => setAssignedGroupId(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignGroupOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!assignedGroupId || !selectedUserId) {
                  alert("請先選擇群組與使用者");
                  return;
                }
                handleAssignGroup();
              }}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Group Dialog */}
      <Dialog open={isRemoveGroupOpen} onOpenChange={setIsRemoveGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from Group</DialogTitle>
            <DialogDescription>選擇要將此使用者移除的群組</DialogDescription>
          </DialogHeader>
          <Select
            value={selectedGroupId?.toString() || ""}
            onValueChange={(v) => {
              const group = currentGroupOptions.find(g => g.id.toString() === v);
              if (group) {
                setSelectedGroupId(group.id);
                setSelectedGroupName(group.name);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {currentGroupOptions.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveGroupOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!selectedGroupId || !selectedUserId) {
                  alert("請選擇要移除的群組");
                  return;
                }
                handleRemoveGroup();
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>{role.chiName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setRoleFilter("all") }}>Clear Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Laboratory personnel and their information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Active Tests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar><AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{availableRoles.find((r) => r.engName === user.role.name)?.chiName}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="text-xs">{skill.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.groups.map((group) => (
                        <Badge key={group.id} variant="secondary" className="text-xs">{group.name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{user.tests.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleEditUser(user)} variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                      <Button onClick={() => handleDeleteUser(user.id)} variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                      <Button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setAssignedGroupId("");
                          setIsAssignGroupOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setCurrentGroupOptions(user.groups || []);
                          setSelectedGroupName("");
                          setIsRemoveGroupOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <UserRoundX className="h-4 w-4" />
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
  );
}
