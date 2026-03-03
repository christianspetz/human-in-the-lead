import { useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   DESIGN TOKENS — Prism Design Language
   ═══════════════════════════════════════════════════════ */
const GOLD = "#D4A853", GREEN = "#7CB9A8", RED = "#D48A8A", YELLOW = "#D4C27A";
const FONT = "'DM Sans',sans-serif", MONO = "'DM Mono',monospace";
const TH = {
  dark:  { bg: "#111110", card: "#1A1A18", bdr: "#2A2A25", tx: "#EEEAE4", tx2: "#B8B0A4", mut: "#888", hover: "#1E1E1B" },
  light: { bg: "#F5F0E8", card: "#FFFFFF", bdr: "#D8D2C6", tx: "#1A1A18", tx2: "#555548", mut: "#888880", hover: "#F0EBE0" },
};

/* ═══════════════════════════════════════════════════════
   FUZZY MATCHING — word overlap ratio
   ═══════════════════════════════════════════════════════ */
function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/).filter(Boolean);
}

function wordOverlap(a, b) {
  const wa = normalize(a), wb = normalize(b);
  if (!wa.length || !wb.length) return 0;
  const setB = new Set(wb);
  const matches = wa.filter(w => setB.has(w)).length;
  return (matches * 2) / (wa.length + wb.length);
}

function findBestMatch(job, apqcProcs) {
  let best = { proc: null, score: 0 };
  for (const p of apqcProcs) {
    // Match against the L4 label
    const labelScore = wordOverlap(job, p.label);
    // Match against any jobs array entries if present
    let jobsScore = 0;
    if (p.jobs && Array.isArray(p.jobs)) {
      for (const j of p.jobs) {
        const s = wordOverlap(job, j);
        if (s > jobsScore) jobsScore = s;
      }
    }
    const score = Math.max(labelScore, jobsScore);
    if (score > best.score) {
      best = { proc: p, score };
    }
  }
  return best;
}

function confidenceTier(score) {
  if (score >= 0.8) return { tier: "auto", color: GREEN, label: "Auto-Map", icon: "✓" };
  if (score >= 0.5) return { tier: "review", color: YELLOW, label: "Review", icon: "↔" };
  return { tier: "unmatched", color: RED, label: "Unmatched", icon: "✗" };
}

/* ═══════════════════════════════════════════════════════
   PARSE UPLOADS — textarea, CSV, JSON
   ═══════════════════════════════════════════════════════ */
function parseLines(text) {
  return text
    .split(/\r?\n/)
    .map(l => l.replace(/^[-•*]\s*/, "").replace(/^["']|["']$/g, "").trim())
    .filter(Boolean);
}

function parseCSV(text) {
  return text
    .split(/\r?\n/)
    .flatMap(row => row.split(","))
    .map(c => c.replace(/^["']|["']$/g, "").trim())
    .filter(Boolean);
}

function parseJSON(text) {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return data.map(d => typeof d === "string" ? d : d.name || d.label || d.job || "").filter(Boolean);
    return [];
  } catch { return []; }
}

/* ═══════════════════════════════════════════════════════
   BlueprintReconciler — main component
   ═══════════════════════════════════════════════════════ */
export default function BlueprintReconciler({ visible, onClose, apqcProcs = [], onMapProcess, theme = "dark" }) {
  const t = TH[theme] || TH.dark;

  const [rawText, setRawText] = useState("");
  const [jobs, setJobs] = useState([]);            // parsed job strings
  const [overrides, setOverrides] = useState({});   // index → procId or "__none__"
  const [step, setStep] = useState("upload");       // "upload" | "match"

  /* — flatten apqcProcs into a simple lookup — */
  const procList = useMemo(() => apqcProcs, [apqcProcs]);
  const procById = useMemo(() => {
    const m = {};
    for (const p of procList) m[p.id || p.l4] = p;
    return m;
  }, [procList]);

  /* — compute matches — */
  const matches = useMemo(() => {
    return jobs.map((job, i) => {
      const { proc, score } = findBestMatch(job, procList);
      const override = overrides[i];
      if (override === "__none__") return { job, proc: null, score: 0, overridden: true };
      if (override && procById[override]) return { job, proc: procById[override], score: 1, overridden: true };
      return { job, proc, score, overridden: false };
    });
  }, [jobs, procList, procById, overrides]);

  /* — handlers — */
  function handleParse() {
    const parsed = parseLines(rawText);
    if (parsed.length) {
      setJobs(parsed);
      setStep("match");
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      let parsed;
      if (file.name.endsWith(".json")) parsed = parseJSON(text);
      else if (file.name.endsWith(".csv")) parsed = parseCSV(text);
      else parsed = parseLines(text);
      if (parsed.length) {
        setJobs(parsed);
        setStep("match");
      }
    };
    reader.readAsText(file);
  }

  function handleOverride(index, value) {
    setOverrides(prev => ({ ...prev, [index]: value }));
  }

  function handleApply() {
    const mapping = matches
      .filter(m => m.proc)
      .map(m => ({
        blueprintJob: m.job,
        procId: m.proc.id || m.proc.l4,
        label: m.proc.label,
        l4: m.proc.l4,
        confidence: Math.round(m.score * 100),
        overridden: m.overridden,
      }));
    onMapProcess?.(mapping);
    onClose?.();
  }

  function handleReset() {
    setJobs([]);
    setOverrides({});
    setRawText("");
    setStep("upload");
  }

  /* — stats — */
  const autoCount = matches.filter(m => confidenceTier(m.score).tier === "auto").length;
  const reviewCount = matches.filter(m => confidenceTier(m.score).tier === "review").length;
  const unmatchedCount = matches.filter(m => confidenceTier(m.score).tier === "unmatched").length;

  if (!visible) return null;

  /* ═══════════════════════════════════════════════════════
     STYLES
     ═══════════════════════════════════════════════════════ */
  const overlay = {
    position: "fixed", inset: 0, zIndex: 9000,
    background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: FONT,
  };
  const panel = {
    background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 16,
    width: "min(960px, 92vw)", maxHeight: "85vh", overflow: "hidden",
    display: "flex", flexDirection: "column",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  };
  const header = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 28px", borderBottom: `1px solid ${t.bdr}`,
  };
  const body = { padding: "24px 28px", overflowY: "auto", flex: 1 };
  const footer = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 28px", borderTop: `1px solid ${t.bdr}`,
  };
  const btnPrimary = {
    background: GOLD, color: "#111", border: "none", borderRadius: 10,
    padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
  };
  const btnSecondary = {
    background: "none", border: `1px solid ${t.bdr}`, borderRadius: 10,
    padding: "10px 24px", color: t.tx2, cursor: "pointer", fontSize: 14, fontFamily: FONT,
  };
  const textarea = {
    width: "100%", minHeight: 160, background: t.bg, border: `1px solid ${t.bdr}`,
    borderRadius: 10, padding: 16, color: t.tx, fontSize: 14, fontFamily: FONT,
    resize: "vertical", outline: "none", boxSizing: "border-box",
  };
  const th = {
    textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 600,
    color: t.mut, textTransform: "uppercase", letterSpacing: "0.5px",
    borderBottom: `1px solid ${t.bdr}`,
  };
  const td = {
    padding: "10px 12px", fontSize: 14, color: t.tx,
    borderBottom: `1px solid ${t.bdr}`, verticalAlign: "middle",
  };
  const badge = (color) => ({
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    color: "#111", background: color,
  });
  const select = {
    background: t.bg, border: `1px solid ${t.bdr}`, borderRadius: 8,
    padding: "6px 10px", fontSize: 13, color: t.tx, fontFamily: FONT,
    cursor: "pointer", maxWidth: 260, outline: "none",
  };
  const statBox = (color) => ({
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "12px 20px", borderRadius: 10, background: `${color}15`,
    border: `1px solid ${color}30`, minWidth: 90,
  });

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={panel}>

        {/* ── HEADER ── */}
        <div style={header}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.tx, fontFamily: FONT }}>
              EY.ai Value Blueprint Reconciler
            </div>
            <div style={{ fontSize: 13, color: t.tx2, marginTop: 2 }}>
              Map EY.ai Value Blueprint jobs-to-be-done → APQC L4 processes
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.mut, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {/* ── BODY ── */}
        <div style={body}>

          {/* ── STEP 1: UPLOAD ── */}
          {step === "upload" && (
            <div>
              <div style={{ fontSize: 14, color: t.tx2, marginBottom: 12 }}>
                Paste your EY.ai Value Blueprint jobs-to-be-done below (one per line), or upload a CSV / JSON file.
              </div>
              <textarea
                style={textarea}
                placeholder={`Close entity level books\nValidate trial balances\nProcess intercompany eliminations\nGenerate consolidated financial statements`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
                <button style={btnPrimary} onClick={handleParse} disabled={!rawText.trim()}>
                  Parse & Match
                </button>
                <label style={{ ...btnSecondary, display: "inline-flex", alignItems: "center", gap: 6, margin: 0 }}>
                  Upload File
                  <input
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                </label>
                <span style={{ fontSize: 12, color: t.mut }}>
                  Accepts .txt, .csv, .json
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 2: MATCH TABLE ── */}
          {step === "match" && (
            <div>
              {/* Summary stats */}
              <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                <div style={statBox(GREEN)}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>{autoCount}</div>
                  <div style={{ fontSize: 11, color: t.tx2, marginTop: 2 }}>Auto-Mapped</div>
                </div>
                <div style={statBox(YELLOW)}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: YELLOW }}>{reviewCount}</div>
                  <div style={{ fontSize: 11, color: t.tx2, marginTop: 2 }}>Review</div>
                </div>
                <div style={statBox(RED)}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: RED }}>{unmatchedCount}</div>
                  <div style={{ fontSize: 11, color: t.tx2, marginTop: 2 }}>Unmatched</div>
                </div>
                <div style={statBox(t.bdr)}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: t.tx }}>{jobs.length}</div>
                  <div style={{ fontSize: 11, color: t.tx2, marginTop: 2 }}>Total Jobs</div>
                </div>
              </div>

              {/* Match table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={th}>Blueprint Job</th>
                      <th style={th}>Best Match (L4)</th>
                      <th style={th}>Confidence</th>
                      <th style={th}>Action / Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m, i) => {
                      const tier = confidenceTier(m.score);
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : `${t.bdr}15` }}>
                          <td style={{ ...td, fontWeight: 500, maxWidth: 240 }}>
                            {m.job}
                          </td>
                          <td style={{ ...td, maxWidth: 280 }}>
                            {m.proc ? (
                              <span>
                                <span style={{ fontFamily: MONO, fontSize: 12, color: GOLD, marginRight: 6 }}>
                                  {m.proc.l4}
                                </span>
                                {m.proc.label}
                              </span>
                            ) : (
                              <span style={{ color: t.mut, fontStyle: "italic" }}>No match found</span>
                            )}
                          </td>
                          <td style={td}>
                            <span style={badge(tier.color)}>
                              {tier.icon} {Math.round(m.score * 100)}%
                            </span>
                          </td>
                          <td style={td}>
                            <select
                              style={select}
                              value={overrides[i] || ""}
                              onChange={(e) => handleOverride(i, e.target.value)}
                            >
                              <option value="">
                                {tier.tier === "auto" ? "✓ Map (auto)" : tier.tier === "review" ? "↔ Review" : "✗ Unmatched"}
                              </option>
                              <option value="__none__">No Match / New Process</option>
                              {procList.map(p => (
                                <option key={p.id || p.l4} value={p.id || p.l4}>
                                  {p.l4} — {p.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={footer}>
          <div style={{ display: "flex", gap: 10 }}>
            {step === "match" && (
              <button style={btnSecondary} onClick={handleReset}>← Back</button>
            )}
            <button style={btnSecondary} onClick={onClose}>Cancel</button>
          </div>
          {step === "match" && (
            <button style={btnPrimary} onClick={handleApply}>
              Apply Mapping ({matches.filter(m => m.proc).length} processes)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
