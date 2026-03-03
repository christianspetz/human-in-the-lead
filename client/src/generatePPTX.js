import pptxgen from "pptxgenjs";
import AGENT_SPECS from "./agentSpecs";

/* ═══════════════════════════════════════════════════════
   PPTX GENERATION — Big 4 Quality Phase 0 Deck (22 slides)
   ═══════════════════════════════════════════════════════ */

export default function generatePPTX({
  baseline, selProcs, valResult, scenarioLevel, procValues, procBenchmarks,
  agentResults, baselineData, selectedFunction, totalKPIs,
  FUNCTIONS, PROC_MAP, getQuartile, BLUEPRINT_TIERS,
}) {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "CUSTOM_16x9", width: 10, height: 5.625 });
  pptx.layout = "CUSTOM_16x9";

  // ── Color constants (no # prefix — pptxgenjs requirement) ──
  const C = {
    darkBg: "111110", cardBg: "1A1A18", border: "2A2A25",
    lightBg: "F5F0E8", white: "EEEAE4", gray: "888888", darkGray: "555555",
    gold: "D4A853", green: "7CB9A8", blue: "7BA7CC", purple: "C4A1D4",
    red: "D48A8A", orange: "D4A07A", black: "111110", lightGold: "3D3520",
  };

  // ── Helpers ──
  const fmtD = v => {
    if (!v && v !== 0) return "$0M";
    const a = Math.abs(v), s = v < 0 ? "-" : "";
    return a >= 1000 ? s + "$" + (a / 1000).toFixed(1) + "B" : s + "$" + a.toFixed(1) + "M";
  };
  const trunc = (s, n) => s && s.length > n ? s.slice(0, n) + "\u2026" : (s || "");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const fnName = FUNCTIONS.find(f => f.id === selectedFunction)?.name || "Finance";

  // ── Slide factories (NEVER reuse option objects — pptxgenjs mutates them) ──
  const addFtr = (sl, pg) => {
    sl.addText("humaninthelead.ai  |  Confidential", { x: 0.5, y: 5.25, w: 5, h: 0.3, fontSize: 8, color: C.gray, fontFace: "Calibri" });
    sl.addText(String(pg), { x: 9.0, y: 5.25, w: 0.5, h: 0.3, fontSize: 8, color: C.gray, fontFace: "Calibri", align: "right" });
  };
  const goldLn = sl => sl.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.4, w: 9.0, h: 0.007, fill: { color: C.gold } });
  const dkSl = () => { const s = pptx.addSlide(); s.background = { fill: C.darkBg }; return s; };
  const ltSl = () => { const s = pptx.addSlide(); s.background = { fill: C.lightBg }; return s; };

  // ── Precompute data ──
  const imps = valResult.impacts.filter(i => i.value > 0);
  const top5 = imps.slice(0, 5);
  const { revImpact: rv, cogsImpact: cg, sgaImpact: sg } = valResult.pnl;
  const tv = valResult.total;
  const bsh = valResult.balanceSheet;
  const hasWC = bsh.totalWorkingCapital > 0;

  // E2E aggregation
  const e2e = {};
  imps.forEach(imp => {
    if (!e2e[imp.e2e]) e2e[imp.e2e] = { procs: 0, value: 0, kpis: 0 };
    e2e[imp.e2e].procs++;
    e2e[imp.e2e].value += imp.value;
    const p = PROC_MAP[imp.id];
    e2e[imp.e2e].kpis += p?.kpis?.length || 0;
  });

  // SAP module aggregation
  const sapM = {};
  selProcs.forEach(p => (p.sap || []).forEach(s => { sapM[s.module] = (sapM[s.module] || 0) + 1; }));

  // Quartile aggregation
  let qT = 0, qA = 0, qL = 0, qTot = 0;
  selProcs.forEach(proc => {
    const pv = procValues[proc.id] || {}, pb = procBenchmarks[proc.id] || {};
    (proc.kpis || []).forEach((kpi, ki) => {
      const cur = pv["kpi_current_" + ki] ?? kpi.current;
      const ben = pb["bench_" + ki] ?? kpi.benchmark;
      const q = getQuartile(cur, ben, kpi);
      if (q) { qTot++; if (q.score >= 3) qT++; else if (q.score >= 2) qA++; else qL++; }
    });
  });

  let pg = 1;

  // ════════════════════════════════════════════
  // SLIDE 1 — TITLE (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText(baseline.company, { x: 0.5, y: 1.2, w: 9.0, h: 0.8, fontSize: 36, fontFace: "Georgia", color: C.gold, bold: true });
    s.addText("Phase 0 Value Assessment", { x: 0.5, y: 2.0, w: 9.0, h: 0.5, fontSize: 18, fontFace: "Georgia", color: C.white });
    s.addText("Function: " + fnName, { x: 0.5, y: 2.7, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray });
    s.addText(today, { x: 0.5, y: 3.1, w: 9.0, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.darkGray });
    s.addText("humaninthelead.ai", { x: 0.5, y: 4.8, w: 9.0, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.gray });
    pg++;
  })();

  // ════════════════════════════════════════════
  // SLIDE 2 — EXECUTIVE SUMMARY (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("Executive Summary", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

    // 4 stat boxes
    [
      { l: "Total Combined Value", v: fmtD(tv), c: C.gold },
      { l: "P&L Impact", v: fmtD(rv + cg + sg), c: C.green },
      { l: "Working Capital Freed", v: hasWC ? fmtD(bsh.totalWorkingCapital) : "N/A", c: C.blue },
      { l: "Processes Assessed", v: String(selProcs.length), c: C.white },
    ].forEach((st, i) => {
      const bx = 0.5 + i * 2.25;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx, y: 1.2, w: 2.0, h: 1.1, fill: { color: C.cardBg }, rectRadius: 0.1, line: { color: C.border, width: 0.5 } });
      s.addText(st.v, { x: bx, y: 1.25, w: 2.0, h: 0.65, fontSize: 28, fontFace: "Georgia", color: st.c, bold: true, align: "center", valign: "bottom" });
      s.addText(st.l, { x: bx, y: 1.9, w: 2.0, h: 0.35, fontSize: 10, fontFace: "Calibri", color: C.gray, align: "center", valign: "top" });
    });

    // Auto-generated summary paragraph
    const topE = Object.entries(e2e).sort((a, b) => b[1].value - a[1].value)[0];
    const txt = "This Phase 0 assessment analyzed " + selProcs.length + " APQC L4 processes across " + fnName +
      " for " + baseline.company + ". The analysis identified " + fmtD(tv) + " in addressable value under a " +
      scenarioLevel + " realization scenario. " +
      (topE ? topE[0] + " represents the largest opportunity at " + fmtD(topE[1].value) + " across " + topE[1].procs + " processes. " : "") +
      qL + " of " + qTot + " assessed KPIs are at Bottom Quartile, indicating significant improvement potential.";
    s.addText(txt, { x: 0.5, y: 2.6, w: 9.0, h: 1.4, fontSize: 12, fontFace: "Calibri", color: C.white, lineSpacingMultiple: 1.4 });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 3 — THE CASE FOR TRANSFORMATION (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("The Case for Transformation", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

    const cols = [
      { title: "Today", color: C.red, items: ["Manual, fragmented processes", "Disconnected systems & data silos", "Reactive exception handling", "Limited visibility into KPIs"] },
      { title: "With S/4HANA", color: C.gold, items: ["Standardized on a single platform", "Real-time data & unified ledger", "Embedded analytics & workflows", "Industry best-practice processes"] },
      { title: "With S/4HANA + AI Agents", color: C.green, items: ["Autonomous process execution", "Predictive exception management", "Continuous optimization loops", "Human oversight on strategic decisions"] },
    ];
    cols.forEach((col, i) => {
      const cx = 0.5 + i * 3.1;
      s.addText(col.title, { x: cx, y: 1.2, w: 2.8, h: 0.4, fontSize: 16, fontFace: "Georgia", color: col.color, bold: true });
      s.addShape(pptx.shapes.RECTANGLE, { x: cx, y: 1.6, w: 2.8, h: 0.007, fill: { color: col.color } });
      col.items.forEach((item, j) => {
        s.addText("\u2022  " + item, { x: cx, y: 1.75 + j * 0.45, w: 2.8, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.white, lineSpacingMultiple: 1.2 });
      });
    });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 4 — SCOPE OVERVIEW (light bg)
  // ════════════════════════════════════════════
  (() => {
    const s = ltSl(); goldLn(s);
    s.addText("Scope Overview", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.black });

    const rows = [
      [{ text: "E2E Flow", options: { bold: true, fontSize: 11, color: C.black, fill: { color: "E8E2D6" } } },
       { text: "Processes", options: { bold: true, fontSize: 11, color: C.black, fill: { color: "E8E2D6" }, align: "center" } },
       { text: "KPIs", options: { bold: true, fontSize: 11, color: C.black, fill: { color: "E8E2D6" }, align: "center" } },
       { text: "Est. Value", options: { bold: true, fontSize: 11, color: C.black, fill: { color: "E8E2D6" }, align: "right" } }],
    ];
    Object.entries(e2e).forEach(([nm, d]) => {
      rows.push([
        { text: nm, options: { fontSize: 11, color: C.black } },
        { text: String(d.procs), options: { fontSize: 11, color: C.black, align: "center" } },
        { text: String(d.kpis), options: { fontSize: 11, color: C.black, align: "center" } },
        { text: fmtD(d.value), options: { fontSize: 11, color: C.black, align: "right", bold: true } },
      ]);
    });
    rows.push([
      { text: "Total", options: { bold: true, fontSize: 11, color: C.gold, fill: { color: "E8E2D6" } } },
      { text: String(selProcs.length), options: { bold: true, fontSize: 11, color: C.gold, fill: { color: "E8E2D6" }, align: "center" } },
      { text: String(totalKPIs), options: { bold: true, fontSize: 11, color: C.gold, fill: { color: "E8E2D6" }, align: "center" } },
      { text: fmtD(tv), options: { bold: true, fontSize: 11, color: C.gold, fill: { color: "E8E2D6" }, align: "right" } },
    ]);
    s.addTable(rows, { x: 0.5, y: 1.2, w: 9.0, colW: [3.5, 1.5, 1.5, 2.5], border: { type: "solid", pt: 0.5, color: "D8D2C6" }, rowH: 0.4 });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 5 — METHODOLOGY (light bg)
  // ════════════════════════════════════════════
  (() => {
    const s = ltSl(); goldLn(s);
    s.addText("Methodology", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.black });

    const steps = [
      { n: "1", nm: "Scope", d: "Select APQC L4 processes via blueprint or direct" },
      { n: "2", nm: "Baseline", d: "Capture current FTEs, cycle times, data quality" },
      { n: "3", nm: "KPIs", d: "Measure current performance against benchmarks" },
      { n: "4", nm: "Benchmarks", d: "APQC/Hackett quartile benchmarks + Catalyst AI" },
      { n: "5", nm: "ERP Impact", d: "SAP S/4HANA module mapping and scenarios" },
      { n: "6", nm: "AI Agents", d: "Generate AI agent scenarios with quantified uplift" },
      { n: "7", nm: "Value", d: "Gap analysis \u2192 addressable value \u2192 P&L rollup" },
    ];
    steps.forEach((ms, i) => {
      const bx = 0.35 + i * 1.3;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx, y: 1.3, w: 1.15, h: 0.65, fill: { color: i === 6 ? C.gold : C.black }, rectRadius: 0.08 });
      s.addText(ms.n, { x: bx, y: 1.3, w: 1.15, h: 0.3, fontSize: 10, fontFace: "Calibri", color: i === 6 ? C.black : C.gold, align: "center", bold: true });
      s.addText(ms.nm, { x: bx, y: 1.55, w: 1.15, h: 0.35, fontSize: 11, fontFace: "Calibri", color: i === 6 ? C.black : C.white, align: "center", bold: true });
      if (i < 6) s.addText("\u2192", { x: bx + 1.15, y: 1.4, w: 0.15, h: 0.5, fontSize: 14, fontFace: "Calibri", color: C.gray, align: "center" });
      s.addText(ms.d, { x: bx - 0.05, y: 2.1, w: 1.25, h: 0.7, fontSize: 8, fontFace: "Calibri", color: C.darkGray, align: "center", lineSpacingMultiple: 1.2 });
    });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 6 — VALUE SUMMARY (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("Value Summary", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });
    s.addText(fmtD(tv), { x: 0.5, y: 1.1, w: 9.0, h: 0.9, fontSize: 48, fontFace: "Georgia", color: C.gold, bold: true, align: "center" });
    s.addText("Total Addressable Value", { x: 0.5, y: 1.9, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });

    const e2eE = Object.entries(e2e).filter(([, d]) => d.value > 0);
    if (e2eE.length > 0) {
      s.addChart(pptx.charts.BAR, [{ name: "Value", labels: e2eE.map(([n]) => n), values: e2eE.map(([, d]) => Math.round(d.value * 10) / 10) }], {
        x: 0.5, y: 2.5, w: 9.0, h: 2.5, showTitle: false, showValue: true,
        valueFontSize: 9, valueFontColor: C.white,
        catAxisLabelColor: C.gray, catAxisLabelFontSize: 10,
        valAxisLabelColor: C.gray, valAxisLabelFontSize: 9,
        catAxisLineShow: false, valAxisLineShow: false,
        valGridLine: { color: C.border, size: 0.5 },
        chartColors: [C.gold], barDir: "bar",
      });
    }
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 7 — ERP vs AGENT VALUE SPLIT (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("ERP vs AI Agent Value Split", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

    // Left: ERP
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1.2, w: 4.0, h: 3.2, fill: { color: C.cardBg }, rectRadius: 0.1, line: { color: C.border, width: 0.5 } });
    s.addText("ERP Modernization", { x: 0.5, y: 1.3, w: 4.0, h: 0.4, fontSize: 16, fontFace: "Georgia", color: C.gold, align: "center", bold: true });
    s.addText(fmtD(tv), { x: 0.5, y: 1.7, w: 4.0, h: 0.6, fontSize: 32, fontFace: "Georgia", color: C.gold, align: "center", bold: true });
    [["Revenue Impact", fmtD(rv)], ["COGS Reduction", fmtD(cg)], ["SG&A Reduction", fmtD(sg)]].forEach(([lb, vl], i) => {
      s.addText(lb, { x: 0.8, y: 2.5 + i * 0.45, w: 2.5, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.gray });
      s.addText(vl, { x: 3.0, y: 2.5 + i * 0.45, w: 1.3, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.white, align: "right", bold: true });
    });

    // Right: AI Agents
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 1.2, w: 4.0, h: 3.2, fill: { color: C.cardBg }, rectRadius: 0.1, line: { color: C.border, width: 0.5 } });
    s.addText("AI Agent Uplift", { x: 5.5, y: 1.3, w: 4.0, h: 0.4, fontSize: 16, fontFace: "Georgia", color: C.green, align: "center", bold: true });
    const aCt = Object.keys(agentResults).length;
    s.addText(aCt > 0 ? aCt + " Scenarios" : "TBD", { x: 5.5, y: 1.7, w: 4.0, h: 0.6, fontSize: 32, fontFace: "Georgia", color: C.green, align: "center", bold: true });
    s.addText(aCt + " agent scenarios generated", { x: 5.5, y: 2.5, w: 4.0, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.gray, align: "center" });
    s.addText("Agent value quantification requires\nPhase 1 detailed design", { x: 5.5, y: 3.0, w: 4.0, h: 0.6, fontSize: 10, fontFace: "Calibri", color: C.darkGray, align: "center", lineSpacingMultiple: 1.3 });

    s.addText("Combined: " + fmtD(tv), { x: 0.5, y: 4.6, w: 9.0, h: 0.3, fontSize: 14, fontFace: "Georgia", color: C.gold, align: "center", bold: true });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 8 — P&L IMPACT (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("P&L Impact", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });
    const hd = (t, ex) => ({ text: t, options: { bold: true, fontSize: 11, color: C.white, fill: { color: C.border }, ...ex } });
    const cl = (t, ex) => ({ text: t, options: { fontSize: 11, color: C.white, ...ex } });
    const gf = { fill: { color: C.lightGold } };
    s.addTable([
      [hd("Line Item"), hd("Baseline", { align: "right" }), hd("Impact", { align: "right" }), hd("Improved", { align: "right" })],
      [cl("Revenue"), cl(fmtD(baseline.revenue), { align: "right" }), cl(fmtD(rv), { align: "right", color: C.green, bold: true }), cl(fmtD(baseline.revenue + rv), { align: "right" })],
      [cl("COGS"), cl(fmtD(baseline.cogs), { align: "right" }), cl(fmtD(cg), { align: "right", color: C.green, bold: true }), cl(fmtD(baseline.cogs - cg), { align: "right" })],
      [cl("Gross Profit"), cl(fmtD(baseline.revenue - baseline.cogs), { align: "right" }), cl(fmtD(rv + cg), { align: "right", color: C.green, bold: true }), cl(fmtD(baseline.revenue - baseline.cogs + rv + cg), { align: "right" })],
      [cl("SG&A"), cl(fmtD(baseline.sga), { align: "right" }), cl(fmtD(sg), { align: "right", color: C.green, bold: true }), cl(fmtD(baseline.sga - sg), { align: "right" })],
      [cl("EBITDA", { bold: true, color: C.gold, ...gf }), cl(fmtD(baseline.ebitda), { align: "right", bold: true, color: C.gold, ...gf }), cl(fmtD(rv + cg + sg), { align: "right", bold: true, color: C.gold, ...gf }), cl(fmtD((baseline.ebitda || 0) + rv + cg + sg), { align: "right", bold: true, color: C.gold, ...gf })],
    ], { x: 0.5, y: 1.2, w: 9.0, colW: [2.5, 2.0, 2.5, 2.0], border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.45 });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 9 — WORKING CAPITAL (dark bg, conditional)
  // ════════════════════════════════════════════
  if (hasWC) {
    (() => {
      const s = dkSl(); goldLn(s);
      s.addText("Working Capital Impact", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });
      const wh = (t, ex) => ({ text: t, options: { bold: true, fontSize: 11, color: C.white, fill: { color: C.border }, ...ex } });
      const wc = (t, ex) => ({ text: t, options: { fontSize: 11, color: C.white, ...ex } });
      const gf = { fill: { color: C.lightGold } };
      s.addTable([
        [wh("Line Item"), wh("Current ($M)", { align: "right" }), wh("Improvement", { align: "right" }), wh("Improved ($M)", { align: "right" })],
        [wc("Accounts Receivable"), wc(fmtD(baseline.recv), { align: "right" }), wc(fmtD(bsh.receivablesImpact), { align: "right", color: C.green, bold: true }), wc(fmtD(baseline.recv - bsh.receivablesImpact), { align: "right" })],
        [wc("Inventory"), wc(fmtD(baseline.inventory), { align: "right" }), wc(fmtD(bsh.inventoryImpact), { align: "right", color: C.green, bold: true }), wc(fmtD(baseline.inventory - bsh.inventoryImpact), { align: "right" })],
        [wc("Accounts Payable"), wc(fmtD(baseline.pay), { align: "right" }), wc(fmtD(bsh.payablesImpact), { align: "right", color: C.blue, bold: true }), wc(fmtD(baseline.pay + bsh.payablesImpact), { align: "right" })],
        [wc("Net Working Capital Freed", { color: C.gold, bold: true, ...gf }), wc("", { ...gf }), wc(fmtD(bsh.totalWorkingCapital), { fontSize: 14, color: C.gold, align: "right", bold: true, ...gf }), wc("", { ...gf })],
      ], { x: 0.5, y: 1.2, w: 9.0, colW: [3.0, 2.0, 2.0, 2.0], border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.45 });
      addFtr(s, pg++);
    })();
  }

  // ════════════════════════════════════════════
  // SLIDES 10-14 — TOP 5 PROCESS DEEP DIVES (dark bg)
  // ════════════════════════════════════════════
  top5.forEach(imp => {
    const s = dkSl(); goldLn(s);
    const proc = PROC_MAP[imp.id];
    if (!proc) return;

    s.addText(imp.l4 + "  " + imp.label, { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 20, fontFace: "Georgia", color: C.white });
    s.addText(imp.e2e + "  |  Value: " + fmtD(imp.value), { x: 0.5, y: 0.95, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gold });

    // KPI table: Current | Benchmark | Quartile
    const pv = procValues[proc.id] || {}, pb = procBenchmarks[proc.id] || {};
    const kH = (t, ex) => ({ text: t, options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.border }, ...ex } });
    const kC = (t, ex) => ({ text: t, options: { fontSize: 9, color: C.white, ...ex } });
    const kR = [[kH("KPI"), kH("Current", { align: "center" }), kH("Benchmark", { align: "center" }), kH("Quartile", { align: "center" })]];

    (proc.kpis || []).slice(0, 6).forEach((kpi, ki) => {
      const cur = pv["kpi_current_" + ki] ?? kpi.current;
      const ben = pb["bench_" + ki] ?? kpi.benchmark;
      const q = getQuartile(cur, ben, kpi);
      const qLb = q ? q.label : "\u2014";
      const qCl = q ? (q.score >= 3 ? C.green : q.score >= 2 ? C.gold : C.red) : C.gray;
      const u = kpi.unit === "%" ? "%" : kpi.unit === "days" ? " days" : "";
      kR.push([
        kC(trunc(kpi.name, 40)),
        kC(cur != null ? cur + u : "\u2014", { align: "center" }),
        kC(ben != null ? ben + u : "\u2014", { align: "center" }),
        kC(qLb, { align: "center", color: qCl, bold: true }),
      ]);
    });
    s.addTable(kR, { x: 0.5, y: 1.4, w: 9.0, colW: [3.5, 1.5, 1.5, 2.5], border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.32 });

    // SAP modules
    const sapMods = (proc.sap || []).map(x => x.module).join(", ");
    if (sapMods) s.addText("SAP Modules: " + sapMods, { x: 0.5, y: 3.8, w: 9.0, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.gray });

    // Agent description (truncated to 250 chars)
    const agTx = agentResults[proc.id];
    if (agTx) {
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.1, w: 9.0, h: 0.9, fill: { color: C.cardBg }, rectRadius: 0.08, line: { color: C.border, width: 0.5 } });
      s.addText("AI Agent", { x: 0.6, y: 4.12, w: 1.0, h: 0.2, fontSize: 8, fontFace: "Calibri", color: C.gold, bold: true });
      s.addText(trunc(agTx, 250), { x: 0.6, y: 4.3, w: 8.8, h: 0.65, fontSize: 8, fontFace: "Calibri", color: C.white, lineSpacingMultiple: 1.2 });
    }
    addFtr(s, pg++);
  });

  // ════════════════════════════════════════════
  // SLIDE 15 — QUARTILE ANALYSIS (light bg)
  // ════════════════════════════════════════════
  (() => {
    const s = ltSl(); goldLn(s);
    s.addText("Quartile Analysis", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.black });

    [
      { l: "Top Quartile", v: String(qT), c: C.green },
      { l: "Average", v: String(qA), c: C.gold },
      { l: "Bottom Quartile", v: String(qL), c: C.red },
      { l: "Total Assessed", v: String(qTot), c: C.black },
    ].forEach((st, i) => {
      const bx = 0.5 + i * 2.25;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx, y: 1.2, w: 2.0, h: 0.9, fill: { color: "FFFFFF" }, rectRadius: 0.08, line: { color: "D8D2C6", width: 0.5 } });
      s.addText(st.v, { x: bx, y: 1.2, w: 2.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: st.c, bold: true, align: "center", valign: "bottom" });
      s.addText(st.l, { x: bx, y: 1.7, w: 2.0, h: 0.35, fontSize: 10, fontFace: "Calibri", color: C.darkGray, align: "center", valign: "top" });
    });

    if (qTot > 0) {
      s.addChart(pptx.charts.BAR,
        [{ name: "KPIs", labels: ["Top Quartile", "Average", "Bottom Quartile"], values: [qT, qA, qL] }],
        { x: 0.5, y: 2.5, w: 9.0, h: 1.8, showTitle: false, showValue: true,
          valueFontSize: 10, valueFontColor: C.black,
          catAxisLabelColor: C.darkGray, catAxisLabelFontSize: 10,
          valAxisLabelColor: C.darkGray, valAxisLabelFontSize: 9,
          catAxisLineShow: false, valAxisLineShow: false,
          valGridLine: { color: "D8D2C6", size: 0.5 },
          chartColors: [C.green, C.gold, C.red], barDir: "bar" });
    }

    const lowPct = qTot > 0 ? Math.round((qL / qTot) * 100) : 0;
    s.addText("Key Finding: " + lowPct + "% of assessed KPIs are Bottom Quartile \u2014 significant improvement opportunity", {
      x: 0.5, y: 4.5, w: 9.0, h: 0.4, fontSize: 12, fontFace: "Calibri", color: C.red, bold: true, italic: true,
    });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 16 — AI AGENT OPPORTUNITIES (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("AI Agent Opportunities", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });
    const aP = imps.filter(i => agentResults[i.id]).slice(0, 8);
    const aH = (t, ex) => ({ text: t, options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.border }, ...ex } });
    const aC = (t, ex) => ({ text: t, options: { fontSize: 10, color: C.white, ...ex } });
    const aR = [[aH("Process"), aH("L4 Code", { align: "center" }), aH("ERP Value", { align: "right" }), aH("Agent Status", { align: "center" })]];
    aP.forEach(imp => {
      aR.push([
        aC(trunc(imp.label, 35)),
        aC(imp.l4, { fontSize: 9, color: C.gray, align: "center" }),
        aC(fmtD(imp.value), { color: C.gold, align: "right", bold: true }),
        aC("Scenario Ready", { fontSize: 9, color: C.green, align: "center" }),
      ]);
    });
    if (aR.length > 1) s.addTable(aR, { x: 0.5, y: 1.2, w: 9.0, colW: [3.5, 1.5, 2.0, 2.0], border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.35 });
    else s.addText("No AI agent scenarios generated yet. Run Catalyst in Step 6.", { x: 0.5, y: 2.0, w: 9.0, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 17 — IMPLEMENTATION ROADMAP (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("AI Agent Implementation Roadmap", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

    // Build roadmap data sorted by ROI
    const rmData = selProcs
      .filter(p => AGENT_SPECS[p.id])
      .map(p => {
        const spec = AGENT_SPECS[p.id];
        const imp = valResult.impacts.find(i => i.id === p.id);
        const agV = imp?.agentValue || 0;
        const roi = spec.implCost > 0 && agV > 0 ? Math.round((agV * 1000 / spec.implCost) * 100) : 0;
        return { label: p.label, l4: p.l4, ...spec, agV, roi };
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 8);

    if (rmData.length > 0) {
      const totalCost = rmData.reduce((s, r) => s + r.implCost, 0);
      const avgPayback = Math.round(rmData.reduce((s, r) => s + r.paybackMonths, 0) / rmData.length);
      const totalAgV = rmData.reduce((s, r) => s + r.agV, 0);
      const pROI = totalCost > 0 && totalAgV > 0 ? Math.round((totalAgV * 1000 / totalCost) * 100) : 0;

      // Summary stats
      [
        { l: "Total Cost", v: "$" + (totalCost >= 1000 ? (totalCost / 1000).toFixed(1) + "M" : totalCost + "K"), c: C.purple },
        { l: "Avg Payback", v: avgPayback + " mo", c: C.gold },
        { l: "Agent Value", v: totalAgV > 0 ? fmtD(totalAgV) + "/yr" : "TBD", c: C.green },
        { l: "Portfolio ROI", v: pROI > 0 ? pROI + "%" : "TBD", c: pROI > 200 ? C.green : C.gold },
      ].forEach((st, i) => {
        const bx = 0.5 + i * 2.25;
        s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx, y: 1.1, w: 2.0, h: 0.8, fill: { color: C.cardBg }, rectRadius: 0.08, line: { color: C.border, width: 0.5 } });
        s.addText(st.v, { x: bx, y: 1.1, w: 2.0, h: 0.45, fontSize: 18, fontFace: "Georgia", color: st.c, bold: true, align: "center", valign: "bottom" });
        s.addText(st.l, { x: bx, y: 1.55, w: 2.0, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.gray, align: "center", valign: "top" });
      });

      // Roadmap table
      const rH = (t, ex) => ({ text: t, options: { bold: true, fontSize: 9, color: C.white, fill: { color: C.border }, ...ex } });
      const rC = (t, ex) => ({ text: t, options: { fontSize: 9, color: C.white, ...ex } });
      const rows = [[rH("Process"), rH("Type", { align: "center" }), rH("Effort", { align: "center" }), rH("Months", { align: "center" }), rH("Cost", { align: "right" }), rH("Feasibility", { align: "center" }), rH("Payback", { align: "center" }), rH("ROI", { align: "right" })]];
      rmData.forEach(r => {
        const fCl = r.feasibility >= 80 ? C.green : r.feasibility >= 60 ? C.gold : C.orange;
        const rCl = r.roi > 200 ? C.green : r.roi > 100 ? C.gold : C.orange;
        rows.push([
          rC(trunc(r.label, 28)),
          rC(r.agentType, { align: "center", fontSize: 8, color: r.agentType === "Autonomous" ? C.green : r.agentType === "Hybrid" ? C.gold : C.blue }),
          rC(r.effort, { align: "center", color: r.effort === "Low" ? C.green : r.effort === "Medium" ? C.gold : C.red }),
          rC(String(r.implMonths), { align: "center" }),
          rC("$" + r.implCost + "K", { align: "right", color: C.purple }),
          rC(String(r.feasibility), { align: "center", color: fCl, bold: true }),
          rC(r.paybackMonths + "mo", { align: "center", color: C.gold }),
          rC(r.roi > 0 ? r.roi + "%" : "\u2014", { align: "right", color: rCl, bold: true }),
        ]);
      });
      s.addTable(rows, { x: 0.5, y: 2.1, w: 9.0, colW: [2.2, 1.0, 0.8, 0.8, 0.9, 0.9, 0.8, 0.6], border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.3 });
    } else {
      s.addText("No agent implementation specs available for selected processes.", { x: 0.5, y: 2.0, w: 9.0, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.gray, align: "center" });
    }
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 18 — SAP MODULE COVERAGE (light bg)
  // ════════════════════════════════════════════
  (() => {
    const s = ltSl(); goldLn(s);
    s.addText("SAP Module Coverage", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.black });
    Object.entries(sapM).sort((a, b) => b[1] - a[1]).forEach(([mod, cnt], i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const bx = 0.5 + col * 2.3, by = 1.3 + row * 0.65;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: 2.0, h: 0.5, fill: { color: "FFFFFF" }, rectRadius: 0.06, line: { color: "D8D2C6", width: 0.5 } });
      s.addText(mod, { x: bx + 0.1, y: by, w: 1.3, h: 0.5, fontSize: 11, fontFace: "Calibri", color: C.black, bold: true });
      s.addText(String(cnt), { x: bx + 1.4, y: by, w: 0.5, h: 0.5, fontSize: 14, fontFace: "Georgia", color: C.gold, align: "center", bold: true });
    });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 19 — EY.ai VALUE BLUEPRINT ALIGNMENT (dark bg)
  // ════════════════════════════════════════════
  if (BLUEPRINT_TIERS && BLUEPRINT_TIERS.length > 0) {
    (() => {
      const s = dkSl(); goldLn(s);
      s.addText("EY.ai Value Blueprint Alignment", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

      const tierCounts = {};
      (BLUEPRINT_TIERS || []).forEach(bt => tierCounts[bt.id] = 0);
      selProcs.forEach(p => (p.blueprintTiers || []).forEach(tid => { tierCounts[tid] = (tierCounts[tid] || 0) + 1; }));
      const covered = (BLUEPRINT_TIERS || []).filter(bt => tierCounts[bt.id] > 0);

      const bH = (t2, ex) => ({ text: t2, options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.border }, ...ex } });
      const bC = (t2, ex) => ({ text: t2, options: { fontSize: 10, color: C.white, ...ex } });
      const bRows = [[bH("Tier"), bH("Description"), bH("Processes", { align: "center" })]];
      (BLUEPRINT_TIERS || []).forEach(bt => {
        const cnt = tierCounts[bt.id] || 0;
        if (cnt > 0) {
          bRows.push([
            bC(bt.name, { bold: true, color: bt.color.replace("#", "") }),
            bC(bt.description, { fontSize: 9 }),
            bC(String(cnt), { align: "center", bold: true }),
          ]);
        }
      });
      if (bRows.length > 1) {
        s.addTable(bRows, { x: 0.5, y: 1.2, w: 9.0, colW: [2.5, 5.0, 1.5], border: { type: "solid", pt: 0.5, color: C.border }, rowH: 0.38 });
      }
      s.addText("Assessment covers " + covered.length + " of 7 tiers", { x: 0.5, y: 4.6, w: 9.0, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gold, align: "center", bold: true });
      addFtr(s, pg++);
    })();
  }

  // ════════════════════════════════════════════
  // SLIDE 20 — BASELINE FINDINGS (light bg)
  // ════════════════════════════════════════════
  (() => {
    const s = ltSl(); goldLn(s);
    s.addText("Baseline Findings", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.black });

    const ef = [], lf = [];
    selProcs.forEach(p => {
      const ft = baselineData[p.id + "_a_ftes"], rw = baselineData[p.id + "_a_rework"], cy = baselineData[p.id + "_a_cycleTime"];
      if (ft) ef.push(p.label + ": " + ft + " FTEs");
      if (rw && Number(rw) > 15) ef.push(p.label + ": " + rw + "% rework");
      if (cy) ef.push(p.label + ": " + cy + " days cycle time");
      const mn = baselineData[p.id + "_b_manualPct"], dq = baselineData[p.id + "_b_dataQuality"];
      if (mn && Number(mn) > 50) lf.push(p.label + ": " + mn + "% manual");
      if (dq) lf.push(p.label + ": DQ \u2014 " + dq);
    });

    s.addText("Process Efficiency", { x: 0.5, y: 1.2, w: 4.0, h: 0.35, fontSize: 14, fontFace: "Georgia", color: C.black, bold: true });
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 1.55, w: 4.0, h: 0.005, fill: { color: C.gold } });
    (ef.length > 0 ? ef.slice(0, 5) : ["No baseline efficiency data captured"]).forEach((f, i) => {
      s.addText("\u2022  " + trunc(f, 55), { x: 0.5, y: 1.7 + i * 0.35, w: 4.0, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.darkGray });
    });

    s.addText("Data-Driven Leakage", { x: 5.5, y: 1.2, w: 4.0, h: 0.35, fontSize: 14, fontFace: "Georgia", color: C.black, bold: true });
    s.addShape(pptx.shapes.RECTANGLE, { x: 5.5, y: 1.55, w: 4.0, h: 0.005, fill: { color: C.gold } });
    (lf.length > 0 ? lf.slice(0, 5) : ["No leakage data captured"]).forEach((f, i) => {
      s.addText("\u2022  " + trunc(f, 55), { x: 5.5, y: 1.7 + i * 0.35, w: 4.0, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.darkGray });
    });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 20 — CAPABILITY ROADMAP (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("Capability Roadmap", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

    s.addText("Built & Demonstrated", { x: 0.5, y: 1.2, w: 4.0, h: 0.4, fontSize: 14, fontFace: "Georgia", color: C.green, bold: true });
    s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 1.6, w: 4.0, h: 0.005, fill: { color: C.green } });
    ["APQC L4 process hierarchy (80+ processes)", "KPI benchmarking (APQC, Hackett, Gartner)", "SAP S/4HANA module mapping", "AI agent scenario generation (Catalyst)", "Bottom-up value calculation engine", "Phase 0 report generation (HTML + PPTX)"].forEach((item, i) => {
      s.addText("\u2022  " + item, { x: 0.5, y: 1.75 + i * 0.4, w: 4.0, h: 0.35, fontSize: 10, fontFace: "Calibri", color: C.white });
    });

    s.addText("Planned Extensions", { x: 5.5, y: 1.2, w: 4.0, h: 0.4, fontSize: 14, fontFace: "Georgia", color: C.gold, bold: true });
    s.addShape(pptx.shapes.RECTANGLE, { x: 5.5, y: 1.6, w: 4.0, h: 0.005, fill: { color: C.gold } });
    ["Process mining integration (Signavio/Celonis)", "Multi-scenario comparison engine", "Detailed Phase 1 scoping tool", "Client portal with real-time dashboards", "Supply Chain & HR function expansion", "Wave planning & implementation roadmap"].forEach((item, i) => {
      s.addText("\u2022  " + item, { x: 5.5, y: 1.75 + i * 0.4, w: 4.0, h: 0.35, fontSize: 10, fontFace: "Calibri", color: C.white });
    });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 21 — NEXT STEPS (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("Next Steps", { x: 0.5, y: 0.5, w: 9.0, h: 0.5, fontSize: 24, fontFace: "Georgia", color: C.white });

    const topE = Object.entries(e2e).sort((a, b) => b[1].value - a[1].value)[0];
    const topAg = imps.find(i => agentResults[i.id]);
    const worstE = Object.entries(e2e).sort((a, b) => a[1].value - b[1].value)[0];

    [
      { n: "1", t: topE ? "Prioritize " + topE[0] + " \u2014 " + fmtD(topE[1].value) + " addressable value across " + topE[1].procs + " processes" : "Prioritize highest-value E2E flow for Phase 1" },
      { n: "2", t: topAg ? "Deploy AI agents for " + trunc(topAg.label, 40) + " \u2014 incremental value opportunity" : "Generate AI agent scenarios for top processes" },
      { n: "3", t: "Address Bottom Quartile KPIs \u2014 " + qL + " of " + qTot + " KPIs below benchmark" + (worstE ? " (focus on " + worstE[0] + ")" : "") },
      { n: "4", t: "Initiate Phase 1 detailed design for " + selProcs.length + " prioritized processes \u2014 build implementation roadmap and wave plan" },
    ].forEach((ni, i) => {
      const by = 1.3 + i * 0.85;
      s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: by, w: 0.55, h: 0.55, fill: { color: C.gold }, rectRadius: 0.08 });
      s.addText(ni.n, { x: 0.5, y: by, w: 0.55, h: 0.55, fontSize: 18, fontFace: "Georgia", color: C.black, align: "center", bold: true });
      s.addText(ni.t, { x: 1.25, y: by, w: 8.25, h: 0.55, fontSize: 13, fontFace: "Calibri", color: C.white, lineSpacingMultiple: 1.3 });
    });
    addFtr(s, pg++);
  })();

  // ════════════════════════════════════════════
  // SLIDE 22 — CLOSING (dark bg)
  // ════════════════════════════════════════════
  (() => {
    const s = dkSl(); goldLn(s);
    s.addText("humaninthelead.ai", { x: 0.5, y: 1.8, w: 9.0, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.gold, align: "center", bold: true });
    s.addText("Bottom-Up Value Identification Engine", { x: 0.5, y: 2.5, w: 9.0, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.gray, align: "center" });
    s.addText(baseline.company + "  |  Phase 0 Value Assessment  |  " + today, { x: 0.5, y: 3.2, w: 9.0, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.darkGray, align: "center" });
    addFtr(s, pg);
  })();

  // ── Generate & download ──
  pptx.writeFile({ fileName: baseline.company.replace(/\s+/g, "_") + "_Phase0.pptx" });
}
