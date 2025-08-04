import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET() {
  try {
    const db = getDatabase()

    const queries = db
      .prepare(`
      SELECT id, case_type, case_number, filing_year, success, timestamp
      FROM queries
      ORDER BY timestamp DESC
      LIMIT 50
    `)
      .all()

    return NextResponse.json({ queries })
  } catch (error) {
    console.error("Error fetching query history:", error)
    return NextResponse.json({ error: "Failed to fetch query history" }, { status: 500 })
  }
}
