import pptxgen from "pptxgenjs";

/* ═══════════════════════════════════════════════════════
   PPTX V2 — MediGen-Style Executive Value Assessment
   6 slides: Cover, What We Found, Where The Value Is,
   How We Got There, What It Takes, Recommended Next Steps
   ═══════════════════════════════════════════════════════ */

// Design tokens
const NAVY = "0F1B2D";
const WHITE_BG = "FFFFFF";
const GOLD = "D4A853";
const GOLD_LIGHT = "FDF6E8";
const NAVY_TEXT = "1A2A3D";
const GRAY = "6B7280";
const GRAY_LIGHT = "E5E7EB";
const GREEN = "16A34A";
const FONT = "Calibri";
const CONF_TEXT = "CONFIDENTIAL";

const fmtD = v => {
  if (!v && v !== 0) return "$0M";
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  return a >= 1000 ? s + "$" + (a / 1000).toFixed(1) + "B" : a >= 1 ? s + "$" + a.toFixed(1) + "M" : s + "$" + (a * 1000).toFixed(0) + "K";
};
const fmtPct = v => (v * 100).toFixed(0) + "%";
const trunc = (s, n) => s && s.length > n ? s.slice(0, n) + "\u2026" : (s || "");
const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

function setupPptx() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "CUSTOM_16x9", width: 10, height: 5.625 });
  pptx.layout = "CUSTOM_16x9";
  return pptx;
}

// Footer with CONFIDENTIAL on every slide
function addFooter(sl, isDark) {
  const color = isDark ? "4A5568" : GRAY;
  sl.addText(CONF_TEXT, { x: 0.5, y: 5.25, w: 3, h: 0.3, fontSize: 7, fontFace: FONT, color, bold: true, letterSpacing: 2 });
  sl.addText("humaninthelead.ai", { x: 7.0, y: 5.25, w: 2.5, h: 0.3, fontSize: 7, fontFace: FONT, color, align: "right" });
}

/* ─── Slide 1: Cover ─── */
function slideCover(pptx, { assessmentProfile, baseline, companyFinancials }) {
  const s = pptx.addSlide();
  s.background = { fill: NAVY };

  const coName = assessmentProfile?.companyName || companyFinancials?.companyName || baseline?.company || "Company";

  // Gold accent line
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 2.55, w: 4.5, h: 0.004, fill: { color: GOLD } });

  // Company name
  s.addText(coName, { x: 0.5, y: 1.2, w: 6, h: 0.8, fontSize: 36, fontFace: FONT, color: "FFFFFF", bold: true });

  // Subtitle
  s.addText("Value Assessment", { x: 0.5, y: 2.7, w: 6, h: 0.6, fontSize: 24, fontFace: FONT, color: GOLD });

  // Date
  s.addText(today(), { x: 0.5, y: 3.4, w: 4, h: 0.4, fontSize: 14, fontFace: FONT, color: "8899AA" });

  // Confidential badge
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.2, w: 1.6, h: 0.35, fill: { color: "1A2F45" }, rectRadius: 0.04, line: { color: "2A4055", width: 0.5 } });
  s.addText(CONF_TEXT, { x: 0.5, y: 4.2, w: 1.6, h: 0.35, fontSize: 8, fontFace: FONT, color: "667788", align: "center", bold: true });

  // Right side accent block
  s.addShape(pptx.shapes.RECTANGLE, { x: 7.5, y: 0, w: 2.5, h: 5.625, fill: { color: "0A1520" } });
  s.addText("Prepared by\nHuman in the Lead", { x: 7.6, y: 4.2, w: 2.3, h: 0.8, fontSize: 9, fontFace: FONT, color: "556677", align: "center", lineSpacingMultiple: 1.4 });

  addFooter(s, true);
}

/* ─── Slide 2: What We Found — stat callouts ─── */
function slideWhatWeFound(pptx, data) {
  const { tv, agTot, combined, imps, assessmentProfile, companyFinancials, multiYearRamp } = data;
  const s = pptx.addSlide();
  s.background = { fill: WHITE_BG };

  // Section header
  s.addText("What We Found", { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 28, fontFace: FONT, color: NAVY_TEXT, bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.85, w: 1.2, h: 0.004, fill: { color: GOLD } });

  const nProcs = imps.length;
  const topProc = imps[0];

  // Calculate payback period
  const erpImplCost = tv * 0.15;
  const ramp = multiYearRamp || { erp: [30, 70, 100], agent: [0, 40, 100] };
  const yr1Value = (tv * ramp.erp[0] / 100) + (agTot * (ramp.agent?.[0] || 0) / 100);
  const paybackMonths = yr1Value > 0 ? Math.ceil((erpImplCost / yr1Value) * 12) : 24;

  // Stat callout cards — 4 across
  const stats = [
    { number: fmtD(combined), label: "Total Value\nPotential" },
    { number: String(nProcs), label: "Processes\nAssessed" },
    { number: topProc ? trunc(topProc.label, 18) : "N/A", label: "Top Process\nby Value", smallNum: true },
    { number: paybackMonths <= 24 ? `${paybackMonths}mo` : "24mo+", label: "Estimated\nPayback Period" },
  ];

  const cardW = 2.0, gap = 0.4, startX = 0.5, startY = 1.4;
  stats.forEach((stat, i) => {
    const cx = startX + i * (cardW + gap);
    // Card background
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: startY, w: cardW, h: 1.8, fill: { color: "F9FAFB" }, rectRadius: 0.08, line: { color: GRAY_LIGHT, width: 0.5 } });
    // Gold top accent
    s.addShape(pptx.shapes.RECTANGLE, { x: cx + 0.3, y: startY + 0.15, w: cardW - 0.6, h: 0.003, fill: { color: GOLD } });
    // Number
    s.addText(stat.number, { x: cx, y: startY + 0.3, w: cardW, h: 0.8, fontSize: stat.smallNum ? 18 : 40, fontFace: FONT, color: GOLD, bold: true, align: "center" });
    // Label
    s.addText(stat.label, { x: cx, y: startY + 1.15, w: cardW, h: 0.5, fontSize: 11, fontFace: FONT, color: GRAY, align: "center", lineSpacingMultiple: 1.3 });
  });

  // Breakdown strip at bottom
  const stripY = 3.6;
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: stripY, w: 9.0, h: 0.003, fill: { color: GRAY_LIGHT } });

  const breakdownItems = [
    { label: "ERP Value", value: fmtD(tv), color: GOLD },
    { label: "Agent Uplift", value: fmtD(agTot), color: GREEN },
    { label: "Combined", value: fmtD(combined), color: NAVY_TEXT },
  ];
  breakdownItems.forEach((item, i) => {
    const bx = 0.5 + i * 3.1;
    s.addText(item.label, { x: bx, y: stripY + 0.15, w: 2.8, h: 0.25, fontSize: 10, fontFace: FONT, color: GRAY });
    s.addText(item.value, { x: bx, y: stripY + 0.4, w: 2.8, h: 0.4, fontSize: 22, fontFace: FONT, color: item.color, bold: true });
  });

  // Industry context line
  const ind = assessmentProfile?.industry || "";
  const band = assessmentProfile?.revenueBand || "";
  if (ind || band) {
    s.addText(`Benchmarks: ${ind}${band ? " | " + band : ""} peer group`, { x: 0.5, y: 4.6, w: 9, h: 0.3, fontSize: 9, fontFace: FONT, color: GRAY, italic: true });
  }

  addFooter(s, false);
}

/* ─── Slide 3: Where The Value Is — process table ─── */
function slideWhereValueIs(pptx, data, { selProcs, procValues, procBenchmarks }) {
  const { imps } = data;
  const s = pptx.addSlide();
  s.background = { fill: WHITE_BG };

  s.addText("Where The Value Is", { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 28, fontFace: FONT, color: NAVY_TEXT, bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.85, w: 1.2, h: 0.004, fill: { color: GOLD } });

  // Build SAP lever lookup
  const leverLookup = {};
  selProcs.forEach(p => {
    const sapMods = (p.sap || []).map(m => m.module).join(", ");
    const capability = (p.kpis || [])[0]?.capability || "";
    const valLever = p.valLevers?.[0];
    leverLookup[p.id] = { module: sapMods, capability: trunc(capability, 25), fintype: valLever?.fintype || "" };
  });

  // Get baseline/target for first KPI of each process
  const procDetails = imps.slice(0, 8).map(imp => {
    const proc = selProcs.find(p => p.id === imp.id);
    const pv = procValues[imp.id] || {};
    const pb = procBenchmarks[imp.id] || {};
    const firstKpi = proc?.kpis?.[0];
    const current = pv["kpi_current_0"] ?? firstKpi?.current;
    const bench = pb["bench_0"] ?? firstKpi?.benchmark;
    const unit = firstKpi?.unit || "";
    const lv = leverLookup[imp.id] || {};
    return {
      label: imp.label,
      sapLever: lv.module || lv.capability || "S/4HANA",
      baseline: current != null ? `${current}${unit}` : "—",
      target: bench != null ? `${bench}${unit}` : "—",
      value: imp.value + (imp.agentValue || 0),
    };
  });

  if (procDetails.length > 0) {
    // Table header
    const hd = (t, ex) => ({ text: t, options: { bold: true, fontSize: 9, color: "FFFFFF", fill: { color: NAVY }, fontFace: FONT, ...ex } });
    const cl = (t, ex) => ({ text: String(t), options: { fontSize: 9, color: NAVY_TEXT, fontFace: FONT, ...ex } });

    const rows = [
      [hd("Process"), hd("SAP Lever"), hd("Baseline", { align: "center" }), hd("Target", { align: "center" }), hd("Value", { align: "right" })],
      ...procDetails.map((p, i) => {
        const rowFill = i % 2 === 0 ? { fill: { color: "F9FAFB" } } : {};
        return [
          cl(trunc(p.label, 30), { bold: true, ...rowFill }),
          cl(trunc(p.sapLever, 20), { color: GRAY, ...rowFill }),
          cl(p.baseline, { align: "center", ...rowFill }),
          cl(p.target, { align: "center", color: GREEN, ...rowFill }),
          cl(fmtD(p.value), { align: "right", color: GOLD, bold: true, ...rowFill }),
        ];
      }),
    ];
    s.addTable(rows, { x: 0.5, y: 1.1, w: 9.0, colW: [2.8, 2.0, 1.3, 1.3, 1.6], border: { type: "solid", pt: 0.5, color: GRAY_LIGHT }, rowH: 0.38 });
  }

  addFooter(s, false);
}

/* ─── Slide 4: How We Got There — calculation transparency ─── */
function slideHowWeGotThere(pptx, data, params) {
  const { assessmentProfile, imps, tv, agTot } = data;
  const s = pptx.addSlide();
  s.background = { fill: NAVY };

  s.addText("How We Got There", { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 28, fontFace: FONT, color: "FFFFFF", bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.85, w: 1.2, h: 0.004, fill: { color: GOLD } });
  s.addText("Calculation transparency", { x: 0.5, y: 0.95, w: 9, h: 0.3, fontSize: 12, fontFace: FONT, color: "8899AA", italic: true });

  const scenarioLevel = params.scenarioLevel || "Medium";
  const multipliers = { High: "100%", Medium: "65%", Low: "35%" };
  const ind = assessmentProfile?.industry || "Industry";
  const band = assessmentProfile?.revenueBand || "";

  // Four info cards in a 2x2 grid
  const cards = [
    { title: "Benchmark Source", content: `${ind}${band ? "\n" + band : ""}\npeer group`, icon: "01" },
    { title: "Scenario Used", content: `${scenarioLevel}\n(${multipliers[scenarioLevel] || "65%"} of gap)`, icon: "02" },
    { title: "Addressable %", content: `Default 80%\nadjusted per process\nwhere overridden`, icon: "03" },
    { title: "Agent Uplift %", content: agTot > 0 ? `${fmtD(agTot)} incremental\nfrom ERP benchmark\nto agent benchmark` : "No agent scenarios\ngenerated yet", icon: "04" },
  ];

  const cardW = 4.1, cardH = 1.6, gapX = 0.5, gapY = 0.3;
  cards.forEach((card, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = 0.5 + col * (cardW + gapX);
    const cy = 1.5 + row * (cardH + gapY);

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cardW, h: cardH, fill: { color: "142236" }, rectRadius: 0.08, line: { color: "1E3350", width: 0.5 } });

    // Number badge
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx + 0.15, y: cy + 0.15, w: 0.4, h: 0.35, fill: { color: GOLD }, rectRadius: 0.04 });
    s.addText(card.icon, { x: cx + 0.15, y: cy + 0.15, w: 0.4, h: 0.35, fontSize: 10, fontFace: FONT, color: NAVY, bold: true, align: "center" });

    // Title
    s.addText(card.title, { x: cx + 0.7, y: cy + 0.15, w: cardW - 0.9, h: 0.35, fontSize: 13, fontFace: FONT, color: GOLD, bold: true });

    // Content
    s.addText(card.content, { x: cx + 0.7, y: cy + 0.55, w: cardW - 0.9, h: cardH - 0.7, fontSize: 11, fontFace: FONT, color: "B0BEC5", lineSpacingMultiple: 1.4 });
  });

  addFooter(s, true);
}

/* ─── Slide 5: What It Takes — People / Process / Technology / Data ─── */
function slideWhatItTakes(pptx, data) {
  const { valueRealization } = data;
  const s = pptx.addSlide();
  s.background = { fill: WHITE_BG };

  s.addText("What It Takes", { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 28, fontFace: FONT, color: NAVY_TEXT, bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.85, w: 1.2, h: 0.004, fill: { color: GOLD } });
  s.addText("Realization requirements across four dimensions", { x: 0.5, y: 0.95, w: 9, h: 0.3, fontSize: 12, fontFace: FONT, color: GRAY, italic: true });

  const vr = valueRealization || {};

  const dims = [
    {
      title: "People",
      color: "3B82F6",
      getItems: d => [
        d.roleChanges || "Role changes TBD",
        d.headcountDelta ? `Headcount delta: ${d.headcountDelta}` : null,
        (d.skillsRequired || []).length > 0 ? `Skills: ${d.skillsRequired.join(", ")}` : null,
      ].filter(Boolean),
    },
    {
      title: "Process",
      color: GREEN,
      getItems: d => [
        d.processesRedesigned || "Process redesign TBD",
        d.processesRetired || null,
        d.automationCandidates || null,
      ].filter(Boolean),
    },
    {
      title: "Technology",
      color: "8B5CF6",
      getItems: d => [
        d.integrationNeeds || "Integration needs TBD",
        d.itInfrastructure || null,
        d.physicalFootprint || null,
      ].filter(Boolean),
    },
    {
      title: "Data",
      color: GOLD,
      getItems: d => [
        d.dataGaps || "Data requirements TBD",
        d.governanceNeeds || null,
        (d.qualityIssues || []).length > 0 ? `Quality: ${d.qualityIssues.join(", ")}` : null,
      ].filter(Boolean),
    },
  ];

  const colW = 2.05, gap = 0.2, startY = 1.4, colH = 3.6;
  dims.forEach((dim, i) => {
    const cx = 0.5 + i * (colW + gap);

    // Column card
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: startY, w: colW, h: colH, fill: { color: "F9FAFB" }, rectRadius: 0.08, line: { color: GRAY_LIGHT, width: 0.5 } });

    // Colored header bar
    s.addShape(pptx.shapes.RECTANGLE, { x: cx, y: startY, w: colW, h: 0.5, fill: { color: dim.color }, rectRadius: 0.08 });
    // Fix bottom corners of header (overlay rectangle)
    s.addShape(pptx.shapes.RECTANGLE, { x: cx, y: startY + 0.3, w: colW, h: 0.2, fill: { color: dim.color } });
    s.addText(dim.title, { x: cx, y: startY, w: colW, h: 0.5, fontSize: 13, fontFace: FONT, color: "FFFFFF", bold: true, align: "center" });

    // Content items
    const items = vr[dim.title.toLowerCase()] || vr[dim.title.toLowerCase() + "es"] || vr[dim.title.toLowerCase().replace("process", "processes")];
    const lines = items ? dim.getItems(items) : [`${dim.title} requirements not yet defined`];
    const content = lines.map(l => typeof l === "string" ? trunc(l, 60) : "").filter(Boolean).join("\n\n");
    s.addText(content || `${dim.title} requirements\nnot yet defined`, { x: cx + 0.12, y: startY + 0.6, w: colW - 0.24, h: colH - 0.7, fontSize: 9, fontFace: FONT, color: NAVY_TEXT, lineSpacingMultiple: 1.4 });
  });

  addFooter(s, false);
}

/* ─── Slide 6: Recommended Next Steps ─── */
function slideNextSteps(pptx, data) {
  const { imps, e2e, agTot, tv, multiYearRamp } = data;
  const s = pptx.addSlide();
  s.background = { fill: NAVY };

  s.addText("Recommended Next Steps", { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 28, fontFace: FONT, color: "FFFFFF", bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.85, w: 1.2, h: 0.004, fill: { color: GOLD } });

  const topE = Object.entries(e2e).sort((a, b) => b[1].value - a[1].value)[0];
  const topProc = imps[0];
  const nProcs = Math.min(imps.length, 5);

  // Phase 1 scope
  const phase1Scope = topE
    ? `${topE[0]} — ${nProcs} processes, ${fmtD(topE[1].value)} addressable`
    : `Top ${nProcs} processes by value`;

  // Timeline
  const ramp = multiYearRamp || { erp: [30, 70, 100] };
  const timeline = "8-12 weeks to Phase 1 completion";

  // Owner
  const owner = "Executive Sponsor + Project Lead";

  // Three step cards
  const steps = [
    { phase: "Phase 1", title: "Detailed Design", desc: `Scope: ${phase1Scope}\n\nDeep-dive top processes, validate benchmarks with process owners, build implementation roadmap`, timeline: "Weeks 1-4", color: GOLD },
    { phase: "Phase 2", title: "Build & Configure", desc: `Configure S/4HANA for ${nProcs} priority processes${agTot > 0 ? "\n\nDeploy AI agent pilots for highest-feasibility candidates" : ""}`, timeline: "Weeks 4-10", color: "4A90D9" },
    { phase: "Phase 3", title: "Realize Value", desc: `Go-live, measure against baseline KPIs, track value realization\n\nTarget: ${fmtD(tv * (ramp.erp[0] || 30) / 100)} Year 1 ERP value`, timeline: "Weeks 10-16", color: GREEN },
  ];

  const cardW = 2.8, gap = 0.3;
  steps.forEach((step, i) => {
    const cx = 0.5 + i * (cardW + gap);
    const cy = 1.3;
    const cardH = 3.4;

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cardW, h: cardH, fill: { color: "142236" }, rectRadius: 0.1, line: { color: "1E3350", width: 0.5 } });

    // Phase badge
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx + 0.15, y: cy + 0.15, w: 1.0, h: 0.32, fill: { color: step.color }, rectRadius: 0.05 });
    s.addText(step.phase, { x: cx + 0.15, y: cy + 0.15, w: 1.0, h: 0.32, fontSize: 9, fontFace: FONT, color: step.color === GOLD ? NAVY : "FFFFFF", bold: true, align: "center" });

    // Timeline right
    s.addText(step.timeline, { x: cx + 1.3, y: cy + 0.15, w: cardW - 1.5, h: 0.32, fontSize: 9, fontFace: FONT, color: "8899AA", align: "right" });

    // Title
    s.addText(step.title, { x: cx + 0.15, y: cy + 0.6, w: cardW - 0.3, h: 0.4, fontSize: 16, fontFace: FONT, color: "FFFFFF", bold: true });

    // Description
    s.addText(step.desc, { x: cx + 0.15, y: cy + 1.1, w: cardW - 0.3, h: cardH - 1.3, fontSize: 10, fontFace: FONT, color: "B0BEC5", lineSpacingMultiple: 1.4 });
  });

  // Owner bar at bottom
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 4.85, w: 10, h: 0.78, fill: { color: "0A1520" } });
  s.addText(`Owner: ${owner}  |  Timeline: ${timeline}`, { x: 0.5, y: 4.85, w: 5.5, h: 0.4, fontSize: 10, fontFace: FONT, color: "8899AA" });
  s.addText("Phase 0 complete. Ready for Phase 1.", { x: 6.0, y: 4.85, w: 3.5, h: 0.4, fontSize: 10, fontFace: FONT, color: GOLD, align: "right" });

  addFooter(s, true);
}

/* ═══════════════════════════════════════════════════════
   PRECOMPUTE shared data
   ═══════════════════════════════════════════════════════ */
function precompute({ baseline, selProcs, valResult, procValues, procBenchmarks, agentResults, getQuartile, PROC_MAP, FUNCTIONS, selectedFunction, valueRealization, companyFinancials, multiYearRamp, assessmentProfile }) {
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
    if (!e2e[imp.e2e]) e2e[imp.e2e] = { procs: 0, value: 0 };
    e2e[imp.e2e].procs++;
    e2e[imp.e2e].value += imp.value;
  });

  return { imps, rv, cg, sg, tv, agTot, combined, bsh, fnName, e2e, valueRealization, companyFinancials, multiYearRamp, assessmentProfile };
}

/* ═══════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════ */
export function generateExecDeck(params) {
  const pptx = setupPptx();
  const data = precompute(params);

  slideCover(pptx, data);
  slideWhatWeFound(pptx, data);
  slideWhereValueIs(pptx, data, params);
  slideHowWeGotThere(pptx, data, params);
  slideWhatItTakes(pptx, data);
  slideNextSteps(pptx, data);

  const coName = params.assessmentProfile?.companyName || params.baseline.company || "Company";
  pptx.writeFile({ fileName: coName.replace(/\s+/g, "_") + "_Value_Assessment.pptx" });
}

export function generateDetailedDeck(params) {
  // For now, detailed deck uses the same 6-slide executive format
  // A future expansion can add appendix slides
  generateExecDeck(params);
}

export default function generatePPTXv2(params) {
  generateExecDeck(params);
}
