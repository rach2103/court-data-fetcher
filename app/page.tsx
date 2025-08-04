"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Database } from "lucide-react"
import { CaseResults } from "@/components/case-results"
import { QueryHistory } from "@/components/query-history"
import { DatabaseAdmin } from "@/components/database-admin"

interface CaseData {
  id: string
  caseNumber: string
  caseType: string
  filingYear: string
  parties: {
    petitioner: string
    respondent: string
  }
  filingDate: string
  nextHearingDate: string
  status: string
  orders: Array<{
    date: string
    title: string
    pdfUrl: string
  }>
  lastUpdated: string
}

const CASE_TYPES = [
  "Civil Appeal",
  "Criminal Appeal",
  "Writ Petition",
  "Civil Suit",
  "Criminal Case",
  "Company Petition",
  "Arbitration Petition",
  "Contempt Petition",
]

export default function CourtDataFetcher() {
  const [formData, setFormData] = useState({
    caseType: "",
    caseNumber: "",
    filingYear: new Date().getFullYear().toString(),
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [refreshHistory, setRefreshHistory] = useState(0)
  const [showAdmin, setShowAdmin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.caseType || !formData.caseNumber || !formData.filingYear) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")
    setCaseData(null)

    try {
      const response = await fetch("/api/fetch-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch case data")
      }

      setCaseData(result.data)
      setRefreshHistory((prev) => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Court Data Fetcher</h1>
              <p className="text-lg text-gray-600">Fetch case information from Delhi High Court</p>
            </div>
            <Button variant="outline" onClick={() => setShowAdmin(!showAdmin)} className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {showAdmin ? "Hide Admin" : "Show Admin"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Case Search
                </CardTitle>
                <CardDescription>Enter case details to fetch information from Delhi High Court</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="caseType">Case Type *</Label>
                      <Select
                        value={formData.caseType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, caseType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select case type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CASE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="filingYear">Filing Year *</Label>
                      <Input
                        id="filingYear"
                        type="number"
                        min="2000"
                        max={new Date().getFullYear()}
                        value={formData.filingYear}
                        onChange={(e) => setFormData((prev) => ({ ...prev, filingYear: e.target.value }))}
                        placeholder="2024"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caseNumber">Case Number *</Label>
                    <Input
                      id="caseNumber"
                      value={formData.caseNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, caseNumber: e.target.value }))}
                      placeholder="e.g., 1234"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching Case Data...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Fetch Case Data
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            {caseData && <CaseResults caseData={caseData} />}
          </div>

          {/* Query History Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Query History
                </CardTitle>
                <CardDescription>Recent case searches</CardDescription>
              </CardHeader>
              <CardContent>
                <QueryHistory key={refreshHistory} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Database Admin Panel */}
        {showAdmin && (
          <div className="mt-8">
            <DatabaseAdmin />
          </div>
        )}
      </div>
    </div>
  )
}
