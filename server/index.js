require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const pool = require('./pgPool');
const { users, createToken, authMiddleware } = require('./auth');
const analyzeRouter = require('./routes/analyze');
const assessmentsRouter = require('./routes/assessments');
const pdfRouter = require('./routes/pdf');
const statsRouter = require('./routes/stats');
const simulateRouter = require('./routes/simulate');
const reimagineRouter = require('./routes/reimagine');
const arclineRoutes = require('./routes/arcline');
const apolloSimulateRouter = require('./routes/apolloSimulate');
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// ─── Auth routes ───
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = createToken(user);
  res.cookie("prism_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email already registered" });
  const id = String(users.length + 1);
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = { id, email, passwordHash, role: "consultant", name: name || email.split("@")[0] };
  users.push(user);
  const token = createToken(user);
  res.cookie("prism_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("prism_token");
  res.json({ ok: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api', analyzeRouter);
app.use('/api', pdfRouter);
app.use('/api', statsRouter);
app.use('/api', simulateRouter);
app.use('/api', reimagineRouter);
app.use('/api/arcline', arclineRoutes);
app.use('/api', apolloSimulateRouter);
assessmentsRouter(app, authMiddleware);
// Catalyst API proxy — keeps Anthropic API key server-side
app.post('/api/catalyst', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Catalyst not configured on server" });

  try {
    const { prompt, model } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    const text = data.content?.map(c => c.text || "").join("\n") || "";
    res.json({ result: text });
  } catch (err) {
    console.error("Catalyst proxy error:", err);
    res.status(500).json({ error: "Catalyst request failed" });
  }
});

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
autoMigrate().catch((err) => {
  console.error('Database connection failed (non-fatal):', err.message);
}).finally(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
