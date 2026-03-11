import pptxgen from "pptxgenjs";

/* ═══════════════════════════════════════════════════════
   PPTX V2 — CFO-Ready Executive Value Assessment
   6 slides: Cover, What We Found, How We Got There,
   What It Takes, Implementation Timeline, Risks & Assumptions
   ═══════════════════════════════════════════════════════ */

// Design tokens
const NAVY = "0F1B2D";
const WHITE_BG = "FFFFFF";
const GOLD = "D4A853";
const NAVY_TEXT = "1A2A3D";
const GRAY = "6B7280";
const GRAY_LIGHT = "E5E7EB";
const GREEN = "16A34A";
const PURPLE = "8B5CF6";
const FONT = "Calibri";
const FOOTER_LEFT = "Confidential | humaninthelead.ai";

const fmtD = v => {
  if (!v && v !== 0) return "$0M";
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  return a >= 1000 ? s + "$" + (a / 1000).toFixed(1) + "B" : a >= 1 ? s + "$" + a.toFixed(1) + "M" : s + "$" + (a * 1000).toFixed(0) + "K";
};
const fmtK = v => "$" + Math.round(v).toLocaleString();
const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

function setupPptx() {
  const pptx = new pptxgen();
  pptx.defineLayout({ name: "CUSTOM_16x9", width: 10, height: 5.625 });
  pptx.layout = "CUSTOM_16x9";
  return pptx;
}

function addFooter(sl, isDark) {
  const color = isDark ? "4A5568" : GRAY;
  sl.addText(FOOTER_LEFT, { x: 0.5, y: 5.25, w: 4, h: 0.3, fontSize: 7, fontFace: FONT, color, bold: true });
  sl.addText("humaninthelead.ai", { x: 7.0, y: 5.25, w: 2.5, h: 0.3, fontSize: 7, fontFace: FONT, color, align: "right" });
}

/* ─── Slide 1: Cover ─── */
function slideCover(pptx, data, params) {
  const s = pptx.addSlide();
  s.background = { fill: NAVY };

  const coName = data.coName;
  const ind = data.assessmentProfile?.industry || "";
  const band = data.assessmentProfile?.revenueBand || "";
  const fnName = data.fnName;
  const e2eNames = [...new Set(data.imps.map(i => i.e2e))].join(", ");
  const procList = data.imps.slice(0, 5).map(i => i.l4 + " " + i.label).join("\n");

  // Gold accent line
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 2.35, w: 4.5, h: 0.004, fill: { color: GOLD } });

  // Company name
  s.addText(coName, { x: 0.5, y: 0.8, w: 6.5, h: 0.8, fontSize: 36, fontFace: FONT, color: "FFFFFF", bold: true });

  // Title
  const titleName = e2eNames || fnName;
  s.addText(`${titleName} Value Assessment`, { x: 0.5, y: 1.6, w: 6.5, h: 0.5, fontSize: 22, fontFace: FONT, color: GOLD });

  // E2E and function
  s.addText(`End-to-End Process: ${e2eNames}`, { x: 0.5, y: 2.1, w: 6.5, h: 0.3, fontSize: 12, fontFace: FONT, color: "8899AA" });

  // Scope details
  s.addText(`${data.imps.length} L4 processes assessed  |  ${ind}${band ? " | " + band : ""}`, { x: 0.5, y: 2.55, w: 6.5, h: 0.3, fontSize: 11, fontFace: FONT, color: "8899AA" });

  // Date
  s.addText(today(), { x: 0.5, y: 2.9, w: 4, h: 0.3, fontSize: 12, fontFace: FONT, color: "667788" });

  // L4 process list
  if (procList) {
    s.addText("Processes in scope:", { x: 0.5, y: 3.4, w: 6, h: 0.25, fontSize: 9, fontFace: FONT, color: GOLD, bold: true });
    s.addText(procList, { x: 0.5, y: 3.65, w: 6.5, h: 1.2, fontSize: 8, fontFace: FONT, color: "667788", lineSpacingMultiple: 1.5 });
  }

  // Confidential badge
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.5, w: 1.6, h: 0.35, fill: { color: "1A2F45" }, rectRadius: 0.04, line: { color: "2A4055", width: 0.5 } });
  s.addText("CONFIDENTIAL", { x: 0.5, y: 4.5, w: 1.6, h: 0.35, fontSize: 8, fontFace: FONT, color: "667788", align: "center", bold: true });

  // Right side accent block
  s.addShape(pptx.shapes.RECTANGLE, { x: 7.5, y: 0, w: 2.5, h: 5.625, fill: { color: "0A1520" } });
  s.addText("Prepared by\nHuman in the Lead", { x: 7.6, y: 4.2, w: 2.3, h: 0.8, fontSize: 9, fontFace: FONT, color: "556677", align: "center", lineSpacingMultiple: 1.4 });

  addFooter(s, true);
}

/* ─── Slide 2: What We Found ─── */
function slideWhatWeFound(pptx, data, params) {
  const { tv, agTot, combined, imps, scenarioLevel, coName, censusData } = data;
  const s = pptx.addSlide();
  s.background = { fill: WHITE_BG };

  s.addText("What We Found", { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 28, fontFace: FONT, color: NAVY_TEXT, bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.85, w: 1.2, h: 0.004, fill: { color: GOLD } });

  const hasCensus = !!censusData?.byProcess;
  const ind = data.assessmentProfile?.industry || "Industry";
  const band = data.assessmentProfile?.revenueBand || "";

  // Data source badge
  const srcText = hasCensus
    ? `Based on ${coName} workforce data (${censusData.totalEmployees} employees, ${censusData.byProcess.length} processes mapped)`
    : `Based on ${ind}${band ? " " + band : ""} peer group benchmarks`;
  s.addText(srcText, { x: 0.5, y: 0.95, w: 9, h: 0.25, fontSize: 9, fontFace: FONT, color: hasCensus ? PURPLE : GRAY, italic: true, bold: hasCensus });

  // Stat callout cards — 4 across
  const ramp = data.multiYearRamp || { erp: [30, 70, 100], agent: [0, 40, 100] };
  const yr1Value = (tv * (ramp.erp[0] || 30) / 100) + (agTot * ((ramp.agent || [])[0] || 0) / 100);
  const erpImplCost = tv * 0.15;
  const paybackMonths = yr1Value > 0 ? Math.ceil((erpImplCost / yr1Value) * 12) : 24;

  const stats = [
    { number: fmtD(combined), label: "Total Value\nPotential" },
    { number: fmtD(tv), label: "ERP Baseline\nValue" },
    { number: fmtD(agTot), label: "Agent\nUplift" },
    { number: paybackMonths <= 24 ? `${paybackMonths}mo` : "24mo+", label: "Estimated\nPayback" },
  ];

  const cardW = 2.0, gap = 0.4, startX = 0.5, startY = 1.4;
  stats.forEach((stat, i) => {
    const cx = startX + i * (cardW + gap);
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: startY, w: cardW, h: 1.6, fill: { color: "F9FAFB" }, rectRadius: 0.08, line: { color: GRAY_LIGHT, width: 0.5 } });
    s.addShape(pptx.shapes.RECTANGLE, { x: cx + 0.3, y: startY + 0.12, w: cardW - 0.6, h: 0.003, fill: { color: GOLD } });
    s.addText(stat.number, { x: cx, y: startY + 0.25, w: cardW, h: 0.7, fontSize: 36, fontFace: FONT, color: GOLD, bold: true, align: "center" });
    s.addText(stat.label, { x: cx, y: startY + 1.0, w: cardW, h: 0.5, fontSize: 11, fontFace: FONT, color: GRAY, align: "center", lineSpacingMultiple: 1.3 });
  });

  // Scenario context
  const multipliers = { High: "100%", Medium: "65%", Low: "35%" };
  s.addText(`Scenario: ${scenarioLevel} (${multipliers[scenarioLevel] || "65%"} of addressable gap)  —  ${scenarioLevel === "Medium" ? "Recommended planning assumption" : scenarioLevel === "Low" ? "Minimum credible case" : "Full potential, assumes excellent execution"}`, {
    x: 0.5, y: 3.2, w: 9, h: 0.3, fontSize: 10, fontFace: FONT, color: NAVY_TEXT
  });

  // Process breakdown table
  const topImps = imps.slice(0, 6);
  if (topImps.length > 0) {
    const hd = (t, ex) => ({ text: t, options: { bold: true, fontSize: 9, color: "FFFFFF", fill: { color: NAVY }, fontFace: FONT, ...ex } });
    const cl = (t, ex) => ({ text: String(t), options: { fontSize: 9, color: NAVY_TEXT, fontFace: FONT, ...ex } });

    const rows = [
      [hd("L4"), hd("Process"), hd("E2E"), hd("ERP", { align: "right" }), hd("Agent", { align: "right" }), hd("Total", { align: "right" })],
      ...topImps.map((imp, i) => {
        const rowFill = i % 2 === 0 ? { fill: { color: "F9FAFB" } } : {};
        return [
          cl(imp.l4, { fontFace: "Courier New", fontSize: 8, color: GRAY, ...rowFill }),
          cl(imp.label, { bold: true, ...rowFill }),
          cl(imp.e2e, { color: GRAY, ...rowFill }),
          cl(fmtD(imp.value), { align: "right", color: GOLD, bold: true, ...rowFill }),
          cl(imp.agentValue > 0 ? fmtD(imp.agentValue) : "--", { align: "right", color: GREEN, ...rowFill }),
          cl(fmtD(imp.value + (imp.agentValue || 0)), { align: "right", bold: true, ...rowFill }),
        ];
      }),
    ];
    s.addTable(rows, { x: 0.5, y: 3.6, w: 9.0, colW: [0.8, 3.0, 1.6, 1.1, 1.1, 1.4], border: { type: "solid", pt: 0.5, color: GRAY_LIGHT }, rowH: 0.28 });
  }

  addFooter(s, false);
}

/* ─── Slide 3: How We Got There — Calculation Transparency ─── */
function slideHowWeGotThere(pptx, data, params) {
  const { imps, tv, agTot, scenarioLevel, coName, censusData } = data;
  const { selProcs, procValues, procBenchmarks, companyFinancials } = params;
  const s = pptx.addSlide();
  s.background = { fill: NAVY };

  s.addText("How We Got There", { x: 0.5, y: 0.25, w: 9, h: 0.45, fontSize: 26, fontFace: FONT, color: "FFFFFF", bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.7, w: 1.2, h: 0.004, fill: { color: GOLD } });
  s.addText("Every number is auditable. Here is the formula with real inputs.", { x: 0.5, y: 0.78, w: 9, h: 0.25, fontSize: 10, fontFace: FONT, color: "8899AA", italic: true });

  // Pick the top process to show worked example
  const topImp = imps[0];
  const topProc = topImp ? selProcs.find(p => p.id === topImp.id) : null;
  const pv = topImp ? procValues[topImp.id] || {} : {};
  const pb = topImp ? procBenchmarks[topImp.id] || {} : {};
  const kpi = topProc?.kpis?.[0];
  const lever = topProc?.valLevers?.[0];
  const sapMod = (topProc?.sap || [])[0]?.module || "S/4HANA";

  const multipliers = { High: 1.0, Medium: 0.65, Low: 0.35 };
  const scenarioMult = multipliers[scenarioLevel] || 0.65;
  const addressablePct = 80;

  const current = pv["kpi_current_0"] ?? kpi?.current;
  const bench = pb["bench_0"] ?? kpi?.benchmark;
  const unit = kpi?.unit || "";
  const gap = current != null && bench != null ? Math.abs(current - bench) : 0;
  const addressableGap = gap * (addressablePct / 100) * scenarioMult;

  // Census or benchmark labor cost
  const hasCensus = !!censusData?.byProcess;
  const censusMatch = hasCensus ? censusData.byProcess.find(bp => bp.apqcCode === topProc?.l4) : null;
  const effectiveSga = companyFinancials?.sga || params.baseline?.sga || 0;
  const laborCostM = censusMatch ? censusMatch.totalCost / 1_000_000 : effectiveSga;
  const laborSource = censusMatch
    ? `$${(censusMatch.totalCost / 1000).toFixed(0)}K (from workforce census, ${censusMatch.headcount} employees mapped)`
    : `$${effectiveSga.toFixed(0)}M (industry benchmark${data.assessmentProfile?.industry ? ", " + data.assessmentProfile.industry : ""})`;

  // Worked example card
  if (topProc && kpi) {
    const cx = 0.5, cy = 1.15, cw = 5.5, ch = 3.8;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cw, h: ch, fill: { color: "142236" }, rectRadius: 0.08, line: { color: "1E3350", width: 0.5 } });

    s.addText(`Worked Example: ${topProc.l4} ${topProc.label}`, { x: cx + 0.2, y: cy + 0.1, w: cw - 0.4, h: 0.35, fontSize: 12, fontFace: FONT, color: GOLD, bold: true });
    s.addText(`KPI: ${kpi.name}  |  SAP Module: ${sapMod}`, { x: cx + 0.2, y: cy + 0.45, w: cw - 0.4, h: 0.25, fontSize: 9, fontFace: FONT, color: "8899AA" });

    const steps = [
      { label: "Baseline KPI", value: current != null ? `${current} ${unit}` : "Not entered", note: "Source: questionnaire / manual entry" },
      { label: "Target KPI (benchmark)", value: bench != null ? `${bench} ${unit}` : "Not set", note: `Source: ${kpi.src || "APQC"} benchmark` },
      { label: "Gap", value: `${gap.toFixed(1)} ${unit}`, note: `|${current} - ${bench}| = ${gap.toFixed(1)}` },
      { label: "Addressable gap", value: `${addressableGap.toFixed(2)} ${unit}`, note: `${gap.toFixed(1)} x ${addressablePct}% addressable x ${(scenarioMult * 100).toFixed(0)}% scenario = ${addressableGap.toFixed(2)}` },
      { label: "Labor cost base", value: laborSource, note: "" },
      { label: "Financial impact", value: fmtD(topImp.value), note: `Gap % x labor cost base = ${fmtD(topImp.value)}` },
    ];

    steps.forEach((step, i) => {
      const sy = cy + 0.8 + i * 0.47;
      s.addText(`${i + 1}.`, { x: cx + 0.2, y: sy, w: 0.25, h: 0.25, fontSize: 9, fontFace: FONT, color: GOLD, bold: true });
      s.addText(step.label, { x: cx + 0.45, y: sy, w: 1.5, h: 0.25, fontSize: 9, fontFace: FONT, color: "FFFFFF", bold: true });
      s.addText(step.value, { x: cx + 2.0, y: sy, w: 3.2, h: 0.25, fontSize: 9, fontFace: FONT, color: "B0BEC5" });
      if (step.note) {
        s.addText(step.note, { x: cx + 2.0, y: sy + 0.2, w: 3.2, h: 0.2, fontSize: 7, fontFace: FONT, color: "667788", italic: true });
      }
    });
  }

  // Right side: methodology summary
  const rx = 6.3, ry = 1.15, rw = 3.3, rh = 3.8;
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: rx, y: ry, w: rw, h: rh, fill: { color: "142236" }, rectRadius: 0.08, line: { color: "1E3350", width: 0.5 } });
  s.addText("Methodology", { x: rx + 0.15, y: ry + 0.1, w: rw - 0.3, h: 0.3, fontSize: 12, fontFace: FONT, color: GOLD, bold: true });

  const methItems = [
    `Bottom-up: ${data.imps.length} L4 processes, each with sourced KPI benchmarks`,
    `Benchmarks: APQC PCF, SAP VLM, Hackett Group`,
    `Scenario: ${scenarioLevel} (${(scenarioMult * 100).toFixed(0)}% of gap)`,
    `Addressable: ${addressablePct}% default, adjustable per process`,
    `Agent uplift: ${agTot > 0 ? fmtD(agTot) + " incremental above ERP" : "Not modeled"}`,
    hasCensus ? `Labor: ${coName} census (${censusData.totalEmployees} employees)` : `Labor: ${data.assessmentProfile?.industry || "Industry"} benchmarks`,
    companyFinancials ? `Financials: ${coName} actuals (FY${companyFinancials.fiscalYear || ""})` : `Financials: Revenue band estimates`,
  ];
  methItems.forEach((item, i) => {
    s.addText(`${item}`, { x: rx + 0.15, y: ry + 0.5 + i * 0.42, w: rw - 0.3, h: 0.38, fontSize: 8, fontFace: FONT, color: "B0BEC5", lineSpacingMultiple: 1.2 });
  });

  addFooter(s, true);
}

/* ─── Slide 4: What It Takes — 2x2 grid ─── */
function slideWhatItTakes(pptx, data, params) {
  const { valueRealization, censusData, coName, imps } = data;
  const { selProcs } = params;
  const s = pptx.addSlide();
  s.background = { fill: WHITE_BG };

  s.addText("What It Takes", { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 28, fontFace: FONT, color: NAVY_TEXT, bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.85, w: 1.2, h: 0.004, fill: { color: GOLD } });

  const vr = valueRealization || {};
  const hasCensus = !!censusData?.byProcess;
  const sapModules = [...new Set(selProcs.flatMap(p => (p.sap || []).map(m => m.module)))].slice(0, 5);

  // Build content for each quadrant
  const dims = [
    {
      title: "People", color: "3B82F6",
      getLines: () => {
        const lines = [];
        if (hasCensus) {
          const matchedRows = censusData.rows.filter(r => r.apqcL4Code && selProcs.some(p => p.l4 === r.apqcL4Code));
          const locations = [...new Set(matchedRows.map(r => r.location).filter(Boolean))];
          if (matchedRows.length > 0) {
            lines.push(`${matchedRows.length} employees affected across ${locations.length} location${locations.length !== 1 ? "s" : ""}`);
            const roles = [...new Set(matchedRows.map(r => r.role))].slice(0, 3);
            lines.push(`Key roles: ${roles.join(", ")}`);
            const totalCost = matchedRows.reduce((s, r) => s + (r.cost || 0) * (r.fte || 1), 0);
            lines.push(`Labor cost impact: ${fmtK(totalCost)}`);
          }
        }
        if (lines.length === 0) {
          const pd = vr.people || {};
          if (pd.roleChanges) lines.push(pd.roleChanges.split("\n")[0].substring(0, 80));
          if (pd.headcountDelta) lines.push(`Headcount delta: ${pd.headcountDelta}`);
          if ((pd.skillsRequired || []).length > 0) lines.push(`Skills: ${pd.skillsRequired.slice(0, 3).join(", ")}`);
        }
        return lines.length > 0 ? lines : null;
      }
    },
    {
      title: "Process", color: GREEN,
      getLines: () => {
        const lines = [];
        const pd = vr.processes || {};
        if (Array.isArray(pd.processesRedesigned) && pd.processesRedesigned.length > 0) {
          lines.push(`Redesign: ${pd.processesRedesigned.slice(0, 2).join(", ")}`);
        } else if (typeof pd.processesRedesigned === "string" && pd.processesRedesigned) {
          lines.push(pd.processesRedesigned.split("\n")[0].substring(0, 80));
        }
        if (Array.isArray(pd.automationCandidates) && pd.automationCandidates.length > 0) {
          lines.push(`Automate: ${pd.automationCandidates.slice(0, 2).join(", ")}`);
        }
        if (lines.length === 0) {
          const topLabels = imps.slice(0, 3).map(i => i.label);
          lines.push(`${topLabels.length} processes to be redesigned`);
          lines.push(`SAP best-practice configuration`);
        }
        return lines;
      }
    },
    {
      title: "Technology", color: PURPLE,
      getLines: () => {
        const lines = [];
        if (sapModules.length > 0) lines.push(`SAP: ${sapModules.join(", ")}`);
        const pd = vr.technology || {};
        if (pd.integrationNeeds) lines.push(pd.integrationNeeds.split("\n")[0].substring(0, 80));
        if (pd.itInfrastructure) lines.push(pd.itInfrastructure.split("\n")[0].substring(0, 80));
        if (lines.length === 0) {
          lines.push(`S/4HANA core configuration`);
          if (data.agTot > 0) lines.push(`AI agent deployment for top processes`);
        }
        return lines;
      }
    },
    {
      title: "Data", color: GOLD,
      getLines: () => {
        const lines = [];
        const pd = vr.data || {};
        if (pd.dataGaps) lines.push(pd.dataGaps.split("\n")[0].substring(0, 80));
        if (pd.governanceNeeds) lines.push(pd.governanceNeeds.split("\n")[0].substring(0, 80));
        if ((pd.qualityIssues || []).length > 0) lines.push(`Quality: ${pd.qualityIssues.slice(0, 3).join(", ")}`);
        if (lines.length === 0) {
          lines.push(`Master data cleansing and migration`);
          lines.push(`Data governance framework required`);
        }
        return lines;
      }
    },
  ];

  const colW = 4.15, colH = 2.0, gapX = 0.4, gapY = 0.3, startY = 1.0;
  dims.forEach((dim, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = 0.5 + col * (colW + gapX);
    const cy = startY + row * (colH + gapY);

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: colW, h: colH, fill: { color: "F9FAFB" }, rectRadius: 0.08, line: { color: GRAY_LIGHT, width: 0.5 } });

    // Colored header
    s.addShape(pptx.shapes.RECTANGLE, { x: cx, y: cy, w: colW, h: 0.4, fill: { color: dim.color }, rectRadius: 0.08 });
    s.addShape(pptx.shapes.RECTANGLE, { x: cx, y: cy + 0.25, w: colW, h: 0.15, fill: { color: dim.color } });
    s.addText(dim.title, { x: cx, y: cy, w: colW, h: 0.4, fontSize: 12, fontFace: FONT, color: "FFFFFF", bold: true, align: "center" });

    const lines = dim.getLines()?.map(l => l.substring(0, 90)) || [];
    if (lines && lines.length > 0) {
      const bullets = lines.map(l => `  ${l}`).join("\n");
      s.addText(bullets, { x: cx + 0.15, y: cy + 0.5, w: colW - 0.3, h: colH - 0.6, fontSize: 8, fontFace: FONT, color: NAVY_TEXT, lineSpacingMultiple: 1.2 });
    }
  });

  // Census badge if applicable
  if (hasCensus) {
    s.addText(`People data sourced from ${coName} workforce census`, { x: 0.5, y: 4.8, w: 9, h: 0.25, fontSize: 8, fontFace: FONT, color: PURPLE, italic: true });
  }

  addFooter(s, false);
}

/* ─── Slide 5: Implementation Timeline ─── */
function slideTimeline(pptx, data, params) {
  const { tv, agTot, coName, imps } = data;
  const ramp = data.multiYearRamp || { erp: [30, 70, 100], agent: [0, 40, 100] };
  const s = pptx.addSlide();
  s.background = { fill: NAVY };

  s.addText("Implementation Timeline", { x: 0.5, y: 0.25, w: 9, h: 0.45, fontSize: 26, fontFace: FONT, color: "FFFFFF", bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.7, w: 1.2, h: 0.004, fill: { color: GOLD } });

  const nProcs = Math.min(imps.length, 5);
  const topLabels = imps.slice(0, 3).map(i => i.label);

  // Year targets
  const yr1 = (tv * (ramp.erp[0] || 30) / 100) + (agTot * ((ramp.agent || [])[0] || 0) / 100);
  const yr2 = (tv * (ramp.erp[1] || 70) / 100) + (agTot * ((ramp.agent || [])[1] || 40) / 100);
  const yr3 = (tv * (ramp.erp[2] || 100) / 100) + (agTot * ((ramp.agent || [])[2] || 100) / 100);

  // Three phase cards
  const phases = [
    {
      phase: "Phase 1: Design", timeline: "Weeks 1-4", color: GOLD,
      items: [
        `Validate benchmarks with ${coName} process owners`,
        `Map ${nProcs} priority processes to S/4HANA`,
        `Define data migration scope`,
        `Finalize implementation roadmap`,
      ]
    },
    {
      phase: "Phase 2: Build", timeline: "Weeks 4-10", color: "4A90D9",
      items: [
        `Configure S/4HANA for priority processes`,
        topLabels.length > 0 ? `Key: ${topLabels.slice(0, 2).join(", ")}` : `Configure top processes`,
        `Integration testing and UAT`,
        agTot > 0 ? `Deploy AI agent pilots` : `Train end users`,
      ]
    },
    {
      phase: "Phase 3: Realize", timeline: "Weeks 10-16", color: GREEN,
      items: [
        `Go-live and hypercare`,
        `Measure against baseline KPIs`,
        `Track value realization weekly`,
        `Year 1 target: ${fmtD(yr1)} for ${coName}`,
      ]
    },
  ];

  const cardW = 2.8, gap = 0.3;
  phases.forEach((ph, i) => {
    const cx = 0.5 + i * (cardW + gap);
    const cy = 1.1, ch = 3.2;

    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cardW, h: ch, fill: { color: "142236" }, rectRadius: 0.1, line: { color: "1E3350", width: 0.5 } });

    // Phase badge
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: cx + 0.12, y: cy + 0.12, w: 1.8, h: 0.3, fill: { color: ph.color }, rectRadius: 0.05 });
    s.addText(ph.phase, { x: cx + 0.12, y: cy + 0.12, w: 1.8, h: 0.3, fontSize: 9, fontFace: FONT, color: ph.color === GOLD ? NAVY : "FFFFFF", bold: true, align: "center" });

    // Timeline
    s.addText(ph.timeline, { x: cx + 2.0, y: cy + 0.12, w: 0.7, h: 0.3, fontSize: 8, fontFace: FONT, color: "8899AA", align: "right" });

    // Items
    ph.items.forEach((item, j) => {
      s.addText(`${item}`, { x: cx + 0.15, y: cy + 0.6 + j * 0.55, w: cardW - 0.3, h: 0.5, fontSize: 9, fontFace: FONT, color: "B0BEC5", lineSpacingMultiple: 1.3 });
    });
  });

  // Year targets bar
  s.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 4.45, w: 10, h: 1.0, fill: { color: "0A1520" } });

  const yearCards = [
    { label: `Year 1 (${coName})`, value: fmtD(yr1), pct: `${ramp.erp[0] || 30}% ERP ramp` },
    { label: `Year 2 (${coName})`, value: fmtD(yr2), pct: `${ramp.erp[1] || 70}% ERP + AI pilots` },
    { label: `Year 3 Cumulative`, value: fmtD(yr3), pct: `Full run-rate` },
  ];
  yearCards.forEach((yc, i) => {
    const yx = 0.5 + i * 3.2;
    s.addText(yc.label, { x: yx, y: 4.5, w: 2.8, h: 0.25, fontSize: 9, fontFace: FONT, color: "8899AA" });
    s.addText(yc.value, { x: yx, y: 4.75, w: 2.8, h: 0.35, fontSize: 22, fontFace: FONT, color: GOLD, bold: true });
    s.addText(yc.pct, { x: yx + 1.5, y: 4.78, w: 1.5, h: 0.25, fontSize: 8, fontFace: FONT, color: "667788" });
  });

  addFooter(s, true);
}

/* ─── Slide 6: Risks & Assumptions ─── */
function slideRisksAssumptions(pptx, data, params) {
  const { tv, agTot, scenarioLevel, coName } = data;
  const s = pptx.addSlide();
  s.background = { fill: WHITE_BG };

  s.addText("Risks & Assumptions", { x: 0.5, y: 0.35, w: 9, h: 0.5, fontSize: 28, fontFace: FONT, color: NAVY_TEXT, bold: true });
  s.addShape(pptx.shapes.RECTANGLE, { x: 0.5, y: 0.85, w: 1.2, h: 0.004, fill: { color: GOLD } });

  const multipliers = { High: 1.0, Medium: 0.65, Low: 0.35 };
  const combined = tv + agTot;
  const halfAdoptionValue = combined * 0.5;

  // Key assumptions
  const assumptions = [
    { title: "Addressable Gap", detail: "Default 80% of the benchmark gap is addressable through process and technology change. Structural, regulatory, and market constraints account for the remaining 20%." },
    { title: "Adoption Curve", detail: `${scenarioLevel} scenario assumes ${(multipliers[scenarioLevel] * 100).toFixed(0)}% of addressable gap is realized. Actual adoption depends on change management effectiveness, training quality, and executive sponsorship.` },
    { title: "Impl. Timeline", detail: "16-week timeline assumes dedicated project team, available SMEs, and no major scope changes. ERP configuration complexity may extend Phase 2." },
    { title: "Data Quality", detail: `Value calculations assume clean master data migration. Data quality issues in ${coName}'s source systems may require additional remediation effort.` },
    { title: "Change Management", detail: "Process redesign requires active change management. Role changes, retraining, and organizational alignment are critical success factors." },
  ];

  const startY = 1.15;
  assumptions.forEach((a, i) => {
    const ay = startY + i * 0.62;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: ay, w: 5.8, h: 0.55, fill: { color: "F9FAFB" }, rectRadius: 0.06, line: { color: GRAY_LIGHT, width: 0.5 } });
    s.addText(a.title, { x: 0.65, y: ay + 0.02, w: 1.5, h: 0.25, fontSize: 10, fontFace: FONT, color: NAVY_TEXT, bold: true });
    s.addText(a.detail, { x: 0.65, y: ay + 0.25, w: 5.5, h: 0.28, fontSize: 7.5, fontFace: FONT, color: GRAY, lineSpacingMultiple: 1.2 });
  });

  // What-if scenario card
  const wx = 6.6, wy = 1.15, ww = 3.0, wh = 3.7;
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: wx, y: wy, w: ww, h: wh, fill: { color: "FEF3C7" }, rectRadius: 0.08, line: { color: "F59E0B", width: 0.5 } });

  s.addText("What If?", { x: wx + 0.15, y: wy + 0.1, w: ww - 0.3, h: 0.35, fontSize: 14, fontFace: FONT, color: NAVY_TEXT, bold: true });
  s.addText("Sensitivity Analysis", { x: wx + 0.15, y: wy + 0.4, w: ww - 0.3, h: 0.25, fontSize: 9, fontFace: FONT, color: GRAY, italic: true });

  const scenarios = [
    { label: "Full potential (100%)", value: fmtD(combined / (multipliers[scenarioLevel] || 0.65)), color: GREEN },
    { label: `${scenarioLevel} scenario`, value: fmtD(combined), color: GOLD },
    { label: "50% adoption", value: fmtD(halfAdoptionValue), color: "DC2626" },
    { label: "30% adoption (floor)", value: fmtD(combined * 0.3), color: "DC2626" },
  ];

  scenarios.forEach((sc, i) => {
    const sy = wy + 0.8 + i * 0.6;
    s.addText(sc.label, { x: wx + 0.15, y: sy, w: ww - 0.3, h: 0.25, fontSize: 9, fontFace: FONT, color: GRAY });
    s.addText(sc.value, { x: wx + 0.15, y: sy + 0.22, w: ww - 0.3, h: 0.3, fontSize: 18, fontFace: FONT, color: sc.color, bold: true });
  });

  s.addText(`Even at 50% adoption, ${coName} captures ${fmtD(halfAdoptionValue)} annually.`, {
    x: 0.5, y: 4.5, w: 9, h: 0.3, fontSize: 10, fontFace: FONT, color: NAVY_TEXT, italic: true
  });

  addFooter(s, false);
}

/* ═══════════════════════════════════════════════════════
   PRECOMPUTE shared data
   ═══════════════════════════════════════════════════════ */
function precompute(params) {
  const { baseline, selProcs, valResult, procValues, procBenchmarks, agentResults, getQuartile, PROC_MAP, FUNCTIONS, selectedFunction, valueRealization, companyFinancials, multiYearRamp, assessmentProfile, censusData, scenarioLevel } = params;
  const imps = valResult.impacts.filter(i => i.value > 0);
  const { revImpact: rv, cogsImpact: cg, sgaImpact: sg } = valResult.pnl;
  const tv = valResult.total;
  const agTot = valResult.agentTotal || 0;
  const combined = valResult.combined || tv;
  const bsh = valResult.balanceSheet;
  const fnName = FUNCTIONS.find(f => f.id === selectedFunction)?.name || "Finance";
  const coName = assessmentProfile?.companyName || companyFinancials?.companyName || baseline?.company || "Company";

  // E2E aggregation
  const e2e = {};
  imps.forEach(imp => {
    if (!e2e[imp.e2e]) e2e[imp.e2e] = { procs: 0, value: 0 };
    e2e[imp.e2e].procs++;
    e2e[imp.e2e].value += imp.value;
  });

  return { imps, rv, cg, sg, tv, agTot, combined, bsh, fnName, e2e, valueRealization, companyFinancials, multiYearRamp, assessmentProfile, censusData, scenarioLevel: scenarioLevel || "Medium", coName };
}

/* ═══════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════ */
export function generateExecDeck(params) {
  const pptx = setupPptx();
  const data = precompute(params);

  slideCover(pptx, data, params);
  slideWhatWeFound(pptx, data, params);
  slideHowWeGotThere(pptx, data, params);
  slideWhatItTakes(pptx, data, params);
  slideTimeline(pptx, data, params);
  slideRisksAssumptions(pptx, data, params);

  pptx.writeFile({ fileName: data.coName.replace(/\s+/g, "_") + "_Value_Assessment.pptx" });
}

export function generateDetailedDeck(params) {
  generateExecDeck(params);
}

export default function generatePPTXv2(params) {
  generateExecDeck(params);
}
