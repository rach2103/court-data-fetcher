-- Initialize the court data database
-- This script creates the necessary tables for storing query logs and case data

-- Queries table to log all search requests
CREATE TABLE IF NOT EXISTS queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_type TEXT NOT NULL,
    case_number TEXT NOT NULL,
    filing_year TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    raw_response TEXT,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_queries_timestamp ON queries(timestamp);
CREATE INDEX IF NOT EXISTS idx_queries_case ON queries(case_type, case_number, filing_year);
CREATE INDEX IF NOT EXISTS idx_queries_success ON queries(success);

CREATE INDEX IF NOT EXISTS idx_cases_case_info ON cases(case_type, case_number, filing_year);
CREATE INDEX IF NOT EXISTS idx_cases_last_updated ON cases(last_updated);

-- Insert some sample data for testing
INSERT OR IGNORE INTO queries (case_type, case_number, filing_year, timestamp, success, raw_response) VALUES
('Civil Appeal', '1234', '2024', '2024-01-15T10:30:00Z', 1, '{"status": "success"}'),
('Writ Petition', '5678', '2024', '2024-01-14T14:20:00Z', 1, '{"status": "success"}'),
('Criminal Appeal', '9999', '2024', '2024-01-13T09:15:00Z', 0, 'Case not found');
