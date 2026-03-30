// deploy: force fresh build 2026-03-05
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
app.use(express.json({ limit: '10mb' }));
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
    const { prompt, model, messages, max_tokens } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: max_tokens || 1500,
        messages: messages || [{ role: "user", content: prompt }],
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

// Financial PDF extraction — server-side text extraction + AI parsing
app.post('/api/extract-financials', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const { base64, fileName } = req.body;
    if (!base64) return res.status(400).json({ error: "No file data provided" });

    const isPdf = (fileName || '').toLowerCase().endsWith('.pdf');
    let extractedText = '';

    if (isPdf) {
      // Server-side PDF text extraction with pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const uint8 = new Uint8Array(Buffer.from(base64, 'base64'));
      const doc = await pdfjsLib.getDocument({ data: uint8 }).promise;

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        extractedText += `\n--- PAGE ${i} ---\n` + pageText;
      }
      doc.destroy();
    } else {
      // For Excel/other formats, pass base64 directly (truncated)
      extractedText = `[Base64 ${fileName || 'file'} content - first 100K chars]\n${Buffer.from(base64, 'base64').toString('utf8').substring(0, 100000)}`;
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "Could not extract text from document. The PDF may be image-based (scanned)." });
    }

    console.log(`[extract-financials] Extracted ${extractedText.length} chars from ${fileName || 'unknown file'}`);

    // Send extracted text to Claude for structured parsing
    const prompt = `You are a financial data extraction expert. Below is the full text extracted from a company's earnings release or financial filing. Extract the FULL YEAR (annual) financial data.

IMPORTANT RULES:
- Only extract FULL YEAR / "Year Ended" figures, NOT quarterly
- Numbers are stated "in millions" unless noted — return values in millions
- If stated in billions, multiply by 1000
- If a field can be calculated from other extracted values, calculate it
- For EBITDA: Operating Income + Depreciation & Amortization
- For Free Cash Flow: Operating Cash Flow - CapEx
- For Operating Margin: Operating Income / Revenue * 100
- For Gross Profit: Revenue - COGS

FIELDS TO EXTRACT:
revenue, cogs, grossProfit, sga, operatingIncome, operatingMargin, ebitda, netIncome, eps,
accountsReceivable, accountsPayable, inventory, totalAssets, cash, longTermDebt, totalEquity,
capex, operatingCashFlow, freeCashFlow, depreciation,
headcount, financeHeadcount, annualPayroll

Return ONLY a JSON object (no markdown, no commentary):
{
  "fields": {
    "revenue": { "value": <number in millions or null>, "sourceLabel": "<exact label from document>", "confidence": "found"|"calculated"|"not found" },
    "cogs": { ... }, "grossProfit": { ... }, "sga": { ... }, "operatingIncome": { ... },
    "operatingMargin": { ... }, "ebitda": { ... }, "netIncome": { ... }, "eps": { ... },
    "accountsReceivable": { ... }, "accountsPayable": { ... }, "inventory": { ... },
    "totalAssets": { ... }, "cash": { ... }, "longTermDebt": { ... }, "totalEquity": { ... },
    "capex": { ... }, "operatingCashFlow": { ... }, "freeCashFlow": { ... },
    "depreciation": { ... }, "headcount": { ... }, "financeHeadcount": { ... }, "annualPayroll": { ... }
  },
  "fiscalYear": "<year>",
  "currency": "USD",
  "companyName": "<company name>",
  "segments": [{"name": "<segment>", "revenue": <number>, "operatingIncome": <number>}]
}

=== DOCUMENT TEXT ===
${extractedText}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("[extract-financials] API error:", data.error);
      return res.status(400).json({ error: data.error.message });
    }

    const aiText = data.content?.map(c => c.text || "").join("\n") || "";
    console.log(`[extract-financials] AI response: ${aiText.substring(0, 200)}...`);

    res.json({
      result: aiText,
      rawTextLength: extractedText.length,
      rawTextPreview: extractedText.substring(0, 2000),
    });
  } catch (err) {
    console.error("[extract-financials] Error:", err);
    res.status(500).json({ error: err.message || "Financial extraction failed" });
  }
});

// AI Role-to-APQC Process Mapping
app.post('/api/map-roles', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const { roles } = req.body;
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: "No roles provided" });
    }

    const systemPrompt = `You are an APQC process framework expert. Map each job title + department combination to the most relevant APQC Level 4 process. Return JSON only, no other text. Format: [{"role": "...", "department": "...", "apqcL4Code": "8.2.1", "apqcL4Name": "Evaluate Customer Creditworthiness", "confidence": "high|medium|low"}]. If a role spans multiple processes, return the primary one. If a role cannot be mapped to a specific L4 process, set apqcL4Code to "unmapped".`;

    const userPrompt = `Map these role + department combinations to APQC L4 processes:\n\n${JSON.stringify(roles)}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error("[map-roles] API error:", data.error);
      return res.status(400).json({ error: data.error.message });
    }

    const text = data.content?.map(c => c.text || "").join("\n") || "";
    console.log(`[map-roles] Mapped ${roles.length} unique roles`);
    res.json({ result: text });
  } catch (err) {
    console.error("[map-roles] Error:", err);
    res.status(500).json({ error: err.message || "Role mapping failed" });
  }
});

// Serve React build in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
const clientPublicPath = path.join(__dirname, '..', 'client', 'public');
app.use(express.static(clientBuildPath));
app.use(express.static(clientPublicPath));

// Static standalone pages
app.get('/eudia', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'eudia.html'));
});

app.get('/payer', (req, res) => {
  const distFile = path.join(clientBuildPath, 'ignite-payer.html');
  const pubFile = path.join(clientPublicPath, 'ignite-payer.html');
  const fs = require('fs');
  if (fs.existsSync(distFile)) res.sendFile(distFile);
  else res.sendFile(pubFile);
});

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
