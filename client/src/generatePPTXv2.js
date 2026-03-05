import pptxgen from "pptxgenjs";
import AGENT_SPECS from "./agentSpecs";

/* ═══════════════════════════════════════════════════════
   PPTX V2 — Executive (4 slides) + Detailed (10 slides)
   Design: Dark #111110 only, Gold ERP, Green Agent, Georgia headings
   Strict: 1 chart OR 1 table per slide, no methodology, no filler
   ═══════════════════════════════════════════════════════ */

// Color constants (no # prefix for pptxgenjs)
const C = {
  bg: "111110", card: "1A1A18", bdr: "2A2A25",
  white: "EEEAE4", gray: "888888", dkGray: "555555",
  gold: "D4A853", green: "7CB9A8", blue: "7BA7CC",
  purple: "C4A1D4", red: "D48A8A", orange: "D4A07A",
  lightGold: "3D3520",
};

const fmtD = v => {
  if (!v && v !== 0) return "$0M";
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  return a >= 1000 ? s + "$" + (a / 1000).toFixed(1) + "B" : s + "$" + a.toFixed(1) + "M";
};
const trunc = (s, n) => s && s.length > n ? s.slice(0, n) + "\u2026" : (s || "");
const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

/* ─── Slide helpers ─── */
function setupPptx() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "CUSTOM_16x9", width: 10, height: 5.625 });
  pptx.layout = "CUSTOM_16x9";
  return pptx;
}
const dkSl = pptx => { const s = pptx.addSlide(); s.background = { fill: C.bg }; return s; };
const goldLn = (pptx, sl) => sl.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.4, w: 9.0, h: 0.007, fill: { color: C.gold } });
const addFtr = (sl, pg) => {
  sl.addText("humaninthelead.ai  |  Confidential", { x: 0.5, y: 5.25, w: 5, h: 0.3, fontSize: 8, color: C.gray, fontFace: "Calibri" });
  sl.addText(String(pg), { x: 9.0, y: 5.25, w: 0.5, h: 0.3, fontSize: 8, color: C.gray, fontFace: "Calibri", align: "right" });
};
const hd = (t, ex) => ({ text: t, options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.bdr }, ...ex } });
const cl = (t, ex) => ({ text: t, options: { fontSize: 10, color: C.white, ...ex } });

/* ═══════════════════════════════════════════════════════
   PRECOMPUTE shared data
   ═══════════════════════════════════════════════════════ */
function precompute({ baseline, selProcs, valResult, procValues, procBenchmarks, agentResults, getQuartile, PROC_MAP, FUNCTIONS, selectedFunction, valueRealization, companyFinancials, multiYearRamp }) {
  const imps = valResult.impacts.filter(i => i.value > 0);
  const { revImpact: rv, cogsImpact: cg, sgaImpact: sg } = valResult.pnl;
  const tv = valResult.total;
  const agTot = valResult.agentTotal || 0;
  const combined = valResult.combined || tv;
  const bsh = valResult.balanceSheet;
  const fnName = FUNCTIONS.find(f => f.id === selectedFunction)?.name || "Finance";

  // E2E aggregation
  const e2e = {};
  imps.forEach(imp => {
    if (!e2e[imp.e2e]) e2e[imp.e2e] = { procs: 0, value: 0, kpis: 0 };
    e2e[imp.e2e].procs++;
    e2e[imp.e2e].value += imp.value;
    const p = PROC_MAP[imp.id];
    e2e[imp.e2e].kpis += p?.kpis?.length || 0;
  });

  // Quartile data per process
  const procQuartiles = {};
  selProcs.forEach(proc => {
    const pv = procValues[proc.id] || {}, pb = procBenchmarks[proc.id] || {};
    const kqs = [];
    (proc.kpis || []).forEach((kpi, ki) => {
      const cur = pv["kpi_current_" + ki] ?? kpi.current;
      const ben = pb["bench_" + ki] ?? kpi.benchmark;
      const q = getQuartile(cur, ben, kpi);
      kqs.push({ kpi, cur, ben, q });
    });
    procQuartiles[proc.id] = kqs;
  });

  // Quartile totals
  let qT = 0, qA = 0, qL = 0, qTot = 0;
  Object.values(procQuartiles).forEach(kqs => kqs.forEach(({ q }) => {
    if (q) { qTot++; if (q.score >= 3) qT++; else if (q.score >= 2) qA++; else qL++; }
  }));

  // Decision leakage — processes with bottom quartile KPIs + high value
  const leakage = imps
    .filter(imp => {
      const qs = procQuartiles[imp.id] || [];
      return qs.some(({ q }) => q && q.score < 1.5);
    })
    .map(imp => {
      const qs = procQuartiles[imp.id] || [];
      const worstKpi = qs.filter(({ q }) => q && q.score < 1.5).sort((a, b) => (a.q?.score || 0) - (b.q?.score || 0))[0];
      return { label: imp.label, l4: imp.l4, value: imp.value, reason: worstKpi ? `${worstKpi.kpi.name} at bottom quartile` : "Below benchmark" };
    })
    .sort((a, b) => b.value - a.value);

  // Agent specs
  const agentData = selProcs
    .filter(p => AGENT_SPECS[p.id])
    .map(p => {
      const spec = AGENT_SPECS[p.id];
      const imp = valResult.impacts.find(i => i.id === p.id);
      return { label: p.label, l4: p.l4, ...spec, agV: imp?.agentValue || 0, feasibility: spec.feasibility };
    })
    .sort((a, b) => b.feasibility - a.feasibility);

  // Top 3 processes by value
  const top3 = imps.slice(0, 3);

  return { imps, rv, cg, sg, tv, agTot, combined, bsh, fnName, e2e, procQuartiles, qT, qA, qL, qTot, leakage, agentData, top3, valueRealization, companyFinancials, multiYearRamp };
}

/* ═══════════════════════════════════════════════════════
   EXECUTIVE DECK — 4 slides
   ═══════════════════════════════════════════════════════ */
function buildExecDeck(pptx, data, baseline) {
  const { tv, agTot, combined, rv, cg, sg, top3, leakage, fnName } = data;
  const dt = today();
  let pg = 1;

  // ── Slide 1: Cover ──
  (() => {
    const s = dkSl(pptx);
    // Thin gold horizontal rule at vertical center
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 2.8, w: 5.5, h: 0.005, fill: { color: C.gold } });
    // Logo placeholder
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.6, w: 1.8, h: 1.0, fill: { color: "2A2A25" }, rectRadius: 0.05 });
    s.addText("Upload logo", { x: 0.5, y: 0.6, w: 1.8, h: 1.0, fontSize: 9, fontFace: "Calibri", color: C.gray, align: "center" });
    // Company name, subtitle, date
    s.addText(baseline.company || "Company", { x: 0.5, y: 3.1, w: 5.5, h: 0.7, fontSize: 36, fontFace: "Georgia", color: C.white, bold: true });
    s.addText("SAP S/4HANA Phase 0 Business Case", { x: 0.5, y: 3.8, w: 5.5, h: 0.35, fontSize: 18, fontFace: "Georgia", color: C.gray });
    s.addText(`Prepared: ${dt}  |  Confidential`, { x: 0.5, y: 4.2, w: 5.5, h: 0.25, fontSize: 12, fontFace: "Calibri", color: C.dkGray });
    // Right side: Three stacked value boxes
    const vBoxX = 7.0, vBoxW = 2.5;
    [
      { label: "Combined Value", value: fmtD(combined), color: C.gold, y: 1.0, fontSize: 28 },
      { label: "ERP Value", value: fmtD(tv), color: C.gold, y: 2.2, fontSize: 22 },
      { label: "Agent Uplift", value: fmtD(agTot), color: C.green, y: 3.2, fontSize: 22 },
    ].forEach(box => {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: vBoxX, y: box.y, w: vBoxW, h: 0.85, fill: { color: C.card }, rectRadius: 0.08, line: { color: C.bdr, width: 0.5 } });
      s.addText(box.label, { x: vBoxX, y: box.y + 0.05, w: vBoxW, h: 0.25, fontSize: 9, fontFace: "Calibri", color: C.gray, align: "center", textTransform: "uppercase" });
      s.addText(box.value, { x: vBoxX, y: box.y + 0.28, w: vBoxW, h: 0.5, fontSize: box.fontSize, fontFace: "Georgia", color: box.color, bold: true, align: "center" });
    });
    // Bottom right branding
    s.addText("humaninthelead.ai", { x: 8.0, y: 5.2, w: 1.8, h: 0.25, fontSize: 10, fontFace: "Calibri", color: "444444", align: "right" });
    pg++;
  })();

  // ── Slide 2: Value Summary — "The opportunity" ──
  (() => {
    const s = dkSl(pptx);
    const cfName = baseline.companyFinancials?.companyName || baseline.company || "Company";
    const cfYear = baseline.companyFinancials?.fiscalYear || "";
    const nProcs = top3.length > 0 ? data.imps.length : 0;
    s.addText("The opportunity", { x: 0.5, y: 0.35, w: 9.0, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.white });
    s.addText(`Based on ${nProcs} processes assessed, ${cfName}${cfYear ? " FY" + cfYear : ""} financials, ${baseline.industry || "industry"} peer benchmarks`, { x: 0.5, y: 0.85, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray });

    // Horizontal stacked bar: ERP (gold) + Agent (green stacked) = Total
    const barY = 1.5, barH = 0.6, barMaxW = 7.5;
    const erpW = combined > 0 ? Math.max((tv / combined) * barMaxW, 0.5) : barMaxW * 0.7;
    const agW = combined > 0 ? Math.max((agTot / combined) * barMaxW, 0.3) : barMaxW * 0.3;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: barY, w: erpW, h: barH, fill: { color: C.gold }, rectRadius: 0.05 });
    s.addText("ERP " + fmtD(tv), { x: 0.5, y: barY, w: erpW, h: barH, fontSize: 12, fontFace: "Calibri", color: C.bg, bold: true, align: "center" });
    if (agTot > 0) {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + erpW, y: barY, w: agW, h: barH, fill: { color: C.green }, rectRadius: 0.05 });
      s.addText("Agent " + fmtD(agTot), { x: 0.5 + erpW, y: barY, w: agW, h: barH, fontSize: 12, fontFace: "Calibri", color: C.bg, bold: true, align: "center" });
    }
    s.addText(fmtD(combined), { x: 0.5 + erpW + agW + 0.15, y: barY, w: 1.5, h: barH, fontSize: 18, fontFace: "Georgia", color: C.white, bold: true });

    // Table: top 3 processes with ERP + Agent split
    if (top3.length > 0) {
      const rows = [
        [hd("Process"), hd("ERP Value", { align: "right" }), hd("Agent Uplift", { align: "right" }), hd("Total", { align: "right" })],
        ...top3.map((imp, i) => {
          const agV = imp.agentValue || 0;
          const total = imp.value + agV;
          const rowFill = i % 2 === 0 ? { fill: { color: C.card } } : {};
          return [
            cl(trunc(imp.label, 35), rowFill), cl(fmtD(imp.value), { align: "right", color: C.gold, ...rowFill }), cl(agV > 0 ? fmtD(agV) : "—", { align: "right", color: C.green, ...rowFill }), cl(fmtD(total), { align: "right", color: C.white, bold: true, ...rowFill }),
          ];
        }),
      ];
      s.addTable(rows, { x: 0.5, y: 2.4, w: 9.0, colW: [3.5, 2.0, 2.0, 1.5], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.38 });
    }

    // P&L impact strip — colored boxes
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 4.0, w: 9.0, h: 0.005, fill: { color: C.gold } });
    const pnlItems = [
      { label: "Revenue", value: fmtD(rv), prefix: "+", color: C.green },
      { label: "COGS", value: fmtD(Math.abs(cg)), prefix: "-", color: C.green },
      { label: "SG&A", value: fmtD(Math.abs(sg)), prefix: "-", color: C.green },
      { label: "EBITDA", value: fmtD(rv + cg + sg), prefix: "+", color: C.gold },
    ];
    pnlItems.forEach((item, i) => {
      const bx = 0.5 + i * 2.25, by = 4.1;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: 2.0, h: 1.0, fill: { color: C.card }, rectRadius: 0.06, line: { color: C.bdr, width: 0.5 } });
      s.addText(item.label, { x: bx, y: by + 0.08, w: 2.0, h: 0.22, fontSize: 10, fontFace: "Calibri", color: C.gray, align: "center" });
      s.addText(item.prefix + item.value, { x: bx, y: by + 0.32, w: 2.0, h: 0.5, fontSize: 20, fontFace: "Georgia", color: item.color, bold: i === 3, align: "center" });
    });
    addFtr(s, pg++);
  })();

  // ── Slide 3: Decision Leakage ──
  (() => {
    const s = dkSl(pptx);
    s.addText("Beyond the metrics \u2014 decisions this unlocks", { x: 0.5, y: 0.35, w: 9.0, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.white });
    s.addText("Value is created when the right decision is made at the right time with the right data. Today, these decisions are at risk.", { x: 0.5, y: 0.85, w: 9.0, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.gray, italic: true });

    const lk = leakage.slice(0, 4);
    if (lk.length > 0) {
      const rows = [
        [hd("Decision"), hd("Why blocked today"), hd("Value at risk", { align: "right" })],
        ...lk.map(l => [
          cl(trunc(l.label, 30), { bold: true }), cl(trunc(l.reason, 40), { color: C.gold, fontSize: 10 }), cl(fmtD(l.value), { align: "right", color: C.green, bold: true }),
        ]),
      ];
      s.addTable(rows, { x: 0.5, y: 1.5, w: 9.0, colW: [3.2, 3.8, 2.0], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.45 });

      // Insight box
      const insightY = 1.5 + (lk.length + 1) * 0.45 + 0.4;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.5, y: insightY, w: 7.0, h: 0.7, fill: { color: C.card }, rectRadius: 0.08, line: { color: C.gold, width: 1 } });
      s.addText("The transformation doesn\u2019t just improve metrics. It changes what\u2019s possible.", { x: 1.5, y: insightY, w: 7.0, h: 0.7, fontSize: 13, fontFace: "Georgia", color: C.gold, italic: true, align: "center" });
    } else {
      s.addText("No decision leakage identified \u2014 all KPIs are at or above benchmark.", { x: 0.5, y: 2.5, w: 9.0, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    }
    addFtr(s, pg++);
  })();

  // ── Slide 4: Next Steps — side-by-side action cards ──
  (() => {
    const s = dkSl(pptx);
    s.addText("Recommended next steps", { x: 0.5, y: 0.35, w: 9.0, h: 0.5, fontSize: 28, fontFace: "Georgia", color: C.white });

    const topE = Object.entries(data.e2e).sort((a, b) => b[1].value - a[1].value)[0];
    const topProc = data.imps[0];
    const actions = [
      { action: topE ? `Prioritize ${topE[0]}` : "Prioritize highest-value E2E flow", rationale: topE ? `${fmtD(topE[1].value)} addressable value — largest concentration of opportunity` : "Identify and focus on highest-value process area", owner: "Executive Sponsor", timeline: "Week 1-2", priority: "HIGH" },
      { action: "Initiate Phase 1 detailed design", rationale: topProc ? `Deep-dive ${trunc(topProc.label, 25)} and top 3 processes for implementation roadmap` : "Design wave plan and detailed requirements", owner: "Project Lead", timeline: "Week 2-4", priority: "HIGH" },
      { action: "Deploy AI agent pilots", rationale: agTot > 0 ? `${fmtD(agTot)} incremental value from agent automation — start with highest-feasibility candidates` : "Identify agent automation candidates from assessment", owner: "Technology Lead", timeline: "Week 4-8", priority: "MED" },
    ];

    const cardW = 2.8, gap = 0.3;
    actions.forEach((a, i) => {
      const bx = 0.5 + i * (cardW + gap), by = 1.2, cardH = 3.6;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: cardW, h: cardH, fill: { color: C.card }, rectRadius: 0.1, line: { color: C.bdr, width: 0.5 } });
      // Priority badge top-right
      const pColor = a.priority === "HIGH" ? C.gold : a.priority === "MED" ? C.green : C.blue;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx + cardW - 1.0, y: by + 0.12, w: 0.85, h: 0.3, fill: { color: pColor }, rectRadius: 0.06 });
      s.addText(a.priority, { x: bx + cardW - 1.0, y: by + 0.12, w: 0.85, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.bg, bold: true, align: "center" });
      // Action title
      s.addText(a.action, { x: bx + 0.15, y: by + 0.55, w: cardW - 0.3, h: 0.6, fontSize: 16, fontFace: "Calibri", color: C.white, bold: true });
      // Owner
      s.addText(a.owner, { x: bx + 0.15, y: by + 1.2, w: cardW - 0.3, h: 0.25, fontSize: 12, fontFace: "Calibri", color: C.gray });
      // Timeline
      s.addText(a.timeline, { x: bx + 0.15, y: by + 1.5, w: cardW - 0.3, h: 0.25, fontSize: 12, fontFace: "Georgia", color: C.gold });
      // Rationale
      s.addText(a.rationale, { x: bx + 0.15, y: by + 1.9, w: cardW - 0.3, h: 1.4, fontSize: 12, fontFace: "Calibri", color: C.dkGray, lineSpacingMultiple: 1.3 });
    });

    // Footer bar
    s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: C.card } });
    s.addText("Phase 0 complete. Phase 1 detailed design available upon request.", { x: 0.5, y: 5.05, w: 5.5, h: 0.5, fontSize: 10, fontFace: "Calibri", color: C.gray });
    s.addText("humaninthelead.ai \u00B7 Confidential", { x: 6.0, y: 5.05, w: 3.5, h: 0.5, fontSize: 10, fontFace: "Calibri", color: C.gray, align: "right" });
    pg++;
  })();
}

/* ═══════════════════════════════════════════════════════
   DETAILED REPORT — 10 slides max
   ═══════════════════════════════════════════════════════ */
function buildDetailedDeck(pptx, data, baseline, { selProcs, procValues, procBenchmarks, agentResults, baselineData, PROC_MAP, getQuartile, scenarioLevel, totalKPIs, processOwners }) {
  const { imps, rv, cg, sg, tv, agTot, combined, bsh, fnName, e2e, procQuartiles, qT, qA, qL, qTot, leakage, agentData, valueRealization, companyFinancials, multiYearRamp } = data;
  const dt = today();
  let pg = 1;

  // ── Slide 1: Cover ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText(baseline.company || "Company", { x: 0.5, y: 1.0, w: 9.0, h: 0.9, fontSize: 40, fontFace: "Georgia", color: C.gold, bold: true });
    s.addText("Phase 0 Detailed Report", { x: 0.5, y: 1.9, w: 9.0, h: 0.5, fontSize: 20, fontFace: "Georgia", color: C.white });
    s.addText(fnName + "  |  " + dt, { x: 0.5, y: 2.6, w: 9.0, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.gray });
    s.addText(fmtD(combined), { x: 0.5, y: 3.4, w: 9.0, h: 1.0, fontSize: 64, fontFace: "Georgia", color: C.gold, bold: true, align: "center" });
    s.addText("Total Combined Value", { x: 0.5, y: 4.3, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    pg++;
  })();

  // ── Slide 2: Scope — processes with owners ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Assessment Scope", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    s.addText(`${selProcs.length} processes across ${Object.keys(data.e2e).length} E2E flows — covering the full ${data.fnName} function`, { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    const rows = [
      [hd("Process"), hd("L4 Code", { align: "center" }), hd("Owner"), hd("E2E Flow")],
    ];
    selProcs.slice(0, 12).forEach(p => {
      const owner = processOwners?.[p.id] || {};
      rows.push([
        cl(trunc(p.label, 30)),
        cl(p.l4, { align: "center", fontSize: 9, color: C.gray }),
        cl(trunc(owner.name || "—", 20)),
        cl(trunc(p.e2e || "—", 20), { fontSize: 9 }),
      ]);
    });
    s.addTable(rows, { x: 0.5, y: 1.2, w: 9.0, colW: [3.0, 1.2, 2.4, 2.4], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.32 });
    addFtr(s, pg++);
  })();

  // ── Slide 3: Baseline Confidence grid ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Baseline Confidence", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    const lowConfCount = selProcs.filter(p => { const qs = procQuartiles[p.id] || []; const assessed = qs.filter(({ q }) => q).length; return qs.length === 0 || assessed / qs.length < 0.8; }).length;
    s.addText(lowConfCount > 0 ? `${lowConfCount} of ${selProcs.length} processes have low confidence data \u2014 consider deep-dive baseline collection` : "All processes have strong baseline data \u2014 high confidence in value estimates", { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    const rows = [[hd("Process"), hd("Confidence", { align: "center" }), hd("KPIs", { align: "center" }), hd("Data Quality", { align: "center" })]];
    selProcs.slice(0, 12).forEach(proc => {
      const qs = procQuartiles[proc.id] || [];
      const assessed = qs.filter(({ q }) => q).length;
      const total = qs.length;
      const topCount = qs.filter(({ q }) => q && q.score >= 3).length;
      const level = total === 0 ? "Low" : assessed / total >= 0.8 ? (topCount / total >= 0.5 ? "High" : "Med") : "Low";
      const lColor = level === "High" ? C.green : level === "Med" ? C.gold : C.red;
      const dq = baselineData[proc.id + "_b_dataQuality"] || "—";
      rows.push([
        cl(trunc(proc.label, 30)),
        cl(level, { align: "center", color: lColor, bold: true }),
        cl(assessed + "/" + total, { align: "center" }),
        cl(trunc(dq, 20), { align: "center", fontSize: 9 }),
      ]);
    });
    s.addTable(rows, { x: 0.5, y: 1.2, w: 9.0, colW: [3.5, 1.5, 1.5, 2.5], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.32 });
    addFtr(s, pg++);
  })();

  // ── Slide 4: Decision leakage full analysis ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Decision Leakage Analysis", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    const leakTotal = leakage.reduce((s, l) => s + l.value, 0);
    s.addText(leakage.length > 0 ? `${leakage.length} processes with blocked decisions \u2014 ${fmtD(leakTotal)} of value at risk from poor data or process gaps` : "No blocked decisions identified \u2014 current processes support decision-making adequately", { x: 0.5, y: 0.9, w: 9.0, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    const lk = leakage.slice(0, 10);
    if (lk.length > 0) {
      const rows = [
        [hd("Decision"), hd("L4"), hd("Why Blocked"), hd("Est. Value", { align: "right" })],
        ...lk.map(l => [
          cl(trunc(l.label, 25)), cl(l.l4, { fontSize: 9, color: C.gray }), cl(trunc(l.reason, 30), { fontSize: 9 }), cl(fmtD(l.value), { align: "right", color: C.gold, bold: true }),
        ]),
      ];
      s.addTable(rows, { x: 0.5, y: 1.4, w: 9.0, colW: [2.8, 1.0, 3.2, 2.0], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.35 });
    } else {
      s.addText("No decision leakage identified.", { x: 0.5, y: 2.5, w: 9.0, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    }
    addFtr(s, pg++);
  })();

  // ── Slide 5: Benchmark positioning — quartile chart ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Benchmark Positioning", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    s.addText(qL > 0 ? `You are in the bottom quartile on ${qL} of ${qTot} KPIs \u2014 significant headroom exists` : `${qT} of ${qTot} KPIs in top quartile \u2014 limited performance gaps`, { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    if (qTot > 0) {
      // Horizontal quartile chart per process (up to 8)
      const procLabels = [];
      const topVals = [], avgVals = [], lowVals = [];
      selProcs.slice(0, 8).forEach(proc => {
        const qs = procQuartiles[proc.id] || [];
        let t = 0, a = 0, l = 0;
        qs.forEach(({ q }) => { if (q) { if (q.score >= 3) t++; else if (q.score >= 2) a++; else l++; } });
        procLabels.push(trunc(proc.label, 20));
        topVals.push(t);
        avgVals.push(a);
        lowVals.push(l);
      });
      s.addChart(pptx.charts.BAR, [
        { name: "Top Quartile", labels: procLabels, values: topVals },
        { name: "Average", labels: procLabels, values: avgVals },
        { name: "Bottom Quartile", labels: procLabels, values: lowVals },
      ], {
        x: 0.5, y: 1.2, w: 9.0, h: 3.8, showTitle: false, barDir: "bar",
        barGrouping: "stacked", showValue: false,
        catAxisLabelColor: C.gray, catAxisLabelFontSize: 9,
        valAxisLabelColor: C.gray, valAxisLabelFontSize: 9,
        catAxisLineShow: false, valAxisLineShow: false,
        valGridLine: { color: C.bdr, size: 0.5 },
        chartColors: [C.green, C.gold, C.red],
        showLegend: true, legendPos: "b", legendColor: C.gray, legendFontSize: 9,
      });
    } else {
      s.addText("No benchmark data available.", { x: 0.5, y: 2.5, w: 9.0, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    }
    addFtr(s, pg++);
  })();

  // ── Slide 6: ERP Value — bar chart ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("ERP Value by Process", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    const top2Val = imps.slice(0, 2).reduce((s, i) => s + i.value, 0);
    const top2Pct = tv > 0 ? Math.round((top2Val / tv) * 100) : 0;
    const top2Names = imps.slice(0, 2).map(i => trunc(i.label, 20)).join(" and ");
    s.addText(top2Pct > 0 ? `${top2Names} represent ${top2Pct}% of total ERP opportunity` : "ERP value distributed across all assessed processes", { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    const top8 = imps.slice(0, 8);
    if (top8.length > 0) {
      s.addChart(pptx.charts.BAR, [{
        name: "Value ($M)", labels: top8.map(i => trunc(i.label, 20)), values: top8.map(i => Math.round(i.value * 10) / 10),
      }], {
        x: 0.5, y: 1.2, w: 9.0, h: 3.8, showTitle: false, barDir: "bar",
        showValue: true, valueFontSize: 9, valueFontColor: C.white,
        catAxisLabelColor: C.gray, catAxisLabelFontSize: 9,
        valAxisLabelColor: C.gray, valAxisLabelFontSize: 9,
        catAxisLineShow: false, valAxisLineShow: false,
        valGridLine: { color: C.bdr, size: 0.5 },
        chartColors: [C.gold],
      });
    }
    addFtr(s, pg++);
  })();

  // ── Slide 7: Agent Uplift ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("AI Agent Uplift", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    const autoCount = agentData.filter(a => a.agentType === "Autonomous").length;
    const highFeas = agentData.filter(a => a.feasibility >= 80).length;
    s.addText(agentData.length > 0 ? `${agentData.length} agent opportunities identified \u2014 ${highFeas} high feasibility, ${autoCount} fully autonomous` : "No AI agent scenarios generated \u2014 run Catalyst to identify opportunities", { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    if (agentData.length > 0) {
      const rows = [
        [hd("Process"), hd("Agent Type", { align: "center" }), hd("Feasibility", { align: "center" }), hd("Value", { align: "right" })],
        ...agentData.slice(0, 10).map(a => {
          const fCol = a.feasibility >= 80 ? C.green : a.feasibility >= 60 ? C.gold : C.orange;
          return [
            cl(trunc(a.label, 30)),
            cl(a.agentType || "—", { align: "center", fontSize: 9, color: a.agentType === "Autonomous" ? C.green : a.agentType === "Hybrid" ? C.gold : C.blue }),
            cl(String(a.feasibility || "—"), { align: "center", color: fCol, bold: true }),
            cl(a.agV > 0 ? fmtD(a.agV) : "TBD", { align: "right", color: C.green, bold: true }),
          ];
        }),
      ];
      s.addTable(rows, { x: 0.5, y: 1.2, w: 9.0, colW: [3.5, 1.8, 1.7, 2.0], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.35 });
    } else {
      s.addText("No AI agent scenarios generated. Run Catalyst to generate.", { x: 0.5, y: 2.5, w: 9.0, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    }
    addFtr(s, pg++);
  })();

  // ── Slide 8: P&L Impact — income statement + balance sheet ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("P&L Impact", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    const ebitdaImp = rv + cg + sg;
    const ebitdaPct = baseline.ebitda > 0 ? Math.round((ebitdaImp / baseline.ebitda) * 100) : 0;
    s.addText(ebitdaPct > 0 ? `${fmtD(ebitdaImp)} EBITDA improvement \u2014 ${ebitdaPct}% uplift on current baseline` : `${fmtD(ebitdaImp)} EBITDA improvement across revenue, COGS, and SG&A`, { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    const gf = { fill: { color: C.lightGold } };
    // Income statement
    s.addTable([
      [hd("Line Item"), hd("Baseline", { align: "right" }), hd("Impact", { align: "right" }), hd("Improved", { align: "right" })],
      [cl("Revenue"), cl(fmtD(baseline.revenue), { align: "right" }), cl(fmtD(rv), { align: "right", color: C.green, bold: true }), cl(fmtD(baseline.revenue + rv), { align: "right" })],
      [cl("COGS"), cl(fmtD(baseline.cogs), { align: "right" }), cl(fmtD(cg), { align: "right", color: C.green, bold: true }), cl(fmtD(baseline.cogs - cg), { align: "right" })],
      [cl("Gross Profit"), cl(fmtD(baseline.revenue - baseline.cogs), { align: "right" }), cl(fmtD(rv + cg), { align: "right", color: C.green, bold: true }), cl(fmtD(baseline.revenue - baseline.cogs + rv + cg), { align: "right" })],
      [cl("SG&A"), cl(fmtD(baseline.sga), { align: "right" }), cl(fmtD(sg), { align: "right", color: C.green, bold: true }), cl(fmtD(baseline.sga - sg), { align: "right" })],
      [cl("EBITDA", { bold: true, color: C.gold, ...gf }), cl(fmtD(baseline.ebitda), { align: "right", bold: true, color: C.gold, ...gf }), cl(fmtD(rv + cg + sg), { align: "right", bold: true, color: C.gold, ...gf }), cl(fmtD((baseline.ebitda || 0) + rv + cg + sg), { align: "right", bold: true, color: C.gold, ...gf })],
    ], { x: 0.5, y: 1.1, w: 9.0, colW: [2.5, 2.0, 2.5, 2.0], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.38 });

    // 3-year cumulative waterfall
    const ramp = multiYearRamp || { erp: [30, 70, 100], agent: [0, 40, 100], costSpread: [70, 20, 10] };
    const totalImplCost = agentData.reduce((s, a) => s + (a.implCost || 0), 0) / 1000;
    const erpImplCost = tv * 0.15;
    const tCost = totalImplCost + erpImplCost;
    s.addText("3-Year Value Waterfall", { x: 0.5, y: 3.6, w: 9.0, h: 0.3, fontSize: 14, fontFace: "Georgia", color: C.white, bold: true });
    s.addTable([
      [hd(""), hd("Year 1", { align: "right" }), hd("Year 2", { align: "right" }), hd("Year 3", { align: "right" }), hd("3-Year", { align: "right" })],
      [cl("ERP Value"), cl(fmtD(tv * ramp.erp[0] / 100), { align: "right", color: C.gold }), cl(fmtD(tv * ramp.erp[1] / 100), { align: "right", color: C.gold }), cl(fmtD(tv * ramp.erp[2] / 100), { align: "right", color: C.gold }), cl(fmtD(tv * (ramp.erp[0] + ramp.erp[1] + ramp.erp[2]) / 100), { align: "right", color: C.gold, bold: true })],
      [cl("Agent Uplift"), cl(fmtD(agTot * ramp.agent[0] / 100), { align: "right", color: C.green }), cl(fmtD(agTot * ramp.agent[1] / 100), { align: "right", color: C.green }), cl(fmtD(agTot * ramp.agent[2] / 100), { align: "right", color: C.green }), cl(fmtD(agTot * (ramp.agent[0] + ramp.agent[1] + ramp.agent[2]) / 100), { align: "right", color: C.green, bold: true })],
      [cl("Working Capital", { color: C.blue }), cl(fmtD(bsh.totalWorkingCapital * 0.5), { align: "right", color: C.blue }), cl(fmtD(bsh.totalWorkingCapital * 0.8), { align: "right", color: C.blue }), cl(fmtD(bsh.totalWorkingCapital), { align: "right", color: C.blue }), cl(fmtD(bsh.totalWorkingCapital), { align: "right", color: C.blue, bold: true })],
    ], { x: 0.5, y: 3.9, w: 9.0, colW: [2.0, 1.75, 1.75, 1.75, 1.75], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.28 });
    addFtr(s, pg++);
  })();

  // ── Slide 8b: Balance Sheet Impact ──
  (() => {
    const hasWC = bsh && bsh.totalWorkingCapital > 0;
    if (!hasWC) { return; }
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Balance Sheet Impact", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    s.addText(`${fmtD(bsh.totalWorkingCapital)} working capital released through DSO, DIO, and DPO improvements`, { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    // DSO/DIO/DPO calculations
    const rev = baseline.revenue || 1;
    const cogs = baseline.cogs || 1;
    const currentDSO = baseline.recv > 0 ? Math.round(baseline.recv / rev * 365) : 45;
    const currentDIO = baseline.inventory > 0 ? Math.round(baseline.inventory / cogs * 365) : 60;
    const currentDPO = baseline.pay > 0 ? Math.round(baseline.pay / cogs * 365) : 35;
    const dsoImp = rev > 0 ? Math.round(bsh.receivablesImpact / (rev / 365)) : 0;
    const dioImp = cogs > 0 ? Math.round(bsh.inventoryImpact / (cogs / 365)) : 0;
    const dpoImp = cogs > 0 ? Math.round(bsh.payablesImpact / (cogs / 365)) : 0;

    s.addTable([
      [hd("Metric"), hd("Current", { align: "right" }), hd("Improved", { align: "right" }), hd("Change", { align: "right" })],
      [cl("DSO (Days)"), cl(String(currentDSO), { align: "right" }), cl(String(currentDSO - dsoImp), { align: "right" }), cl(`-${dsoImp} days`, { align: "right", color: C.green })],
      [cl("DIO (Days)"), cl(String(currentDIO), { align: "right" }), cl(String(currentDIO - dioImp), { align: "right" }), cl(`-${dioImp} days`, { align: "right", color: C.green })],
      [cl("DPO (Days)"), cl(String(currentDPO), { align: "right" }), cl(String(currentDPO + dpoImp), { align: "right" }), cl(`+${dpoImp} days`, { align: "right", color: C.green })],
      [cl("Cash Conversion Cycle", { bold: true }), cl(String(currentDSO + currentDIO - currentDPO), { align: "right", bold: true }), cl(String((currentDSO - dsoImp) + (currentDIO - dioImp) - (currentDPO + dpoImp)), { align: "right", bold: true }), cl(`-${dsoImp + dioImp + dpoImp} days`, { align: "right", color: C.gold, bold: true })],
    ], { x: 0.5, y: 1.2, w: 9.0, colW: [3.0, 2.0, 2.0, 2.0], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.38 });

    // Working capital headline
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 2.5, y: 3.5, w: 5.0, h: 1.2, fill: { color: C.lightGold }, rectRadius: 0.1, line: { color: C.gold, width: 1 } });
    s.addText("Working Capital Released", { x: 2.5, y: 3.6, w: 5.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    s.addText(fmtD(bsh.totalWorkingCapital), { x: 2.5, y: 3.9, w: 5.0, h: 0.7, fontSize: 36, fontFace: "Georgia", color: C.gold, bold: true, align: "center" });

    // Source footnote
    s.addText("Sources: DSO improvement from O2C cycle time KPIs; DIO from inventory KPIs; DPO from P2P process improvements.", { x: 0.5, y: 4.9, w: 9.0, h: 0.25, fontSize: 7, fontFace: "Calibri", color: C.dkGray, italic: true });
    addFtr(s, pg++);
  })();

  // ── Slide 9: Value Realization Plan — 2×3 grid ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Value Realization Plan", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    const definedDims = ["people","processes","data","technology","governance","operatingModel"].filter(k => vr[k] && Object.values(vr[k]).some(v => v && (Array.isArray(v) ? v.length > 0 : true))).length;
    s.addText(definedDims > 0 ? `${definedDims} of 6 realization dimensions defined \u2014 ${6 - definedDims > 0 ? (6 - definedDims) + " still need attention" : "all dimensions covered"}` : "Value realization dimensions not yet defined \u2014 complete in Step 6", { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    const vr = valueRealization || {};
    const dims = [
      { key: "people", label: "People", color: C.gold, getContent: d => [d.roleChanges, d.headcountDelta ? `Headcount delta: ${d.headcountDelta}` : "", (d.skillsRequired || []).join(", ")].filter(Boolean).join("\n") },
      { key: "processes", label: "Processes", color: C.green, getContent: d => [d.processesRedesigned, d.processesRetired, d.automationCandidates].flat().filter(Boolean).join(", ") },
      { key: "data", label: "Data", color: C.blue, getContent: d => [d.dataGaps, d.governanceNeeds, (d.qualityIssues || []).join(", ")].filter(Boolean).join("\n") },
      { key: "technology", label: "Technology", color: C.purple, getContent: d => [d.integrationNeeds, d.itInfrastructure, d.physicalFootprint].filter(Boolean).join("\n") },
      { key: "governance", label: "Governance", color: C.orange, getContent: d => [d.decisionRights, d.ownershipModel].filter(Boolean).join("\n") },
      { key: "operatingModel", label: "Operating Model", color: C.red, getContent: d => [d.structuralChanges, d.reportingChanges, d.serviceModel].filter(Boolean).join("\n") },
    ];

    dims.forEach((dim, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const bx = 0.5 + col * 3.1, by = 1.2 + row * 2.0;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: 2.8, h: 1.8, fill: { color: C.card }, rectRadius: 0.08, line: { color: C.bdr, width: 0.5 } });
      s.addText(dim.label, { x: bx + 0.1, y: by + 0.05, w: 2.6, h: 0.3, fontSize: 12, fontFace: "Georgia", color: dim.color, bold: true });
      s.addShape(pptx.shapes.RECTANGLE, { x: bx + 0.1, y: by + 0.35, w: 2.6, h: 0.004, fill: { color: dim.color } });
      const content = vr[dim.key] ? dim.getContent(vr[dim.key]) : "Not yet defined";
      s.addText(trunc(content, 120), { x: bx + 0.1, y: by + 0.45, w: 2.6, h: 1.25, fontSize: 8, fontFace: "Calibri", color: C.white, lineSpacingMultiple: 1.3 });
    });
    addFtr(s, pg++);
  })();

  // ── Slide 10: Action Plan with owners ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Action Plan", { x: 0.5, y: 0.5, w: 9.0, h: 0.4, fontSize: 24, fontFace: "Georgia", color: C.white });
    const topActionE2E = Object.entries(e2e).sort((a, b) => b[1].value - a[1].value)[0];
    s.addText(topActionE2E ? `Focus on ${topActionE2E[0]} first \u2014 ${fmtD(topActionE2E[1].value)} at stake with ${topActionE2E[1].procs} processes in scope` : "5 prioritized actions to move from assessment to implementation", { x: 0.5, y: 0.9, w: 9.0, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.gray, italic: true });

    const topE = Object.entries(e2e).sort((a, b) => b[1].value - a[1].value)[0];
    const topAg = imps.find(i => agentResults[i.id]);

    const actions = [
      { action: topE ? `Prioritize ${topE[0]} — ${fmtD(topE[1].value)} addressable` : "Prioritize highest-value E2E flow", owner: "Executive Sponsor", timeline: "Week 1-2", priority: "High" },
      { action: "Initiate Phase 1 detailed design and wave planning", owner: "Project Lead", timeline: "Week 2-4", priority: "High" },
      { action: topAg ? `Deploy AI agent for ${trunc(topAg.label, 30)}` : "Generate AI agent scenarios", owner: "Technology Lead", timeline: "Week 4-8", priority: "Med" },
      { action: `Address ${data.qL} bottom quartile KPIs`, owner: "Process Owners", timeline: "Week 2-6", priority: "High" },
      { action: "Establish transformation governance", owner: "PMO", timeline: "Week 1-2", priority: "High" },
    ];

    const rows = [
      [hd("#", { align: "center" }), hd("Action"), hd("Owner"), hd("Timeline"), hd("Priority", { align: "center" })],
      ...actions.map((a, i) => {
        const pColor = a.priority === "High" ? C.gold : a.priority === "Med" ? C.green : C.blue;
        return [
          cl(String(i + 1), { align: "center", bold: true }),
          cl(trunc(a.action, 40)),
          cl(a.owner, { fontSize: 9 }),
          cl(a.timeline, { fontSize: 9 }),
          cl(a.priority, { align: "center", color: pColor, bold: true }),
        ];
      }),
    ];
    s.addTable(rows, { x: 0.5, y: 1.2, w: 9.0, colW: [0.5, 4.0, 1.8, 1.2, 1.5], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.45 });
    addFtr(s, pg++);
  })();
}

/* ═══════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════ */
export function generateExecDeck(params) {
  const pptx = setupPptx();
  const data = precompute(params);
  buildExecDeck(pptx, data, params.baseline);
  pptx.writeFile({ fileName: (params.baseline.company || "Company").replace(/\s+/g, "_") + "_Phase0_Executive.pptx" });
}

export function generateDetailedDeck(params) {
  const pptx = setupPptx();
  const data = precompute(params);
  buildDetailedDeck(pptx, data, params.baseline, params);
  pptx.writeFile({ fileName: (params.baseline.company || "Company").replace(/\s+/g, "_") + "_Phase0_Detailed.pptx" });
}

export default function generatePPTXv2(params) {
  generateExecDeck(params);
  // Small delay to avoid browser download collision
  setTimeout(() => generateDetailedDeck(params), 500);
}
