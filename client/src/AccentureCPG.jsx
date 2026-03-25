import { useState } from "react";

const C = {
  bg: "#F5F0E8",
  surface: "#FDFAF5",
  surfaceAlt: "#EDE8DC",
  border: "#D4CCB8",
  text: "#0F0C08",
  textMuted: "#3A3228",
  textDim: "#6C6050",
  accent: "#8C6814",
  accentSoft: "#8C681416",
  accentBorder: "#8C681430",
  red: "#7A1C0C",
  redSoft: "#7A1C0C0E",
  redBorder: "#7A1C0C25",
  green: "#1E5C2E",
  greenSoft: "#1E5C2E0E",
  greenBorder: "#1E5C2E25",
  amber: "#7A4A08",
  amberSoft: "#7A4A080E",
  amberBorder: "#7A4A0825",
};

const Mono = ({ children, color, size = 9 }) => (
  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: size, color: color || C.textDim, letterSpacing: "0.08em" }}>{children}</span>
);

const Bullets = ({ items, color = C.text, dotColor = C.accent }) => (
  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", gap: 10, marginBottom: i < items.length - 1 ? 8 : 0, alignItems: "flex-start" }}>
        <span style={{ color: dotColor, fontSize: 14, lineHeight: "20px", flexShrink: 0 }}>·</span>
        <span style={{ fontSize: 13, color, lineHeight: 1.7 }}>{item}</span>
      </li>
    ))}
  </ul>
);

const SECTORS = [
  {
    id: "fb", name: "Food & Beverage", size: "$8.2T", tag: "VOLUME CRISIS", tagColor: C.red,
    tagTip: "Volume sold is declining even as prices remain high. Brands are selling less product, not less revenue — for now. The next phase will hit both.",
    hook: "Five consecutive quarters of volume decline. Price-led growth has reached its limit.",
    pattern: "GLP-1 adoption is permanently reshuffling the category — the brands that act now will own a new consumer segment by 2030. The ones that don't will enter it as followers.",
    hasAgent: true,
    struggle: {
      with: [
        "Private label now at 22.9% of US unit sales — consumers learned to buy store brand during COVID and haven't switched back",
        "Five straight quarters of volume decline across Frito-Lay, Quaker, beverages",
        "GLP-1 users (23% of US households) cutting grocery spend 31% and shifting away from snacks and sugary drinks",
        "Trade promotion spend of $200–300B annually with no real-time ROI visibility — brands find out if a promo worked 6–8 weeks after it ran",
      ],
      trying: [
        "Lowering prices ('surgical pricing') — this is admitting the problem, not solving it. You can't price your way out of a commodity perception",
        "Launching GLP-1-adjacent products with press releases but no commercial model — Pepsi's Propel GLP-1 drink announced but not yet integrated into the trade strategy",
        "Building demand forecasting AI — everyone has this. It optimizes existing spend, it doesn't fix the differentiation problem",
        "Reducing pack sizes to appear cheaper — this trains consumers to look for smaller packs, not to value the brand",
      ],
      should: [
        "Rebuild the trade promotion model from scratch — replace 6-week lag ROI analysis with an AI agent that reallocates spend in real time based on sell-through signals",
        "Treat GLP-1 as a portfolio strategy problem, not a marketing problem — map which SKUs win and lose as adoption doubles, then build the commercial execution plan",
        "Invest in brand differentiation that works at shelf in 3 seconds — functional benefits (protein, fiber, portion control) that private label cannot credibly claim",
        "Go after mid-tier F&B (Lamb Weston, TreeHouse, Post Holdings) — same structural pressure as PepsiCo, but no AI advisory relationship and faster decision cycles",
      ],
    },
    brand: {
      name: "PepsiCo", status: "UNDER PRESSURE", statusColor: C.red,
      title: "The reckoning after a decade of pricing power",
      summary: "PepsiCo is the most visible example of what happens when a brand overprices during COVID and then tries to walk it back. The response — 'surgical pricing,' smaller packs, GLP-1-adjacent products — signals awareness of the problem without a real commercial fix.",
      moves: [
        { l: "Acquired Poppi", t: "Prebiotic soda acquisition signals GLP-1-era consumer shift. Smart brand asset, but hasn't been integrated into the core trade and commercial model yet." },
        { l: "Shut two snack plants", t: "Volume has reset structurally. PepsiCo is rightsizing supply, not waiting for a demand recovery that isn't coming at the same pace." },
        { l: "Athina Kanioura (ex-Accenture)", t: "Chief Strategy & Transformation Officer. Compressed product dev from 9 months to 6 weeks via AI. The talent model is the Accenture playbook in action." },
      ],
      accentureAngle: "The TPO mandate is live. Athina Kanioura knows exactly what Accenture can do. The entry is a 6-week trade promotion diagnostic — the CFO sees projected uplift before you've asked for anything.",
    },
    situation: [
      { n: "5 qtrs", label: "Consecutive volume declines (NA)", note: "Frito-Lay NA −3%, Quaker −6% in a single quarter. The market recalibrating — not a cycle." },
      { n: "22.9%", label: "Private label US unit share", note: "$271B in sales. 80%+ of consumers rate store brand quality equal to branded. Brands created this." },
      { n: "31%", label: "GLP-1 grocery spend reduction", note: "23% of US households have a user. 35% of the category by 2030. The portfolio hasn't been rebuilt for this." },
      { n: "14%", label: "CPG companies that have scaled AI (all sectors)", note: "Cross-sector figure. 97% of CPG executives say AI will impact their market share. Only 14% have actually scaled it beyond a pilot. This applies across F&B, beauty, home care, OTC, pet care, and T&A equally." },
    ],
    pitches: [
      {
        title: "Trade Promotion Optimization",
        urgency: "NOW", value: "$200–400K pilot → $2–5M program",
        problem: "$200–300B in annual trade spend across CPG with 6–8 week ROI lag. By the time a brand knows a promotion failed, they've already committed to the next one.",
        solution: "AI Refinery RGM agent: real-time sell-through monitoring, elasticity modeling per SKU/retailer, autonomous reallocation recommendations. Proven at AB InBev and Mondelēz.",
        buyer: "CFO + Chief Commercial Officer",
        wedge: "6-week TPO diagnostic, fixed fee. CFO sees projected uplift before SOW is signed.",
        timeline: "6 weeks to pilot results · 6 months to full program",
      },
      {
        title: "GLP-1 Portfolio Analytics Sprint",
        urgency: "NOW", value: "$300–500K sprint → board mandate",
        problem: "Every major F&B company has announced awareness of GLP-1 impact. None have built the commercial model — which SKUs to defend, reposition, or retire, and in what sequence.",
        solution: "Household-level behavioral data analysis mapped to portfolio, retailer channel mix, and pricing architecture. Output: a board-ready portfolio decision framework with commercial execution plan.",
        buyer: "Chief Strategy Officer + CMO",
        wedge: "Board-level question already being asked. Come with the answer built.",
        timeline: "8–10 weeks to board-ready output",
      },
      {
        title: "AI-Native Commercial Operating Model",
        urgency: "12 MONTHS", value: "$5–15M transformation program",
        problem: "Most F&B brands have AI tools sitting alongside existing commercial processes. PepsiCo's model (Athina Kanioura, ex-Accenture) redesigned the process around AI — compressing product dev from 9 months to 6 weeks.",
        solution: "Full commercial org redesign: demand sensing, innovation pipeline, trade execution, and media allocation rebuilt from scratch for AI-first operation. Not AI added to existing workflows — workflows redesigned for AI.",
        buyer: "CEO + Chief Strategy Officer",
        wedge: "BEES as the proof case. Frame as: 'What BEES did for beer distribution, this does for your commercial model.'",
        timeline: "12–18 months to full deployment",
      },
    ],
    agent: {
      title: "TPO Agent — PepsiCo / Food & Beverage",
      sub: "Trade spend reallocation · Real-time optimization",
      inputs: [{ id: "brand", label: "Brand", val: "Frito-Lay" }, { id: "retailer", label: "Retailer", val: "Walmart US" }, { id: "budget", label: "Promo budget", val: "$4.2M Q2" }],
      steps: [
        { ms: 500, text: "Ingesting 14 weeks of sell-through data across 3,200 stores..." },
        { ms: 700, text: "Scanning competitive pricing signals (private label, Pringles)..." },
        { ms: 600, text: "Running elasticity model across 47 SKU–retailer combinations..." },
        { ms: 600, text: "Identifying 6 underperforming promotions consuming 31% of budget..." },
        { ms: 400, text: "Generating reallocation recommendations..." },
      ],
      headline: "3 promotions flagged for reallocation",
      delta: "+$1.2M projected uplift vs. current plan",
      rows: [
        { label: "Cut: Lay's Classic 20% off end-cap (SE)", value: "−$680K", color: C.red, note: "Elasticity 0.4 — price insensitive segment. Spend is wasted." },
        { label: "Reallocate: Baked Lay's in-store demo (Midwest)", value: "+$440K", color: C.green, note: "GLP-1 households 3.2x more responsive to better-for-you positioning." },
        { label: "Reallocate: Multi-pack digital shelf (Northeast)", value: "+$240K", color: C.green, note: "Digital shelf velocity up 28%. Leverage the signal." },
        { label: "Hold: Doritos BOGO (Back-to-school)", value: "Maintain", color: C.amber, note: "1.8x baseline performance. Do not disrupt." },
      ],
      insight: "31% of budget is allocated to low-elasticity placements. The agent reallocates $920K toward GLP-1-sensitive segments — a signal the human planning team is not yet weighting in their models.",
      nextStep: "Propose a 6-week TPO diagnostic. Fixed scope. The CFO sees $1.2M in projected uplift before the SOW is signed. That is the opening.",
      ref: "Accenture AI Refinery RGM agent · AB InBev BEES ($52.5B GMV, 29 countries) · Mondelēz $1.2B transformation",
    },
  },
  {
    id: "beauty", name: "Beauty & Personal Care", size: "$640B", tag: "AI ARMS RACE", tagColor: "#6A3A8A",
    hook: "Accenture signed with Estée Lauder in November 2025. The mandate is live.",
    tagTip: "L'Oréal has spent 4 years building AI infrastructure. Everyone else is trying to catch up in 18 months. The brands that move now can close the gap. The ones that don't will be permanently behind.",
    pattern: "The brands winning in beauty are not the ones with the best formulations — they're the ones who know what to make before consumers ask for it. Trend intelligence is the new competitive moat.",
    hasAgent: true,
    struggle: {
      with: [
        "L'Oréal has a structural AI advantage: 2,000 tech experts, 800 data analysts, 500 AI patents, and TrendSpotter predicting demand 6–18 months ahead. Everyone else is reacting",
        "TikTok compressed innovation cycles — a SKU can go from zero to 1,000% demand in 72 hours. Traditional 18–24 month development pipelines can't respond",
        "Estée Lauder: three consecutive years of revenue decline, $974M in brand impairment charges, heavy travel retail exposure that didn't recover post-COVID",
        "GLP-1 creating new beauty categories ('Ozempic Face') before brands have products on shelf",
      ],
      trying: [
        "Investing in content AI (faster production, lower cost) — this is table stakes now, not differentiation",
        "Hiring tech executives — ELC hired its first-ever CDMO in 2025. The talent is right but the systems don't exist yet",
        "Partnering with every platform (Meta, Amazon, TikTok Shop, Google) — distribution is not the problem. Knowing what to make is the problem",
        "Running GenAI pilots — proof of concepts that haven't scaled into operating model changes",
      ],
      should: [
        "Build trend intelligence infrastructure that tells you what to produce before the market asks — L'Oréal's TrendSpotter is the benchmark, a productized version is the opportunity for mid-tier brands",
        "Use GenAI to compress the brief-to-launch pipeline from 18 months to 6 weeks — the brands that do this own TikTok-scale demand spikes",
        "For ELC specifically: extend the Accenture EBS deal from back-office efficiency into the commercial intelligence layer — that doubles the engagement",
        "Build the personalization infrastructure that makes ModiFace-scale conversion uplift (3x) accessible to brands without L'Oréal's tech org",
      ],
    },
    brand: {
      name: "Estée Lauder", status: "ACCENTURE ENGAGED", statusColor: C.green,
      title: "The largest beauty transformation in a generation — Accenture is inside",
      summary: "ELC signed a global Enterprise Business Services agreement with Accenture in November 2025 as part of Beauty Reimagined. Three years of decline, $974M in brand impairment charges, 7,000 job cuts. Now showing early results: 31% AI media ROI improvement in North America, first operating margin expansion expected in four years.",
      moves: [
        { l: "Accenture EBS deal (Nov 2025)", t: "Global Enterprise Business Services agreement to modernize operations and deploy AI across the business. Q2 FY2026 showing early traction." },
        { l: "31% AI media ROI improvement", t: "North American media campaigns showing 31% improvement in ROI from AI-driven optimization. First tangible commercial AI result." },
        { l: "Shopify + Adobe + Google partnerships", t: "Digital infrastructure rebuild: TOM FORD DTC store live UK Jan 2026, Adobe Firefly in creative workflows, Google Gemini powering Jo Malone AI Scent Advisor (Dec 2025)." },
      ],
      accentureAngle: "The EBS mandate is live. The next conversation is extending AI from back-office efficiency into commercial intelligence — trend prediction, content production, and personalization. That doubles the engagement.",
    },
    situation: [
      { n: "Nov 2025", label: "Accenture EBS agreement signed", note: "Global Enterprise Business Services deal. AI deployment across the full operating model. The mandate is real." },
      { n: "31%", label: "AI media ROI improvement (ELC)", note: "North American campaigns. First tangible commercial AI result from Beauty Reimagined strategy." },
      { n: "1B+", label: "L'Oréal ModiFace try-ons", note: "3x e-commerce conversion uplift. 2,000 tech experts. The gap ELC is trying to close." },
      { n: "3 yrs", label: "Consecutive ELC revenue decline", note: "$974M in brand impairment charges. 7,000 job cuts. The reset is real — and so is the opportunity." },
    ],
    pitches: [
      {
        title: "ELC Commercial Intelligence Layer",
        urgency: "NOW", value: "$3–8M program extension on existing EBS mandate",
        problem: "The Accenture EBS deal covers operational efficiency — back-office, processes, enterprise services. The commercial intelligence layer (trend prediction, content production at scale, personalization) is not yet in scope.",
        solution: "Extend the EBS engagement into commercial AI: TrendSpotter-equivalent built on ELC's data, GenAI content pipeline (Accenture Song), and hyper-personalization infrastructure. L'Oréal's model, built for ELC in 18 months.",
        buyer: "ELC CDMO (Aude Gandon, hired 2025)",
        wedge: "Existing Accenture relationship. This is an expansion conversation, not a pitch.",
        timeline: "60 days to scoping · 18 months to commercial deployment",
      },
      {
        title: "TrendSpotter Productization for Mid-Tier Beauty",
        urgency: "NOW", value: "$5–15M annual subscription per brand",
        problem: "L'Oréal's trend intelligence is a 4-year proprietary system. Mid-tier brands (Charlotte Tilbury, NARS, Drunk Elephant) face the same TikTok-speed demand cycles with none of the infrastructure.",
        solution: "Productized trend intelligence agent scanning 3,500+ sources with brand-specific signal filtering and portfolio gap mapping. Subscription model — not a project. First productized AI offering in beauty consulting.",
        buyer: "CMO at $500M–$3B beauty brand",
        wedge: "Run the trend agent simulation live. Show them two uncovered trends in their portfolio in 3 minutes.",
        timeline: "90 days to MVP · 6 months to subscription launch",
      },
      {
        title: "Shiseido JV Model — Replication",
        urgency: "HIGH PRIORITY", value: "$20–50M dedicated JV engagement",
        problem: "Project-based consulting in beauty produces low trust, high turnover, and mediocre outcomes. The Shiseido JV (250 people, 3 design awards) produced category-leading results because it was a dedicated team, not a consulting engagement.",
        solution: "Pitch a beauty brand on a dedicated interactive agency JV — shared team, shared P&L accountability, multi-year. Beauty Key app and Shiseido DX transformation as the reference cases.",
        buyer: "CEO + CMO of a major beauty group",
        wedge: "Shiseido JV as the proof case. 'We don't want to consult you on your digital transformation. We want to build it with you.'",
        timeline: "6–12 months to JV structure · 3-year engagement",
      },
    ],
    agent: {
      title: "Trend Agent — Estée Lauder / Beauty",
      sub: "Consumer signal detection · Portfolio gap analysis",
      inputs: [{ id: "brand", label: "Brand", val: "Estée Lauder" }, { id: "cat", label: "Category", val: "Skin care — serums" }, { id: "window", label: "Horizon", val: "90-day forward" }],
      steps: [
        { ms: 500, text: "Scanning 3,500+ sources (TikTok, Reddit, clinical journals, search)..." },
        { ms: 700, text: "Cross-referencing historical trend-to-sales conversion patterns..." },
        { ms: 600, text: "Filtering for serum-adjacent consumer behavior signals..." },
        { ms: 600, text: "Running velocity scoring on 12 emerging micro-trends..." },
        { ms: 400, text: "Mapping against ELC current SKU portfolio..." },
      ],
      headline: "2 high-velocity trends with zero ELC coverage",
      delta: "~$340M estimated addressable demand, next 12 months",
      rows: [
        { label: "Barrier repair for GLP-1 skin", value: "Velocity 9.2/10", color: C.red, note: "4.1M TikTok mentions in 8 weeks. Skin barrier disruption from rapid weight loss. Zero ELC SKU positioned here." },
        { label: "Peptide stacking protocols", value: "Velocity 8.1/10", color: C.amber, note: "340% YoY search growth. ELC has peptides — no 'stacking' positioning. $180M opportunity, no new R&D required." },
        { label: "Facial volume support post-GLP-1", value: "Velocity 6.8/10", color: C.green, note: "'Ozempic Face' forming now. 6–9 month window before category crowded." },
        { label: "Glass skin aesthetic", value: "Velocity 4.2/10", color: C.textDim, note: "Already mainstream. Late entry finds crowded shelf. Do not invest." },
      ],
      insight: "ELC has the formulations. The gap is positioning and timing. The trend agent identifies a $180M repositioning opportunity in peptide stacking that requires no new product development — just messaging and digital shelf strategy.",
      nextStep: "Take this output to the ELC CDMO team. The conversation: 'We have the EBS mandate. This is what the commercial intelligence layer looks like on top of it.' That is the program extension.",
      ref: "Accenture × ELC EBS agreement (Nov 2025) · Noli AI (L'Oréal) · Accenture Song · Microsoft Copilot integration",
    },
  },
  {
    id: "health", name: "Health & Wellness OTC", size: "$193B", tag: "GREENFIELD", tagColor: C.green,
    hook: "Three post-spinoff companies. No incumbent at two of them. The clearest live opportunity in CPG.",
    tagTip: "Greenfield means no legacy infrastructure, no incumbent consultant, no existing AI architecture. All three companies are building from scratch — which is rare and valuable.",
    pattern: "Post-spinoff companies make decisions fast and need a transformation story quickly. Opella (PE-backed) has a 4-year exit deadline. That urgency creates a consulting window that won't stay open.",
    hasAgent: true,
    struggle: {
      with: [
        "All three companies (Haleon, Kenvue, Opella) were built inside pharma — pharma-grade compliance, pharma-grade data, pharma-grade everything. None of it scales to consumer health",
        "Haleon's own CDO said it publicly: 'the pedigree may not have been data.' Building consumer health AI on pharma infrastructure is like building a sports car on a truck chassis",
        "Kenvue signed a $750M+ Microsoft Azure deal — but is explicitly 'in the early days.' The money is committed. The implementation hasn't started",
        "Opella needs to tell a transformation story to CD&R for their exit in 4–5 years — they don't have one yet",
      ],
      trying: [
        "Hiring digital talent from pharma — this perpetuates the same culture and toolsets that created the infrastructure gap",
        "Running Azure pilots (Kenvue) without a commercial operating model to plug them into — technology without organizational architecture delivers nothing",
        "Trying to build NRM capability from scratch — Haleon is doing this now. It takes 18–24 months unassisted. With the right partner, 90 days to a working model",
        "Treating the transformation as an IT project — it's a commercial architecture problem that happens to have a technology component",
      ],
      should: [
        "Go to Opella first via the CD&R operating partner — PE urgency means 30-day decisions, not 18-month RFPs. Come in with the exit narrative built",
        "For Haleon: pitch the org design before the technology. The 6-unit restructuring needs a new commercial architecture. Most firms pitch the tech. The firm that wins owns the org design",
        "For Kenvue: don't pitch Azure help. Pitch the commercial capability that makes the Azure investment pay off. That's a different buyer and a different budget",
        "Use QuantHealth (Accenture portfolio, 86% accuracy across 350M patient records) as the door-opener — no competitor has this Rx-to-OTC proof point",
      ],
    },
    brand: {
      name: "Haleon", status: "MID-TRANSFORMATION", statusColor: C.amber,
      title: "The world's largest standalone consumer health company — building from scratch",
      summary: "Spun off from GSK in July 2022. Three years later, Haleon is restructuring again — moving from 3 geography-based P&Ls to 6 consumer-behavior-based operating units in February 2026, with NRM and pricing AI explicitly named as strategic enablers.",
      moves: [
        { l: "6-unit restructuring (Feb 2026)", t: "From 3 regions to 6 consumer-behavior-based units. Category-led, AI explicitly called out. £175–200M in gross savings targeted." },
        { l: "NRM AI as strategic priority", t: "Net Revenue Management AI named in the restructuring announcement. The system is being built. No incumbent has the implementation mandate." },
        { l: "GLP-1 portfolio repositioning", t: "Actively repositioning TUMS, Benefiber, Biotene, Centrum for GLP-1 users experiencing digestive disruption. Board-level priority." },
      ],
      accentureAngle: "The org redesign creates the mandate. 6 units with different data models need a unified commercial AI architecture. Pitch the org design first — that's the 3-year engagement. NRM AI is the wedge.",
    },
    situation: [
      { n: "3 → 6", label: "Haleon operating unit restructure (Feb 2026)", note: "Geography-based to consumer-behavior-based. NRM and pricing AI named as priorities. No incumbent on the implementation." },
      { n: "€16B", label: "Opella enterprise value (CD&R-backed)", note: "PE timeline = fast decisions. No incumbent. 4–5 year exit. Fastest entry in the sector." },
      { n: "$750M+", label: "Kenvue Azure savings, unrealized", note: "5-year Microsoft deal, April 2025. Explicitly 'in the early days.' The overlay hasn't started." },
      { n: "86%", label: "QuantHealth prediction accuracy", note: "350M patient records. Accenture portfolio investment. No competitor has this Rx-to-OTC proof point." },
    ],
    pitches: [
      {
        title: "Opella — PE Exit Transformation Program",
        urgency: "NOW", value: "$3–8M program · 18-month engagement",
        problem: "CD&R acquired Opella at €16B and needs a transformation narrative for their exit deck in 4–5 years. Opella is still running on Sanofi legacy infrastructure with no standalone AI commercial architecture.",
        solution: "90-day commercial AI sprint: standalone data architecture, NRM AI deployment, GLP-1 portfolio mapping. Deliverable: a transformation story CD&R can put in front of LPs. Technology follows the narrative.",
        buyer: "Opella CEO/CFO via CD&R operating partner",
        wedge: "PE exit narrative. 'We build the transformation story for the exit deck, starting with a 90-day commercial AI sprint.'",
        timeline: "30 days to SOW · 90-day first sprint · 18-month program",
      },
      {
        title: "Haleon 6-Unit Commercial Architecture",
        urgency: "NOW", value: "$5–12M program · 2-year engagement",
        problem: "Haleon restructured from 3 regions to 6 consumer-behavior-based operating units in February 2026. NRM and pricing AI named as strategic priorities. 6 units with different data models need a unified commercial AI architecture.",
        solution: "Org design first, technology second. New commercial operating model for 6 units, unified NRM AI agent across all units, GLP-1 portfolio repositioning plan for TUMS/Benefiber/Centrum. Pitch the architecture, not the tools.",
        buyer: "Haleon Chief Commercial Officer + CFO",
        wedge: "The restructuring created the mandate. Show the gap analysis — 6 units with no unified data layer is a known problem they haven't solved.",
        timeline: "90-day NRM readiness sprint · 24-month transformation",
      },
      {
        title: "Kenvue Azure Commercial Overlay",
        urgency: "HIGH PRIORITY", value: "$4–10M · Multi-year",
        problem: "$750M+ in potential Azure AI savings sits unrealized. Microsoft will try to pull implementation into its own partner ecosystem. The Accenture opportunity is the commercial capability layer, not the Azure infrastructure.",
        solution: "Commercial operating model that makes the Azure investment pay off — AI-driven demand sensing, NRM, and supply chain optimization built on the Kenvue Azure foundation. Different buyer than IT. Different budget.",
        buyer: "Kenvue Chief Commercial Officer (not CTO)",
        wedge: "QuantHealth Rx-to-OTC proof point. 'We have the clinical AI proof case no Microsoft partner can match.'",
        timeline: "60 days to scoping · 18 months to deployment",
      },
    ],
    agent: {
      title: "Post-Spinoff Readiness Agent — Haleon",
      sub: "6-unit architecture gap analysis · NRM AI readiness",
      inputs: [{ id: "co", label: "Company", val: "Haleon" }, { id: "units", label: "Operating units", val: "6 (Feb 2026)" }, { id: "focus", label: "Focus", val: "NRM AI deployment" }],
      steps: [
        { ms: 600, text: "Mapping commercial data architecture across 6 new operating units..." },
        { ms: 700, text: "Benchmarking NRM maturity vs. Kenvue and Opella post-separation..." },
        { ms: 600, text: "Running cross-unit coordination requirement analysis..." },
        { ms: 500, text: "Identifying AI deployment gaps for NRM and pricing..." },
        { ms: 400, text: "Generating phased implementation roadmap..." },
      ],
      headline: "3 critical gaps in the new 6-unit commercial architecture",
      delta: "NRM AI across 6 units: £80–120M annual margin improvement potential",
      rows: [
        { label: "No unified commercial data layer across 6 units", value: "CRITICAL", color: C.red, note: "Each unit on separate infrastructure from the 3-region model. NRM AI requires a unified foundation." },
        { label: "NRM pricing function not yet centralized", value: "HIGH PRIORITY", color: C.amber, note: "Named as a priority in Feb 2026 restructuring. System being built. Implementation mandate is open." },
        { label: "GLP-1 portfolio repositioning not yet quantified", value: "MEDIUM", color: C.amber, note: "TUMS, Benefiber, Centrum adjacency identified. Commercial modeling not done. Window is Q3 2026." },
        { label: "Market share momentum", value: "STRONG", color: C.green, note: "71% of portfolio gained or held share FY2024. The brands are healthy. The infrastructure is the gap." },
      ],
      insight: "Haleon's restructuring created the mandate. Six operating units with different data models and commercial rhythms need an AI architecture that works across all of them. That is the program — not a NRM pilot, a commercial transformation.",
      nextStep: "Approach Haleon's Chief Commercial Officer with a 90-day NRM readiness sprint. Show the gap analysis. The ask is the implementation design for the 6-unit architecture — that is a 2-year engagement with a clear start.",
      ref: "Accenture QuantHealth (86% accuracy, 350M patient records) · Haleon FY2025 results · CD&R Opella acquisition Oct 2024",
    },
  },
  {
    id: "homecare", name: "Home Care & Cleaning", size: "$265B", tag: "RESTRUCTURING", tagColor: C.amber,
    hook: "P&G has a 5-year AI lead. EU DPP by 2027 creates the forcing function for everyone else.",
    tagTip: "Major players are divesting non-core units and merging divisions. The consolidation creates integration pressure — and open AI roadmaps — at exactly the moment a regulatory deadline forces infrastructure investment.",
    pattern: "EU Digital Product Passport (2027) is forcing every home care brand to build data infrastructure they don't have. The firms that architect it now get compliance for free — and a supplier intelligence moat.",
    hasAgent: false,
    struggle: {
      with: [
        "P&G's AI Factory is structural, not tactical: $1.5B annual productivity target, $65M+ in autonomous media buying in fabric care alone. The gap compounds every quarter",
        "Private label at 29% North America share and growing — the COVID hygiene premium is gone, and formulation alone no longer differentiates",
        "EU Digital Product Passport mandatory by 2027 — full ingredient provenance, carbon footprint, recyclability for every SKU. Most companies lack the data infrastructure",
        "Reckitt and Henkel both mid-transformation (divestiture + merger) with integration pressure and no AI roadmap",
      ],
      trying: [
        "Sustainability messaging and ESG positioning — this addresses consumer perception, not the cost and data architecture gap that P&G has built",
        "Henkel's Smartwash is the right instinct (product-to-platform) but the agent layer that makes it a subscription platform doesn't exist yet",
        "Incremental supply chain digitization — point solutions that don't add up to a connected data architecture",
        "Cost-cutting without reinvestment — Reckitt's Essential Home divestiture buys time but doesn't solve the AI Factory gap",
      ],
      should: [
        "Architect EU DPP compliance now — it forces the data infrastructure investment that is also the foundation for supply chain intelligence and the Smartwash platform layer",
        "For Henkel: pitch the platform architecture for Smartwash — the IoT data layer, the agent that monitors usage and predicts refills, the subscription model. That's a 3-year partnership, not a project",
        "For Reckitt post-Advent: the integration creates an AI roadmap vacuum. Fill it in the next 6 months before someone else does",
        "Go to mid-tier home care brands (Seventh Generation, Method) — same P&G gap problem, faster decision cycle, no incumbent",
      ],
    },
    brand: {
      name: "Henkel", status: "PLATFORM SHIFT", statusColor: C.amber,
      title: "A CES 2025 bet that signals where the whole category is going",
      summary: "Henkel unveiled Smartwash at CES 2025 — an AI-driven connected washing device with 300 quadrillion dosing configurations and 57% greater stain removal. Simultaneously merged Home Care and Beauty Care divisions. This is a structural bet on shared data infrastructure across both categories. The device is live. The platform layer doesn't exist yet.",
      moves: [
        { l: "Smartwash (CES 2025)", t: "Connected device. AI-driven dosing. 57% greater stain removal. The signal: Henkel is betting the category moves from products to platforms." },
        { l: "Home Care + Beauty merger", t: "Combined under shared leadership and data infrastructure. Consumer insights and innovation R&D now span both categories." },
        { l: "EU DPP preparation", t: "2027 deadline for full ingredient traceability. Henkel has partially digitized but is not on track for full compliance without a major infrastructure build." },
      ],
      accentureAngle: "Smartwash platform architecture is a 3-year partnership. Accenture builds the IoT data layer, the agent that monitors usage patterns, and the subscription model. EU DPP is the entry wedge — it forces the infrastructure investment that makes Smartwash a platform.",
    },
    situation: [
      { n: "CES 2025", label: "Smartwash — product-to-platform signal", note: "57% greater stain removal. AI-driven connected device. The category shift from products to platforms has begun." },
      { n: "2027", label: "EU Digital Product Passport mandatory", note: "Full ingredient provenance, carbon footprint, recyclability per SKU. Most companies lack the data infrastructure to comply." },
      { n: "23.7%", label: "P&G operating margin", note: "vs. competitors at ~14%. That gap is the AI Factory — $1.5B annual target, $65M+ autonomous media buying in fabric care." },
      { n: "$4.8B", label: "Reckitt Essential Home sold (July 2025)", note: "Sold to Advent International. Category consolidating. Mid-transformation companies have an open AI roadmap." },
    ],
    pitches: [
      {
        title: "EU DPP Compliance Architecture",
        urgency: "NOW", value: "$1–3M assessment → $5–10M build",
        problem: "EU Digital Product Passport is mandatory by 2027. Full ingredient provenance, carbon footprint, recyclability for every EU SKU. Most home care companies are 67%+ short on required data fields. Non-compliance risks EU market access.",
        solution: "DPP readiness assessment (4 weeks) → full compliance architecture build (18 months). Supply chain data layer, SAP integration, blockchain-backed ingredient traceability. Brands that build by end of 2025 get compliance for free plus a supplier intelligence moat.",
        buyer: "Head of Supply Chain + Chief Sustainability Officer",
        wedge: "2027 deadline creates urgency without selling transformation. Compliance is the entry. Platform moat is the prize.",
        timeline: "4-week assessment · 18-month build · 2027 compliance",
      },
      {
        title: "Smartwash Platform Architecture — Henkel",
        urgency: "HIGH PRIORITY", value: "$8–20M platform partnership",
        problem: "Henkel's Smartwash device is the right bet — product to platform. The IoT data layer, subscription model, and agent that monitors usage patterns and predicts refills doesn't exist yet.",
        solution: "Platform architecture partnership: IoT data layer, usage monitoring agent, subscription billing infrastructure, and the connected device analytics that turns Smartwash from a product into a platform. 3-year engagement minimum.",
        buyer: "Henkel Head of Digital + Chief Product Officer",
        wedge: "EU DPP assessment is the entry. Smartwash platform architecture is what you propose at week 4.",
        timeline: "DPP assessment as entry · 3-year platform partnership",
      },
      {
        title: "Mid-Tier AI Factory Replication",
        urgency: "HIGH PRIORITY", value: "$5–15M transformation",
        problem: "P&G's AI Factory ($1.5B annual productivity savings) is not accessible to mid-tier home care brands. But Accenture built it — the model is productizable for companies at $1–5B revenue facing the same P&G margin gap.",
        solution: "AI Factory for mid-tier: demand sensing, autonomous media buying, supply chain agent layer. Not the full P&G program — the 70% that applies to brands at a quarter of P&G's scale. Reckitt post-Advent and Henkel post-merger are the targets.",
        buyer: "CFO + Chief Supply Chain Officer",
        wedge: "P&G AI Factory outcomes as benchmarks. 'Here's what the gap costs you annually. Here's what it takes to close it.'",
        timeline: "90-day proof of concept · 18-month deployment",
      },
    ],
  },
  {
    id: "pet", name: "Pet Care", size: "$320B", tag: "PREMIUMIZATION", tagColor: "#2A5A8A",
    hook: "Mars Petcare is a $20B company building a pet health data ecosystem with no consulting relationship.",
    tagTip: "Pet care is the only CPG category that grew through both the 2008 recession and COVID. Owners treat pets as family members — the category is price inelastic at the premium tier and structurally growing.",
    pattern: "The category is moving from products to platforms. Whoever connects the vet consultation, the wearable device data, and the nutrition recommendation engine will own the most defensible channel in pet care.",
    hasAgent: false,
    struggle: {
      with: [
        "DTC brands (The Farmer's Dog, Ollie) own the longitudinal data — every meal eaten, every health outcome, every owner behavior. Mars knows what's on the Walmart shelf. That data gap is the competitive gap",
        "The vet channel is the most trusted recommendation in pet care, and it's completely underdigitized — no AI in the consultation flow, no connected nutrition recommendation",
        "Pet insurance penetration growing fast — health outcomes data will become traceable and monetizable. The ecosystem is forming now. Nobody is building the platform layer",
        "Wearable pet health data (Whistle, Fi) exists but isn't connected to nutrition recommendations",
      ],
      trying: [
        "Mars's Kinship platform is the right architecture — but it's built as an ecosystem without an agentic layer that makes it self-improving and sticky",
        "DTC brands scaling fast but running on venture money without enterprise infrastructure — they'll need a transformation partner in 3–5 years",
        "Premium nutrition launches (Royal Canin breed-specific) without the vet recommendation engine that makes them defensible",
        "Sustainability certifications without the data infrastructure to back them up — same DPP problem as home care",
      ],
      should: [
        "Build the vet channel AI integration — an agent that surfaces breed-specific nutrition guidance during the consultation. Whoever owns this owns the category",
        "Connect wearable health data to nutrition formulation — Whistle + Royal Canin formulation database. First mover owns precision pet health",
        "Build the relationship with Mars Petcare's CDO now — this is an 18-month relationship play. The entry is the Kinship platform architecture conversation, not a cold pitch",
        "Watch The Farmer's Dog — at $1B+ revenue they'll need enterprise infrastructure in 3 years. Build the relationship before they hire a transformation VP from McKinsey",
      ],
    },
    brand: {
      name: "Mars Petcare", status: "PLATFORM BUILDING", statusColor: "#2A5A8A",
      title: "Building a pet health data ecosystem — the Kinship platform",
      summary: "Mars Petcare (~$20B+) is no longer positioning itself as a pet food company. Kinship is their bet that whoever owns the data relationship with the pet owner and the veterinarian owns the category — not whoever makes the best kibble. The platform is built. The agent layer is missing.",
      moves: [
        { l: "Kinship platform", t: "Pet health ecosystem connecting owners, vets, and Mars brands through data. Built internally. External partner needed for the agent layer and vet channel integration." },
        { l: "Royal Canin precision nutrition", t: "Breed-specific, life-stage-specific, health-condition-specific formulations. AI drives the formulation engine. The bet: nutrition becomes prescription." },
        { l: "DTC competitive response", t: "Kinship is Mars's answer to The Farmer's Dog longitudinal data advantage — without building a DTC business from scratch." },
      ],
      accentureAngle: "Mars is insular — they distrust consultants. The entry requires a warm introduction to the CDO. The conversation: 'Kinship is the right architecture. We build the agent layer that connects the vet data and the wearable signals into a defensible moat.'",
    },
    situation: [
      { n: "$20B+", label: "Mars Petcare revenue", note: "Nestlé Purina ~$18B. Both investing in AI-driven precision nutrition. Underserved consulting market." },
      { n: "Recession-proof", label: "Category resilience", note: "Grew through 2008 and COVID. Owners cut their own food budget before their dog's prescription diet." },
      { n: "Kinship", label: "Mars pet health data platform", note: "Connecting owners, vets, and brands through data. Built internally. External agent layer partnership is the open opportunity." },
      { n: "$1B+", label: "The Farmer's Dog revenue", note: "DTC competitor with complete longitudinal data. Mars knows the shelf. Farmer's Dog knows every meal eaten." },
    ],
    pitches: [
      {
        title: "Mars Kinship — Agentic Layer Partnership",
        urgency: "BUILD NOW", value: "$10–25M platform partnership",
        problem: "Mars built the Kinship pet health ecosystem — connecting owners, vets, and brands through data. The platform exists. The agent layer that makes it self-improving (vet recommendation agent, wearable-to-nutrition feedback loop) doesn't.",
        solution: "Agentic layer on top of the Kinship infrastructure: vet consultation AI agent, wearable device data integration (Whistle/Fi), personalized nutrition recommendation engine. Position as platform strategy, not consulting.",
        buyer: "Mars Petcare Chief Data Officer (warm intro required)",
        wedge: "Kinship architecture conversation: 'We build the agent layer on infrastructure you've already paid for.'",
        timeline: "18 months to get in the room · 3-year platform partnership",
      },
      {
        title: "Vet Channel AI Integration — Hill's / Royal Canin",
        urgency: "BUILD NOW", value: "$5–12M channel transformation",
        problem: "Hill's and Royal Canin built their moats through veterinarian relationships. Those relationships are analog — no AI in the consultation flow, no connected nutrition recommendation engine at point of care.",
        solution: "AI clinical decision support for veterinarians: agent that monitors patient records, identifies nutritional deficiency signals, and proactively recommends specific prescription diets during the appointment. Whoever owns this integration owns the vet channel.",
        buyer: "VP Digital / VP Marketing at Hill's or Royal Canin",
        wedge: "QuantHealth clinical AI proof point (86% accuracy, 350M records) — no competitor has a comparable clinical proof case.",
        timeline: "12 months to pilot · 24 months to full vet channel deployment",
      },
      {
        title: "DTC-to-Enterprise Transition — The Farmer's Dog",
        urgency: "WATCH", value: "$3–8M infrastructure program",
        problem: "The Farmer's Dog is at $1B+ revenue and growing. Venture-backed DTC infrastructure doesn't scale to enterprise — supply chain, inventory management, customer data architecture all need rebuilding.",
        solution: "Enterprise infrastructure transition: supply chain scale, customer data platform, and the AI recommendation layer that makes their longitudinal pet health data defensible as they scale beyond DTC into retail.",
        buyer: "CEO / CFO of The Farmer's Dog",
        wedge: "Build the relationship now. They'll need a transformation partner in 3 years. The firm that is already there wins.",
        timeline: "Relationship play now · Program in 2028–2029",
      },
    ],
  },
  {
    id: "ta", name: "Tobacco & Alcohol", size: "$1.55T", tag: "STRUCTURAL DECLINE", tagColor: C.red,
    hook: "PMI just hit $40B revenue with 41.5% from smoke-free. BEES ($52.5B GMV) proves agentic AI at scale. Accenture built both.",
    tagTip: "Alcohol and combustible tobacco are in permanent structural decline — driven by health awareness, GLP-1 drugs, and generational shift. This is not a cycle. It is a category transformation.",
    pattern: "The companies winning in this sector (PMI, AB InBev) are the ones that stopped defending the old model and built entirely new ones. PMI invested $12.5B over 10 years. BEES took 5 years to build. Neither is a quick fix.",
    hasAgent: true,
    struggle: {
      with: [
        "US drinking rate at 54% in 2025, down from 67% in 2022 — GLP-1 reduces alcohol cravings by >65%. This is demographic and health-driven structural decline, not a cycle",
        "Bud Light still 40% below pre-boycott levels after 3 years — nobody had real-time brand sentiment intelligence when they needed it",
        "PMI has 43 million IQOS users generating longitudinal behavioral data across 106 markets — and no analytics infrastructure to monetize it",
        "BEES is proven in beer ($52.5B GMV). It is not proven in spirits. Premium spirits route-to-market is fragmented, relationship-driven, and not standardized enough for full automation",
      ],
      trying: [
        "Every firm is pitching PMI and BAT on sustainability and ESG strategy — this is not the problem PMI needs solved",
        "AB InBev is trying to apply the BEES model to spirits distribution — this won't work directly because spirits lacks the operational standardization that made BEES possible in beer",
        "Alcohol brands launching non-alcoholic variants without a formulation or go-to-market strategy — 175% volume growth in NA since 2019 is being taken by startups, not incumbents",
        "Brand recovery campaigns for Bud Light — you can't spend your way out of a trust problem in the social media era",
      ],
      should: [
        "For PMI: build the analytics and personalization layer for 43M IQOS users — health signals, usage patterns, retention interventions. Not ESG. Not sustainability. Data infrastructure",
        "For spirits: start BEES adaptation with a distributor relationship agent — monitor account performance, surface sales plays to reps. Build the standardization first, automation second",
        "For alcohol brands: build real-time brand sentiment monitoring — the Bud Light lesson is 72 hours of lead time vs. 72 hours of lag time. Every major brand needs this, none have it",
        "NA beverage strategy: the $30B+ opportunity is being taken by startups. Incumbents need formulation capability and a DTC data model. Neither comes from the current organization",
      ],
    },
    brand: {
      name: "Philip Morris International", status: "TRANSFORMATION COMPLETE", statusColor: C.green,
      title: "The most dramatic revenue mix transformation in any consumer company, ever",
      summary: "PMI reported FY2025 in February 2026: $40B+ in total net revenues, with $16.9B (41.5%) from smoke-free products that didn't exist 10 years ago. Three of four global regions are now majority smoke-free by net revenue. The transformation is structurally complete. The next mandate is monetizing 43M connected device users.",
      moves: [
        { l: "IQOS 76% heat-not-burn share", t: "106 markets. 43M+ consumers. $12.5B invested since 2008. The device generates real-time behavioral data — usage patterns, session frequency, device health — that isn't yet fully monetized." },
        { l: "ZYN +37% US growth", t: "Nicotine pouches growing 37% in US. More than doubled in international markets. A third product category scaling alongside IQOS." },
        { l: "41.5% smoke-free revenue", t: "Up from effectively zero in 2015. 27 markets exceeded 50% smoke-free net revenue milestone in 2025. The category shift is structural and irreversible." },
      ],
      accentureAngle: "43M users generating longitudinal device usage data across 106 markets. PMI has the infrastructure. The analytics, personalization, and engagement layer that monetizes that data is underdeveloped. That is a defined problem with a defined solution — and it's not what any other firm is pitching.",
    },
    situation: [
      { n: "41.5%", label: "PMI revenue from smoke-free (FY2025)", note: "$16.9B of $40B+. Three of four regions now majority smoke-free. 43M+ consumers, 106 markets, 76% global heat-not-burn share." },
      { n: "54%", label: "US drinking rate (2025)", note: "Down from 67% in 2022. Surgeon General declared alcohol a leading cause of preventable cancer. GLP-1 reduces cravings >65%." },
      { n: "$52.5B", label: "BEES GMV — Accenture-built", note: "75% of AB InBev orders auto-generated, 29 countries. The most important agentic AI proof case in all of CPG." },
      { n: "40%", label: "Bud Light still below pre-boycott", note: "3 years later. 1.2 ppts recovered. Real-time brand sentiment intelligence: nobody had it when they needed it." },
    ],
    pitches: [
      {
        title: "PMI IQOS Data Ecosystem",
        urgency: "NOW", value: "$8–20M multi-year program",
        problem: "PMI has 43 million IQOS users generating longitudinal device usage data across 106 markets. Health signals, usage patterns, device performance. No analytics infrastructure to monetize it. Every firm is pitching PMI on ESG — nobody is pitching the data problem.",
        solution: "Data architecture and personalized engagement infrastructure for 43M connected device users: usage pattern analytics, at-risk user detection, personalized retention interventions, and market-by-market regulatory compliance monitoring. Not ESG. Data infrastructure.",
        buyer: "PMI Chief Digital Officer",
        wedge: "IQOS generates longitudinal consumer behavioral data unlike anything in traditional tobacco. Lead with: 'We build the analytics layer that turns that data into retention and competitive advantage.'",
        timeline: "90-day scoping · 18-month program · multi-year engagement",
      },
      {
        title: "BEES for Spirits — AB InBev / Diageo",
        urgency: "HIGH PRIORITY", value: "$5–15M adapted program",
        problem: "BEES is proven at $52.5B GMV in beer. Spirits distribution is fundamentally different — fragmented, relationship-driven, not standardized. The BEES model cannot be copied directly. But the distributor intelligence problem is identical.",
        solution: "Phase 1: distributor relationship agent — 1,400+ on-premise accounts monitored for performance signals, sales plays surfaced to reps automatically. Phase 2: route-to-market standardization. Phase 3: automated ordering when standardization is complete. The sequencing is the insight.",
        buyer: "Chief Commercial Officer at Diageo or Pernod Ricard",
        wedge: "BEES as the proof case. 'We built BEES. Here's why you can't copy it directly in spirits — and here's the path that does work.'",
        timeline: "6-month Phase 1 · 18-month program · full BEES adaptation at 36 months",
      },
      {
        title: "Brand Sentiment Intelligence Platform",
        urgency: "HIGH PRIORITY", value: "$2–5M annual product",
        problem: "Bud Light lost 40% of volume in weeks. Nobody detected the sentiment shift early enough to intervene. Three years later, only 1.2 percentage points recovered. Every major alcohol and tobacco brand carries the same risk — none have real-time brand sentiment intelligence.",
        solution: "Continuous brand sentiment monitoring agent: social listening, early warning system, crisis protocol triggers, and automated escalation. The pitch is not 'we'll predict the next crisis' — it's '72 hours of lead time instead of 72 hours of lag time.'",
        buyer: "CMO + Head of Risk at major alcohol brands",
        wedge: "Bud Light lesson is seared into every CMO in this category. 'Here's what it would have taken to detect that 72 hours earlier.'",
        timeline: "60-day build · annual subscription model",
      },
    ],
    agent: {
      title: "IQOS Engagement Agent — PMI",
      sub: "Connected device ecosystem · Consumer intelligence + retention",
      inputs: [{ id: "market", label: "Market", val: "IQOS — Europe + Japan" }, { id: "users", label: "User base", val: "43M+, 106 markets" }, { id: "focus", label: "Focus", val: "Retention + personalization" }],
      steps: [
        { ms: 500, text: "Mapping IQOS device usage data architecture across 106 markets..." },
        { ms: 700, text: "Analyzing behavioral signal patterns (session frequency, usage decline indicators)..." },
        { ms: 600, text: "Identifying at-risk user segments (declining usage = return to combustibles)..." },
        { ms: 500, text: "Generating personalized intervention architecture..." },
        { ms: 400, text: "Mapping regulatory compliance requirements per market..." },
      ],
      headline: "3 data monetization opportunities in the IQOS ecosystem",
      delta: "Retention agent: est. 2–4% reduction in user churn across 43M users",
      rows: [
        { label: "Proactive retention agent", value: "HIGH PRIORITY", color: C.green, note: "Monitor usage patterns. Detect declining usage (predictor of return to combustibles). Trigger personalized engagement autonomously." },
        { label: "Market personalization engine", value: "HIGH VALUE", color: C.green, note: "43M users across 106 markets. No unified personalization layer. Each market operating on separate logic." },
        { label: "Regulatory compliance monitoring agent", value: "CRITICAL", color: C.amber, note: "IQOS subject to different regulations in each of 106 markets. Agent that monitors changes and flags compliance implications in real time." },
        { label: "BEES spirits adaptation", value: "START WITH STEP 1", color: C.textDim, note: "BEES proven in beer. Spirits route-to-market is fragmented. Start with distributor relationship agent — not full automation." },
      ],
      insight: "PMI has the most sophisticated connected device ecosystem in any consumer company. 43M users generating behavioral data across 106 markets. The analytics and personalization layer that turns that data into revenue is underdeveloped. That is a specific, solvable problem.",
      nextStep: "Approach PMI's Chief Digital Officer with a data architecture proposal — not ESG, not sustainability, but the personalization and retention infrastructure for 43M connected device users. No other firm is pitching this.",
      ref: "PMI FY2025 Annual Results (Feb 2026, $40B revenue, 41.5% smoke-free) · BEES (Accenture-built, $52.5B GMV) · Diageo AI marketing £400M",
    },
  },
];

const GLOSSARY = [
  { term: "BEES", short: "AB InBev's AI order platform, built by Accenture — $52.5B GMV", detail: "Before BEES: a sales rep visited each distributor, took manual orders. Now an AI agent monitors inventory and demand signals and places the reorder itself. 75% of AB InBev's orders across 29 countries are auto-generated. The distributor who uses BEES for 2 years trains the model on their buying patterns — that behavioral data is the moat. Not IP, not brand. Behavioral data at scale." },
  { term: "GMV", short: "Gross Merchandise Value — total commerce a platform processes", detail: "The total dollar value of all transactions processed through a platform. BEES has $52.5B GMV — that's the value of beer orders the system managed annually. Not Accenture's revenue. The standard measure of platform scale." },
  { term: "Agentic AI", short: "AI that takes actions autonomously without human approval per step", detail: "The difference from a regular AI tool: an agent doesn't just answer questions, it decides what to do and does it. BEES is agentic — it places orders without a button press. A TPO agent monitors sell-through in real time, detects an underperforming promotion, and reallocates budget. While the marketing team is asleep." },
  { term: "GLP-1", short: "Weight-loss drugs (Ozempic, Wegovy) reshaping every CPG category", detail: "Used by 23% of US households. Users cut grocery spend 31%, eat smaller portions, and shift brand preferences dramatically. Every CPG category affected: snack foods (fewer impulse buys), beauty (skin changes from rapid weight loss), OTC health (digestive disruption), alcohol (cravings reduced >65%). Estimated to create a 60–140bps annual headwind to high-sugar and high-carb categories by 2027." },
  { term: "EU DPP", short: "EU Digital Product Passport — mandatory ingredient traceability by 2027", detail: "Full ingredient provenance, carbon footprint, and recyclability data required for every SKU sold in the EU. Mandatory by 2027. Most CPG companies lack the data infrastructure. Build now: compliance plus a data moat. Build in 2026: crisis rates, no moat." },
  { term: "NRM", short: "Net Revenue Management — AI-driven pricing and promotion optimization", detail: "The commercial discipline of optimizing price, promotion, pack size, and channel mix to protect margin. When Haleon says 'NRM AI,' they mean using AI to make these decisions faster and more precisely — agents that monitor performance signals in real time and recommend adjustments before the results have landed. Versus the current model: spreadsheets reviewed weekly." },
];

const SECTOR_ICONS = {
  fb: (color) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grocery shelf with declining bar chart */}
      <rect x="8" y="48" width="48" height="3" rx="1" fill={color} opacity="0.25"/>
      <rect x="8" y="30" width="8" height="18" rx="2" fill={color} opacity="0.7"/>
      <rect x="20" y="24" width="8" height="24" rx="2" fill={color} opacity="0.5"/>
      <rect x="32" y="18" width="8" height="30" rx="2" fill={color} opacity="0.4"/>
      <rect x="44" y="34" width="8" height="14" rx="2" fill={color} opacity="0.8"/>
      {/* Down arrow */}
      <path d="M50 12 L54 18 L46 18 Z" fill={color} opacity="0.9"/>
      <line x1="50" y1="6" x2="50" y2="17" stroke={color} strokeWidth="1.5" opacity="0.9"/>
    </svg>
  ),
  beauty: (color) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lipstick + sparkle */}
      <rect x="26" y="28" width="12" height="22" rx="2" fill={color} opacity="0.15" stroke={color} strokeWidth="1.2"/>
      <rect x="26" y="20" width="12" height="10" rx="1" fill={color} opacity="0.5"/>
      <path d="M26 20 Q32 14 38 20" fill={color} opacity="0.7"/>
      {/* Sparkles */}
      <line x1="14" y1="18" x2="14" y2="26" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <line x1="10" y1="22" x2="18" y2="22" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <line x1="46" y1="10" x2="46" y2="18" stroke={color} strokeWidth="1.2" opacity="0.4"/>
      <line x1="42" y1="14" x2="50" y2="14" stroke={color} strokeWidth="1.2" opacity="0.4"/>
      <circle cx="46" cy="14" r="1.5" fill={color} opacity="0.6"/>
      <circle cx="14" cy="22" r="1.5" fill={color} opacity="0.6"/>
      {/* AI scan lines */}
      <line x1="10" y1="44" x2="54" y2="44" stroke={color} strokeWidth="0.8" strokeDasharray="3 2" opacity="0.3"/>
      <line x1="10" y1="48" x2="54" y2="48" stroke={color} strokeWidth="0.8" strokeDasharray="3 2" opacity="0.2"/>
    </svg>
  ),
  health: (color) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Capsule pill */}
      <rect x="14" y="26" width="36" height="12" rx="6" fill={color} opacity="0.12" stroke={color} strokeWidth="1.2"/>
      <rect x="14" y="26" width="18" height="12" rx="6" fill={color} opacity="0.35"/>
      {/* Three company dots representing spinoffs */}
      <circle cx="20" cy="14" r="4" fill={color} opacity="0.7"/>
      <circle cx="32" cy="14" r="4" fill={color} opacity="0.5"/>
      <circle cx="44" cy="14" r="4" fill={color} opacity="0.35"/>
      <line x1="24" y1="14" x2="28" y2="14" stroke={color} strokeWidth="1" opacity="0.3"/>
      <line x1="36" y1="14" x2="40" y2="14" stroke={color} strokeWidth="1" opacity="0.3"/>
      {/* Arrow pointing right = opportunity */}
      <path d="M36 46 L44 50 L36 54" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      <line x1="20" y1="50" x2="43" y2="50" stroke={color} strokeWidth="1.5" opacity="0.6"/>
    </svg>
  ),
  homecare: (color) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cleaning bottle */}
      <path d="M24 20 L24 16 L30 12 L34 12 L40 16 L40 20" fill={color} opacity="0.5" stroke={color} strokeWidth="1"/>
      <rect x="22" y="20" width="20" height="28" rx="4" fill={color} opacity="0.12" stroke={color} strokeWidth="1.2"/>
      <rect x="22" y="20" width="20" height="12" rx="2" fill={color} opacity="0.25"/>
      {/* Bubbles */}
      <circle cx="48" cy="28" r="3" fill="none" stroke={color} strokeWidth="1" opacity="0.5"/>
      <circle cx="54" cy="20" r="2" fill="none" stroke={color} strokeWidth="1" opacity="0.4"/>
      <circle cx="50" cy="14" r="1.5" fill="none" stroke={color} strokeWidth="1" opacity="0.3"/>
      {/* EU flag dots suggestion */}
      <circle cx="14" cy="48" r="1.5" fill={color} opacity="0.4"/>
      <circle cx="20" cy="48" r="1.5" fill={color} opacity="0.4"/>
      <circle cx="14" cy="54" r="1.5" fill={color} opacity="0.4"/>
      <circle cx="20" cy="54" r="1.5" fill={color} opacity="0.4"/>
    </svg>
  ),
  pet: (color) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Paw print */}
      <circle cx="32" cy="36" r="10" fill={color} opacity="0.15" stroke={color} strokeWidth="1.2"/>
      <circle cx="32" cy="36" r="6" fill={color} opacity="0.3"/>
      <circle cx="20" cy="26" r="4" fill={color} opacity="0.4"/>
      <circle cx="30" cy="22" r="4" fill={color} opacity="0.4"/>
      <circle cx="40" cy="22" r="4" fill={color} opacity="0.4"/>
      <circle cx="48" cy="28" r="4" fill={color} opacity="0.4"/>
      {/* Connected platform dots */}
      <line x1="10" y1="54" x2="22" y2="46" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      <line x1="22" y1="46" x2="36" y2="50" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      <line x1="36" y1="50" x2="50" y2="44" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
      <circle cx="10" cy="54" r="2" fill={color} opacity="0.5"/>
      <circle cx="22" cy="46" r="2" fill={color} opacity="0.5"/>
      <circle cx="36" cy="50" r="2" fill={color} opacity="0.5"/>
      <circle cx="50" cy="44" r="2" fill={color} opacity="0.5"/>
    </svg>
  ),
  ta: (color) => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* IQOS device / connected device shape */}
      <rect x="24" y="12" width="16" height="36" rx="4" fill={color} opacity="0.12" stroke={color} strokeWidth="1.2"/>
      <rect x="27" y="15" width="10" height="6" rx="1" fill={color} opacity="0.3"/>
      <circle cx="32" cy="38" r="3" fill={color} opacity="0.4"/>
      {/* Signal waves = data */}
      <path d="M44 24 Q50 28 44 32" fill="none" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <path d="M48 20 Q58 28 48 36" fill="none" stroke={color} strokeWidth="1.2" opacity="0.35"/>
      {/* Declining line = structural decline */}
      <path d="M8 48 L18 44 L28 46 L38 42 L50 52" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.4"/>
    </svg>
  ),
};

const TABS = ["SITUATION", "BRAND SPOTLIGHT", "WHAT TO DO", "BUSINESS CASES", "AI OUTPUT"];
const TABS_NO_AGENT = ["SITUATION", "BRAND SPOTLIGHT", "WHAT TO DO", "BUSINESS CASES"];

function GlossaryAccordion() {
  const [open, setOpen] = useState(null);
  const mono = { fontFamily: "JetBrains Mono, monospace" };
  return (
    <div>
      <div style={{ ...mono, fontSize: 9, color: C.textDim, letterSpacing: "0.15em", marginBottom: 14 }}>KEY TERMS — click to expand</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {GLOSSARY.map((g, i) => (
          <div key={g.term} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ ...mono, fontSize: 12, color: C.accent, fontWeight: 500, marginBottom: 3 }}>{g.term}</div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{g.short}</div>
              </div>
              <span style={{ ...mono, color: C.textDim, fontSize: 16, flexShrink: 0, marginTop: 2 }}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 16px 14px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, paddingTop: 12 }}>{g.detail}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentOutput({ agent }) {
  const mono = { fontFamily: "JetBrains Mono, monospace" };
  return (
    <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
      {/* Header */}
      <div style={{ background: "#1A1610", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ ...mono, fontSize: 9, color: "#8C6814", letterSpacing: "0.18em", marginBottom: 5 }}>AI REFINERY OUTPUT</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#E8E4DC" }}>{agent.title}</div>
          <div style={{ fontSize: 11, color: "#6C6458", marginTop: 2 }}>{agent.sub}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...mono, fontSize: 8, color: "#4A4038", letterSpacing: "0.1em", marginBottom: 4 }}>INPUT PARAMETERS</div>
          {agent.inputs.map(inp => (
            <div key={inp.id} style={{ ...mono, fontSize: 10, color: "#8C8070" }}>{inp.label}: <span style={{ color: "#C0B090" }}>{inp.val}</span></div>
          ))}
        </div>
      </div>

      {/* Output */}
      <div style={{ background: C.surface, padding: "18px 20px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 4 }}>{agent.headline}</div>
          <div style={{ ...mono, fontSize: 12, color: C.accent }}>{agent.delta}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {agent.rows.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "11px 14px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderLeft: `3px solid ${row.color}`, borderRadius: "0 6px 6px 0" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 3 }}>{row.label}</div>
                <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{row.note}</div>
              </div>
              <div style={{ ...mono, fontSize: 11, color: row.color, whiteSpace: "nowrap", alignSelf: "flex-start" }}>{row.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "14px 16px", background: C.accentSoft, border: `1px solid ${C.accentBorder}`, borderRadius: 6, marginBottom: 10 }}>
          <div style={{ ...mono, fontSize: 8, color: C.accent, letterSpacing: "0.12em", marginBottom: 6 }}>WHAT THIS MEANS</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>{agent.insight}</div>
        </div>

        <div style={{ padding: "14px 16px", background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderLeft: `3px solid ${C.green}`, borderRadius: "0 6px 6px 0", marginBottom: 14 }}>
          <div style={{ ...mono, fontSize: 8, color: C.green, letterSpacing: "0.12em", marginBottom: 6 }}>NEXT STEP</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>{agent.nextStep}</div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ ...mono, fontSize: 8, color: C.textDim, letterSpacing: "0.1em", flexShrink: 0, marginTop: 1 }}>METHODOLOGY</div>
          <div style={{ ...mono, fontSize: 10, color: C.textMuted, lineHeight: 1.6 }}>Representative output based on Accenture CPG commercial benchmarks (AB InBev, Mondelēz, ELC). In a real engagement, this is generated from client data.</div>
        </div>
      </div>
    </div>
  );
}

function PitchCard({ p, mono }) {
  const [open, setOpen] = useState(false);
  const urgColor = p.urgency === "NOW" ? C.red : p.urgency === "HIGH PRIORITY" ? C.amber : C.green;
  const urgBg = p.urgency === "NOW" ? C.redSoft : p.urgency === "HIGH PRIORITY" ? C.amberSoft : C.greenSoft;
  const urgBorder = p.urgency === "NOW" ? C.redBorder : p.urgency === "HIGH PRIORITY" ? C.amberBorder : C.greenBorder;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 20px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 7, flexWrap: "wrap" }}>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: urgColor, background: urgBg, border: `1px solid ${urgBorder}`, padding: "3px 8px", borderRadius: 3 }}>{p.urgency}</span>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em", color: C.accent, background: C.accentSoft, border: `1px solid ${C.accentBorder}`, padding: "3px 8px", borderRadius: 3 }}>{p.value}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, color: C.text }}>{p.title}</div>
        </div>
        <span style={{ ...mono, color: C.textDim, fontSize: 20, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14, paddingTop: 16 }}>
            <div>
              <div style={{ ...mono, fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 8 }}>THE PROBLEM</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{p.problem}</div>
            </div>
            <div>
              <div style={{ ...mono, fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 8 }}>ACCENTURE SOLUTION</div>
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{p.solution}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div style={{ padding: "10px 12px", background: C.accentSoft, border: `1px solid ${C.accentBorder}`, borderRadius: 6 }}>
              <div style={{ ...mono, fontSize: 8, color: C.accent, letterSpacing: "0.1em", marginBottom: 5 }}>BUYER</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{p.buyer}</div>
            </div>
            <div style={{ padding: "10px 12px", background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderRadius: 6 }}>
              <div style={{ ...mono, fontSize: 8, color: C.green, letterSpacing: "0.1em", marginBottom: 5 }}>ENTRY WEDGE</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{p.wedge}</div>
            </div>
            <div style={{ padding: "10px 12px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6 }}>
              <div style={{ ...mono, fontSize: 8, color: C.textDim, letterSpacing: "0.1em", marginBottom: 5 }}>TIMELINE</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{p.timeline}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectorView({ sector, onBack }) {
  const tabs = sector.hasAgent ? TABS : TABS_NO_AGENT;
  const [tab, setTab] = useState(0);
  const mono = { fontFamily: "JetBrains Mono, monospace" };
  const b = sector.brand;
  const s = sector.struggle;

  return (
    <div>
      <button onClick={onBack} style={{ ...mono, background: "none", border: `1px solid ${C.border}`, color: C.textMuted, padding: "5px 12px", borderRadius: 3, cursor: "pointer", fontSize: 10, letterSpacing: "0.08em", marginBottom: 24 }}>← ALL SECTORS</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "inline-block", ...mono, fontSize: 11, letterSpacing: "0.14em", color: sector.tagColor, background: sector.tagColor + "14", border: `1px solid ${sector.tagColor}28`, padding: "5px 12px", borderRadius: 4, marginBottom: 12 }}>{sector.tag}</div>
          <h2 style={{ fontSize: 28, fontWeight: 400, margin: 0, color: C.text, letterSpacing: "-0.02em", fontFamily: "Georgia, serif", lineHeight: 1.2 }}>{sector.name}</h2>
          <div style={{ fontSize: 14, color: C.textMuted, marginTop: 8, fontStyle: "italic", fontFamily: "Georgia, serif", maxWidth: 500 }}>{sector.hook}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...mono, fontSize: 28, color: C.accent, lineHeight: 1 }}>{sector.size}</div>
            <div style={{ ...mono, fontSize: 8, color: C.textDim, letterSpacing: "0.1em", marginTop: 4 }}>TOTAL GLOBAL MARKET SIZE</div>
          </div>
          <div style={{ opacity: 0.6 }}>
            {SECTOR_ICONS[sector.id] && SECTOR_ICONS[sector.id](sector.tagColor)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 24, overflowX: "auto" }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{ ...mono, background: "none", border: "none", cursor: "pointer", padding: "10px 20px", fontSize: 9, letterSpacing: "0.14em", color: tab === i ? C.accent : C.textDim, borderBottom: `2px solid ${tab === i ? C.accent : "transparent"}`, marginBottom: -1, whiteSpace: "nowrap" }}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {sector.situation.map((st, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 22px" }}>
              <div style={{ ...mono, fontSize: 28, color: C.accent, lineHeight: 1, marginBottom: 8 }}>{st.n}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 8 }}>{st.label}</div>
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>{st.note}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 1 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 400, color: C.text, fontFamily: "Georgia, serif", marginBottom: 5 }}>{b.name}</div>
              <div style={{ fontSize: 14, color: C.textMuted, fontStyle: "italic", fontFamily: "Georgia, serif" }}>{b.title}</div>
            </div>
            <span style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", color: b.statusColor, background: b.statusColor + "14", border: `1px solid ${b.statusColor}28`, padding: "5px 12px", borderRadius: 3 }}>{b.status}</span>
          </div>

          <div style={{ fontSize: 15, color: C.text, lineHeight: 1.9, marginBottom: 22, fontFamily: "Georgia, serif", maxWidth: 640, borderLeft: `3px solid ${C.border}`, paddingLeft: 18 }}>{b.summary}</div>

          <div style={{ ...mono, fontSize: 9, color: C.textDim, letterSpacing: "0.14em", marginBottom: 10 }}>KEY MOVES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {b.moves.map((m, i) => (
              <div key={i} style={{ padding: "13px 16px", background: C.surface, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.accent}`, borderRadius: "0 8px 8px 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "flex-start" }}>
                <div style={{ ...mono, fontSize: 9, color: C.accent, letterSpacing: "0.1em", whiteSpace: "nowrap", paddingTop: 2 }}>{i + 1}. {m.l}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>{m.t}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "14px 16px", background: C.greenSoft, border: `1px solid ${C.greenBorder}`, borderRadius: 6 }}>
            <div style={{ ...mono, fontSize: 8, color: C.green, letterSpacing: "0.12em", marginBottom: 6 }}>ACCENTURE ANGLE</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.8, fontFamily: "Georgia, serif" }}>{b.accentureAngle}</div>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "WHAT THEY'RE STRUGGLING WITH", items: s.with.slice(0, 3), color: C.red, soft: C.redSoft, border: C.redBorder },
            { label: "WHAT THEY'RE TRYING — BUT NOT WORKING", items: s.trying.slice(0, 3), color: C.amber, soft: C.amberSoft, border: C.amberBorder },
            { label: "WHAT ACTUALLY WORKS", items: s.should.slice(0, 3), color: C.green, soft: C.greenSoft, border: C.greenBorder },
          ].map(({ label, items, color, soft, border }) => (
            <div key={label} style={{ padding: "16px 20px", background: soft, border: `1px solid ${border}`, borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0" }}>
              <div style={{ ...mono, fontSize: 9, color, letterSpacing: "0.14em", marginBottom: 14 }}>{label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <span style={{ ...mono, fontSize: 15, color, fontWeight: 500, flexShrink: 0, lineHeight: "24px", minWidth: 18 }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: C.text, lineHeight: 1.8 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sector.pitches.map((p, i) => <PitchCard key={i} p={p} mono={mono} />)}
        </div>
      )}

      {tab === 4 && sector.hasAgent && sector.agent && (
        <div>
          <div style={{ padding: "12px 16px", background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 18 }}>
            <div style={{ ...mono, fontSize: 8, color: C.textDim, letterSpacing: "0.12em", marginBottom: 5 }}>WHAT THIS IS</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              This is a sample output from the Accenture AI Refinery — a pre-built AI model trained on CPG commercial data. In a real client engagement, this output would be generated from the client's own sell-through, pricing, and consumer data. Here it is populated with representative data to show what the output looks like and what action it drives.
            </div>
          </div>
          <AgentOutput agent={sector.agent} />
        </div>
      )}

      <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
        <div style={{ ...mono, fontSize: 8, color: C.textDim, letterSpacing: "0.12em", marginBottom: 10 }}>OTHER SECTORS</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SECTORS.filter(s => s.id !== sector.id).map(s => (
            <button key={s.id} onClick={() => { window.__cpg(s.id); }} style={{ ...mono, background: C.surface, border: `1px solid ${C.border}`, color: C.textMuted, padding: "5px 14px", borderRadius: 3, cursor: "pointer", fontSize: 9, letterSpacing: "0.08em" }}>{s.name.split(" ")[0]} →</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AccentureCPG() {
  const [selected, setSelected] = useState(null);
  window.__cpg = setSelected;
  const sector = selected ? SECTORS.find(s => s.id === selected) : null;
  const mono = { fontFamily: "JetBrains Mono, monospace" };

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "Georgia, serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        button:focus { outline: none; }
        input:focus { outline: 1px solid ${C.accentBorder}; }
      `}</style>

      <div style={{ padding: "14px 32px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ ...mono, fontSize: 9, color: C.accent, letterSpacing: "0.2em" }}>humaninthelead.ai</span>
        <span style={{ ...mono, fontSize: 8, color: C.textDim, letterSpacing: "0.12em" }}>MARCH 2026 · CONFIDENTIAL</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "32px 32px 56px" }}>
        {!selected ? (
          <div>
            {/* Hero */}
            <div style={{ marginBottom: 32, maxWidth: 680 }}>
              <div style={{ ...mono, fontSize: 9, color: C.accent, letterSpacing: "0.2em", marginBottom: 12 }}>ACCENTURE · CPG AI INTELLIGENCE</div>
              <h1 style={{ fontSize: 28, fontWeight: 400, margin: "0 0 12px 0", lineHeight: 1.2, color: C.text, letterSpacing: "-0.02em" }}>
                Where AI creates structural advantage across six CPG sectors.
              </h1>
              <div style={{ fontSize: 16, fontWeight: 500, color: C.textMuted, marginBottom: 8 }}>
                An opportunity scanner for the Accenture GenAI practice.
              </div>
              <div style={{ fontSize: 15, color: C.textDim, lineHeight: 1.75 }}>
                A snapshot of each CPG industry — what's happening, where the gaps are, and where Accenture has a right to win.
              </div>
            </div>

            {/* Stat cards — 14% first, with sources on hover */}
            <div style={{ display: "flex", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
              {[
                { l: "CPG companies that have scaled AI beyond pilot", v: "14%", c: C.red, tip: "Only 14% of CPG companies have successfully moved AI beyond a single pilot project into production at scale. 97% say AI will impact market share. Source: Accenture Consumer Goods Research 2024." },
                { l: "BEES GMV — Accenture-built", v: "$52.5B", c: C.green, tip: "BEES is the AI order management platform Accenture built for AB InBev. It processes $52.5B worth of beer orders annually across 29 countries, with 75% fully automated. GMV = Gross Merchandise Value — total commerce the platform handles. Source: AB InBev Annual Report 2024." },
                { l: "Accenture Products & Services revenue", v: "~$21B", c: C.accent, tip: "Accenture's Consumer Goods & Services practice forward-year revenue estimate. Covers F&B, beauty, home care, OTC health, pet care, and tobacco/alcohol globally. Source: Accenture FY2025 Annual Report, Products segment." },
                { l: "Accenture GenAI bookings FY25", v: "$5.9B", c: C.accent, tip: "Accenture's GenAI-specific client bookings in fiscal year 2025 — up from $3B the prior year. Fastest-growing segment of the firm. Source: Accenture FY2025 Earnings, Q4 2025." },
              ].map(({ l, v, c, tip }) => (
                <div key={l} style={{ padding: "12px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, position: "relative", cursor: "default" }}
                  onMouseEnter={e => { const t = e.currentTarget.querySelector(".tip"); if (t) t.style.display = "block"; }}
                  onMouseLeave={e => { const t = e.currentTarget.querySelector(".tip"); if (t) t.style.display = "none"; }}
                >
                  <div style={{ ...mono, fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 5 }}>{l}</div>
                  <div style={{ ...mono, fontSize: 20, color: c }}>{v}</div>
                  <div style={{ ...mono, fontSize: 8, color: C.textDim, marginTop: 3 }}>hover for source ↑</div>
                  <div className="tip" style={{ display: "none", position: "absolute", bottom: "calc(100% + 8px)", left: 0, background: "#1A1610", color: "#E8E4DC", fontSize: 12, lineHeight: 1.7, padding: "12px 16px", borderRadius: 6, width: 280, zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                    {tip}
                  </div>
                </div>
              ))}
            </div>

            {/* Sector grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36 }}>
              {SECTORS.map(s => (
                <button key={s.id} onClick={() => setSelected(s.id)}
                  style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 18px", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.surfaceAlt; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
                >
                  <div style={{ position: "absolute", top: 8, right: 8, opacity: 0.5, pointerEvents: "none" }}>
                    {SECTOR_ICONS[s.id] && SECTOR_ICONS[s.id](s.tagColor)}
                  </div>
                  <div style={{ position: "relative" }}>
                    {/* Tag with tooltip */}
                    <div style={{ marginBottom: 12, position: "relative", display: "inline-block" }}
                      onMouseEnter={e => { const t = e.currentTarget.querySelector(".tagtip"); if (t) t.style.display = "block"; }}
                      onMouseLeave={e => { const t = e.currentTarget.querySelector(".tagtip"); if (t) t.style.display = "none"; }}
                    >
                      <div style={{ display: "inline-block", ...mono, fontSize: 10, letterSpacing: "0.15em", color: s.tagColor, background: s.tagColor + "14", border: `1px solid ${s.tagColor}22`, padding: "4px 10px", borderRadius: 4 }}>{s.tag} ⓘ</div>
                      <div className="tagtip" style={{ display: "none", position: "absolute", top: "calc(100% + 6px)", left: 0, background: "#1A1610", color: "#E8E4DC", fontSize: 12, lineHeight: 1.65, padding: "10px 14px", borderRadius: 6, width: 250, zIndex: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.25)", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                        {s.tagTip}
                      </div>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 400, color: C.text, fontFamily: "Georgia, serif", marginBottom: 10, lineHeight: 1.3 }}>{s.name}</div>
                    {/* Two bullets */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: C.textDim, fontSize: 14, lineHeight: "19px", flexShrink: 0 }}>·</span>
                        <span style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55 }}>{s.hook}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: C.accent, fontSize: 14, lineHeight: "19px", flexShrink: 0 }}>·</span>
                        <span style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.55, fontStyle: "italic" }}>{s.pattern}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ ...mono, fontSize: 16, color: C.accent }}>{s.size} </span>
                        <span style={{ ...mono, fontSize: 9, color: C.textDim }}>MARKET SIZE</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {s.hasAgent && <span style={{ ...mono, fontSize: 7, color: C.green, background: C.greenSoft, border: `1px solid ${C.greenBorder}`, padding: "2px 6px", borderRadius: 2 }}>AI OUTPUT</span>}
                        <span style={{ ...mono, fontSize: 8, color: C.textDim, letterSpacing: "0.1em" }}>EXPLORE →</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Bulletized core thesis — full width */}
            <div style={{ padding: "24px 28px", background: C.accentSoft, border: `1px solid ${C.accentBorder}`, borderLeft: `4px solid ${C.accent}`, borderRadius: "0 8px 8px 0", marginBottom: 40 }}>
              <div style={{ ...mono, fontSize: 9, color: C.accent, letterSpacing: "0.15em", marginBottom: 16 }}>THE CORE THESIS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { n: "86%", text: "of CPG companies have announced an AI strategy. Only 14% have scaled beyond a pilot. That gap is where the mandates are." },
                  { n: "BEES", text: "— $52.5B GMV, Accenture-built, 29 countries — is proof that agentic AI can replace an entire commercial function. Not augment it. Replace it." },
                  { n: "Every sector", text: "has a BEES equivalent waiting to be built. Trade promotion in F&B. Trend intelligence in Beauty. PE exit architecture in OTC. IQOS data monetization in Tobacco. The question is who gets there first." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <span style={{ ...mono, fontSize: 13, color: C.accent, flexShrink: 0, fontWeight: 500, minWidth: 72, paddingTop: 2 }}>{item.n}</span>
                    <span style={{ fontSize: 15, color: C.text, lineHeight: 1.75 }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <GlossaryAccordion />
          </div>
        ) : (
          <SectorView sector={sector} onBack={() => setSelected(null)} />
        )}
      </div>

      <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: C.textDim }}>Built by <span style={{ color: C.accent }}>Christian Spetz</span> — humaninthelead.ai</span>
        <span style={{ ...mono, fontSize: 8, color: C.textDim }}>Based on public information only</span>
      </div>
    </div>
  );
}
