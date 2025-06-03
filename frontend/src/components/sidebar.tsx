"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TestTube, Users, Monitor, Calendar, Settings, FileText, Gavel } from 'lucide-react'

const navigation = [
  { name: "儀表板", href: "/", icon: LayoutDashboard, roles: ["admin", "leader", "member"] },
  // { name: "專案管理", href: "/projects", icon: TestTube, roles: ["leader"] },
  { name: "我的任務", href: "/my-tests", icon: Calendar, roles: ["member"] },
  // { name: "任務管理", href: "/tasks", icon: TestTube, roles: ["leader"] },
  { name: "測試管理", href: "/group-tests", icon: TestTube, roles: ["leader"] },
  // { name: "技能管理", href: "/skills", icon: Gavel, roles: ["leader"] },
  { name: "用戶管理", href: "/users", icon: Users, roles: ["admin"] },
  { name: "群組管理", href: "/groups", icon: Monitor, roles: ["admin"] },
  { name: "測試管理", href: "/tests", icon: TestTube, roles: ["admin"] },
  { name: "設備管理", href: "/devices", icon: Monitor, roles: ["admin", "leader"] },
  { name: "報告審核", href: "/reports", icon: FileText, roles: ["leader"] },
  // { name: "系統設定", href: "/settings", icon: Settings, roles: ["admin"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const [currentUserRole, setCurrentUserRole] = useState("admin")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("currentUserRole") || "admin"
      setCurrentUserRole(savedRole)
    }
  }, [])

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "管理員"
      case "leader":
        return "組長"
      case "member":
        return "組員"
      default:
        return "用戶"
    }
  }

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex flex-col items-center justify-center h-20 px-4 bg-blue-600">
        <h1 className="text-xl font-bold text-white">實驗室管理系統</h1>
        <p className="text-sm text-blue-100">{getRoleDisplayName(currentUserRole)}</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation
          .filter((item) => item.roles.includes(currentUserRole))
          .map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
      </nav>
    </div>
  )
}
