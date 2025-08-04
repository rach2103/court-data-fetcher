"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, BarChart3, Trash2, Download, RefreshCw, Server, Clock, CheckCircle } from "lucide-react"

interface DatabaseStats {
  totalQueries: number
  successfulQueries: number
  failedQueries: number
  cachedCases: number
  successRate: string
  avgResponseTime: number
}

export function DatabaseAdmin() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/database?action=stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDatabaseAction = async (action: string) => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(result.message)
        await fetchStats() // Refresh stats
      } else {
        setMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch("/api/database?action=export")
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `court-data-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setMessage("Data exported successfully")
      }
    } catch (error) {
      setMessage(`Export error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading && !stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading database statistics...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Database Statistics
          </CardTitle>
          <CardDescription>Overview of database usage and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalQueries}</div>
                <div className="text-sm text-gray-600">Total Queries</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.successfulQueries}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.failedQueries}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.cachedCases}</div>
                <div className="text-sm text-gray-600">Cached Cases</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>

              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.avgResponseTime}ms</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>Manage database data and perform maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => fetchStats()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Stats
            </Button>

            <Button variant="outline" onClick={exportData} className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Data
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleDatabaseAction("clear-queries")}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Query Logs
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleDatabaseAction("clear-cache")}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Case Cache
            </Button>
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Database Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Database Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Database Connection
              </span>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Last Updated
              </span>
              <span className="text-sm text-gray-600">{new Date().toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-500" />
                Database Type
              </span>
              <Badge variant="secondary">SQLite</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
