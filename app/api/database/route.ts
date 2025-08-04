import { NextResponse } from "next/server"
import { getDatabase, dbUtils } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "stats":
        const stats = dbUtils.getStats()
        return NextResponse.json({ stats })

      case "courts":
        const courts = dbUtils.getCourts()
        return NextResponse.json({ courts })

      case "case-types":
        const courtId = searchParams.get("courtId")
        if (!courtId) {
          return NextResponse.json({ error: "Court ID is required" }, { status: 400 })
        }
        const caseTypes = dbUtils.getCaseTypes(Number.parseInt(courtId))
        return NextResponse.json({ caseTypes })

      case "export":
        // Export database data
        const db = getDatabase()
        const queries = db.prepare("SELECT * FROM queries ORDER BY timestamp DESC LIMIT 1000").all()
        const cases = db.prepare("SELECT * FROM cases ORDER BY created_at DESC").all()

        return NextResponse.json({
          queries,
          cases,
          exportedAt: new Date().toISOString(),
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Database API error:", error)
    return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case "clear-queries":
        const db = getDatabase()
        const result = db.prepare("DELETE FROM queries").run()
        return NextResponse.json({
          message: `Cleared ${result.changes} query records`,
          cleared: result.changes,
        })

      case "clear-cache":
        const db2 = getDatabase()
        const result2 = db2.prepare("DELETE FROM cases").run()
        return NextResponse.json({
          message: `Cleared ${result2.changes} cached cases`,
          cleared: result2.changes,
        })

      case "backup":
        // Create a backup of the database
        const db3 = getDatabase()
        const backup = db3.backup(`backup-${Date.now()}.db`)
        return NextResponse.json({
          message: "Backup created successfully",
          backupPath: backup,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Database POST error:", error)
    return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
  }
}
