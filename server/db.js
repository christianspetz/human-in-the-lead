const Database = require("better-sqlite3");
const path = require("path");

// Use /data directory on Railway (persistent volume) or local ./data
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, "data", "prism.db");

// Ensure directory exists
const fs = require("fs");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent reads
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    function_id TEXT DEFAULT 'finance',
    function_name TEXT DEFAULT 'Finance',
    status TEXT DEFAULT 'draft',
    data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assessment_shares (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    shared_with_email TEXT NOT NULL,
    role TEXT DEFAULT 'viewer',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (assessment_id) REFERENCES assessments(id)
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_email TEXT,
    action TEXT NOT NULL,
    field_changed TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_assessment ON audit_log(assessment_id);
  CREATE INDEX IF NOT EXISTS idx_shares_assessment ON assessment_shares(assessment_id);
`);

module.exports = db;
