"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Users, Zap, Monitor } from "lucide-react"
import Link from "next/link"

export default function AssignTestPage() {
  const params = useParams()
  const testId = params.id as string
  const groupId = 1

  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [testDetails, setTestDetails] = useState<any>(null)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch(`/api/v1/getGroupUser/${groupId}`)
        const users = await usersRes.json()
        setAvailableUsers(users)

        const testRes = await fetch(`/api/v1/getTest/${testId}`)
        const test = await testRes.json()
        setTestDetails(test)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [groupId, testId])

  const requiredSkillNames = useMemo(() => {
    return testDetails?.method?.skills?.map((s: any) => s.name) || []
  }, [testDetails])

  const enrichedUsers = useMemo(() => {
    return availableUsers.map((user) => {
      const skillNames = user.skills.map((s: any) => s.name)
      const hasAllSkills = requiredSkillNames.every((req) => skillNames.includes(req))
      return {
        ...user,
        currentTests: user.tests.length,
        skillNames,
        isCompatible: hasAllSkills,
      }
    })
  }, [availableUsers, requiredSkillNames])

  const handleUserToggle = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleAssign = () => {
    const resp = fetch(`/api/v1/assignUserTest/${testId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedUser: selectedUsers }),
    })
    resp
      .then((res) => res.json())
      .then((data) => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error assigning users:", error)
      })
  }

  if (loading || !testDetails) {
    return <p className="text-gray-500">Loading test details...</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/group-tests`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assign Test</h1>
          <p className="text-gray-600">
            {testDetails.display_id} - {testDetails.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Test Requirements
          </CardTitle>
          <CardDescription>Skills and devices required for this test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {testDetails.method.skills.map((skill: any) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Compatible Devices</h3>
              <div className="flex flex-wrap gap-2">
                {testDetails.method.devices.map((device: any) => (
                  <Badge key={device.id} variant="outline">
                    <Monitor className="h-3 w-3 mr-1" />
                    {device.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Select Users
          </CardTitle>
          <CardDescription>Choose users to assign to this test</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrichedUsers.map((user: any) => (
              <div
                key={user.id}
                className={`flex items-center space-x-4 p-4 border rounded-lg ${
                  user.isCompatible ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => handleUserToggle(user.id)}
                  disabled={!user.isCompatible}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{user.username}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Current Tests: {user.currentTests}</p>
                      <Badge variant={user.isCompatible ? "default" : "destructive"}>
                        {user.isCompatible ? "Compatible" : "Incompatible"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Skills:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.skillNames.map((skill: string) => (
                        <Badge
                          key={skill}
                          variant={requiredSkillNames.includes(skill) ? "default" : "outline"}
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" asChild>
          <Link href={`/tests/${params.id}`}>Cancel</Link>
        </Button>
        <Button onClick={handleAssign} disabled={selectedUsers.length === 0}>
          Assign Selected Users ({selectedUsers.length})
        </Button>
      </div>
    </div>
  )
}
