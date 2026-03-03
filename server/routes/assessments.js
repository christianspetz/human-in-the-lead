const { v4: uuidv4 } = require("uuid");

module.exports = function(app, authMiddleware) {
  const db = require("../db");

  // List user's assessments
  app.get("/api/assessments", authMiddleware, (req, res) => {
    const own = db.prepare("SELECT id, company_name, function_id, function_name, status, created_at, updated_at FROM assessments WHERE user_id = ? ORDER BY updated_at DESC").all(req.user.id);
    const shared = db.prepare(`
      SELECT a.id, a.company_name, a.function_id, a.function_name, a.status, a.created_at, a.updated_at, s.role as share_role
      FROM assessment_shares s JOIN assessments a ON s.assessment_id = a.id
      WHERE s.shared_with_email = ? ORDER BY a.updated_at DESC
    `).all(req.user.email);
    res.json({ own, shared });
  });

  // Create new assessment
  app.post("/api/assessments", authMiddleware, (req, res) => {
    const { companyName, functionId, functionName } = req.body;
    const id = uuidv4();
    const data = JSON.stringify({
      baseline: { company: companyName || "New Company", industry: "Manufacturing", revenue: 5000, cogs: 3000, sga: 1000, recv: 800, pay: 600, inventory: 400, headcount: 5000 },
      selectedProcs: [], selectedFunction: functionId || "finance",
      procValues: {}, procBenchmarks: {}, questAnswers: {}, baselineData: {}, procScenarios: {},
      catalystResults: {}, agentResults: {}, uploadedMining: {}, savedScenarios: [],
    });
    db.prepare("INSERT INTO assessments (id, user_id, company_name, function_id, function_name, data) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, req.user.id, companyName || "New Company", functionId || "finance", functionName || "Finance", data);

    db.prepare("INSERT INTO audit_log (assessment_id, user_id, user_email, action) VALUES (?, ?, ?, ?)")
      .run(id, req.user.id, req.user.email, "created");

    res.json({ id, company_name: companyName || "New Company" });
  });

  // Get assessment
  app.get("/api/assessments/:id", authMiddleware, (req, res) => {
    const row = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    // Check access
    if (row.user_id !== req.user.id) {
      const share = db.prepare("SELECT * FROM assessment_shares WHERE assessment_id = ? AND shared_with_email = ?").get(req.params.id, req.user.email);
      if (!share) return res.status(403).json({ error: "Access denied" });
    }
    res.json({ ...row, data: JSON.parse(row.data) });
  });

  // Update assessment data (full save)
  app.put("/api/assessments/:id", authMiddleware, (req, res) => {
    const row = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    // Owner or editor can update
    if (row.user_id !== req.user.id) {
      const share = db.prepare("SELECT * FROM assessment_shares WHERE assessment_id = ? AND shared_with_email = ? AND role = 'editor'").get(req.params.id, req.user.email);
      if (!share) return res.status(403).json({ error: "Access denied" });
    }
    const { data, companyName, status } = req.body;
    const updates = [];
    const params = [];
    if (data !== undefined) { updates.push("data = ?"); params.push(JSON.stringify(data)); }
    if (companyName !== undefined) { updates.push("company_name = ?"); params.push(companyName); }
    if (status !== undefined) { updates.push("status = ?"); params.push(status); }
    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);
    db.prepare(`UPDATE assessments SET ${updates.join(", ")} WHERE id = ?`).run(...params);

    db.prepare("INSERT INTO audit_log (assessment_id, user_id, user_email, action, field_changed) VALUES (?, ?, ?, ?, ?)")
      .run(req.params.id, req.user.id, req.user.email, "updated", Object.keys(req.body).join(","));

    res.json({ ok: true });
  });

  // Patch assessment data (partial merge)
  app.patch("/api/assessments/:id", authMiddleware, (req, res) => {
    const row = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (row.user_id !== req.user.id) {
      const share = db.prepare("SELECT * FROM assessment_shares WHERE assessment_id = ? AND shared_with_email = ? AND role = 'editor'").get(req.params.id, req.user.email);
      if (!share) return res.status(403).json({ error: "Access denied" });
    }
    const existing = JSON.parse(row.data);
    const merged = { ...existing, ...req.body.data };
    db.prepare("UPDATE assessments SET data = ?, updated_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(merged), req.params.id);

    db.prepare("INSERT INTO audit_log (assessment_id, user_id, user_email, action, field_changed) VALUES (?, ?, ?, ?, ?)")
      .run(req.params.id, req.user.id, req.user.email, "patched", Object.keys(req.body.data || {}).join(","));

    res.json({ ok: true });
  });

  // Delete assessment
  app.delete("/api/assessments/:id", authMiddleware, (req, res) => {
    const row = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (row.user_id !== req.user.id) return res.status(403).json({ error: "Only owner can delete" });

    db.prepare("DELETE FROM assessment_shares WHERE assessment_id = ?").run(req.params.id);
    db.prepare("DELETE FROM assessments WHERE id = ?").run(req.params.id);

    db.prepare("INSERT INTO audit_log (assessment_id, user_id, user_email, action) VALUES (?, ?, ?, ?)")
      .run(req.params.id, req.user.id, req.user.email, "deleted");

    res.json({ ok: true });
  });

  // Share assessment
  app.post("/api/assessments/:id/share", authMiddleware, (req, res) => {
    const row = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (row.user_id !== req.user.id) return res.status(403).json({ error: "Only owner can share" });

    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    const shareRole = role === "editor" ? "editor" : "viewer";
    const shareId = uuidv4();

    // Upsert — remove existing share for this email then insert
    db.prepare("DELETE FROM assessment_shares WHERE assessment_id = ? AND shared_with_email = ?").run(req.params.id, email);
    db.prepare("INSERT INTO assessment_shares (id, assessment_id, shared_with_email, role) VALUES (?, ?, ?, ?)")
      .run(shareId, req.params.id, email, shareRole);

    db.prepare("INSERT INTO audit_log (assessment_id, user_id, user_email, action, field_changed) VALUES (?, ?, ?, ?, ?)")
      .run(req.params.id, req.user.id, req.user.email, "shared", `${email}:${shareRole}`);

    res.json({ ok: true, shareId });
  });

  // Revoke share
  app.delete("/api/assessments/:id/share/:shareId", authMiddleware, (req, res) => {
    const row = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (row.user_id !== req.user.id) return res.status(403).json({ error: "Only owner can revoke shares" });

    db.prepare("DELETE FROM assessment_shares WHERE id = ? AND assessment_id = ?").run(req.params.shareId, req.params.id);
    res.json({ ok: true });
  });

  // List shares for an assessment
  app.get("/api/assessments/:id/shares", authMiddleware, (req, res) => {
    const row = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (row.user_id !== req.user.id) return res.status(403).json({ error: "Only owner can view shares" });

    const shares = db.prepare("SELECT id, shared_with_email, role, created_at FROM assessment_shares WHERE assessment_id = ?").all(req.params.id);
    res.json({ shares });
  });

  // Audit log for an assessment
  app.get("/api/assessments/:id/audit", authMiddleware, (req, res) => {
    const row = db.prepare("SELECT * FROM assessments WHERE id = ?").get(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (row.user_id !== req.user.id) return res.status(403).json({ error: "Only owner can view audit log" });

    const log = db.prepare("SELECT * FROM audit_log WHERE assessment_id = ? ORDER BY timestamp DESC LIMIT 100").all(req.params.id);
    res.json({ log });
  });
};
