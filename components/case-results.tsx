"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Users, FileText, Download, ExternalLink } from "lucide-react"

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

interface CaseResultsProps {
  caseData: CaseData
}

export function CaseResults({ caseData }: CaseResultsProps) {
  const handleDownloadPDF = async (pdfUrl: string, title: string) => {
    try {
      const response = await fetch("/api/download-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfUrl, title }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Case Details
              </CardTitle>
              <CardDescription>
                {caseData.caseType} No. {caseData.caseNumber}/{caseData.filingYear}
              </CardDescription>
            </div>
            <Badge variant={caseData.status === "Active" ? "default" : "secondary"}>{caseData.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parties */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Parties
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Petitioner:</span>
                <p className="mt-1">{caseData.parties.petitioner}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Respondent:</span>
                <p className="mt-1">{caseData.parties.respondent}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <span className="font-medium text-gray-600">Filing Date:</span>
                <p className="text-sm">{new Date(caseData.filingDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <span className="font-medium text-gray-600">Next Hearing:</span>
                <p className="text-sm">{new Date(caseData.nextHearingDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders and Judgments */}
      {caseData.orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Orders & Judgments</CardTitle>
            <CardDescription>Recent orders and judgments for this case</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {caseData.orders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium">{order.title}</h5>
                    <p className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(order.pdfUrl, "_blank")}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(order.pdfUrl, order.title)}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date(caseData.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}
