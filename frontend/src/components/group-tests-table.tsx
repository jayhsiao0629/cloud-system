"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, UserPlus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

const statusColors = {
  待分派: "bg-yellow-100 text-yellow-800",
  進行中: "bg-blue-100 text-blue-800",
  已完成: "bg-green-100 text-green-800",
  失敗: "bg-red-100 text-red-800",
  已取消: "bg-gray-100 text-gray-800",
}

export function GroupTestsTable() {
  const [tests, setTests] = useState([])
  const [groups, setGroups] = useState([])

  useEffect(() => {
    fetch("/api/v1/getGroupTests/1")
      .then(res => res.json())
      .then(data => setTests(data))
      .catch(err => console.error("Fetch devices error:", err))

    fetch("/api/v1/getGroups")
        .then(res => res.json())
        .then(data => {
            setGroups(data)
        })
        .catch(err => console.error("Fetch groups error:", err))
  }, [])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Test ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Group Name</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned Users</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tests.map((test) => (
          <TableRow key={test.id}>
            <TableCell className="font-medium">{test.display_id}</TableCell>
            <TableCell>{test.name}</TableCell>
            <TableCell>
                <Badge variant="secondary" className="text-xs">
                    {groups.find(group => group.id === test.group_id)?.name || "Unknown Group"}
                </Badge>
            </TableCell>
            <TableCell>{test.method.name}</TableCell>
            <TableCell>
              <Badge className={statusColors[test.status as keyof typeof statusColors]}>{test.status}</Badge>
            </TableCell>
            <TableCell>
              {test.users.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {test.users.map((user) => (
                    <Badge key={user.id} variant="outline" className="text-xs">
                      {user.username}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/group-tests/1`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                {test.users.length === 0 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/group-tests/${test.id}/assign`}>
                      <UserPlus className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
