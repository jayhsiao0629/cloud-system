"use client"

import { Bell, Search, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ChangeUserDialog from "@/components/change-user-dialog"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"

export function Header() {
  const [currentRole, setCurrentRole] = useState("admin")
  const [changeUserDialogOpen, setChangeUserDialogOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("")
  const [currentGroupId, setCurrentGroupId] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("currentUserRole") || "admin"
      const savedUserId = localStorage.getItem("currentUserId") || ""
      const savedGroupId = localStorage.getItem("currentGroupId") || ""
      setCurrentRole(savedRole)
      setCurrentUserId(savedUserId)
      setCurrentGroupId(savedGroupId)
      Swal.fire({
        title: "歡迎使用",
        text: `您目前的角色是 ${savedRole === "admin" ? "管理員" : savedRole === "leader" ? "組長" : "組員"}, Group ID: ${savedGroupId}, 用戶 ID: ${savedUserId}`,
        icon: "info",
        confirmButtonText: "確定",
      })
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      
    }
  }, [])

  useEffect(() => {
    // 當切換用戶的時候，同時設置目前用戶ID與角色
    if (currentUserId === "") return;
    fetch(`/api/v1/getUser/${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched user data:", data)
        if (data?.user) {
          const roleId = data.user.role_id;
          const userRole = 
            roleId === 1 ? "admin" :
            roleId === 2 ? "leader" :
            "member";
          const groupId = data.user.group_id || "";
          setCurrentRole(userRole)
          setChangeUserDialogOpen(false)
          localStorage.setItem("currentUserRole", userRole)
          localStorage.setItem("currentUserId", currentUserId)
          localStorage.setItem("currentGroupId", groupId)
          if(userRole !== currentRole) {
            // 重新載入頁面以更新側邊欄
            window.location.reload();
          }
        }
      })

  }, [currentUserId, currentRole])


  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole)
    localStorage.setItem("currentUserRole", newRole)
    localStorage.removeItem("currentUserId") // 清除當前用戶ID，因為角色改變可能需要重新選擇用戶
    setCurrentUserId("") // 清除當前用戶ID
    // 重新載入頁面以更新側邊欄
    window.location.reload()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input type="search" placeholder="搜尋測試、用戶、設備..." className="pl-10 w-96" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {currentRole === "admin" ? "管理員" : currentRole === "leader" ? "組長" : "組員"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>切換角色</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRoleChange("admin")}>管理員 (Admin)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange("leader")}>組長 (Leader)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange("member")}>組員 (Member)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>我的帳戶</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setChangeUserDialogOpen(true) }}>切換用戶</DropdownMenuItem>
              <DropdownMenuItem>設定</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>登出</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ChangeUserDialog
        open={changeUserDialogOpen}
        currentUserId={currentUserId}
        onOpenChange={setChangeUserDialogOpen}
        onChangeUserId={(newUserId: string) => {
          setCurrentUserId(newUserId)
        }} />
    </header>
  )
}
