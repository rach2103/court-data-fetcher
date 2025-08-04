import { type NextRequest, NextResponse } from "next/server"
import { dbUtils } from "@/lib/database"
import { scrapeCourtData } from "@/lib/scraper"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { caseType, caseNumber, filingYear } = await request.json()

    if (!caseType || !caseNumber || !filingYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check for cached case data first
    const cachedCase = dbUtils.getCachedCase(caseType, caseNumber, filingYear)
    if (cachedCase) {
      // Return cached data if it's less than 24 hours old
      const cacheAge = Date.now() - new Date(cachedCase.last_updated).getTime()
      if (cacheAge < 24 * 60 * 60 * 1000) {
        // 24 hours
        const responseTime = Date.now() - startTime
        dbUtils.logQuery(caseType, caseNumber, filingYear, true, "Returned from cache", responseTime)

        return NextResponse.json({
          data: {
            id: cachedCase.id,
            caseNumber: cachedCase.case_number,
            caseType: cachedCase.case_type,
            filingYear: cachedCase.filing_year,
            parties: {
              petitioner: cachedCase.petitioner,
              respondent: cachedCase.respondent,
            },
            filingDate: cachedCase.filing_date,
            nextHearingDate: cachedCase.next_hearing_date,
            status: cachedCase.status,
            orders: JSON.parse(cachedCase.orders_json || "[]"),
            lastUpdated: cachedCase.last_updated,
          },
          fromCache: true,
        })
      }
    }

    try {
      // Attempt to scrape fresh court data
      const caseData = await scrapeCourtData(caseType, caseNumber, filingYear)
      const responseTime = Date.now() - startTime

      // Cache the successful result
      dbUtils.cacheCase(caseData)

      // Log successful query
      dbUtils.logQuery(caseType, caseNumber, filingYear, true, JSON.stringify(caseData), responseTime)

      return NextResponse.json({ data: caseData, fromCache: false })
    } catch (scrapeError) {
      const responseTime = Date.now() - startTime
      const errorMessage = scrapeError instanceof Error ? scrapeError.message : "Unknown error"

      // Log failed query
      dbUtils.logQuery(caseType, caseNumber, filingYear, false, errorMessage, responseTime)

      throw scrapeError
    }
  } catch (error) {
    console.error("Error fetching case data:", error)

    if (error instanceof Error) {
      if (error.message.includes("Case not found")) {
        return NextResponse.json(
          { error: "Case not found. Please verify the case number and try again." },
          { status: 404 },
        )
      }
      if (error.message.includes("Court website unavailable")) {
        return NextResponse.json(
          { error: "Court website is currently unavailable. Please try again later." },
          { status: 503 },
        )
      }
    }

    return NextResponse.json({ error: "Failed to fetch case data. Please try again." }, { status: 500 })
  }
}
