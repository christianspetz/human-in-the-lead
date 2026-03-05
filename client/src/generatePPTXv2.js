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
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText(baseline.company || "Company", { x: 0.5, y: 1.0, w: 9.0, h: 0.9, fontSize: 40, fontFace: "Georgia", color: C.gold, bold: true });
    s.addText("Phase 0 Assessment", { x: 0.5, y: 1.9, w: 9.0, h: 0.5, fontSize: 20, fontFace: "Georgia", color: C.white });
    s.addText(dt, { x: 0.5, y: 2.6, w: 9.0, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.gray });
    // Combined value in large gold Georgia
    s.addText(fmtD(combined), { x: 0.5, y: 3.4, w: 9.0, h: 1.0, fontSize: 64, fontFace: "Georgia", color: C.gold, bold: true, align: "center" });
    s.addText("Total Combined Value", { x: 0.5, y: 4.3, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    pg++;
  })();

  // ── Slide 2: Value Summary ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Value Summary", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

    // Horizontal bar: ERP + Agent = Total
    const erpW = combined > 0 ? Math.max((tv / combined) * 7.0, 0.5) : 3.5;
    const agW = combined > 0 ? Math.max((agTot / combined) * 7.0, 0.5) : 0.5;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1.2, w: erpW, h: 0.5, fill: { color: C.gold }, rectRadius: 0.05 });
    s.addText("ERP " + fmtD(tv), { x: 0.5, y: 1.2, w: erpW, h: 0.5, fontSize: 11, fontFace: "Calibri", color: C.bg, bold: true, align: "center" });
    if (agTot > 0) {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + erpW + 0.1, y: 1.2, w: agW, h: 0.5, fill: { color: C.green }, rectRadius: 0.05 });
      s.addText("Agent " + fmtD(agTot), { x: 0.5 + erpW + 0.1, y: 1.2, w: agW, h: 0.5, fontSize: 11, fontFace: "Calibri", color: C.bg, bold: true, align: "center" });
    }
    s.addText("= " + fmtD(combined), { x: 8.0, y: 1.2, w: 1.5, h: 0.5, fontSize: 16, fontFace: "Georgia", color: C.white, bold: true, align: "right" });

    // Table: top 3 processes
    if (top3.length > 0) {
      const rows = [
        [hd("Process"), hd("E2E Flow"), hd("Value", { align: "right" })],
        ...top3.map(imp => [
          cl(trunc(imp.label, 35)), cl(trunc(imp.e2e, 25)), cl(fmtD(imp.value), { align: "right", color: C.gold, bold: true }),
        ]),
      ];
      s.addTable(rows, { x: 0.5, y: 2.0, w: 9.0, colW: [4.0, 3.0, 2.0], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.38 });
    }

    // P&L impact
    s.addText("P&L Impact", { x: 0.5, y: 3.6, w: 9.0, h: 0.35, fontSize: 14, fontFace: "Georgia", color: C.white, bold: true });
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 3.95, w: 9.0, h: 0.005, fill: { color: C.gold } });
    const pnlItems = [
      ["Revenue", fmtD(rv)], ["COGS", fmtD(cg)], ["SG&A", fmtD(sg)], ["EBITDA", fmtD(rv + cg + sg)],
    ];
    pnlItems.forEach((item, i) => {
      const bx = 0.5 + i * 2.25;
      s.addText(item[0], { x: bx, y: 4.05, w: 2.0, h: 0.25, fontSize: 10, fontFace: "Calibri", color: C.gray });
      s.addText(item[1], { x: bx, y: 4.3, w: 2.0, h: 0.35, fontSize: 18, fontFace: "Georgia", color: i === 3 ? C.gold : C.green, bold: i === 3 });
    });
    // Methodology footnote
    const cfName = baseline.companyFinancials?.companyName || baseline.company || "Company";
    const cfYear = baseline.companyFinancials?.fiscalYear || "";
    s.addText(`Based on ${cfName}${cfYear ? " FY" + cfYear : ""} financials. Medium scenario (65%). Methodology: APQC + SAP VLM benchmarks, bottom-up process analysis.`, { x: 0.5, y: 4.9, w: 9.0, h: 0.25, fontSize: 7, fontFace: "Calibri", color: C.dkGray, italic: true });
    addFtr(s, pg++);
  })();

  // ── Slide 3: Decision Leakage ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Decision Leakage", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });
    s.addText("Strategic decisions this transformation unlocks", { x: 0.5, y: 0.95, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray, italic: true });

    const lk = leakage.slice(0, 8);
    if (lk.length > 0) {
      const rows = [
        [hd("Decision"), hd("Why Blocked"), hd("Est. Value", { align: "right" })],
        ...lk.map(l => [
          cl(trunc(l.label, 30)), cl(trunc(l.reason, 35), { fontSize: 9 }), cl(fmtD(l.value), { align: "right", color: C.gold, bold: true }),
        ]),
      ];
      s.addTable(rows, { x: 0.5, y: 1.4, w: 9.0, colW: [3.5, 3.5, 2.0], border: { type: "solid", pt: 0.5, color: C.bdr }, rowH: 0.38 });
    } else {
      s.addText("No decision leakage identified — all KPIs are at or above benchmark.", { x: 0.5, y: 2.5, w: 9.0, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    }
    addFtr(s, pg++);
  })();

  // ── Slide 4: Next Steps ──
  (() => {
    const s = dkSl(pptx); goldLn(pptx, s);
    s.addText("Next Steps", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

    const topE = Object.entries(data.e2e).sort((a, b) => b[1].value - a[1].value)[0];
    const actions = [
      { action: topE ? `Prioritize ${topE[0]} — ${fmtD(topE[1].value)} addressable` : "Prioritize highest-value E2E flow", owner: "Sponsor", timeline: "Week 1-2", priority: "High" },
      { action: "Initiate Phase 1 detailed design", owner: "Project Lead", timeline: "Week 2-4", priority: "High" },
      { action: "Deploy AI agent pilots for top processes", owner: "Technology", timeline: "Week 4-8", priority: "Med" },
    ];

    actions.forEach((a, i) => {
      const by = 1.3 + i * 1.2;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: by, w: 9.0, h: 1.0, fill: { color: C.card }, rectRadius: 0.1, line: { color: C.bdr, width: 0.5 } });
      s.addText(a.action, { x: 0.7, y: by + 0.05, w: 6.5, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.white, bold: true });
      s.addText("Owner: " + a.owner + "   |   " + a.timeline, { x: 0.7, y: by + 0.5, w: 6.5, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.gray });
      // Priority badge
      const pColor = a.priority === "High" ? C.gold : a.priority === "Med" ? C.green : C.blue;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 8.2, y: by + 0.25, w: 1.1, h: 0.45, fill: { color: pColor }, rectRadius: 0.08 });
      s.addText(a.priority, { x: 8.2, y: by + 0.25, w: 1.1, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.bg, bold: true, align: "center" });
    });
    addFtr(s, pg++);
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
    s.addText("Assessment Scope", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
    s.addText("Baseline Confidence", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
    s.addText("Decision Leakage Analysis", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });
    s.addText("Strategic decisions this transformation unlocks", { x: 0.5, y: 0.95, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray, italic: true });

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
    s.addText("Benchmark Positioning", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
    s.addText("ERP Value by Process", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
    s.addText("AI Agent Uplift", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
    s.addText("P&L Impact", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
    s.addText("Balance Sheet Impact", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
    s.addText("Value Realization Plan", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
    s.addText("Action Plan", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

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
