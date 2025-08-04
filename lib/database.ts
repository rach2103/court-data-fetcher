import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const dbPath = path.join(dataDir, "court_data.db")
    db = new Database(dbPath)

    // Enable WAL mode for better concurrent access
    db.pragma("journal_mode = WAL")
    db.pragma("synchronous = NORMAL")
    db.pragma("cache_size = 1000000")
    db.pragma("temp_store = memory")

    // Initialize all tables
    initializeTables()
    seedSampleData()
  }

  return db
}

function initializeTables() {
  if (!db) return

  // Create tables with proper schema
  db.exec(`
    -- Queries table to log all search requests
    CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_type TEXT NOT NULL,
      case_number TEXT NOT NULL,
      filing_year TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      success BOOLEAN NOT NULL DEFAULT FALSE,
      raw_response TEXT,
      error_message TEXT,
      response_time_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Cases table to cache successful case data
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      case_number TEXT NOT NULL,
      case_type TEXT NOT NULL,
      filing_year TEXT NOT NULL,
      petitioner TEXT,
      respondent TEXT,
      filing_date TEXT,
      next_hearing_date TEXT,
      status TEXT,
      orders_json TEXT, -- JSON array of orders
      last_updated TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(case_type, case_number, filing_year)
    );

    -- Court information table
    CREATE TABLE IF NOT EXISTS courts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      location TEXT,
      type TEXT, -- High Court, District Court, etc.
      active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Case types table for different courts
    CREATE TABLE IF NOT EXISTS case_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      court_id INTEGER,
      type_name TEXT NOT NULL,
      type_code TEXT,
      description TEXT,
      active BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (court_id) REFERENCES courts (id),
      UNIQUE(court_id, type_name)
    );

    -- Orders and judgments table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT NOT NULL,
      order_date TEXT NOT NULL,
      title TEXT NOT NULL,
      pdf_url TEXT,
      local_pdf_path TEXT,
      order_type TEXT, -- Order, Judgment, Notice, etc.
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (case_id) REFERENCES cases (id)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_queries_timestamp ON queries(timestamp);
    CREATE INDEX IF NOT EXISTS idx_queries_case ON queries(case_type, case_number, filing_year);
    CREATE INDEX IF NOT EXISTS idx_queries_success ON queries(success);
    CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at);

    CREATE INDEX IF NOT EXISTS idx_cases_case_info ON cases(case_type, case_number, filing_year);
    CREATE INDEX IF NOT EXISTS idx_cases_last_updated ON cases(last_updated);
    CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);

    CREATE INDEX IF NOT EXISTS idx_orders_case_id ON orders(case_id);
    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
    CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);

    CREATE INDEX IF NOT EXISTS idx_case_types_court ON case_types(court_id);
    CREATE INDEX IF NOT EXISTS idx_courts_active ON courts(active);
  `)
}

function seedSampleData() {
  if (!db) return

  // Check if data already exists
  const courtCount = db.prepare("SELECT COUNT(*) as count FROM courts").get() as { count: number }
  if (courtCount.count > 0) return

  // Insert court information
  const insertCourt = db.prepare(`
    INSERT INTO courts (name, url, location, type, active) VALUES (?, ?, ?, ?, ?)
  `)

  const courts = [
    ["Delhi High Court", "https://delhihighcourt.nic.in/", "New Delhi", "High Court", true],
    ["Supreme Court of India", "https://main.sci.gov.in/", "New Delhi", "Supreme Court", true],
    ["Bombay High Court", "https://bombayhighcourt.nic.in/", "Mumbai", "High Court", true],
    ["Madras High Court", "https://hcmadras.tn.nic.in/", "Chennai", "High Court", true],
    ["Calcutta High Court", "https://calcuttahighcourt.nic.in/", "Kolkata", "High Court", true],
  ]

  courts.forEach((court) => insertCourt.run(...court))

  // Insert case types for Delhi High Court
  const insertCaseType = db.prepare(`
    INSERT INTO case_types (court_id, type_name, type_code, description, active) VALUES (?, ?, ?, ?, ?)
  `)

  const caseTypes = [
    [1, "Civil Appeal", "CA", "Civil Appeals", true],
    [1, "Criminal Appeal", "CRL.A", "Criminal Appeals", true],
    [1, "Writ Petition", "W.P.(C)", "Writ Petitions (Civil)", true],
    [1, "Civil Suit", "CS(OS)", "Civil Suits (Original Side)", true],
    [1, "Criminal Case", "CRL.M.C", "Criminal Miscellaneous Cases", true],
    [1, "Company Petition", "CP", "Company Petitions", true],
    [1, "Arbitration Petition", "ARB.P", "Arbitration Petitions", true],
    [1, "Contempt Petition", "CONT.CAS(C)", "Contempt Cases (Civil)", true],
    [1, "Criminal Writ", "W.P.(CRL)", "Writ Petitions (Criminal)", true],
    [1, "Bail Application", "BAIL APPLN", "Bail Applications", true],
  ]

  caseTypes.forEach((caseType) => insertCaseType.run(...caseType))

  // Insert some sample queries for testing
  const insertQuery = db.prepare(`
    INSERT INTO queries (case_type, case_number, filing_year, timestamp, success, raw_response, response_time_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const sampleQueries = [
    ["Civil Appeal", "1234", "2024", new Date().toISOString(), true, '{"status": "success"}', 1500],
    [
      "Writ Petition",
      "5678",
      "2024",
      new Date(Date.now() - 86400000).toISOString(),
      true,
      '{"status": "success"}',
      2100,
    ],
    ["Criminal Appeal", "9999", "2024", new Date(Date.now() - 172800000).toISOString(), false, "Case not found", 800],
  ]

  sampleQueries.forEach((query) => insertQuery.run(...query))
}

// Database utility functions
export const dbUtils = {
  // Get all courts
  getCourts: () => {
    const db = getDatabase()
    return db.prepare("SELECT * FROM courts WHERE active = 1 ORDER BY name").all()
  },

  // Get case types for a specific court
  getCaseTypes: (courtId: number) => {
    const db = getDatabase()
    return db.prepare("SELECT * FROM case_types WHERE court_id = ? AND active = 1 ORDER BY type_name").all(courtId)
  },

  // Insert a new query log
  logQuery: (
    caseType: string,
    caseNumber: string,
    filingYear: string,
    success: boolean,
    response: string,
    responseTime = 0,
  ) => {
    const db = getDatabase()
    return db
      .prepare(`
      INSERT INTO queries (case_type, case_number, filing_year, timestamp, success, raw_response, response_time_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
      .run(caseType, caseNumber, filingYear, new Date().toISOString(), success, response, responseTime)
  },

  // Cache case data
  cacheCase: (caseData: any) => {
    const db = getDatabase()
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO cases 
      (id, case_number, case_type, filing_year, petitioner, respondent, filing_date, next_hearing_date, status, orders_json, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    return stmt.run(
      caseData.id,
      caseData.caseNumber,
      caseData.caseType,
      caseData.filingYear,
      caseData.parties.petitioner,
      caseData.parties.respondent,
      caseData.filingDate,
      caseData.nextHearingDate,
      caseData.status,
      JSON.stringify(caseData.orders),
      caseData.lastUpdated,
    )
  },

  // Get cached case data
  getCachedCase: (caseType: string, caseNumber: string, filingYear: string) => {
    const db = getDatabase()
    return db
      .prepare(`
      SELECT * FROM cases 
      WHERE case_type = ? AND case_number = ? AND filing_year = ?
    `)
      .get(caseType, caseNumber, filingYear)
  },

  // Get query history
  getQueryHistory: (limit = 50) => {
    const db = getDatabase()
    return db
      .prepare(`
      SELECT id, case_type, case_number, filing_year, success, timestamp, response_time_ms
      FROM queries
      ORDER BY timestamp DESC
      LIMIT ?
    `)
      .all(limit)
  },

  // Get database statistics
  getStats: () => {
    const db = getDatabase()
    const totalQueries = db.prepare("SELECT COUNT(*) as count FROM queries").get() as { count: number }
    const successfulQueries = db.prepare("SELECT COUNT(*) as count FROM queries WHERE success = 1").get() as {
      count: number
    }
    const cachedCases = db.prepare("SELECT COUNT(*) as count FROM cases").get() as { count: number }
    const avgResponseTime = db
      .prepare("SELECT AVG(response_time_ms) as avg FROM queries WHERE response_time_ms > 0")
      .get() as { avg: number }

    return {
      totalQueries: totalQueries.count,
      successfulQueries: successfulQueries.count,
      failedQueries: totalQueries.count - successfulQueries.count,
      cachedCases: cachedCases.count,
      successRate: totalQueries.count > 0 ? ((successfulQueries.count / totalQueries.count) * 100).toFixed(1) : "0",
      avgResponseTime: avgResponseTime.avg ? Math.round(avgResponseTime.avg) : 0,
    }
  },
}

// Close database connection gracefully
export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

// Handle process termination
process.on("exit", closeDatabase)
process.on("SIGINT", closeDatabase)
process.on("SIGTERM", closeDatabase)
