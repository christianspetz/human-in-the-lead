require('dotenv').config();
const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      
      CREATE TABLE IF NOT EXISTS submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        answers JSONB NOT NULL,
        readiness_score INTEGER,
        readiness_level VARCHAR(50),
        headline VARCHAR(500),
        full_response JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_submissions_industry ON submissions((answers->>'q1'));
    `);
    console.log('Migration completed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
