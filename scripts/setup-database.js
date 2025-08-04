const { getDatabase, dbUtils } = require("../lib/database")

async function setupDatabase() {
  console.log("🚀 Setting up Court Data Fetcher database...")

  try {
    // Initialize database
    const db = getDatabase()
    console.log("✅ Database initialized successfully")

    // Get statistics
    const stats = dbUtils.getStats()
    console.log("📊 Database Statistics:")
    console.log(`   - Total Queries: ${stats.totalQueries}`)
    console.log(`   - Successful Queries: ${stats.successfulQueries}`)
    console.log(`   - Cached Cases: ${stats.cachedCases}`)
    console.log(`   - Success Rate: ${stats.successRate}%`)

    // Get courts
    const courts = dbUtils.getCourts()
    console.log(`🏛️  Available Courts: ${courts.length}`)
    courts.forEach((court) => {
      console.log(`   - ${court.name} (${court.type})`)
    })

    // Get case types for Delhi High Court
    const caseTypes = dbUtils.getCaseTypes(1)
    console.log(`⚖️  Case Types for Delhi High Court: ${caseTypes.length}`)
    caseTypes.forEach((type) => {
      console.log(`   - ${type.type_name} (${type.type_code})`)
    })

    console.log("🎉 Database setup completed successfully!")
    console.log("💡 You can now start the application with: npm run dev")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
