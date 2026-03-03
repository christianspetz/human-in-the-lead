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
   DISCREPANCY LOGIC — traffic light thresholds
   ═══════════════════════════════════════════════════════ */
function discrepancy(reported, mined) {
  if (reported == null || mined == null) return { pct: null, color: "#555", label: "No Data", icon: "—" };
  const diff = Math.abs(reported - mined);
  const base = Math.max(Math.abs(reported), 1);
  const pct = (diff / base) * 100;
  if (pct <= 15) return { pct, color: GREEN, label: "Aligned", icon: "●" };
  if (pct <= 40) return { pct, color: YELLOW, label: "Moderate Gap", icon: "●" };
  return { pct, color: RED, label: "Major Gap", icon: "●" };
}

function formatVal(val, unit) {
  if (val == null) return "—";
  if (unit === "%") return `${val}%`;
  if (unit === "days" || unit === "hrs") return `${val} ${unit}`;
  if (unit === "FTE" || unit === "FTEs") return `${val} FTE`;
  return `${val}`;
}

/* ═══════════════════════════════════════════════════════
   METRIC DEFINITIONS — what we compare
   ═══════════════════════════════════════════════════════ */
const METRIC_DEFS = [
  { key: "ftes",       baselineLabel: "Reported FTEs",         miningLabel: "Observed FTEs (effort)",      unit: "FTE" },
  { key: "rework",     baselineLabel: "Reported Rework %",     miningLabel: "Mining Rework Loops %",       unit: "%" },
  { key: "cycleTime",  baselineLabel: "Reported Cycle Time",   miningLabel: "Mining Cycle Time",           unit: "days" },
  { key: "conformance",baselineLabel: "Expected Conformance",  miningLabel: "Actual Conformance Rate",     unit: "%" },
  { key: "variants",   baselineLabel: "Expected Variants",     miningLabel: "Observed Variants",           unit: "" },
];

/* ═══════════════════════════════════════════════════════
   MiningLinker — main component
   ═══════════════════════════════════════════════════════ */
export default function MiningLinker({ procId, miningData = {}, efficiencyData = {}, theme = "dark" }) {
  const t = TH[theme] || TH.dark;
  const [expanded, setExpanded] = useState(true);

  /* — build comparison rows — */
  const rows = useMemo(() => {
    return METRIC_DEFS.map(def => {
      const baseline = efficiencyData[def.key] ?? null;
      const mined = miningData[def.key] ?? null;
      const disc = discrepancy(baseline, mined);
      return { ...def, baseline, mined, disc };
    });
  }, [miningData, efficiencyData]);

  /* — overall health — */
  const healthScore = useMemo(() => {
    const withData = rows.filter(r => r.disc.pct !== null);
    if (!withData.length) return null;
    const greenCount = withData.filter(r => r.disc.color === GREEN).length;
    const redCount = withData.filter(r => r.disc.color === RED).length;
    if (redCount >= 2) return { color: RED, label: "Data Gaps Detected" };
    if (greenCount === withData.length) return { color: GREEN, label: "Data Aligned" };
    return { color: YELLOW, label: "Partial Alignment" };
  }, [rows]);

  /* ═══════════════════════════════════════════════════════
     STYLES
     ═══════════════════════════════════════════════════════ */
  const container = {
    background: t.card, border: `1px solid ${t.bdr}`, borderRadius: 14,
    fontFamily: FONT, overflow: "hidden",
  };
  const headerStyle = {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 20px", cursor: "pointer", userSelect: "none",
    borderBottom: expanded ? `1px solid ${t.bdr}` : "none",
  };
  const colHeader = {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px",
    color: t.mut, padding: "8px 0",
  };
  const rowStyle = (i) => ({
    display: "grid", gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center", padding: "14px 20px",
    background: i % 2 === 0 ? "transparent" : `${t.bdr}10`,
    borderBottom: `1px solid ${t.bdr}20`,
  });
  const metricBox = {
    display: "flex", flexDirection: "column", gap: 2,
  };
  const arrowCol = {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "0 16px", minWidth: 120,
  };
  const trafficLight = (color) => ({
    width: 10, height: 10, borderRadius: "50%",
    background: color, boxShadow: `0 0 6px ${color}60`,
    display: "inline-block",
  });
  const pill = (color) => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    color: "#111", background: color,
  });

  return (
    <div style={container}>
      {/* ── HEADER ── */}
      <div style={headerStyle} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: GOLD }}>{procId}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: t.tx }}>
            Mining ↔ Baseline Linker
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {healthScore && (
            <span style={pill(healthScore.color)}>
              {healthScore.label}
            </span>
          )}
          <span style={{ color: t.mut, fontSize: 16 }}>
            {expanded ? "▾" : "▸"}
          </span>
        </div>
      </div>

      {/* ── BODY ── */}
      {expanded && (
        <div>
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", padding: "12px 20px 0" }}>
            <div style={colHeader}>Baseline Efficiency</div>
            <div style={{ ...colHeader, textAlign: "center", minWidth: 120 }}>Correlation</div>
            <div style={{ ...colHeader, textAlign: "right" }}>Mining Evidence</div>
          </div>

          {/* Metric rows */}
          {rows.map((row, i) => (
            <div key={row.key} style={rowStyle(i)}>
              {/* LEFT — Baseline */}
              <div style={metricBox}>
                <div style={{ fontSize: 12, color: t.tx2 }}>{row.baselineLabel}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: t.tx, fontFamily: MONO }}>
                  {formatVal(row.baseline, row.unit)}
                </div>
              </div>

              {/* MIDDLE — Arrow + traffic light */}
              <div style={arrowCol}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={trafficLight(row.disc.color)} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: row.disc.color }}>
                    {row.disc.label}
                  </span>
                </div>
                {row.disc.pct !== null ? (
                  <div style={{ fontSize: 20, color: t.tx2, letterSpacing: 2 }}>
                    ←→
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: t.mut, fontStyle: "italic" }}>
                    insufficient data
                  </div>
                )}
                {row.disc.pct !== null && (
                  <div style={{ fontSize: 11, color: t.mut, marginTop: 2 }}>
                    {row.disc.pct.toFixed(0)}% variance
                  </div>
                )}
              </div>

              {/* RIGHT — Mining */}
              <div style={{ ...metricBox, alignItems: "flex-end" }}>
                <div style={{ fontSize: 12, color: t.tx2, textAlign: "right" }}>{row.miningLabel}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: t.tx, fontFamily: MONO }}>
                  {formatVal(row.mined, row.unit)}
                </div>
              </div>
            </div>
          ))}

          {/* Insight callout */}
          {healthScore && healthScore.color === RED && (
            <div style={{
              margin: "16px 20px 20px", padding: "14px 18px", borderRadius: 10,
              background: `${RED}12`, border: `1px solid ${RED}30`,
              fontSize: 13, color: t.tx2, lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 700, color: RED }}>Attention:</span>{" "}
              Significant gaps detected between self-reported baseline data and process mining evidence.
              Review flagged metrics before proceeding with value case modeling.
            </div>
          )}

          {healthScore && healthScore.color === GREEN && (
            <div style={{
              margin: "16px 20px 20px", padding: "14px 18px", borderRadius: 10,
              background: `${GREEN}12`, border: `1px solid ${GREEN}30`,
              fontSize: 13, color: t.tx2, lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: 700, color: GREEN }}>Validated:</span>{" "}
              Baseline efficiency data aligns with process mining evidence. High confidence in value case inputs.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
