require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const pool = require('./db');
const analyzeRouter = require('./routes/analyze');
const pdfRouter = require('./routes/pdf');
const statsRouter = require('./routes/stats');
const simulateRouter = require('./routes/simulate');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', analyzeRouter);
app.use('/api', pdfRouter);
app.use('/api', statsRouter);
app.use('/api', simulateRouter);

// Serve React build in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Auto-migrate on startup
async function autoMigrate() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await client.query(`
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
      )
    `);
    console.log('Database ready');
  } catch (err) {
    console.error('Database setup warning:', err.message);
  } finally {
    client.release();
  }
}

autoMigrate().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});

const simulateRouter = require('./routes/simulate');

const reimagineRouter = require('./routes/reimagine');

app.use('/api', simulateRouter);

app.use('/api', reimagineRouter);



