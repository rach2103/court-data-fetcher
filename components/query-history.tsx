"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, RefreshCw } from "lucide-react"

interface QueryRecord {
  id: number
  caseType: string
  caseNumber: string
  filingYear: string
  success: boolean
  timestamp: string
}

export function QueryHistory() {
  const [queries, setQueries] = useState<QueryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/query-history")
      if (response.ok) {
        const data = await response.json()
        setQueries(data.queries)
      }
    } catch (error) {
      console.error("Error fetching query history:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Recent Queries</span>
        <Button variant="ghost" size="sm" onClick={fetchHistory}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {queries.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">No queries yet</p>
      ) : (
        queries.slice(0, 10).map((query, index) => (
          <div key={query.id}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{query.caseType}</span>
                <Badge variant={query.success ? "default" : "destructive"} className="text-xs">
                  {query.success ? "Success" : "Failed"}
                </Badge>
              </div>
              <div className="text-xs text-gray-600">
                No. {query.caseNumber}/{query.filingYear}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {new Date(query.timestamp).toLocaleString()}
              </div>
            </div>
            {index < queries.length - 1 && <Separator className="mt-3" />}
          </div>
        ))
      )}
    </div>
  )
}
