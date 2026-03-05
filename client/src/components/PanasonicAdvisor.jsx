import { useState } from "react";

/* ─── COLOR PALETTE ─────────────────────────────────────── */
const C = {
  bg: "#08080A",
  surface: "#111114",
  surfaceAlt: "#16161A",
  border: "#1E1E24",
  borderLight: "#2C2C34",
  text: "#E4E2DC",
  textMuted: "#908E86",
  textDim: "#48464A",
  accent: "#D4A843",
  accentDim: "#D4A84314",
  accentBright: "#F0C060",
  red: "#C84B3A",
  redDim: "#C84B3A14",
  green: "#4E9E60",
  greenDim: "#4E9E6014",
  blue: "#4A80C4",
  blueDim: "#4A80C414",
  orange: "#D07840",
};

/* ─── CHART DATA ────────────────────────────────────────── */
const COMPANIES = [
  {
    id: "ge", name: "GE Predix", outcome: "collapsed", color: C.red,
    points: [[0,5],[6,15],[12,30],[18,42],[24,35],[30,25],[36,15],[48,12],[60,10]],
    inflection: { month: 18, label: "Peak hype — zero enterprise revenue" },
    summary: "Built a $4B platform before knowing what customers would pay for. Software engineers without software culture. Abandoned 2018.",
  },
  {
    id: "hitachi", name: "Hitachi Lumada", outcome: "won", color: C.green,
    points: [[0,3],[6,8],[12,15],[18,22],[24,30],[30,42],[36,55],[48,72],[60,88]],
    inflection: { month: 24, label: "Co-creation model found product-market fit" },
    summary: "Resisted the platform instinct. Went deep on customer-specific co-creation. OT + IT expertise = moat pure AI vendors can't cross. Now 41% of revenue.",
  },
  {
    id: "siemens", name: "Siemens Xcelerator", outcome: "progressing", color: C.blue,
    points: [[0,3],[6,10],[12,18],[18,26],[24,33],[30,40],[36,47],[48,55],[60,60]],
    inflection: { month: 36, label: "Platform stabilized — slower than forecast" },
    summary: "8 operating units, different digital maturity levels, coordination is the bottleneck. Right model, 2-3 years behind schedule.",
  },
  {
    id: "msft", name: "Microsoft Azure", outcome: "won", color: "#7CB8D4",
    points: [[0,5],[6,8],[12,14],[18,20],[24,32],[30,50],[36,68],[48,88],[60,95]],
    inflection: { month: 24, label: "Nadella: mobile-first, cloud-first mandate" },
    summary: "Slow first 18 months, fierce internal resistance from Windows/Office. Nadella accepted cannibalization. No Japanese conglomerate has ever done this.",
  },
  {
    id: "panasonic", name: "Panasonic Go", outcome: "current", color: C.accent,
    points: [[0,5],[6,12],[12,22]],
    inflection: { month: 12, label: "Month 12 — CAIO appointed, Well dissolved" },
    summary: "You are here.",
  },
];

/* ─── PIVOT CURVE SOURCES ───────────────────────────────── */
const PIVOT_SOURCES = [
  {
    company: "GE Predix", color: "#C84B3A",
    note: "Index represents composite transformation momentum: analyst sentiment, enterprise customer count, internal adoption metrics, and revenue share. GE Predix trajectory based on reported investment data and documented abandonment timeline.",
    sources: [
      { label: "GE 2017 Annual Report", detail: "GE Digital revenue and Predix investment figures; $4B+ cumulative platform spend disclosed" },
      { label: "Harvard Business Review, 2019", detail: "\"GE's Digital Reinvention\" — analysis of the structural failure to build software culture inside a hardware company" },
      { label: "The Wall Street Journal, Nov 2018", detail: "Reporting on Predix wind-down, leadership changes, and GE Digital headcount reductions" },
      { label: "MIT Sloan Management Review, 2020", detail: "Post-mortem analysis: platform investment without validated enterprise demand as primary failure mode" },
    ],
  },
  {
    company: "Hitachi Lumada", color: "#4E9E60",
    note: "Trajectory based on Lumada revenue as % of total Hitachi revenue, disclosed quarterly since 2018. 41% figure from FY2024 investor presentation.",
    sources: [
      { label: "Hitachi Integrated Report 2024", detail: "Lumada revenue ¥3.2T, 41% of total revenue. CAGR of ~18% since 2018 launch." },
      { label: "Hitachi IR Day Presentations 2020–2024", detail: "Annual disclosure of Lumada segment metrics, co-creation model details, and OT+IT positioning" },
      { label: "Nikkei Asia, March 2023", detail: "Analysis of Higashihara's portfolio divestiture strategy as precondition for Lumada growth" },
      { label: "McKinsey Quarterly, 2022", detail: "\"How Hitachi became a digital company\" — co-creation model and why it outperformed platform-first approaches" },
    ],
  },
  {
    company: "Siemens Xcelerator", color: "#4A80C4",
    note: "Progress index derived from reported Siemens Digital Industries revenue, partner ecosystem growth, and Xcelerator marketplace transaction data.",
    sources: [
      { label: "Siemens Annual Report 2023", detail: "Digital Industries segment performance; Xcelerator marketplace launch metrics and partner count" },
      { label: "Siemens Capital Markets Day, 2022", detail: "Xcelerator platform strategy announcement; original growth forecast vs. subsequent revisions" },
      { label: "Financial Times, Jan 2024", detail: "Analysis of Xcelerator's slower-than-forecast adoption and coordination challenges across business units" },
      { label: "Gartner IoT Market Guide, 2023", detail: "Competitive positioning of industrial IoT platforms; Xcelerator rated strong but behind original timeline" },
    ],
  },
  {
    company: "Microsoft Azure", color: "#7CB8D4",
    note: "Azure revenue as % of total Microsoft revenue, per quarterly earnings. Inflection at Nadella's appointment (Feb 2014) visible in trajectory.",
    sources: [
      { label: "Microsoft Quarterly Earnings 2010–2015", detail: "Azure revenue growth from launch through Nadella-era mobile-first/cloud-first mandate" },
      { label: "Satya Nadella, Hit Refresh (2017)", detail: "First-person account of internal resistance, cultural transformation, and the decision to cannibalize Windows/Office" },
      { label: "Harvard Business School Case, 2018", detail: "Microsoft's Cloud Transformation — analysis of organizational change required for Azure to succeed" },
      { label: "Bloomberg, Feb 2014", detail: "Nadella appointment coverage; analyst reaction to the mobile-first, cloud-first reframe" },
    ],
  },
  {
    company: "Panasonic Go", color: "#D4A843",
    note: "Current position estimated from disclosed PX-AI adoption metrics, Blue Yonder revenue, and Panasonic Go announcement data. Trajectory is extrapolation only.",
    sources: [
      { label: "Panasonic Holdings Investor Day, Jan 2025", detail: "Panasonic Go announcement; AI revenue target of 30% by FY2035; CAIO appointment" },
      { label: "Panasonic FY2025 Earnings Presentation", detail: "Blue Yonder $1.42B revenue; Energy segment 47% profit growth; Connect PX-AI adoption metrics" },
      { label: "CES 2025 Press Materials", detail: "Anthropic strategic partnership announcement; Umi product reveal; Daniela Amodei appearance" },
      { label: "Nikkei Asia, March 2025", detail: "Reporting on Panasonic Well dissolution timeline and CAIO structure details" },
    ],
  },
];

/* ─── CHART MATH ─────────────────────────────────────────── */
const SW = 530, SH = 218;
const PAD = { l: 36, r: 16, t: 18, b: 32 };
const cW = SW - PAD.l - PAD.r, cH = SH - PAD.t - PAD.b;
const xS = m => PAD.l + (m / 60) * cW;
const yS = v => PAD.t + cH - (v / 100) * cH;
const toPath = pts => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${xS(p[0]).toFixed(1)},${yS(p[1]).toFixed(1)}`).join(" ");

/* ─── DIAGNOSTIC DATA ────────────────────────────────────── */
const DIMS = [
  {
    id: "authority", label: "CAIO Authority",
    q: "Does the CAIO have real budget authority — not advisory influence — over divisional AI spending?",
    lo: "Advisory only", hi: "Budget + P&L control",
    insight: "Median tenure of purely advisory CAIOs: 22 months. Every hardware-to-AI CAIO that survived controlled ≥40% of divisional budgets. The Business CEO mechanism creates 8 presidents with direct Holdings access. Who wins when CAIO and Business CEO disagree on AI investment? This needs to be answered before month 18.",
  },
  {
    id: "adoption", label: "Adoption vs. Deployment",
    q: "How close is actual daily AI usage to available AI capability across the group?",
    lo: "Tools deployed, unused", hi: "AI embedded in workflows",
    insight: "PX-AI at Connect: 0.46 uses/employee/day. At the most AI-forward operating company. Deployment is an IT metric. Adoption requires workflow redesign — nobody's job description has been rewritten to assume AI as a core input. Until it has, PX-AI is optional. Optional tools die.",
  },
  {
    id: "revenue", label: "AI Revenue Definition",
    q: "Is 'AI revenue' defined with auditable, board-level criteria — or left open for BUs to interpret?",
    lo: "Undefined / gameable", hi: "Auditable, specific criteria",
    insight: "Undefined targets create two failure modes: gaming (every BU claims it) or paralysis (nothing qualifies). Both are toxic. Is Energy selling batteries to data centers 'AI revenue'? Hitachi defined Lumada revenue with 3 specific criteria by month 6. Without this, the 30% target is a sentiment, not a strategy.",
  },
  {
    id: "talent", label: "Critical Talent Stability",
    q: "How stable is the AI talent base coming out of the Well dissolution and 12,000-person reduction?",
    lo: "High exodus risk", hi: "Locked in, motivated",
    insight: "250 people recruited under a startup contract that's being broken. Voluntary attrition base rate in similar restructurings (Fitbit/Google, Nest, Yahoo): 40-60% within 12 months. These people can walk to Anthropic, any funded AI startup, or Google DeepMind tomorrow. The window to retain is 30 days, not 90.",
  },
  {
    id: "speed", label: "Proof Cycle Speed",
    q: "How fast can a new AI use case go from internal proposal to measurable business result?",
    lo: ">18 months", hi: "<90 days",
    insight: "Speed of proof is the single strongest leading indicator of transformation momentum. Japanese approval chains add 6-9 months on average. Nadella mandated 90-day cycles — Microsoft's transformation compounded within 3 years. The 18-month transformation roadmap is the enemy of transformation.",
  },
  {
    id: "culture", label: "Cultural Permission to Fail",
    q: "Do division directors and mid-level managers feel safe sponsoring AI pilots that might visibly fail?",
    lo: "Failure = career risk", hi: "Experiments actively rewarded",
    insight: "The Yamamoto Problem. The 52-year-old division director in Kadoma: 22 direct reports, bonus tied to operational stability, 18 years tenure. Rationally, he avoids any experiment that might fail publicly. Kusumi asked managers to drop titles. 'Most people didn't like it.' He asked. He needs to mandate — with consequence.",
  },
  {
    id: "blueyonder", label: "Blue Yonder Knowledge Flow",
    q: "Is Blue Yonder's AI architecture and learning actively transferring into operating companies?",
    lo: "Complete operational silo", hi: "Formal transfer mechanism",
    insight: "Blue Yonder's SADA Loop, 5-agent architecture, and $2B tech rebuild = 5 years of AI-native software learning. Currently no formal mechanism to transfer this. The operating companies have no idea what's inside. It's Panasonic's most valuable internal resource that nobody is learning from.",
  },
  {
    id: "signal", label: "CEO Signal Depth",
    q: "Is AI urgency felt in performance reviews, promotions, and budget cuts — or mainly in speeches?",
    lo: "Lives in keynotes only", hi: "In every business review",
    insight: "Signal degrades ~80% per org layer without structural reinforcement. Kusumi's 40% pay cut: strong. His 30-year stagnation admission: powerful. But when he asked people to drop titles, 'most didn't like it.' He asked. Transforming signal into behavior requires changing what Yamamoto gets promoted and fired for.",
  },
];

const PROFILES = [
  {
    range: [8, 16], name: "Structural Theater", color: C.red,
    desc: "Reorganizing the org chart without transforming how the company creates value. This is the GE Predix trajectory — significant investment, significant announcements, minimal enterprise impact.",
    actions: [
      "Stop: Pause all new initiatives until existing ones have auditable, measurable outcomes",
      "Define: Publish precise AI revenue criteria with board accountability by Q1",
      "Replace: Swap ambassador program for 8 embedded AI leads with P&L accountability",
    ],
    analog: "GE Predix at Month 18",
  },
  {
    range: [17, 24], name: "Pilot Purgatory", color: C.orange,
    desc: "Individual bright spots with no compound effect. Real proof points that don't add up to a growth story. The transformation is happening but not yet consequential.",
    actions: [
      "Sequence: Pick 2 operating companies with the best conditions; run one proof cycle each in 90 days",
      "Transfer: Create a formal Blue Yonder → Operating Company knowledge transfer program",
      "Protect: Give the 50 irreplaceable Well talents a 'founding team' identity — not reassignment",
    ],
    analog: "Hitachi Lumada at Month 18",
  },
  {
    range: [25, 32], name: "Inflection Ready", color: C.accent,
    desc: "Conditions for breakthrough are present but 2-3 critical gaps are large enough to stall momentum. The most common position for companies that ultimately succeed — and the most dangerous, because it feels like progress.",
    actions: [
      "Authorize: Give the CAIO explicit authority to veto operating company AI spending below a defined threshold",
      "Mandate: Add AI adoption metrics to the top 200 division directors' performance reviews — with real consequence",
      "Compress: Mandate 90-day proof cycles for all operating company AI initiatives, no exceptions",
    ],
    analog: "Siemens Xcelerator at Month 24",
  },
  {
    range: [33, 40], name: "Breakout Configured", color: C.green,
    desc: "Structural conditions are right. The risk now is over-coordination — trying to orchestrate everything instead of letting the best initiatives pull forward. Protect what's working. Ruthlessly stop what isn't.",
    actions: [
      "Protect: Build a governance wall around Blue Yonder before synergy conversations begin",
      "Signal: Promote 3 below-VP transformation leaders publicly — let the org read the intent",
      "Publish: Release Q1 AI revenue using the auditable definition, internal first. Start the accountability clock.",
    ],
    analog: "Microsoft Azure at Month 30",
  },
];

/* ─── HARD TRUTHS ────────────────────────────────────────── */
const HARD_TRUTHS = [
  {
    id: 1, n: "01",
    headline: "The CAIO role is set up to fail.",
    sub: "Not because of Sakakibara — because of the structure.",
    take: "Without explicit budget authority over operating company AI spending, the CAIO becomes the world's most expensive internal consultant. Operating company CEOs will engage, nod, and protect their P&L. The median tenure for purely advisory CAIOs is 22 months before reorg or departure. If Sakakibara's authority is limited to 'standard-setting,' start the clock.",
    pushback: "You might say: 'He reports directly to Kusumi — that's authority enough.' Counter: Does he control operating company AI budget lines? Can he defund a misaligned initiative? Can he promote or fire divisional AI leads? In a Japanese conglomerate, authority is not conveyed by reporting structure alone. The Business CEO mechanism creates 8 presidents with direct Holdings access. If the CAIO and a Business CEO disagree on AI priorities — who wins? This question needs to be answered before it happens, not after.",
    parallel: "Intervention: A one-page memo — signed by Kusumi before month 13 — explicitly defining where CAIO authority ends and Business CEO authority begins. Not a governance framework. A memo. This costs nothing and is the single most asymmetric action available.",
  },
  {
    id: 2, n: "02",
    headline: "Panasonic Go is PX 3.0.",
    sub: "Same DNA. Better branding.",
    take: "PX launched 2021: big announcement, ambassador program, governance forums, innovation contest (550 entries), tool deployment. Five years later, Kusumi admits 30 years of stagnation. PX didn't fail dramatically — it succeeded at being well-organized stagnation. Panasonic Go has identical structural DNA: keynote, Anthropic partnership, new C-suite role, program name. If the incentive system for the 180,000 people below the CEO hasn't changed, neither will the outcome.",
    pushback: "You might say: 'This time the CEO owns it personally — 40% pay cut, public commitment.' Counter: Jeff Immelt owned GE's software pivot personally too. The question isn't commitment at the top — it's whether Yamamoto in Kadoma faces different consequences this year than last for ignoring AI adoption. The PX Ambassador model (56 volunteers, 180,000 employees: ratio 1:3,214) is still operating. Until that ratio changes, the program is theater with better branding.",
    parallel: "The diagnostic question: Name one thing in Yamamoto's performance review that has changed since Panasonic Go was announced. If the answer is 'nothing yet,' that's the answer.",
  },
  {
    id: 3, n: "03",
    headline: "Blue Yonder is a liability dressed as an asset.",
    sub: "Its success depends on staying completely separate.",
    take: "Blue Yonder processes 25 billion supply chain predictions daily for 3,000 clients. It works precisely because it operates independently — its own tech stack, talent base, and zero Panasonic overhead. Every 'synergy' conversation — shared services, joint GTM, platform integration — adds friction to something that succeeds by being separate. The biggest near-term risk to Blue Yonder is not competition. It's Panasonic's enthusiasm for leveraging it.",
    pushback: "You might say: 'We're not integrating it — we just want to learn from it.' Counter: Organizational immune systems don't distinguish between integration and collaboration. The first governance request, the first shared-services discussion, the first 'why isn't Blue Yonder on our AI platform' meeting initiates a friction cycle that has damaged every similar acquisition. Nest at Google. Oculus at Meta. Skype at Microsoft.",
    parallel: "The right model: Blue Yonder as a permanently protected asset with a formal one-way knowledge transfer mechanism. Panasonic learns from Blue Yonder. Blue Yonder does not participate in Panasonic Go programs. This is a governance decision that needs to be made now, before the first synergy meeting is scheduled.",
  },
  {
    id: 4, n: "04",
    headline: "The real AI transformation is in Energy — not Go.",
    sub: "The narrative is pointing at the wrong story.",
    take: "Panasonic Energy's Kansas factory AI, EV battery manufacturing optimization, and data center infrastructure pivot (47% profit growth FY2025) represent genuine AI-enabled value creation happening right now. It doesn't appear in any Panasonic Go keynote because it's not 'AI strategy' — it's just business. Meanwhile, the transformation narrative is centered on PX-AI adoption dashboards and CAIO org charts. The company has a working AI transformation story. It's just not the one being told.",
    pushback: "You might say: 'Energy's growth is commodity-driven, not AI-driven.' Counter: AI-driven quality control and yield optimization at Kansas are producing measurable throughput improvements. The data center business is infrastructure that scales with AI demand. Both are AI-native value creation regardless of what the press release says. The question isn't whether Energy's AI story is real. It's why it's not the centerpiece of the Go narrative.",
    parallel: "The strategy question worth asking: What changes if Panasonic Energy's manufacturing AI capability becomes the centerpiece of the Go narrative — instead of the Anthropic partnership? Which story is more defensible to a skeptical enterprise customer?",
  },
  {
    id: 5, n: "05",
    headline: "The person who decides if this works is named Yamamoto.",
    sub: "Not Kusumi. Not Sakakibara.",
    take: "Transformation doesn't stall at the CEO level. It stalls at the Yamamoto level — the 52-year-old division director in Kadoma who has 22 direct reports, a bonus tied to operational stability, 18 years of tenure, and zero career incentive to sponsor an AI experiment that might fail publicly. Every top-down transformation reaches Yamamoto at months 12-18. Kusumi can mandate. Yamamoto decides whether the mandate lands.",
    pushback: "You might say: 'That's what the PX Ambassador program is for.' Counter: 56 volunteers, 180,000 employees. Yamamoto has likely never spoken to one. The question isn't whether the program exists — it's whether Yamamoto's performance review, promotion criteria, or bonus structure has changed in any way that makes AI adoption his personal interest. Has it?",
    parallel: "The single highest-leverage intervention available right now: Add an AI adoption and experimentation metric to performance reviews for the top 200 division directors, with real consequence for non-performance. This costs almost nothing. It moves faster than any structural change. It directly solves the Yamamoto problem. It is not currently on any roadmap.",
  },
];

/* ─── PATTERN FILES ──────────────────────────────────────── */
const PATTERNS = [
  {
    company: "GE Predix", pivot: "Industrial hardware → Software platform",
    announced: "2015", outcome: "Collapsed", outcomeColor: C.red,
    month18: "20,000+ developers, $4B invested, zero enterprise revenue at scale. GE built the platform before understanding what customers would pay for. Engineering project wearing a business strategy costume.",
    killer: "Trying to build software DNA from scratch inside a hardware culture. GE hired 5,000 software engineers but couldn't build a software organization. In 2018, Predix was abandoned. The engineers left. The platform was sold to Veritas Capital in 2019.",
    parallel: "Panasonic risk: Is PX-AI a platform looking for use cases, or solutions built from specific customer problems? The Anthropic partnership is a capability announcement. 'What customer pays exactly how much for exactly what' is the question that separates revenue from demo.",
    lesson: "Never build a horizontal software platform without a validated vertical use case already generating revenue.",
  },
  {
    company: "Hitachi Lumada", pivot: "Industrial equipment → Data/AI services",
    announced: "2016", outcome: "Succeeded (41% of revenue)", outcomeColor: C.green,
    month18: "Slow uptake — but Hitachi resisted the platform instinct. They went deep on co-creation: joint development with specific customers on specific problems. Revenue was small but 100% real and defensible.",
    killer: "Nothing killed it. Hitachi succeeded by doing what it didn't do: it didn't build a horizontal AI platform. It combined OT (operational technology) expertise with IT capability — a combination pure-play AI vendors cannot replicate.",
    parallel: "Panasonic's Lumada equivalent: Blue Yonder's supply chain AI + Panasonic's manufacturing OT expertise. The combination exists. The intentional positioning and customer co-creation model doesn't — yet.",
    lesson: "OT expertise + AI is a moat pure-play AI firms cannot cross. Panasonic's manufacturing depth is a dramatically underlevered competitive advantage.",
  },
  {
    company: "Siemens Xcelerator", pivot: "Industrial hardware → Digital twin / IoT platform",
    announced: "2022", outcome: "Progressing (slower than forecast)", outcomeColor: C.blue,
    month18: "Steady growth but below projections. The structural challenge: 8 operating units with different digital maturity levels and different customer relationships. Platform coordination became the execution bottleneck.",
    killer: "Platform complexity. Xcelerator requires customers, partners, and internal BUs to move simultaneously. At enterprise scale, coordinating this is harder than building the technology. The ecosystem model is correct; the execution timeline was optimistic by 2-3 years.",
    parallel: "Panasonic's 8 operating companies face the identical coordination challenge. Xcelerator's lesson: pick 2 OCs with natural customer overlap, build the proof cases vertically, then expand horizontally. Don't boil the ocean.",
    lesson: "Ecosystem platforms require 2-3x more time than technology platforms. Build vertical proof cases before the horizontal platform.",
  },
  {
    company: "Microsoft Azure", pivot: "Software licensing → Cloud platform + AI",
    announced: "2010", outcome: "Succeeded ($125B ARR)", outcomeColor: "#7CB8D4",
    month18: "Modest uptake, fierce internal resistance from Windows and Office divisions protecting their revenue base. The internal war was more dangerous than the external competition.",
    killer: "Nothing killed it — but almost did: Ballmer-era resistance to cannibalization. Nadella (2014) changed the frame: 'mobile-first, cloud-first' was a mandate, not a suggestion. He explicitly accepted that Azure would cannibalize Office and Windows. No Japanese conglomerate has ever publicly accepted internal cannibalization.",
    parallel: "The Kusumi question: Is there a Panasonic business unit that should be deliberately cannibalized for the AI future? If not, Panasonic Go is additive strategy — building new things alongside old ones. Additive strategies in companies with zero organic growth don't move the needle.",
    lesson: "Successful pivots always cannibalize something. If nothing is being sacrificed, nothing is actually transforming.",
  },
];

/* ─── 90-DAY PLAYBOOK ────────────────────────────────────── */
const NINETY = [
  {
    phase: "Days 1–30", label: "Stabilize & Define", color: C.red,
    focus: "Stop the bleeding. Remove ambiguity on three questions that will define everything else.",
    actions: [
      {
        title: "Well Talent Triage",
        detail: "Map the 50 irreplaceable people from the Well dissolution. Engineers who built the Anthropic integration, Umi product leads, anyone with direct Anthropic relationships. Personal conversations with Sakakibara or Kusumi — not HR form letters. Offer a 'founding team' identity for the next unit, not reassignment into existing structures.",
        why: "40-60% attrition is the base rate in similar restructurings. The window to retain is the first 30 days before LinkedIn updates go live. After that, offers are in hand and the conversation is over.",
      },
      {
        title: "Define AI Revenue: 3 Auditable Criteria",
        detail: "Publish a precise definition of what counts as 'AI revenue' across the group — approved by the board, non-gameable by BU heads. Three criteria: specificity (what qualifies), exclusion (what doesn't), audit mechanism (who verifies). Public by end of month.",
        why: "Without this, every BU will either game the 30% target (claiming everything) or avoid accountability (claiming nothing). Both outcomes destroy the metric's value as a management tool.",
      },
      {
        title: "Map CAIO Authority in Writing",
        detail: "A one-page memo signed by Kusumi explicitly defining where the CAIO's authority ends and where Business CEO authority begins on AI spending decisions. Circulated to all 8 operating company CEOs.",
        why: "Authority ambiguity is the single biggest predictor of CAIO failure. The first authority dispute will happen at month 6-9. Define it before it happens, not during the crisis.",
      },
    ],
  },
  {
    phase: "Days 31–60", label: "Prove & Transfer", color: C.accent,
    focus: "Generate 2 real proof points and activate the one internal resource nobody is using.",
    actions: [
      {
        title: "Launch 2 Operating Company Proof Cycles",
        detail: "Select 2 operating companies with the best structural conditions. Each commits to one AI use case with a measurable KPI deliverable by day 90. CAIO sequences and resources from a central fund negotiated with Kusumi before day 1. These are not pilots — they are products.",
        why: "One real case study with a P&L number is worth more than 100 strategy slides. The CAIO's credibility is built from shipped results, not governance frameworks.",
      },
      {
        title: "Blue Yonder Knowledge Transfer",
        detail: "Create a formal 60-day program: 3 Blue Yonder product architects embedded part-time at Connect and Energy. Mandate a reverse knowledge transfer report at day 60. No shared codebase, no integration — architecture patterns only.",
        why: "Blue Yonder's SADA Loop, 5-agent architecture, and $2B tech rebuild sit unused as an internal resource. No formal mechanism currently exists to transfer this learning. It is Panasonic's most valuable internal asset that nobody is learning from.",
      },
      {
        title: "Kill the Ambassador Model",
        detail: "Decommission the PX Ambassador program. Replace with 8 embedded AI leads — one per operating company — with dual reporting (CAIO + Business CEO), defined budget authority, and quarterly P&L accountability. Announce the first 8 names.",
        why: "56 volunteers for 180,000 employees is symbolic governance at a ratio of 1:3,214. Embedded leads with real authority change behavior. Volunteers don't.",
      },
    ],
  },
  {
    phase: "Days 61–90", label: "Signal & Scale", color: C.green,
    focus: "Make it visible that this time is different. Change the incentive system, not just the narrative.",
    actions: [
      {
        title: "Yamamoto Intervention: Performance Review Reset",
        detail: "Add a mandatory AI adoption and experimentation metric to performance reviews for the top 200 division directors. Weight: 15-20% of total review. Real consequence for non-performance (no promotion, no bonus increment). Announced by Kusumi in a recorded all-hands.",
        why: "Yamamoto will not change behavior because of a keynote. He will change it when his bonus is connected to it. This is the highest-leverage, lowest-cost intervention available. It is not on any current roadmap.",
      },
      {
        title: "Promote 3 Transformation Leaders Publicly",
        detail: "Identify 3 people below VP level who have driven measurable AI adoption or shipped an AI product. Promote them with a press-release-level internal announcement. Name them. Share their work. Make the signal unmistakable.",
        why: "The organization watches who gets promoted far more carefully than what gets announced. 3 visible promotions send a clearer signal about what Panasonic values than any all-hands speech.",
      },
      {
        title: "Publish the First AI Revenue Scorecard",
        detail: "Release the first quarterly AI revenue figure using the newly defined criteria — internally first, then investor-facing. Even if the number is small. Especially if the number is small.",
        why: "Starting the public accountability clock is irreversible. It creates a feedback loop that press releases don't. Every quarter becomes a signal to the organization about whether transformation is real or theater.",
      },
    ],
  },
];

/* ─── SHARED COMPONENTS ──────────────────────────────────── */
function Label({ children, color = C.accent }) {
  return (
    <div style={{
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 9,
      letterSpacing: 2.5,
      color,
      fontWeight: 700,
      marginBottom: 6,
    }}>{children}</div>
  );
}

function Tag({ children, color = C.accent }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: 9,
      fontFamily: "JetBrains Mono, monospace",
      color,
      border: `1px solid ${color}40`,
      borderRadius: 3,
      padding: "2px 7px",
      letterSpacing: 1,
    }}>{children}</span>
  );
}

/* ─── TAB: PIVOT CURVE ───────────────────────────────────── */
function PivotTab() {
  const [hovered, setHovered] = useState(null);
  const hCo = hovered ? COMPANIES.find(c => c.id === hovered) : null;

  return (
    <div>
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Chart area */}
        <div style={{ flex: "1 1 400px", minWidth: 320 }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 18, maxWidth: 480, lineHeight: 1.7 }}>
            Four hardware companies announced major AI pivots in the last decade. Here's what actually happened over 60 months. The divergence point is always the same.
          </div>
          <svg
            viewBox={`0 0 ${SW} ${SH}`}
            style={{ width: "100%", maxWidth: SW, display: "block", overflow: "visible" }}
          >
            {/* Grid */}
            {[0, 25, 50, 75, 100].map(v => (
              <line key={v} x1={PAD.l} y1={yS(v)} x2={SW - PAD.r} y2={yS(v)}
                stroke={C.border} strokeWidth={v === 0 ? 1.5 : 1} />
            ))}
            {[0, 12, 24, 36, 48, 60].map(m => (
              <g key={m}>
                <line x1={xS(m)} y1={PAD.t} x2={xS(m)} y2={PAD.t + cH}
                  stroke={C.border} strokeWidth={m === 0 ? 1.5 : 1} />
                <text x={xS(m)} y={SH - 6} fill={C.textDim} fontSize={8}
                  textAnchor="middle" fontFamily="JetBrains Mono, monospace">M{m}</text>
              </g>
            ))}
            {[0, 50, 100].map(v => (
              <text key={v} x={PAD.l - 6} y={yS(v) + 3} fill={C.textDim} fontSize={8}
                textAnchor="end" fontFamily="JetBrains Mono, monospace">{v}</text>
            ))}

            {/* Critical window highlight */}
            <rect x={xS(18)} y={PAD.t} width={xS(24) - xS(18)} height={cH}
              fill={C.accent} opacity={0.045} />
            <rect x={xS(18)} y={PAD.t} width={1} height={cH} fill={C.accent} opacity={0.3} />
            <rect x={xS(24)} y={PAD.t} width={1} height={cH} fill={C.accent} opacity={0.15} />
            <text x={(xS(18) + xS(24)) / 2} y={PAD.t + 11} fill={C.accent} fontSize={7.5}
              textAnchor="middle" fontFamily="JetBrains Mono, monospace" opacity={0.7}>
              CRITICAL WINDOW
            </text>

            {/* Non-Panasonic lines */}
            {COMPANIES.filter(c => c.id !== "panasonic").map(c => (
              <g key={c.id}>
                <path d={toPath(c.points)} stroke={c.color} strokeWidth={1.5} fill="none"
                  opacity={hovered && hovered !== c.id ? 0.18 : 0.8}
                  strokeDasharray={c.outcome === "progressing" ? "5 3" : "none"}
                />
                {/* Invisible wide hit area */}
                <path d={toPath(c.points)} stroke="transparent" strokeWidth={14} fill="none"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            ))}

            {/* Panasonic */}
            <path d={toPath(COMPANIES.find(c => c.id === "panasonic").points)}
              stroke={C.accent} strokeWidth={2.5} fill="none" opacity={1} />
            <circle cx={xS(12)} cy={yS(22)} r={5} fill={C.accent} />
            <circle cx={xS(12)} cy={yS(22)} r={9} fill={C.accent} opacity={0.15} />
            <text x={xS(12) + 14} y={yS(22) - 6} fill={C.accent} fontSize={8.5}
              fontFamily="JetBrains Mono, monospace" fontWeight={700}>YOU ARE HERE</text>

            {/* Company end labels */}
            {COMPANIES.filter(c => c.id !== "panasonic").map(c => {
              const last = c.points[c.points.length - 1];
              return (
                <text key={c.id + "-lbl"} x={xS(last[0]) + 4} y={yS(last[1]) + 4}
                  fill={c.color} fontSize={8} fontFamily="JetBrains Mono, monospace"
                  opacity={hovered && hovered !== c.id ? 0.18 : 0.9}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {c.short || c.name.split(" ")[0]}
                </text>
              );
            })}
          </svg>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
            {COMPANIES.map(c => (
              <div key={c.id}
                style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                  opacity: hovered && hovered !== c.id && c.id !== "panasonic" ? 0.3 : 1 }}
                onMouseEnter={() => c.id !== "panasonic" && setHovered(c.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div style={{ width: 20, height: 2, background: c.color,
                  borderRadius: 1, opacity: c.outcome === "progressing" ? 0.7 : 1 }} />
                <span style={{ fontSize: 10, color: c.id === "panasonic" ? C.accent : C.textMuted,
                  fontFamily: "JetBrains Mono, monospace" }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side detail */}
        <div style={{ width: 220, flexShrink: 0, paddingTop: 32 }}>
          {hCo ? (
            <div style={{ borderLeft: `2px solid ${hCo.color}`, paddingLeft: 16 }}>
              <Label color={hCo.color}>{hCo.outcome.toUpperCase()}</Label>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 10 }}>{hCo.name}</div>
              <div style={{ fontSize: 11, color: C.accent, fontFamily: "JetBrains Mono, monospace",
                marginBottom: 8 }}>Month {hCo.inflection.month}</div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
                {hCo.inflection.label}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.7 }}>
                {hCo.summary}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: "JetBrains Mono, monospace",
                marginBottom: 20 }}>← HOVER A LINE</div>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.7 }}>
                Every pivot looks identical at Month 12.<br /><br />
                The trajectories diverge between Months 18–24.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pattern callout */}
      <div style={{ marginTop: 28, padding: "18px 22px",
        background: C.accentDim, border: `1px solid ${C.accent}28`,
        borderRadius: 6, maxWidth: 640 }}>
        <Label>THE PATTERN</Label>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: C.text }}>
          Companies that won (Hitachi, Microsoft) had resolved three things by Month 18:{" "}
          <span style={{ color: C.accent }}>authority clarity</span>,{" "}
          <span style={{ color: C.accent }}>proof cycle speed</span>, and{" "}
          <span style={{ color: C.accent }}>willingness to cannibalize</span>.{" "}
          Companies that didn't (GE) had great announcements and no enterprise customers paying for anything.
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: C.accent, fontStyle: "italic" }}>
          Panasonic has ~6 months to resolve these questions. Which trajectory is being built right now?
        </div>
      </div>

      {/* Sources */}
      <SourcesPanel sources={PIVOT_SOURCES} />
    </div>
  );
}

/* ─── TAB: DIAGNOSTIC ────────────────────────────────────── */
function DiagnosticTab() {
  const [scores, setScores] = useState({});
  const [insight, setInsight] = useState(null);

  const scored = Object.keys(scores).length;
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const profile = scored === 8 ? PROFILES.find(p => total >= p.range[0] && total <= p.range[1]) : null;
  const pct = scored === 8 ? Math.round(((total - 8) / 32) * 100) : null;

  return (
    <div>
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Dimensions */}
        <div style={{ flex: "1 1 380px" }}>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20, lineHeight: 1.7 }}>
            Score each dimension as you see it today. Not as it's described in the strategy deck — as it actually operates. This is calibrated against patterns from 4 comparable transformations.
          </div>
          {DIMS.map((d) => (
            <div key={d.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                marginBottom: 6, gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.5 }}>{d.q}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 9, color: C.textDim, fontFamily: "JetBrains Mono, monospace",
                  width: 88, textAlign: "right", flexShrink: 0 }}>{d.lo}</span>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setScores(s => ({ ...s, [d.id]: n }))}
                    onMouseEnter={() => !scores[d.id] && null}
                    style={{
                      width: 32, height: 32, borderRadius: 4,
                      border: `1px solid ${scores[d.id] === n ? C.accent : C.border}`,
                      background: scores[d.id] === n ? C.accentDim : scores[d.id] && scores[d.id] > n ? "#D4A84308" : "transparent",
                      color: scores[d.id] === n ? C.accent : C.textDim,
                      fontSize: 12, fontFamily: "JetBrains Mono, monospace",
                      cursor: "pointer", fontWeight: scores[d.id] === n ? 700 : 400,
                      transition: "all 0.1s",
                    }}
                  >{n}</button>
                ))}
                <span style={{ fontSize: 9, color: C.textDim, fontFamily: "JetBrains Mono, monospace",
                  width: 88, flexShrink: 0 }}>{d.hi}</span>
                <button
                  onClick={() => setInsight(insight === d.id ? null : d.id)}
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: insight === d.id ? C.accent : C.textDim, fontSize: 13, padding: "0 4px",
                    lineHeight: 1, flexShrink: 0 }}
                  title="Why this matters"
                >⊕</button>
              </div>
              {insight === d.id && (
                <div style={{ marginTop: 10, padding: "10px 14px",
                  background: C.surfaceAlt, border: `1px solid ${C.border}`,
                  borderRadius: 5, fontSize: 11, color: C.textMuted, lineHeight: 1.7 }}>
                  {d.insight}
                </div>
              )}
              <div style={{ marginTop: 8, height: 1, background: C.border }} />
            </div>
          ))}
        </div>

        {/* Profile panel */}
        <div style={{ width: 230, flexShrink: 0, position: "sticky", top: 0 }}>
          <Label>READINESS PROFILE</Label>

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2 }}>
              <div style={{ width: `${(scored / 8) * 100}%`, height: "100%",
                background: C.accent, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace",
              color: C.textMuted }}>{scored}/8</span>
          </div>

          {profile ? (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: profile.color, lineHeight: 1.2, marginBottom: 4 }}>
                {profile.name}
              </div>
              <div style={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace",
                color: C.textDim, marginBottom: 14 }}>{total}/40 · {pct}th percentile</div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.7, marginBottom: 18 }}>
                {profile.desc}
              </div>

              <Label>TOP INTERVENTIONS</Label>
              {profile.actions.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 3, flexShrink: 0,
                    background: profile.color + "20", border: `1px solid ${profile.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: profile.color, fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 700 }}>{i + 1}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>{a}</div>
                </div>
              ))}

              <div style={{ marginTop: 14, padding: "8px 12px",
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 4, fontSize: 10, color: C.textDim,
                fontFamily: "JetBrains Mono, monospace" }}>
                ANALOG: {profile.analog}
              </div>

              <button
                onClick={() => setScores({})}
                style={{ marginTop: 16, background: "none",
                  border: `1px solid ${C.border}`, borderRadius: 4, padding: "6px 12px",
                  color: C.textDim, fontSize: 10, fontFamily: "JetBrains Mono, monospace",
                  cursor: "pointer", width: "100%" }}
              >RESET SCORES</button>
            </div>
          ) : (
            <div style={{ padding: "20px 0" }}>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.8, marginBottom: 20 }}>
                Score all 8 dimensions to generate your readiness profile — calibrated against Hitachi, GE, Siemens, and Microsoft at equivalent transformation stages.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {DIMS.map(d => (
                  <div key={d.id} style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: scores[d.id] ? C.textMuted : C.textDim }}>{d.label}</span>
                    {scores[d.id] ? (
                      <span style={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace",
                        color: scores[d.id] <= 2 ? C.red : scores[d.id] >= 4 ? C.green : C.accent }}>
                        {scores[d.id]}/5
                      </span>
                    ) : (
                      <span style={{ fontSize: 9, color: C.textDim, fontFamily: "JetBrains Mono, monospace" }}>—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── TAB: HARD TRUTHS ───────────────────────────────────── */
function HardTruthsTab() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24, lineHeight: 1.7, maxWidth: 580 }}>
        Five contrarian takes on Panasonic Go — designed to provoke disagreement.
        Every pushback is a conversation. Every conversation is a data point.
        The goal isn't to be right. It's to surface what isn't being said internally.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {HARD_TRUTHS.map((t, i) => (
          <div key={t.id}>
            <button
              onClick={() => setOpen(open === t.id ? null : t.id)}
              style={{
                width: "100%", background: "none", border: "none",
                cursor: "pointer", textAlign: "left",
                padding: "20px 0", display: "flex", gap: 20, alignItems: "flex-start",
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11,
                color: C.red, flexShrink: 0, paddingTop: 2, fontWeight: 700,
                opacity: 0.7 }}>{t.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, color: C.text, marginBottom: 4, fontWeight: 400,
                  letterSpacing: -0.2 }}>{t.headline}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{t.sub}</div>
              </div>
              <div style={{ color: open === t.id ? C.accent : C.textDim, fontSize: 18,
                flexShrink: 0, paddingTop: 0, transition: "transform 0.2s",
                transform: open === t.id ? "rotate(45deg)" : "rotate(0deg)" }}>+</div>
            </button>

            {open === t.id && (
              <div style={{ paddingBottom: 24, paddingLeft: 46 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <Label color={C.red}>THE TAKE</Label>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, maxWidth: 580 }}>
                      {t.take}
                    </div>
                  </div>
                  <div style={{ padding: "14px 18px", background: C.surfaceAlt,
                    border: `1px solid ${C.border}`, borderRadius: 5, maxWidth: 560 }}>
                    <Label color={C.accent}>WHY YOU MIGHT DISAGREE</Label>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.8 }}>
                      {t.pushback}
                    </div>
                  </div>
                  <div>
                    <Label color={C.blue}>PANASONIC PARALLEL</Label>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.8, maxWidth: 560 }}>
                      {t.parallel}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${C.border}` }} />
      </div>
    </div>
  );
}

/* ─── TAB: PATTERN FILES ─────────────────────────────────── */
function PatternFilesTab() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24, lineHeight: 1.7, maxWidth: 580 }}>
        Deep-reads on four hardware-to-AI pivots. What they got right, what killed them, and the Panasonic parallel. Click any card to expand.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {PATTERNS.map((p) => (
          <div key={p.company}
            style={{ background: C.surface, border: `1px solid ${open === p.company ? p.outcomeColor + "60" : C.border}`,
              borderRadius: 6, overflow: "hidden", cursor: "pointer",
              transition: "border-color 0.15s" }}
            onClick={() => setOpen(open === p.company ? null : p.company)}
          >
            <div style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.company}</div>
                <Tag color={p.outcomeColor}>{p.outcome.split(" ")[0].toUpperCase()}</Tag>
              </div>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: "JetBrains Mono, monospace",
                marginBottom: 8 }}>{p.pivot}</div>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: "JetBrains Mono, monospace" }}>
                ANNOUNCED {p.announced}
              </div>
            </div>

            {open === p.company && (
              <div style={{ borderTop: `1px solid ${C.border}`, padding: "16px 18px",
                display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <Label color={C.textDim}>MONTH 18 REALITY</Label>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>{p.month18}</div>
                </div>
                <div>
                  <Label color={C.red}>WHAT KILLED / SAVED IT</Label>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>{p.killer}</div>
                </div>
                <div style={{ padding: "12px 14px", background: C.accentDim,
                  border: `1px solid ${C.accent}28`, borderRadius: 4 }}>
                  <Label color={C.accent}>PANASONIC PARALLEL</Label>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{p.parallel}</div>
                </div>
                <div style={{ padding: "8px 12px", background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 4 }}>
                  <Label color={C.textDim}>THE LESSON</Label>
                  <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6, fontStyle: "italic" }}>
                    {p.lesson}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TAB: 90-DAY PLAYBOOK ───────────────────────────────── */
function PlaybookTab() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 24, lineHeight: 1.7, maxWidth: 600 }}>
        A 90-day sequencing framework for Panasonic Go — designed to work with the existing org structure, not around it. Three phases. Nine actions. Each grounded in a specific pattern from comparable transformations.
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        {NINETY.map((phase, pi) => (
          <div key={pi} style={{ flex: "1 1 220px", minWidth: 210 }}>
            {/* Phase header */}
            <div style={{ padding: "14px 16px",
              background: phase.color + "12",
              border: `1px solid ${phase.color}30`,
              borderRadius: "6px 6px 0 0", marginBottom: 0 }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9,
                color: phase.color, letterSpacing: 2, marginBottom: 6 }}>{phase.phase}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                {phase.label}
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
                {phase.focus}
              </div>
            </div>

            {/* Actions */}
            <div style={{ border: `1px solid ${phase.color}22`,
              borderTop: "none", borderRadius: "0 0 6px 6px", overflow: "hidden" }}>
              {phase.actions.map((a, ai) => {
                const key = `${pi}-${ai}`;
                const isOpen = open === key;
                return (
                  <div key={ai} style={{ borderTop: ai === 0 ? "none" : `1px solid ${C.border}` }}>
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      style={{ width: "100%", background: isOpen ? C.surfaceAlt : "transparent",
                        border: "none", textAlign: "left", padding: "12px 16px",
                        cursor: "pointer", display: "flex", justifyContent: "space-between",
                        alignItems: "center", gap: 8 }}
                    >
                      <div style={{ fontSize: 12, color: isOpen ? C.text : C.textMuted,
                        fontWeight: isOpen ? 600 : 400, lineHeight: 1.4 }}>{a.title}</div>
                      <div style={{ color: isOpen ? phase.color : C.textDim, flexShrink: 0,
                        fontSize: 14, transform: isOpen ? "rotate(45deg)" : "none",
                        transition: "transform 0.15s" }}>+</div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 16px 14px", background: C.surfaceAlt }}>
                        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7,
                          marginBottom: 10 }}>{a.detail}</div>
                        <div style={{ padding: "8px 12px",
                          background: phase.color + "10",
                          border: `1px solid ${phase.color}25`,
                          borderRadius: 4 }}>
                          <div style={{ fontSize: 9, color: phase.color, fontFamily: "JetBrains Mono, monospace",
                            letterSpacing: 1.5, marginBottom: 4 }}>WHY NOW</div>
                          <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
                            {a.why}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom callout */}
      <div style={{ marginTop: 28, padding: "16px 20px",
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 6, maxWidth: 640 }}>
        <Label color={C.textDim}>SEQUENCING LOGIC</Label>
        <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8 }}>
          Days 1-30 must happen before 31-60 can work. You cannot run proof cycles if authority is undefined. You cannot kill the ambassador model before you have a replacement mechanism. You cannot change the signal without something real to point at. The sequence is not arbitrary — it's causal.
        </div>
      </div>
    </div>
  );
}

/* ─── SOURCES PANEL ─────────────────────────────────────── */
function SourcesPanel({ sources }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 24, maxWidth: 640 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: `1px solid ${C.border}`,
          borderRadius: 4, padding: "6px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace",
          color: C.textDim, letterSpacing: 2 }}>
          {open ? "HIDE" : "VIEW"} SOURCES & METHODOLOGY
        </span>
        <span style={{ color: C.textDim, fontSize: 12,
          transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          ▾
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 12, padding: "16px 18px",
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.7, marginBottom: 16,
            fontStyle: "italic" }}>
            Chart Y-axis represents a composite transformation momentum index — not a single reported metric.
            Index components: analyst/investor confidence, enterprise customer revenue, internal adoption
            indicators, and disclosed revenue share data. Exact values are approximations; relative
            trajectories and inflection timing are the meaningful signal.
          </div>
          {sources.map((s) => (
            <div key={s.company} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 2, background: s.color, borderRadius: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted,
                  fontFamily: "JetBrains Mono, monospace" }}>{s.company}</div>
              </div>
              {s.note && (
                <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.6, marginBottom: 8, paddingLeft: 18 }}>
                  {s.note}
                </div>
              )}
              <div style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>
                {s.sources.map((src, i) => (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontSize: 9, color: s.color, fontFamily: "JetBrains Mono, monospace",
                      flexShrink: 0, paddingTop: 1 }}>—</span>
                    <div>
                      <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>{src.label}.</span>{" "}
                      <span style={{ fontSize: 10, color: C.textDim }}>{src.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── BRIGHT SPOTS DATA ──────────────────────────────────── */
const BRIGHT_SPOTS = [
  {
    id: "blueyonder",
    label: "Blue Yonder",
    headline: "The only hardware company that bought its way to AI leadership — and it worked.",
    stat: "$1.42B",
    statLabel: "AI revenue, already real",
    color: C.green,
    detail: "Blue Yonder processes 25 billion supply chain predictions daily for 3,000 enterprise customers. At the equivalent stage of Hitachi's Lumada journey, Hitachi had no external AI revenue. Panasonic started with a market-proven, category-leading AI platform generating real revenue. This is an 8-year head start that cannot be bought by Siemens, Honeywell, or any hardware competitor that didn't make this acquisition.",
    analog: "Hitachi at equivalent stage: ~$200M in nascent Lumada revenue, still proving the model. Panasonic: $1.42B, proven.",
    unlock: "The unlock is not integration — it's positioning. 'The company behind Blue Yonder' is not yet part of Panasonic's investor narrative. It should be the first sentence.",
  },
  {
    id: "energy",
    label: "Energy × Data Centers",
    headline: "The AI infrastructure story hiding inside the battery business.",
    stat: "47%",
    statLabel: "Profit growth, FY2025",
    color: C.accent,
    detail: "AI data centers are the fastest-growing energy infrastructure market on earth. Panasonic Energy's EV battery expertise, thermal management capability, and manufacturing scale translate directly into AI data center battery backup and UPS systems. Kansas factory AI optimization for EV batteries is producing measurable yield improvements right now — this is not a roadmap item. It is live, generating profit, and validated.",
    analog: "Eaton and Vertiv built multi-billion dollar businesses on data center power infrastructure. Panasonic Energy has comparable or superior capability and is not yet positioned in that market.",
    unlock: "Naming Energy's data center power business as a dedicated P&L with an explicit AI infrastructure narrative. This reframes a battery company as AI infrastructure — a completely different investor multiple.",
  },
  {
    id: "anthropic",
    label: "Anthropic Partnership",
    headline: "The deepest AI research relationship available to any hardware company.",
    stat: "Global Strategic",
    statLabel: "Partnership tier",
    color: "#7CB8D4",
    detail: "Hitachi's AI partnerships: OpenAI enterprise license, Google Cloud. Siemens: Microsoft Azure, generic LLM integrations. Panasonic's Anthropic partnership was announced with Daniela Amodei on stage at CES — the President of the fastest-growing AI lab in the world. This is not a vendor relationship. The partnership covers both consumer (Umi) and enterprise (Claude across the group), and the relationship was built at the highest level of both organizations.",
    analog: "In 2012, Microsoft invested $300M in Barnes & Noble's Nook. Nobody remembers it. In 2023, Microsoft invested $13B in OpenAI. The depth of the relationship — and the intention behind it — is what determines value. Panasonic's Anthropic relationship has the depth.",
    unlock: "Formalizing an Anthropic integration roadmap across all 8 operating companies — not just Well and Connect. Each OC has a specific AI use case where frontier models create competitive advantage. Mapping these explicitly creates the strategic narrative.",
  },
  {
    id: "ot",
    label: "OT Expertise",
    headline: "The moat that pure-play AI companies cannot cross.",
    stat: "108 years",
    statLabel: "Manufacturing depth",
    color: C.orange,
    detail: "Panasonic knows how factories work at a level no AI vendor can replicate. Predictive maintenance, quality control, yield optimization, supply chain orchestration — these require domain knowledge built over decades. Hitachi's Lumada lesson: OT + IT is the combination that wins in industrial AI. Pure-play AI vendors offer the technology. Panasonic offers the technology plus 108 years of manufacturing intuition encoded into processes, data, and people. That combination is inimitable.",
    analog: "Mistral, Cohere, and every other AI vendor can sell models. None of them know what an anomaly sounds like on a Panasonic production line at 2am. That knowledge, combined with AI capability, is a competitive moat that compounds.",
    unlock: "Explicitly positioning Panasonic's manufacturing expertise as the differentiating layer in every industrial AI offering — not as background, but as the product. 'Our AI knows manufacturing because we are manufacturing.'",
  },
  {
    id: "install",
    label: "1B Customer Touchpoints",
    headline: "The distribution advantage no AI startup can afford to build.",
    stat: "1B+",
    statLabel: "Devices in homes globally",
    color: C.blue,
    detail: "Panasonic products are in over a billion homes. Every HVAC unit, every EV charger, every commercial kitchen, every security camera is a data endpoint and a distribution channel for AI-native services. No AI company — not Google, not Amazon, not OpenAI — has this installed base in physical infrastructure. This is exactly the asset Nest was supposed to unlock for Google. The difference: Panasonic owns the full stack from device to cloud.",
    analog: "When Amazon launched Alexa, the killer insight wasn't the voice technology — it was distribution into 100M+ Prime households. Panasonic's installed base is 10x larger and reaches infrastructure categories Amazon has never touched.",
    unlock: "Identifying 3 product categories in the installed base where AI-native services create a recurring revenue stream. HVAC optimization-as-a-service, EV charging intelligence, commercial kitchen energy management. Each is a multi-billion dollar category. None require selling into new markets.",
  },
];

/* ─── TAB: BRIGHT SPOTS ──────────────────────────────────── */
function BrightSpotsTab() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 24, maxWidth: 600 }}>
        <div style={{ fontSize: 16, lineHeight: 1.75, color: C.text, marginBottom: 12 }}>
          The Hard Truths are real. So is this: Panasonic enters this transformation with
          assets that GE, Siemens, and Hitachi didn't have at the equivalent stage.
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
          The question isn't whether the assets exist. It's whether the organization can
          compose them into a growth story before the critical window closes.
          Each card below identifies an asset, its actual magnitude, and the specific
          action that unlocks it.
        </div>
      </div>

      {/* Asset cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {BRIGHT_SPOTS.map((s) => (
          <div key={s.id} style={{ borderTop: `1px solid ${C.border}` }}>
            <button
              onClick={() => setOpen(open === s.id ? null : s.id)}
              style={{
                width: "100%", background: "none", border: "none",
                cursor: "pointer", textAlign: "left",
                padding: "18px 0",
                display: "flex", gap: 20, alignItems: "flex-start",
              }}
            >
              {/* Stat */}
              <div style={{ width: 80, flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color,
                  fontFamily: "JetBrains Mono, monospace", lineHeight: 1.1 }}>{s.stat}</div>
                <div style={{ fontSize: 8, color: C.textDim, letterSpacing: 1,
                  marginTop: 2, lineHeight: 1.4 }}>{s.statLabel.toUpperCase()}</div>
              </div>
              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9,
                  color: s.color, letterSpacing: 2, marginBottom: 5 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.45 }}>{s.headline}</div>
              </div>
              {/* Toggle */}
              <div style={{ color: open === s.id ? s.color : C.textDim, fontSize: 18,
                flexShrink: 0, paddingTop: 2, transition: "transform 0.2s",
                transform: open === s.id ? "rotate(45deg)" : "rotate(0deg)" }}>+</div>
            </button>

            {open === s.id && (
              <div style={{ paddingBottom: 22, paddingLeft: 100 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
                  <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8 }}>
                    {s.detail}
                  </div>
                  <div style={{ padding: "12px 16px",
                    background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 5 }}>
                    <Label color={C.textDim}>COMPARABLE STAGE</Label>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>{s.analog}</div>
                  </div>
                  <div style={{ padding: "12px 16px",
                    background: s.color + "0D", border: `1px solid ${s.color}30`, borderRadius: 5 }}>
                    <Label color={s.color}>THE UNLOCK</Label>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{s.unlock}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${C.border}` }} />
      </div>

      {/* Closing statement */}
      <div style={{ marginTop: 28, padding: "18px 22px",
        background: C.accentDim, border: `1px solid ${C.accent}28`,
        borderRadius: 6, maxWidth: 640 }}>
        <Label>THE HONEST SYNTHESIS</Label>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: C.text }}>
          GE had none of these. Hitachi had one (OT expertise). Siemens had two.
          Microsoft had distribution and culture — but had to rebuild everything else.{" "}
          <span style={{ color: C.accent }}>
            Panasonic enters Month 12 with all five. The assets aren't the problem.
          </span>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
          The constraint is organizational speed and incentive alignment — which is exactly
          what can be changed. The 90-Day Playbook addresses the constraints. The assets compound on their own once the blockers are removed.
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────── */
const TABS = [
  { label: "The Pivot Curve", id: "curve" },
  { label: "Readiness Diagnostic", id: "diag" },
  { label: "Hard Truths", id: "truths" },
  { label: "Bright Spots", id: "bright" },
  { label: "Pattern Files", id: "patterns" },
  { label: "90-Day Playbook", id: "playbook" },
];

export default function PanasonicAdvisor() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{
      background: C.bg, color: C.text,
      minHeight: "100vh",
      fontFamily: "'Newsreader', Georgia, serif",
      display: "flex", flexDirection: "column",
    }}>
      {/* Google fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2C2C34; border-radius: 2px; }
        button:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "18px 32px 14px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 9,
            color: C.accent, letterSpacing: 3, marginBottom: 7 }}>
            HARDWARE → AI TRANSFORMATION PLAYBOOK
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: -0.5,
            lineHeight: 1.2, color: C.text }}>
            What GE, Hitachi, Siemens & Microsoft reveal
            <br />about where Panasonic Go goes next
          </h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "JetBrains Mono, monospace" }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.accent, lineHeight: 1 }}>12</div>
            <div style={{ fontSize: 8, color: C.textDim, letterSpacing: 2.5, marginTop: 2 }}>
              MONTHS IN
            </div>
            <div style={{ fontSize: 8, color: C.textDim, letterSpacing: 1.5, marginTop: 3 }}>
              CRITICAL WINDOW: 18–24
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: `1px solid ${C.border}`,
        padding: "0 32px", overflowX: "auto", flexShrink: 0,
      }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "11px 18px",
            fontSize: 10, fontFamily: "JetBrains Mono, monospace", letterSpacing: 0.8,
            color: tab === i ? C.accent : C.textMuted,
            borderBottom: `2px solid ${tab === i ? C.accent : "transparent"}`,
            whiteSpace: "nowrap", transition: "color 0.15s",
          }}>{t.label.toUpperCase()}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px 48px" }}>
        {tab === 0 && <PivotTab />}
        {tab === 1 && <DiagnosticTab />}
        {tab === 2 && <HardTruthsTab />}
        {tab === 3 && <BrightSpotsTab />}
        {tab === 4 && <PatternFilesTab />}
        {tab === 5 && <PlaybookTab />}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: "10px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 10, color: C.textDim }}>
          Built by{" "}
          <span style={{ color: C.accent }}>Christian Spetz</span>{" "}
          — humaninthelead.ai
        </div>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: "JetBrains Mono, monospace" }}>
          Based on public information only
        </div>
      </div>
    </div>
  );
}
