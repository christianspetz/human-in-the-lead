import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// ARCLINE OS — FULL EXPERIENCE
// 1. Product Concept  2. Implementation Simulator  3. Roadmap
// ═══════════════════════════════════════════════════════

// ─── Shared Constants ─────────────────────
const GOLD = "#D4A853";
const CREAM = "#E8D5B7";
const GREEN = "#7CB9A8";
const PURPLE = "#C4A1D4";
const BLUE = "#7BA7CC";
const RED = "#D48A8A";
const BG = "#111110";
const CARD = "#1A1A18";
const BORDER = "#252523";
const FONT = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', serif";

// ═══════════════════════════════════════════
// TAB 1 — PRODUCT CONCEPT (Full arcline-os)
// ═══════════════════════════════════════════

const STEPS = [
  { id: "foundation", label: "01", title: "The Knowledge Graph", subtitle: "The Foundation",
    description: "Everything starts with the knowledge graph — a data architecture that links clients, their household hierarchy, the products they hold, and the agents serving them. Unlike flat CRM records, the graph captures complex relationships: spouses, trusts, entities, beneficiaries, and cross-product connections. This is what enables AI at scale.",
    quote: "By linking the client, the client hierarchy, the client household to the product and the agent servicing the client — we provide the foundation to substantially automate." },
  { id: "onboarding", label: "02", title: "AI-Powered Onboarding", subtitle: "From Weeks to Days",
    description: "Onboarding is where most firms bleed time. The traditional process: data gathering, KYC, compliance checks, account opening, funding — all done manually with swivel-chair data entry. The AI OS pre-fills data from CRM, Plaid, ADP, and even pulls 10 years of IRS tax returns. AI agents handle document collection, extraction, and follow-ups automatically.",
    quote: "Our biggest focus when it comes to data filling initially is to prefill as much as we can. If you have the information, there's no reason on Earth to swivel-share it into other systems." },
  { id: "agents", label: "03", title: "Three Agent Types", subtitle: "The AI Workforce",
    description: "The system deploys three distinct agent personas: Frontline Agents make advisors and brokers more productive by surfacing client insights and recommending actions. Operations Agents handle back-office compliance, data translation, and workflow execution. Product Agents help teams design and generate onboarding workflows with AI rather than building from scratch.",
    quote: "Our agents are not replacing humans per se, but their job is to make the humans way more efficient and productive." },
  { id: "servicing", label: "04", title: "Proactive Servicing", subtitle: "Beyond Recommendations",
    description: "The AI listens to calls, emails, and data feeds. When a trigger event occurs — a client mentions a newborn, a lock-up expiring, a rate drop — the system doesn't just recommend actions. It executes the full workflow: generates forms, triggers integrations, sends to custodians. Recommendations are prioritized so advisors see the top 3 that matter, not 48 items they'll ignore.",
    quote: "We don't stop by recommending actions. We go all the way to the execution — including integrations with portfolio management, CRM, and custodians." },
  { id: "compliance", label: "05", title: "Compliance-First Design", subtitle: "Trust & Control",
    description: "Every workflow has embedded audit trails, approval chains, and data validations. Despite the AI's ability to run autonomously, every action requires human approval before execution. Single-tenant architecture, private LLMs — zero data sharing between clients. Nothing traverses the public internet. The industry isn't ready for full autonomy, and that's by design.",
    quote: "We never allow for full autonomy for now because we don't think the industry is ready. Everything still requires a human to approve before it gets triggered." },
  { id: "interface", label: "06", title: "Chat-First Future", subtitle: "The Interface Shift",
    description: "In the next 12 months, the primary interaction model shifts from dashboards to conversational AI. Advisors will chat with the system: 'Trigger a distribution event for account XYZ and add a beneficiary with Pershing.' Voice-enabled, context-aware, with the full knowledge graph behind every response. The UI still exists, but the chat becomes the operating layer.",
    quote: "In 12 months, people are going to interact with the app mainly from the chat experience. People don't want to learn UIs — they want to literally chat with apps." },
];

const DEMO_CLIENT = {
  name: "Margaret Chen", tier: "Ultra HNW", aum: "$47.2M", household: "Chen Family Trust", advisor: "Sarah Kim",
  householdMembers: [
    { name: "Margaret", role: "Primary", age: 58 }, { name: "David", role: "Spouse", age: 61 },
    { name: "Emily", role: "Daughter", age: 29 }, { name: "Jason", role: "Son", age: 26 },
  ],
  entities: [{ name: "Chen Family Trust", type: "Trust" }, { name: "MC Holdings LLC", type: "LLC" }, { name: "Chen Foundation", type: "Foundation" }],
  products: [{ name: "Managed Portfolio", value: "$32.1M" }, { name: "PE Fund III", value: "$10.5M" }, { name: "Estate Plan", value: "—" }, { name: "Life Insurance", value: "$5M" }],
};

const ONBOARDING_CLIENT = {
  name: "Alexandra Volkov", tier: "HNW", aum: "$8.5M", progress: 62,
  steps: [
    { name: "Identity Verification", status: "complete", ai: "Passport OCR verified — 99.7% confidence", source: "Internal" },
    { name: "Risk Assessment", status: "complete", ai: "Moderate-aggressive profile confirmed via questionnaire", source: "Internal" },
    { name: "KYC / AML Check", status: "complete", ai: "No flags — PEP screening passed", source: "Refinitiv" },
    { name: "Data Pre-fill", status: "complete", ai: "82% of fields pre-filled from Plaid + CRM", source: "Plaid, Salesforce" },
    { name: "Document Collection", status: "active", ai: "3 of 7 docs received — auto-reminder sent 2hrs ago", source: "Email Agent" },
    { name: "Account Setup", status: "pending", ai: "Waiting on docs to trigger custodian integration", source: "Pershing" },
    { name: "IPS Signing", status: "pending", ai: null, source: "DocuSign" },
    { name: "Initial Funding", status: "pending", ai: null, source: "Wire/ACH" },
  ],
};

const AGENT_TYPES = [
  { type: "Frontline", icon: "◈", color: CREAM, persona: "Advisor / Broker / Banker", focus: "Client-facing productivity",
    examples: ["Surface next-best actions based on trigger events", "Recommend beneficiary updates when life events detected", "Pre-generate meeting agendas from client data", "Identify cross-sell: 529 plans, insurance gaps, refinancing"] },
  { type: "Operations", icon: "◉", color: GREEN, persona: "Back Office / Compliance / Finance", focus: "Workflow execution & data processing",
    examples: ["Translate unstructured data into structured workflows", "Auto-generate custodian forms via integrations", "Execute distribution events end-to-end", "Monitor compliance checkpoints and audit trails"] },
  { type: "Product", icon: "◆", color: PURPLE, persona: "Product Managers / Workflow Designers", focus: "System configuration & journey design",
    examples: ["AI-generate onboarding blueprints from best practices", "Configure multi-custodian, multi-product workflows", "Build approval chains and compliance controls", "Extend product types: wealth → insurance → banking"] },
];

const SERVICING_EVENTS = [
  { trigger: "Client emails: 'We just had a baby!'", priority: "critical",
    actions: [
      { text: "Add newborn as beneficiary to 3 accounts", status: "ready", agent: "Ops" },
      { text: "Recommend opening 529 college savings plan", status: "ready", agent: "Frontline" },
      { text: "Suggest increasing life insurance coverage", status: "suggested", agent: "Frontline" },
      { text: "Generate custodian beneficiary change forms", status: "queued", agent: "Ops" },
    ] },
  { trigger: "PE Fund III lock-up expires in 60 days", priority: "high",
    actions: [
      { text: "Prepare reinvestment options analysis", status: "ready", agent: "Frontline" },
      { text: "Schedule advisory review meeting", status: "suggested", agent: "Frontline" },
      { text: "Model tax implications of distribution vs rollover", status: "queued", agent: "Ops" },
    ] },
  { trigger: "Mortgage rate drops below client's current rate", priority: "medium",
    actions: [
      { text: "Calculate refinancing savings ($1,200/mo)", status: "ready", agent: "Ops" },
      { text: "Flag opportunity in next advisor touchpoint", status: "suggested", agent: "Frontline" },
    ] },
];

// ─── Interactive Demo Components ──────────

function KnowledgeGraphDemo({ animated }) {
  const cx = 220, cy = 145;
  const familyNodes = DEMO_CLIENT.householdMembers.map((m, i) => {
    const angle = (Math.PI * 0.25) + (i * Math.PI * 0.28);
    return { x: cx + Math.cos(angle) * 100, y: cy + Math.sin(angle) * 85, label: m.name, role: m.role, type: "family" };
  });
  const entityNodes = DEMO_CLIENT.entities.map((e, i) => {
    const angle = -(Math.PI * 0.15) - (i * Math.PI * 0.32);
    return { x: cx + Math.cos(angle) * 110, y: cy + Math.sin(angle) * 90, label: e.name.split(" ")[0], subLabel: e.type, type: "entity" };
  });
  const productNodes = DEMO_CLIENT.products.map((p, i) => {
    const angle = Math.PI + 0.2 + (i * Math.PI * 0.2);
    return { x: cx + Math.cos(angle) * 108, y: cy + Math.sin(angle) * 88, label: p.name.split(" ")[0], subLabel: p.value, type: "product" };
  });
  const advisorNode = { x: cx - 30, y: cy + 120, label: "Sarah Kim", subLabel: "Advisor", type: "agent" };
  const allNodes = [{ x: cx, y: cy, label: "Margaret", subLabel: "Primary", type: "center" }, ...familyNodes, ...entityNodes, ...productNodes, advisorNode];
  const typeStyles = {
    center: { fill: CREAM, stroke: CREAM, r: 30, fontSize: 11 },
    family: { fill: GREEN, stroke: GREEN, r: 22, fontSize: 9 },
    entity: { fill: PURPLE, stroke: PURPLE, r: 22, fontSize: 9 },
    product: { fill: BLUE, stroke: BLUE, r: 22, fontSize: 9 },
    agent: { fill: GOLD, stroke: GOLD, r: 22, fontSize: 9 },
  };
  return (
    <svg viewBox="0 0 440 290" style={{ width: "100%", height: "100%", maxHeight: 290 }}>
      <defs><filter id="graphGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {allNodes.slice(1).map((n, i) => (
        <line key={`e-${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="#333" strokeWidth="1" strokeDasharray="5,4"
          style={{ opacity: animated ? 1 : 0.3, transition: `opacity 0.5s ease ${i * 0.08}s` }} />
      ))}
      {entityNodes.map((e, i) => productNodes[i] && (
        <line key={`cr-${i}`} x1={e.x} y1={e.y} x2={productNodes[i].x} y2={productNodes[i].y}
          stroke="#222" strokeWidth="0.5" strokeDasharray="3,5"
          style={{ opacity: animated ? 0.5 : 0, transition: `opacity 0.8s ease ${0.5 + i * 0.1}s` }} />
      ))}
      {allNodes.map((n, i) => {
        const s = typeStyles[n.type];
        return (
          <g key={`n-${i}`} filter="url(#graphGlow)"
            style={{ opacity: animated ? 1 : 0, transform: animated ? "scale(1)" : "scale(0.8)", transformOrigin: `${n.x}px ${n.y}px`, transition: `all 0.4s ease ${i * 0.06}s` }}>
            <circle cx={n.x} cy={n.y} r={s.r} fill={s.fill} fillOpacity="0.1" stroke={s.stroke} strokeWidth="1.5" strokeOpacity="0.6" />
            <text x={n.x} y={n.y + (n.subLabel ? -2 : 3)} fill={s.fill} fontSize={s.fontSize} textAnchor="middle" fontFamily={FONT} fontWeight={n.type === "center" ? "600" : "400"}>{n.label}</text>
            {n.subLabel && <text x={n.x} y={n.y + 10} fill={s.fill} fillOpacity="0.5" fontSize="7" textAnchor="middle" fontFamily={FONT}>{n.subLabel}</text>}
          </g>
        );
      })}
      {[{ label: "Client", color: CREAM, x: 20 }, { label: "Family", color: GREEN, x: 90 }, { label: "Entity", color: PURPLE, x: 155 }, { label: "Product", color: BLUE, x: 225 }, { label: "Agent", color: GOLD, x: 300 }].map(l => (
        <g key={l.label}><circle cx={l.x} cy={278} r={4} fill={l.color} fillOpacity="0.4" /><text x={l.x + 9} y={281} fill="#666" fontSize="8" fontFamily={FONT}>{l.label}</text></g>
      ))}
    </svg>
  );
}

function FoundationView() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);
  return (
    <div>
      <div style={{ background: "#141413", border: "1px solid #222", borderRadius: 14, padding: "8px 0", marginBottom: 20 }}>
        <KnowledgeGraphDemo animated={animated} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[{ label: "Household Members", value: "4", sub: "Margaret, David, Emily, Jason" }, { label: "Entities & Trusts", value: "3", sub: "Trust, LLC, Foundation" }, { label: "Active Products", value: "4", sub: "Portfolio, PE, Estate, Insurance" }, { label: "Graph Connections", value: "23", sub: "Cross-linked relationships" }].map((m, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px",
            opacity: animated ? 1 : 0, transform: animated ? "translateY(0)" : "translateY(8px)", transition: `all 0.4s ease ${0.3 + i * 0.1}s` }}>
            <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontFamily: SERIF, color: CREAM, fontWeight: 300, margin: "4px 0 2px" }}>{m.value}</div>
            <div style={{ fontSize: 10, color: "#666" }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnboardingView() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: CREAM }}>{ONBOARDING_CLIENT.name}</div>
          <div style={{ fontSize: 11, color: "#666" }}>{ONBOARDING_CLIENT.tier} · {ONBOARDING_CLIENT.aum}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontFamily: SERIF, color: GOLD, fontWeight: 300 }}>{ONBOARDING_CLIENT.progress}%</div>
          <div style={{ fontSize: 9, color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>Complete</div>
        </div>
      </div>
      <div style={{ height: 4, background: BORDER, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: animated ? `${ONBOARDING_CLIENT.progress}%` : "0%", background: `linear-gradient(90deg, ${GOLD}, ${CREAM})`, borderRadius: 2, transition: "width 1s ease 0.3s" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {ONBOARDING_CLIENT.steps.map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < ONBOARDING_CLIENT.steps.length - 1 ? "1px solid #1A1A18" : "none",
            opacity: animated ? 1 : 0, transform: animated ? "translateX(0)" : "translateX(-12px)", transition: `all 0.35s ease ${0.2 + i * 0.08}s` }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 28, paddingTop: 2 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%",
                background: step.status === "complete" ? "#4A9A7E" : step.status === "active" ? GOLD : CARD,
                border: step.status === "pending" ? "2px solid #333" : "2px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: step.status === "pending" ? "#444" : "#111", fontWeight: 700 }}>
                {step.status === "complete" ? "✓" : step.status === "active" ? "●" : (i + 1)}
              </div>
              {i < ONBOARDING_CLIENT.steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: step.status === "complete" ? "#4A9A7E33" : "#1E1E1C" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: step.status === "pending" ? "#555" : "#D4D0C8" }}>{step.name}</span>
                <span style={{ fontSize: 9, color: "#444", fontFamily: "monospace" }}>{step.source}</span>
              </div>
              {step.ai && <div style={{ fontSize: 11, color: "#8A8A7A", marginTop: 4, display: "flex", gap: 5, alignItems: "flex-start", lineHeight: 1.5 }}>
                <span style={{ color: GOLD, fontSize: 9, marginTop: 2, flexShrink: 0 }}>⚡</span>{step.ai}
              </div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsView() {
  const [expanded, setExpanded] = useState(0);
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {AGENT_TYPES.map((agent, i) => (
        <div key={i} onClick={() => setExpanded(i)} style={{
          background: expanded === i ? CARD : "#151514", border: `1px solid ${expanded === i ? agent.color + "33" : "#222"}`,
          borderRadius: 12, padding: expanded === i ? "18px 20px" : "14px 20px", cursor: "pointer", transition: "all 0.3s ease",
          opacity: animated ? 1 : 0, transform: animated ? "translateY(0)" : "translateY(10px)", transitionDelay: `${i * 0.1}s` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: agent.color, fontSize: 18 }}>{agent.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: agent.color }}>{agent.type} Agent</div>
                <div style={{ fontSize: 10, color: "#666" }}>{agent.persona}</div>
              </div>
            </div>
            <span style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>{agent.focus}</span>
          </div>
          {expanded === i && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${agent.color}15` }}>
              {agent.examples.map((ex, j) => (
                <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ color: agent.color, fontSize: 8, marginTop: 4, opacity: 0.6 }}>▸</span>
                  <span style={{ fontSize: 12, color: "#A8A49A", lineHeight: 1.5 }}>{ex}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ServicingView() {
  const [activeEvent, setActiveEvent] = useState(0);
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  const priorityColors = { critical: RED, high: GOLD, medium: GREEN };
  const statusStyles = { ready: { bg: "#4A9A7E22", color: GREEN, label: "READY" }, suggested: { bg: `${GOLD}22`, color: GOLD, label: "SUGGESTED" }, queued: { bg: `${BLUE}22`, color: BLUE, label: "QUEUED" } };
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {SERVICING_EVENTS.map((evt, i) => (
          <button key={i} onClick={() => { setActiveEvent(i); setAnimated(false); setTimeout(() => setAnimated(true), 50); }}
            style={{ flex: 1, background: activeEvent === i ? CARD : "#141413", border: `1px solid ${activeEvent === i ? priorityColors[evt.priority] + "44" : "#222"}`,
              borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease" }}>
            <div style={{ fontSize: 8, color: priorityColors[evt.priority], textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.8px", marginBottom: 4 }}>● {evt.priority}</div>
            <div style={{ fontSize: 10, color: activeEvent === i ? "#D4D0C8" : "#666", lineHeight: 1.4, fontFamily: FONT }}>
              {evt.trigger.length > 40 ? evt.trigger.substring(0, 40) + "…" : evt.trigger}
            </div>
          </button>
        ))}
      </div>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 8 }}>Trigger Event Detected</div>
        <div style={{ fontSize: 14, color: CREAM, fontWeight: 500, lineHeight: 1.5 }}>"{SERVICING_EVENTS[activeEvent].trigger}"</div>
      </div>
      <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 10 }}>AI-Generated Action Plan</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SERVICING_EVENTS[activeEvent].actions.map((action, i) => {
          const st = statusStyles[action.status];
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#151514", border: "1px solid #222", borderRadius: 10, padding: "12px 16px",
              opacity: animated ? 1 : 0, transform: animated ? "translateX(0)" : "translateX(-10px)", transition: `all 0.3s ease ${i * 0.1}s` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: "#C8C4B8", lineHeight: 1.4 }}>{action.text}</div>
                <div style={{ fontSize: 9, color: "#555", marginTop: 3 }}>Agent: {action.agent}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 8, padding: "3px 10px", borderRadius: 10, background: st.bg, color: st.color, fontWeight: 700, letterSpacing: "0.5px" }}>{st.label}</span>
                <button style={{ background: "none", border: "1px solid #333", borderRadius: 6, padding: "4px 10px", fontSize: 9, color: "#888", cursor: "pointer", fontFamily: FONT }}>Approve</button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: "#555", marginTop: 14, fontStyle: "italic", lineHeight: 1.5 }}>↑ Every action requires human approval before execution. The AI recommends and prepares — the advisor decides.</div>
    </div>
  );
}

function ComplianceView() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  const controls = [
    { icon: "🔒", title: "Single Tenant Architecture", desc: "Zero data sharing between clients. Each deployment is fully isolated.", status: "Enforced" },
    { icon: "🧠", title: "Private LLMs Only", desc: "No public model access. Private instances with data that never traverses the internet.", status: "Enforced" },
    { icon: "✋", title: "Human-in-the-Loop", desc: "Every AI-triggered action requires explicit human approval before execution.", status: "Active" },
    { icon: "📋", title: "Audit Trail", desc: "Complete record of every action, recommendation, approval, and data access.", status: "Recording" },
    { icon: "✅", title: "Data Validation Layer", desc: "Pre-built validations prevent stale CRM data from triggering incorrect workflows.", status: "Active" },
    { icon: "🔗", title: "Approval Chains", desc: "Configurable multi-level approval workflows per event type and risk level.", status: "Configured" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {controls.map((c, i) => (
        <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px",
          opacity: animated ? 1 : 0, transform: animated ? "translateY(0)" : "translateY(8px)", transition: `all 0.35s ease ${i * 0.08}s` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            <span style={{ fontSize: 8, padding: "2px 8px", borderRadius: 8, background: "#4A9A7E22", color: GREEN, fontWeight: 700, letterSpacing: "0.5px" }}>{c.status}</span>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "#D4D0C8", marginBottom: 4 }}>{c.title}</div>
          <div style={{ fontSize: 10.5, color: "#777", lineHeight: 1.5 }}>{c.desc}</div>
        </div>
      ))}
    </div>
  );
}

function ChatView() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Good morning, Sarah. You have 3 priority items across 12 active clients today. Margaret Chen's PE Fund III lock-up expires in 58 days — I've prepared reinvestment options. Alexandra Volkov's onboarding is waiting on 4 documents. And the Nakamuras may benefit from refinancing. What would you like to tackle first?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);
  const responses = {
    chen: "For Margaret, I've modeled 3 reinvestment scenarios for the PE Fund III distribution. Option A: Roll into PE Fund IV (projected 14% IRR). Option B: Diversify into managed portfolio (lower risk, +$10.5M AUM). Option C: Partial distribution with tax-loss harvesting. I've also flagged that Emily turns 30 next month — ideal time for a wealth transfer conversation. Want me to draft a meeting agenda?",
    volkov: "Alexandra's onboarding is 62% complete. Outstanding items: trust deed, 2 years of tax returns, and proof of funds for Volkov Ventures LLC. I sent an automated reminder 2 hours ago. Note: the KYC screening flagged a PEP connection that cleared, but compliance wants a secondary review. Want me to escalate the document request or schedule a call with Alexandra?",
    nakamura: "The Nakamuras are currently paying 6.8% on their mortgage. Current rates are at 5.2% — refinancing would save approximately $1,200/month. Kai starts high school this fall, so this might be a good time to also review their 529 funding trajectory. I can prepare a combined mortgage + education planning brief. Should I generate it?",
    default: "I can help with that. Based on the knowledge graph, I have full context on all 12 active clients, their household structures, products, and pending events. I can pull up any client profile, generate action plans, draft communications, or trigger workflows. What specific client or task would you like to focus on?",
  };
  const handleSend = () => {
    if (!input.trim() || typing) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const lower = msg.toLowerCase();
      let response = responses.default;
      if (lower.includes("chen") || lower.includes("margaret") || lower.includes("pe fund") || lower.includes("lock")) response = responses.chen;
      else if (lower.includes("volkov") || lower.includes("alexandra") || lower.includes("onboard")) response = responses.volkov;
      else if (lower.includes("nakamura") || lower.includes("refi") || lower.includes("mortgage")) response = responses.nakamura;
      setMessages(prev => [...prev, { role: "ai", text: response }]);
      setTyping(false);
    }, 1500);
  };
  useEffect(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight; }, [messages, typing]);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: 420 }}>
      <div ref={messagesRef} style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ padding: "12px 16px", marginBottom: 8, borderRadius: 12,
            background: m.role === "ai" ? CARD : "#2A2820", border: m.role === "ai" ? `1px solid ${BORDER}` : "1px solid #3A3830" }}>
            {m.role === "ai" && <div style={{ fontSize: 9, color: GOLD, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 6 }}>⚡ ARCLINE AI</div>}
            <div style={{ fontSize: 12.5, color: "#C8C4B8", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {typing && <div style={{ padding: "12px 16px", fontSize: 12, color: GOLD, fontStyle: "italic" }}>⚡ Querying knowledge graph...</div>}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Talk to your AI assistant..."
          style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 16px", color: "#D4D0C8", fontSize: 12.5, outline: "none", fontFamily: FONT }} />
        <button onClick={handleSend} style={{ background: GOLD, color: "#111", border: "none", borderRadius: 10, padding: "0 20px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>Send</button>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        {["Tell me about Chen", "Volkov onboarding status", "Nakamura refinancing", "Today's priorities"].map(q => (
          <button key={q} onClick={() => setInput(q)}
            style={{ background: "#151514", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "5px 12px", fontSize: 10, color: "#777", cursor: "pointer", fontFamily: FONT, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${GOLD}44`; e.currentTarget.style.color = GOLD; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = "#777"; }}>{q}</button>
        ))}
      </div>
    </div>
  );
}

const STEP_COMPONENTS = { foundation: FoundationView, onboarding: OnboardingView, agents: AgentsView, servicing: ServicingView, compliance: ComplianceView, interface: ChatView };

function ConceptTab() {
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  useEffect(() => setMounted(true), []);
  const step = STEPS[activeStep];
  const StepComponent = STEP_COMPONENTS[step.id];
  const goToStep = (i) => { setActiveStep(i); setContentKey(prev => prev + 1); };

  return (
    <div>
      {/* Step sub-navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid #1E1E1C", background: "#141413", padding: "0 32px", overflowX: "auto" }}>
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => goToStep(i)}
            style={{ background: "none", border: "none", borderBottom: activeStep === i ? `2px solid ${GOLD}` : "2px solid transparent",
              padding: "14px 18px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 12, color: activeStep === i ? GOLD : "#444", fontWeight: 700, fontFamily: "monospace" }}>{s.label}</span>
            <span style={{ fontSize: 13, color: activeStep === i ? "#D4D0C8" : "#555", fontWeight: 500, fontFamily: FONT }}>{s.subtitle}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: "#444" }}>
          {activeStep + 1} of {STEPS.length}
        </div>
      </div>
      {/* Split panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, minHeight: "calc(100vh - 160px)",
        opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}>
        {/* Left: Explanation */}
        <div style={{ padding: "36px 40px", borderRight: "1px solid #1E1E1C" }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>
            Step {step.label} — {step.subtitle}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 400, fontFamily: SERIF, color: CREAM, letterSpacing: "-0.5px", margin: "0 0 20px", lineHeight: 1.2 }}>
            {step.title}
          </h1>
          <p style={{ fontSize: 14, color: "#9A968C", lineHeight: 1.75, margin: "0 0 28px" }}>
            {step.description}
          </p>
          <div style={{ borderLeft: `3px solid ${GOLD}44`, paddingLeft: 20, margin: "28px 0" }}>
            <p style={{ fontSize: 13, color: "#8A8678", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
              "{step.quote}"
            </p>
            <p style={{ fontSize: 10, color: "#555", marginTop: 8, fontStyle: "normal" }}>
              — Rabih Ramadi, Co-CEO, on The Customer Wins podcast
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 36 }}>
            {activeStep > 0 && (
              <button onClick={() => goToStep(activeStep - 1)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 20px", fontSize: 12, color: "#888", cursor: "pointer", fontFamily: FONT }}>← Previous</button>
            )}
            {activeStep < STEPS.length - 1 && (
              <button onClick={() => goToStep(activeStep + 1)} style={{ background: GOLD, border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 12, color: "#111", cursor: "pointer", fontWeight: 600, fontFamily: FONT }}>Next Step →</button>
            )}
          </div>
        </div>
        {/* Right: Interactive Demo */}
        <div style={{ padding: "36px 32px", background: "#121211" }}>
          <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, marginBottom: 18 }}>Interactive Demo</div>
          <div key={contentKey}><StepComponent /></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// TAB 2 — IMPLEMENTATION SIMULATOR
// ═══════════════════════════════════════════

const CLIENTS = [
  { id: "large_ria", name: "Meridian Wealth Partners", type: "Large RIA", aum: "$18B", advisors: 240, icon: "◈", color: GOLD,
    description: "Top-50 RIA with 240 advisors across 12 offices. Currently on Salesforce + Black Diamond + Pershing. Manual onboarding takes 3-4 weeks per client. CEO wants to modernize but CTO is protective of existing stack.",
    techStack: ["Salesforce CRM", "Black Diamond", "Pershing Custodian", "DocuSign", "Riskalyze"],
    stakeholders: [
      { name: "Laura Chen", role: "CEO", stance: "Champion — wants transformation", personality: "Visionary, impatient with details" },
      { name: "David Kozlov", role: "CTO", stance: "Skeptical — protective of current stack", personality: "Technical, risk-averse, needs proof" },
      { name: "Sarah Patel", role: "Head of Operations", stance: "Supportive — drowning in manual work", personality: "Pragmatic, detail-oriented" },
      { name: "Marcus Webb", role: "Senior Advisor", stance: "Resistant — doesn't want to learn new tools", personality: "Relationship-focused, hates change" },
    ],
    painPoints: ["3-4 week onboarding time", "Swivel-chair data entry across 5 systems", "No household-level view", "Compliance gaps between systems", "Advisors manually tracking servicing tasks"] },
  { id: "indie_wm", name: "Northstar Financial Group", type: "Independent Wealth Manager", aum: "$2.5B", advisors: 35, icon: "◆", color: GREEN,
    description: "Boutique firm with 35 advisors serving UHNW clients ($5M+ accounts). White-glove service model. Using Wealthbox CRM + Orion + Schwab. Want to differentiate with technology but can't afford a long implementation.",
    techStack: ["Wealthbox CRM", "Orion Portfolio", "Schwab Custodian", "RightCapital Planning"],
    stakeholders: [
      { name: "James Thornton", role: "Managing Partner", stance: "Champion — wants competitive edge", personality: "Strategic, budget-conscious" },
      { name: "Maria Santos", role: "COO", stance: "Cautiously optimistic — needs clear ROI", personality: "Operational, timeline-driven" },
      { name: "Alex Rivera", role: "Lead Advisor", stance: "Curious but busy — needs it to be easy", personality: "Client-obsessed, time-poor" },
    ],
    painPoints: ["Onboarding takes 2 weeks, clients expect same-day", "No unified view of household relationships", "Can't track cross-sell opportunities", "Compliance documentation is manual"] },
  { id: "insurance", name: "Guardian Life Solutions", type: "Insurance Carrier", aum: "$45B (premiums)", advisors: 800, icon: "◉", color: PURPLE,
    description: "Mid-tier insurance carrier expanding into wealth management. 800 agents across life, annuity, and property lines. Legacy policy admin system (20+ years old). Heavily regulated. Need to unify agent experience across product lines.",
    techStack: ["Custom Policy Admin (COBOL-based)", "Guidewire", "Salesforce", "IBM Mainframe"],
    stakeholders: [
      { name: "Patricia Nakamura", role: "EVP Digital", stance: "Champion — mandate from board to modernize", personality: "Executive, politically savvy" },
      { name: "Robert Kim", role: "VP IT", stance: "Overwhelmed — already managing 3 transformations", personality: "Cautious, resource-constrained" },
      { name: "Jennifer Walsh", role: "Chief Compliance Officer", stance: "Blocking — needs ironclad controls", personality: "Regulatory-focused, detail-obsessive" },
      { name: "Tom Reeves", role: "Regional Agent Manager", stance: "Supportive but skeptical of timeline", personality: "Field-level, practical" },
    ],
    painPoints: ["Agent onboarding takes 6-8 weeks", "No cross-product view (life + annuity + property)", "Legacy COBOL system can't integrate with modern APIs", "Regulatory requirements differ by state", "Agents use 7 different systems daily"] },
  { id: "regional_bank", name: "Pacific Coast Bancorp", type: "Regional Bank", aum: "$8B (deposits)", advisors: 120, icon: "▲", color: BLUE,
    description: "Regional bank with 45 branches expanding wealth management division. Core banking on FIS. Wealth arm uses Envestnet + Fidelity. Massive opportunity but wealth and banking tech stacks are completely separate. Board pressure to cross-sell.",
    techStack: ["FIS Core Banking", "Envestnet", "Fidelity Custodian", "nCino Lending", "Salesforce Financial Services Cloud"],
    stakeholders: [
      { name: "Richard Park", role: "SVP Wealth Management", stance: "Champion — his division, his budget", personality: "Ambitious, wants quick wins" },
      { name: "Angela Torres", role: "CIO", stance: "Cautious — needs to align with core banking roadmap", personality: "Enterprise architect mindset" },
      { name: "Mike Chen", role: "Compliance Director", stance: "Neutral — just needs to pass exams", personality: "Regulatory, audit-focused" },
      { name: "Lisa Hoffman", role: "Branch Manager (pilot)", stance: "Excited — wants something better than spreadsheets", personality: "Frontline, user-focused" },
    ],
    painPoints: ["Wealth and banking data completely siloed", "Can't identify bank customers who need wealth services", "Branch staff manually refer clients to wealth advisors", "Different KYC processes for banking vs wealth", "Onboarding a bank customer into wealth takes 4 weeks"] },
];

const PHASES = [
  { id: "discovery", label: "01", title: "Discovery & Scoping", subtitle: "Understanding the Current State",
    description: "Map the client's existing workflows, tech stack, pain points, and stakeholder dynamics. Define success criteria and scope boundaries.",
    roleContext: "As Principal, you lead discovery workshops, interview stakeholders, and produce a current-state assessment with a transformation roadmap." },
  { id: "solution_design", label: "02", title: "Solution Design", subtitle: "Mapping Workflows to Platform",
    description: "Translate the client's processes into Arcline configuration. Design the knowledge graph schema, onboarding journeys, and agent workflows.",
    roleContext: "You own the solution architecture — deciding what's out-of-box, what needs configuration, and what requires custom development." },
  { id: "integration", label: "03", title: "Data & System Integration", subtitle: "Connecting the Ecosystem",
    description: "Build the integration layer: CRM, custodian, document management, compliance systems. Handle data migration, mapping, and quality.",
    roleContext: "You coordinate between Arcline engineering and the client's IT team. You triage integration blockers and make scope trade-off decisions." },
  { id: "configuration", label: "04", title: "Configuration & Build", subtitle: "Bringing the Platform to Life",
    description: "Configure onboarding journeys, servicing workflows, AI agent rules, compliance controls, and approval chains.",
    roleContext: "You oversee the build sprint, manage client expectations on timelines, and ensure configuration matches the signed-off design." },
  { id: "uat", label: "05", title: "User Acceptance Testing", subtitle: "Finding the Gaps",
    description: "Client stakeholders test the system against real scenarios. This is where hidden requirements surface.",
    roleContext: "You run UAT sessions, triage defects vs. change requests, negotiate scope with the client, and decide what gets fixed now vs. post-launch." },
  { id: "adoption", label: "06", title: "Change Management & Adoption", subtitle: "The Human Challenge",
    description: "Train users, manage resistance, build champions. The best platform fails if people won't use it.",
    roleContext: "You design the rollout strategy, identify champions, run training, and handle the inevitable pushback from users who preferred the old way." },
  { id: "golive", label: "07", title: "Go-Live & Optimization", subtitle: "Launch & Iterate",
    description: "Launch the platform, monitor adoption metrics, handle production issues, and capture product feedback for the roadmap.",
    roleContext: "You own the go-live checklist, run the war room during launch week, and compile product feedback for the Arcline product team." },
];

const JD_CONTEXT = `ROLE CONTEXT: User is practicing for Principal of Client & Product Solutions at Avantos AI (AI-native OS for financial services, Series A, Bessemer/MIT-backed). They work in a pod with a PM and Engineer. Core job: lead enterprise client implementations, inform product roadmap from field friction, lead AI solutioning.`;

const buildSystemPrompt = (client, phase) => `You simulate an enterprise implementation meeting for Avantos AI ("Arcline OS"), an AI-native platform for financial services.

${JD_CONTEXT}

CLIENT: ${client.name} (${client.type}, ${client.aum} AUM, ${client.advisors} advisors)
Tech: ${client.techStack.join(", ")}
Pain: ${client.painPoints.join("; ")}

STAKEHOLDERS:
${client.stakeholders.map(s => `${s.name} (${s.role}): ${s.stance}. ${s.personality}`).join("\n")}

PHASE: ${phase.title} — ${phase.description}
User's role: ${phase.roleContext}

INSTRUCTIONS: Play all client stakeholders. Occasionally have the user's pod PM or Engineer add constraints. Keep responses CONCISE — max 250 words for stakeholder dialogue. Be specific, use names, include realistic pushback.

After dialogue, add:
📊 IMPLEMENTATION NOTES
- Friction points: (1-2 bullets)
- Product gaps: (1-2 bullets)  
- Risk flags: (1-2 bullets)

Then add EXACTLY:
🔀 CHOICES
[A] <bold/risky approach, 8-15 words>
[B] <safe/procedural approach, 8-15 words>
[C] <creative/unexpected approach, 8-15 words>
Each choice must reference specific stakeholders or decisions. No obvious right answer.`;

function SimulatorTab({ frictionLog, setFrictionLog }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [activePhase, setActivePhase] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phaseStarted, setPhaseStarted] = useState(false);
  const [choices, setChoices] = useState([]);
  const [showFreeText, setShowFreeText] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const loadingInterval = useRef(null);

  // Contextual loading messages
  const startLoadingMessages = () => {
    if (!client) return;
    const phaseVerbs = {
      "Discovery & Scoping": ["mapping current workflows", "reviewing tech stack documentation", "pulling up org charts"],
      "Solution Design": ["sketching the knowledge graph schema", "reviewing onboarding journey options", "comparing configuration approaches"],
      "Data & System Integration": ["checking API documentation", "reviewing data migration plans", "testing connector compatibility"],
      "Configuration & Build": ["reviewing sprint progress", "checking configuration against signed-off design", "pulling up the build timeline"],
      "User Acceptance Testing": ["running through test scenarios", "compiling defect reports", "reviewing change requests"],
      "Change Management & Adoption": ["checking training attendance numbers", "reviewing adoption dashboards", "gathering field feedback"],
      "Go-Live & Optimization": ["monitoring production metrics", "reviewing launch readiness checklist", "compiling product feedback"],
    };
    const verbs = phaseVerbs[phase.title] || ["reviewing your proposal", "checking their notes", "conferring with a colleague"];
    const msgs = [
      `Briefing you on ${client.name}'s stakeholder dynamics...`,
      `${client.stakeholders[0].name} is ${verbs[0]}...`,
      `${client.stakeholders[Math.min(1, client.stakeholders.length-1)].name} is ${verbs[1] || verbs[0]}...`,
      `Your pod engineer is ${verbs[2] || "checking feasibility"}...`,
      `The room is processing what you just said...`,
      `Someone is pulling up a spreadsheet to challenge your numbers...`,
    ];
    let idx = 0;
    setLoadingMsg(msgs[0]);
    loadingInterval.current = setInterval(() => {
      idx = (idx + 1) % msgs.length;
      setLoadingMsg(msgs[idx]);
    }, 3000);
  };
  const stopLoadingMessages = () => {
    if (loadingInterval.current) clearInterval(loadingInterval.current);
  };
  const chatRef = useRef(null);
  const client = CLIENTS.find(c => c.id === selectedClient);
  const phase = PHASES[activePhase];

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, loading, choices]);

  const resetPhase = () => { setMessages([]); setPhaseStarted(false); setChoices([]); setShowFreeText(false); };

  const parseChoices = (text) => {
    const m = text.match(/🔀\s*CHOICES([\s\S]*?)$/i);
    if (!m) return [];
    return m[1].split("\n").filter(l => l.trim()).map(l => {
      const cm = l.match(/\[([ABC])\]\s*(.*)/);
      return cm ? { letter: cm[1], text: cm[2].trim() } : null;
    }).filter(Boolean).slice(0, 3);
  };
  const stripMeta = (text) => text.replace(/🔀\s*CHOICES[\s\S]*$/i, "").trim();

  const sendToAI = async (userMsg, isAuto = false) => {
    if (loading) return;
    if (!isAuto) setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChoices([]); setShowFreeText(false); setLoading(true); startLoadingMessages();
    try {
      const apiMessages = messages.filter(m => m.role !== "system").map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.rawText || m.text
      }));
      const content = apiMessages.length === 0
        ? `Context: We're beginning Phase ${phase.label}: ${phase.title}. The stakeholders are present.\n\n${userMsg}`
        : userMsg;
      apiMessages.push({ role: "user", content });
      const res = await fetch("/api/arcline/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystemPrompt(client, phase), messages: apiMessages }),
      });
      const data = await res.json();
      const rawText = data.content?.map(b => b.type === "text" ? b.text : "").join("\n") || "No response.";
      const displayText = stripMeta(rawText);
      const parsed = parseChoices(rawText);
      setMessages(prev => [...prev, { role: "ai", text: displayText, rawText }]);
      setChoices(parsed);
      setChoices(parsed);

      // Extract friction
      const notesMatch = rawText.match(/IMPLEMENTATION NOTES([\s\S]*?)(?=🔀|$)/i);
      if (notesMatch) {
        const notes = notesMatch[1];
        const extract = (pat) => { const x = notes.match(pat); return x ? x[1].split(/[-•\n]/).map(s => s.trim()).filter(s => s.length > 5 && s.length < 200) : []; };
        const nf = { phase: phase.title, client: client.name,
          frictionPoints: extract(/friction[^:]*:([\s\S]*?)(?=product gap|risk flag|recommend|$)/i),
          productGaps: extract(/product gap[^:]*:([\s\S]*?)(?=risk flag|recommend|friction|$)/i),
          riskFlags: extract(/risk flag[^:]*:([\s\S]*?)(?=recommend|friction|product gap|$)/i) };
        if (nf.frictionPoints.length || nf.productGaps.length || nf.riskFlags.length) setFrictionLog(prev => [...prev, nf]);
      }
    } catch (err) { setMessages(prev => [...prev, { role: "ai", text: "Connection error: " + err.message, rawText: "" }]); }
    stopLoadingMessages(); setLoading(false);
  };

  const startPhase = () => {
    setPhaseStarted(true);
    setMessages([{ role: "system",
      text: `**Phase ${phase.label}: ${phase.title}**\n${phase.description}\n\n**Your Role:** ${phase.roleContext}\n\n**Client:** ${client.name} (${client.type})\n**In the room:** ${client.stakeholders.map(s => `${s.name} (${s.role})`).join(", ")}` }]);
    sendToAI("I'm entering the room to begin " + phase.title + " with " + client.name + ". Set the scene — what's the energy like and who speaks first?", true);
  };

  const handleChoice = (choice) => sendToAI(`I choose approach: [${choice.letter}] ${choice.text}`);
  const handleFreeText = () => { if (input.trim()) { sendToAI(input.trim()); setInput(""); } };

  const renderBold = (text) => text.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={j} style={{ color: "#E8E4DC" }}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>);

  if (!selectedClient) {
    return (
      <div style={{ padding: "28px 32px" }}>
        <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, marginBottom: 6 }}>Select Your Client</div>
        <div style={{ fontSize: 14, color: "#999", marginBottom: 24, lineHeight: 1.65 }}>Each client type presents different challenges: tech stack complexity, stakeholder dynamics, regulatory requirements, and organizational readiness.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {CLIENTS.map(c => (
            <div key={c.id} onClick={() => setSelectedClient(c.id)}
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px 24px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = c.color + "55"}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div><span style={{ color: c.color, fontSize: 18, marginRight: 8 }}>{c.icon}</span><span style={{ fontSize: 15, fontWeight: 500, color: CREAM }}>{c.name}</span></div>
                <span style={{ fontSize: 9, padding: "3px 10px", borderRadius: 10, background: c.color + "22", color: c.color, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>{c.type}</span>
              </div>
              <div style={{ fontSize: 13, color: "#999", lineHeight: 1.65, marginBottom: 14 }}>{c.description}</div>
              <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                <div><span style={{ fontSize: 9, color: "#555" }}>AUM </span><span style={{ fontSize: 13, color: CREAM, fontWeight: 500 }}>{c.aum}</span></div>
                <div><span style={{ fontSize: 9, color: "#555" }}>ADVISORS </span><span style={{ fontSize: 13, color: CREAM, fontWeight: 500 }}>{c.advisors}</span></div>
              </div>
              <div style={{ fontSize: 10, color: "#666", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 6 }}>STAKEHOLDERS</div>
              {c.stakeholders.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: "#888", display: "flex", gap: 6, marginBottom: 4 }}>
                  <span style={{ color: s.stance.includes("Champion") ? GREEN : s.stance.includes("Skeptical") || s.stance.includes("Resistant") || s.stance.includes("Blocking") ? RED : GOLD, fontSize: 9, marginTop: 3 }}>●</span>
                  <span><strong style={{ color: "#AAA" }}>{s.name}</strong> — {s.role}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", height: "calc(100vh - 105px)" }}>
      <div style={{ borderRight: "1px solid #1E1E1C", padding: "20px 16px", overflowY: "auto", background: "#131312" }}>
        <button onClick={() => { setSelectedClient(null); resetPhase(); setActivePhase(0); }}
          style={{ background: "none", border: "none", color: "#777", fontSize: 12, cursor: "pointer", fontFamily: FONT, marginBottom: 14, padding: 0 }}>← Change client</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ color: client.color, fontSize: 16 }}>{client.icon}</span>
          <div><div style={{ fontSize: 14, fontWeight: 500, color: CREAM }}>{client.name}</div><div style={{ fontSize: 11, color: "#666" }}>{client.type}</div></div>
        </div>
        <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 10 }}>Phases</div>
        {PHASES.map((p, i) => (
          <div key={i} onClick={() => { setActivePhase(i); resetPhase(); }}
            style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 8, background: activePhase === i ? CARD : "transparent",
              border: `1px solid ${activePhase === i ? BORDER : "transparent"}`, cursor: "pointer", marginBottom: 4, transition: "all 0.15s" }}>
            <span style={{ fontSize: 11, color: activePhase === i ? GOLD : "#555", fontFamily: "monospace", fontWeight: 700, marginTop: 1 }}>{p.label}</span>
            <div><div style={{ fontSize: 12.5, color: activePhase === i ? "#E8E4DC" : "#777", fontWeight: 500 }}>{p.title}</div><div style={{ fontSize: 10, color: activePhase === i ? "#888" : "#4A4A48", marginTop: 2 }}>{p.subtitle}</div></div>
          </div>
        ))}
        {frictionLog.length > 0 && (
          <div style={{ marginTop: 16, padding: "12px 14px", background: "#151514", borderRadius: 10, border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 10, color: RED, fontWeight: 700, letterSpacing: "0.5px", marginBottom: 4 }}>FRICTION LOGGED</div>
            <div style={{ fontSize: 18, fontFamily: SERIF, color: CREAM }}>{frictionLog.reduce((a, f) => a + f.frictionPoints.length + f.productGaps.length + f.riskFlags.length, 0)}</div>
            <div style={{ fontSize: 10, color: "#666" }}>items across {frictionLog.length} interactions</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "20px 24px", background: "#121211" }}>
        <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1E1E1C" }}>
          <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "1.5px", marginBottom: 6 }}>PHASE {phase.label} — {phase.subtitle.toUpperCase()}</div>
          <div style={{ fontSize: 22, fontFamily: SERIF, color: CREAM, fontWeight: 400, marginBottom: 10 }}>{phase.title}</div>
          <div style={{ fontSize: 13, color: "#9A968C", lineHeight: 1.65, marginBottom: 10 }}>{phase.description}</div>
          <div style={{ fontSize: 13, color: "#B8B4A8", lineHeight: 1.65, padding: "10px 14px", background: `${GOLD}08`, borderLeft: `3px solid ${GOLD}33`, borderRadius: "0 8px 8px 0" }}>
            <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", marginRight: 6 }}>YOUR ROLE</span> {phase.roleContext}
          </div>
        </div>
        {!phaseStarted ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ fontSize: 36, opacity: 0.2 }}>{client.icon}</div>
            <div style={{ fontSize: 16, color: "#888", textAlign: "center", maxWidth: 440, lineHeight: 1.6 }}>Ready to enter the room with {client.stakeholders.length} stakeholders from {client.name}?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 460 }}>
              {client.stakeholders.map((s, i) => (
                <span key={i} style={{ fontSize: 12, color: "#999", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "6px 14px" }}>{s.name} — {s.role}</span>
              ))}
            </div>
            <button onClick={startPhase} style={{ background: GOLD, color: "#111", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, marginTop: 8 }}>Begin Client Meeting →</button>
          </div>
        ) : (
          <>
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", marginBottom: 14 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ padding: "16px 20px", marginBottom: 10, borderRadius: 12,
                  background: m.role === "user" ? "#2A2820" : m.role === "system" ? `${GOLD}08` : CARD,
                  border: `1px solid ${m.role === "user" ? "#3A3830" : m.role === "system" ? `${GOLD}20` : BORDER}`,
                  maxWidth: m.role === "user" ? "80%" : "100%", marginLeft: m.role === "user" ? "auto" : 0 }}>
                  {m.role === "system" && <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 8 }}>📋 BRIEFING</div>}
                  {m.role === "ai" && <div style={{ fontSize: 10, color: client.color, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 8 }}>🏢 {client.name.toUpperCase()}</div>}
                  {m.role === "user" && <div style={{ fontSize: 10, color: GREEN, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 8 }}>YOU — PRINCIPAL, ARCLINE</div>}
                  <div style={{ fontSize: 14, color: "#D4D0C8", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{renderBold(m.text)}</div>
                </div>
              ))}
              {loading && (
                <div style={{ padding: "16px 20px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: client.color, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                    </div>
                    <div style={{ fontSize: 13, color: client.color, fontStyle: "italic" }}>{loadingMsg}</div>
                  </div>
                  <style>{`@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }`}</style>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleFreeText()}
                placeholder="Or type your own response..."
                style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px", color: "#E8E4DC", fontSize: 14, outline: "none", fontFamily: FONT }} />
              <button onClick={handleFreeText} disabled={loading || !input.trim()} style={{ background: loading || !input.trim() ? "#333" : GOLD, color: "#111", border: "none", borderRadius: 10, padding: "0 24px", fontSize: 14, fontWeight: 600, cursor: loading || !input.trim() ? "default" : "pointer", fontFamily: FONT }}>Send</button>
            </div>
            {/* Choices */}
            {choices.length > 0 && !loading && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: 8 }}>Choose your approach</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {choices.map((c, i) => (
                    <button key={i} onClick={() => handleChoice(c)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#151514", border: `1px solid ${BORDER}`, borderRadius: 10,
                        padding: "12px 16px", cursor: "pointer", textAlign: "left", fontFamily: FONT, transition: "all 0.15s", width: "100%" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${GOLD}55`; e.currentTarget.style.background = `${GOLD}08`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = "#151514"; }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: GOLD, background: `${GOLD}15`, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace", flexShrink: 0 }}>{c.letter}</span>
                      <span style={{ fontSize: 13, color: "#C8C4B8", lineHeight: 1.5 }}>{c.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activePhase < PHASES.length - 1 && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => { setActivePhase(prev => prev + 1); resetPhase(); }}
                  style={{ background: "#151514", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "7px 16px", fontSize: 12, color: GREEN, cursor: "pointer", fontFamily: FONT }}>Advance to next phase →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// TAB 3 — PRODUCT ROADMAP
// ═══════════════════════════════════════════

function RoadmapTab({ frictionLog, onLoadSample, sampleRoadmap }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);

  // Auto-load sample roadmap when sample friction is loaded
  useEffect(() => {
    if (frictionLog.length > 0 && frictionLog === frictionLog && !roadmap && sampleRoadmap && frictionLog[0]?.client === "Meridian Wealth Partners") {
      setRoadmap(sampleRoadmap);
    }
  }, [frictionLog]);

  const loadSampleWithRoadmap = () => {
    onLoadSample();
    setRoadmap(sampleRoadmap);
  };

  const generateRoadmap = async () => {
    if (frictionLog.length === 0) return;
    setLoading(true); setRoadmap(null);
    const frictionSummary = frictionLog.map(f => {
      let items = [];
      if (f.frictionPoints.length) items.push(`Friction: ${f.frictionPoints.join("; ")}`);
      if (f.productGaps.length) items.push(`Gaps: ${f.productGaps.join("; ")}`);
      if (f.riskFlags.length) items.push(`Risks: ${f.riskFlags.join("; ")}`);
      return `[${f.phase} — ${f.client}]\n${items.join("\n")}`;
    }).join("\n\n");
    try {
      const res = await fetch("/api/arcline/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000,
          system: `You are a product strategist for Arcline OS (AI-native finserv platform). From implementation friction data, generate a prioritized roadmap. Respond ONLY with valid JSON, no markdown, no backticks, no preamble. Schema:
{
  "summary": "2-3 sentence executive summary",
  "now": { "label": "NOW", "timeframe": "0-3 months", "items": [{"title": "Feature name", "description": "What and why", "source": "Which friction drove this", "effort": "S|M|L", "impact": "High|Medium"}] },
  "next": { "label": "NEXT", "timeframe": "3-6 months", "items": [same schema] },
  "later": { "label": "LATER", "timeframe": "6-12 months", "items": [same schema] },
  "principles": ["principle 1", "principle 2", "principle 3"]
}
Generate 3-4 items per phase. Be specific and opinionated. Every item must trace to a friction point.`,
          messages: [{ role: "user", content: `Friction data:\n\n${frictionSummary}\n\nGenerate the JSON roadmap.` }] }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.type === "text" ? b.text : "").join("") || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setRoadmap(parsed);
    } catch (err) { console.error(err); setRoadmap({ error: err.message }); }
    setLoading(false);
  };

  const allFriction = frictionLog.flatMap(f => f.frictionPoints);
  const allGaps = frictionLog.flatMap(f => f.productGaps);
  const allRisks = frictionLog.flatMap(f => f.riskFlags);

  const PHASE_COLORS = { now: "#D48A8A", next: GOLD, later: GREEN };
  const EFFORT_COLORS = { S: GREEN, M: GOLD, L: RED };

  return (
    <div style={{ padding: "28px 32px", overflowY: "auto", maxHeight: "calc(100vh - 105px)" }}>
      {frictionLog.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>◈</div>
          <div style={{ fontSize: 18, color: "#777", marginBottom: 8 }}>No implementation data yet</div>
          <div style={{ fontSize: 14, color: "#666", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.65 }}>
            The roadmap is generated from friction data captured in the Implementation Simulator. Run a client scenario in Tab 2, or load a pre-built example to see the output.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={loadSampleWithRoadmap} style={{ background: GOLD, color: "#111", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
              Load Example: Meridian Wealth Partners
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#555", marginTop: 10 }}>4 phases of implementation friction from a Large RIA deployment</div>
          <div style={{ marginTop: 40, textAlign: "left", maxWidth: 600, margin: "40px auto 0" }}>
            <div style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600, marginBottom: 12 }}>What you'll get</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[{ l: "NOW", t: "0-3 months", d: "Critical blockers", c: "#D48A8A" }, { l: "NEXT", t: "3-6 months", d: "Competitive edge", c: GOLD }, { l: "LATER", t: "6-12 months", d: "Platform expansion", c: GREEN }].map((s, i) => (
                <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px", borderTop: `3px solid ${s.c}` }}>
                  <div style={{ fontSize: 14, color: s.c, fontWeight: 700 }}>{s.l}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{s.t}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Friction summary bar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[{ label: "FRICTION POINTS", color: RED, icon: "⚠", items: allFriction },
              { label: "PRODUCT GAPS", color: GOLD, icon: "◆", items: allGaps },
              { label: "RISK FLAGS", color: PURPLE, icon: "▲", items: allRisks }].map((col, ci) => (
              <div key={ci} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 22, fontFamily: SERIF, color: CREAM }}>{col.items.length}</div>
                <div>
                  <div style={{ fontSize: 10, color: col.color, fontWeight: 700, letterSpacing: "0.5px" }}>{col.icon} {col.label}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>from {frictionLog.length} interactions</div>
                </div>
              </div>
            ))}
          </div>

          {!roadmap && !loading && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <button onClick={generateRoadmap} style={{ background: GOLD, color: "#111", border: "none", borderRadius: 10, padding: "14px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                ⚡ Generate Product Roadmap
              </button>
              <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>AI analyzes {allFriction.length + allGaps.length + allRisks.length} data points → visual roadmap</div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
                {[0, 1, 2].map(i => (<div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />))}
              </div>
              <div style={{ fontSize: 13, color: "#777" }}>Translating field friction into product priorities...</div>
              <style>{`@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }`}</style>
            </div>
          )}

          {roadmap && !roadmap.error && (
            <>
              {/* Executive summary */}
              <div style={{ padding: "16px 20px", background: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: 10, marginBottom: 24 }}>
                <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "1px", marginBottom: 6 }}>EXECUTIVE SUMMARY</div>
                <div style={{ fontSize: 14, color: "#C8C4B8", lineHeight: 1.7 }}>{roadmap.summary}</div>
              </div>

              {/* ═══ VISUAL TIMELINE ═══ */}
              <div style={{ marginBottom: 32 }}>
                {/* Timeline header with connecting line */}
                <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginBottom: 4 }}>
                  {/* Connecting line */}
                  <div style={{ position: "absolute", top: 18, left: "8%", right: "8%", height: 3, background: `linear-gradient(90deg, ${PHASE_COLORS.now}, ${PHASE_COLORS.next}, ${PHASE_COLORS.later})`, borderRadius: 2, zIndex: 0 }} />
                  {[roadmap.now, roadmap.next, roadmap.later].map((phase, pi) => {
                    const c = [PHASE_COLORS.now, PHASE_COLORS.next, PHASE_COLORS.later][pi];
                    return (
                      <div key={pi} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: BG, border: `3px solid ${c}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: c, fontFamily: "monospace" }}>
                          {pi + 1}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{phase.label}</div>
                          <div style={{ fontSize: 11, color: "#666" }}>{phase.timeframe}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
                  {[roadmap.now, roadmap.next, roadmap.later].map((phase, pi) => {
                    const c = [PHASE_COLORS.now, PHASE_COLORS.next, PHASE_COLORS.later][pi];
                    const phaseKey = ["now", "next", "later"][pi];
                    return (
                      <div key={pi} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {phase.items.map((item, ii) => {
                          const detailKey = `${phaseKey}-${ii}`;
                          const isActive = activeDetail === detailKey;
                          return (
                            <div key={ii} onClick={() => setActiveDetail(isActive ? null : detailKey)}
                              style={{ background: isActive ? `${c}12` : CARD, border: `1px solid ${isActive ? c + "44" : BORDER}`,
                                borderLeft: `3px solid ${c}`, borderRadius: "0 8px 8px 0", padding: "10px 12px", cursor: "pointer",
                                transition: "all 0.15s" }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = c + "33"; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = BORDER; }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: CREAM, lineHeight: 1.35 }}>{item.title}</div>
                                <span style={{ fontSize: 9, fontWeight: 700, color: EFFORT_COLORS[item.effort] || "#666",
                                  background: (EFFORT_COLORS[item.effort] || "#666") + "18", padding: "2px 6px", borderRadius: 4,
                                  flexShrink: 0, fontFamily: "monospace" }}>{item.effort}</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#777", marginTop: 3 }}>{item.impact} impact</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ═══ DETAIL PANEL ═══ */}
              {activeDetail && (() => {
                const [phaseKey, idx] = activeDetail.split("-");
                const phase = roadmap[phaseKey];
                const item = phase?.items?.[parseInt(idx)];
                const c = PHASE_COLORS[phaseKey];
                if (!item) return null;
                return (
                  <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderTop: `3px solid ${c}`, borderRadius: "0 0 12px 12px", padding: "20px 24px", marginBottom: 24, marginTop: -8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 10, color: c, fontWeight: 700, letterSpacing: "1px", marginBottom: 4 }}>{phase.label} — {phase.timeframe}</div>
                        <div style={{ fontSize: 17, fontWeight: 600, color: CREAM, fontFamily: SERIF }}>{item.title}</div>
                      </div>
                      <button onClick={() => setActiveDetail(null)} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: "0 4px" }}>×</button>
                    </div>
                    <div style={{ fontSize: 14, color: "#B8B4A8", lineHeight: 1.7, marginTop: 10 }}>{item.description}</div>
                    <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                      <div><span style={{ fontSize: 10, color: "#666" }}>SOURCE </span><span style={{ fontSize: 12, color: "#999" }}>{item.source}</span></div>
                      <div><span style={{ fontSize: 10, color: "#666" }}>EFFORT </span><span style={{ fontSize: 12, color: EFFORT_COLORS[item.effort] || "#999", fontWeight: 600 }}>{item.effort === "S" ? "Small" : item.effort === "M" ? "Medium" : "Large"}</span></div>
                      <div><span style={{ fontSize: 10, color: "#666" }}>IMPACT </span><span style={{ fontSize: 12, color: "#999" }}>{item.impact}</span></div>
                    </div>
                  </div>
                );
              })()}

              {/* Principles */}
              {roadmap.principles && (
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 22px" }}>
                  <div style={{ fontSize: 10, color: "#666", fontWeight: 700, letterSpacing: "1px", marginBottom: 10 }}>PRODUCT PRINCIPLES</div>
                  {roadmap.principles.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "#999" }}>
                      <span style={{ color: GOLD, fontSize: 10, marginTop: 3 }}>◈</span> {p}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <button onClick={generateRoadmap} style={{ background: "#151514", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 20px", fontSize: 12, color: "#999", cursor: "pointer", fontFamily: FONT }}>↻ Regenerate</button>
              </div>
            </>
          )}

          {roadmap && roadmap.error && (
            <div style={{ padding: "16px 20px", background: `${RED}12`, border: `1px solid ${RED}33`, borderRadius: 10, color: RED, fontSize: 13 }}>
              Failed to generate roadmap: {roadmap.error}. <button onClick={generateRoadmap} style={{ background: "none", border: "none", color: GOLD, cursor: "pointer", textDecoration: "underline", fontFamily: FONT, fontSize: 13 }}>Try again</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// TAB 4 — HOW THIS WAS BUILT
// ═══════════════════════════════════════════

function ColophonTab() {
  const sections = [
    { title: "What You're Looking At", color: GOLD,
      content: `This is a single React component (~950 lines) that runs entirely in-browser. There is no backend server, no database, no deployment pipeline. The whole thing was built in one conversation with Claude (Anthropic's AI) inside Claude.ai's artifact system, which renders React components live.` },
    { title: "Architecture", color: GREEN, items: [
      { label: "Framework", value: "React with Hooks (useState, useEffect, useRef)" },
      { label: "Styling", value: "Inline styles — no CSS files, no Tailwind build step, no dependencies" },
      { label: "Fonts", value: "DM Sans (body) + Playfair Display (headings) via Google Fonts CDN" },
      { label: "AI Engine", value: "Claude Sonnet 4 via Anthropic API — called directly from the browser" },
      { label: "Hosting", value: "humaninthelead.ai/arcline" },
      { label: "Total files", value: "1 JSX file. That's it." },
    ]},
    { title: "How the Simulator Works", color: CREAM,
      content: `The implementation simulator makes live API calls to Claude Sonnet 4. Each call includes a system prompt containing: the full Avantos job description, the selected client profile (tech stack, stakeholders, pain points), and the current implementation phase. The AI plays all client stakeholders AND your internal Avantos pod members (PM + Engineer) simultaneously, generating realistic pushback based on each person's stance and personality.\n\nAfter each response, the AI generates 3 strategic choices with genuine trade-offs — one bold, one safe, one creative. You can pick a choice or write your own response. The AI also extracts friction points, product gaps, and risk flags from each interaction, which accumulate in a log that feeds Tab 3.` },
    { title: "How the Roadmap Works", color: PURPLE,
      content: `Tab 3 takes the raw friction data from your simulator conversations (every friction point, product gap, and risk flag extracted by the AI) and feeds it into a second Claude call with a product strategy system prompt. The output is a prioritized Now/Next/Later roadmap where every item traces back to a specific implementation friction point. This mirrors the actual Principal role: field friction becomes product input.` },
    { title: "Why I Built This", color: GOLD,
      content: `I wanted to demonstrate three things for the Principal of Client & Product Solutions role:\n\n1. Deep product understanding — Tab 1 walks through the Arcline architecture using Rabih Ramadi's own words from the Customer Wins podcast, not marketing copy.\n\n2. Implementation instincts — Tab 2 tests whether I can navigate real enterprise dynamics: stakeholder politics, technical integration challenges, scope negotiation, and the messy human side of digital transformation.\n\n3. Product-to-engineering translation — Tab 3 shows the feedback loop the JD describes: implementation friction → product roadmap → engineering priorities. This is the core of what the Principal role actually does.\n\nThe whole thing is also a statement about how I work: I use AI as a multiplier, not a crutch. This was built in collaboration with Claude, but every product decision — the client profiles, stakeholder dynamics, phase structure, choice design — comes from my understanding of enterprise fintech implementations.` },
    { title: "Access", color: BLUE, items: [
      { label: "URL", value: "humaninthelead.ai/arcline" },
      { label: "Source", value: "Single .jsx file — can be inspected in browser" },
    ]},
  ];

  return (
    <div style={{ padding: "36px 40px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>Colophon</div>
      <h1 style={{ fontSize: 32, fontFamily: SERIF, color: CREAM, fontWeight: 400, letterSpacing: "-0.5px", margin: "0 0 8px", lineHeight: 1.2 }}>How This Was Built</h1>
      <p style={{ fontSize: 14, color: "#777", margin: "0 0 36px", lineHeight: 1.6 }}>
        Built by Christian for the Avantos Principal of Client & Product Solutions role.
      </p>

      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 28, padding: "24px 28px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 }}>
          <div style={{ fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 12 }}>
            {s.title}
          </div>
          {s.content && (
            <div style={{ fontSize: 14, color: "#B8B4A8", lineHeight: 1.75 }}>
              {s.content.split("\n\n").map((p, j) => <p key={j} style={{ margin: j === 0 ? 0 : "12px 0 0" }}>{p}</p>)}
            </div>
          )}
          {s.items && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {s.items.map((item, j) => (
                <div key={j} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, color: "#666", minWidth: 100, flexShrink: 0, fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: 14, color: "#B8B4A8" }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 36, padding: "20px 24px", background: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: 12 }}>
        <div style={{ fontSize: 13, color: "#9A968C", lineHeight: 1.7, fontStyle: "italic" }}>
          "The best way to show you can do a job is to do the job." — This workspace is my implementation of the implementation role.
        </div>
      </div>
    </div>
  );
}

// ─── Pre-seeded friction data from a Meridian Wealth playthrough ───

const SAMPLE_ROADMAP = {
  summary: "Arcline's integration layer and onboarding flexibility are the primary blockers to closing large RIA deals. The platform needs to handle heavily customized CRM environments, multi-custodian household structures, and conditional onboarding workflows before it can scale beyond early adopters. Change management tooling is a secondary but critical gap — without it, even successful technical implementations will stall at adoption.",
  now: { label: "NOW", timeframe: "0-3 months", items: [
    { title: "Bulk Salesforce Migration Tool", description: "Build a configurable migration engine that maps custom Salesforce objects and fields to the Arcline knowledge graph. Must handle 340+ custom fields without manual mapping for each client.", source: "Meridian Discovery: 'Salesforce instance is heavily customized with 340+ custom fields'", effort: "L", impact: "High" },
    { title: "Multi-Custodian Household Graph", description: "Extend the knowledge graph schema to natively represent households that span multiple custodians (e.g., Pershing + Schwab). Currently forces a single-custodian model that doesn't reflect how large RIAs actually operate.", source: "Meridian Solution Design: 'Knowledge graph can't represent multi-custodian household structure'", effort: "M", impact: "High" },
    { title: "Conditional Onboarding Branching", description: "Add if/then logic to the onboarding journey builder. Meridian uses 3 different workflows depending on account type — the current linear builder can't handle this.", source: "Meridian Solution Design: 'Advisors use 3 different onboarding workflows depending on account type'", effort: "M", impact: "High" },
    { title: "Custodian API Rate Limit Queue", description: "Build a batch queue system for custodian API calls. Pershing's rate limits make real-time sync impossible at scale (240 advisors). Needs intelligent batching with priority lanes for time-sensitive operations.", source: "Meridian Integration: 'Pershing API rate limits make real-time sync impossible'", effort: "S", impact: "High" },
  ]},
  next: { label: "NEXT", timeframe: "3-6 months", items: [
    { title: "State-Level Compliance Rule Engine", description: "Configurable rule sets that vary by state jurisdiction. Financial services compliance requirements differ significantly by state — the platform currently has a one-size-fits-all approach.", source: "Meridian Solution Design: 'Compliance team needs per-state regulatory rule sets'", effort: "L", impact: "Medium" },
    { title: "In-App Guided Onboarding", description: "Contextual help system with role-based walkthroughs. Senior advisors won't attend classroom training — the product needs to teach itself. Include progress tracking and completion incentives.", source: "Meridian Change Management: 'Senior advisors refuse to attend training sessions'", effort: "M", impact: "High" },
    { title: "Black Diamond Connector V2", description: "Rebuild the Black Diamond integration to support custom report templates and handle format changes gracefully. Current connector broke when BD updated their export format.", source: "Meridian Integration: 'Black Diamond data export format changed — connector is broken'", effort: "M", impact: "Medium" },
    { title: "Role-Based Training Paths", description: "Different training sequences for advisors, ops staff, compliance, and management. Current one-size-fits-all approach is a primary adoption blocker.", source: "Meridian Change Management: 'No role-based training paths'", effort: "S", impact: "High" },
  ]},
  later: { label: "LATER", timeframe: "6-12 months", items: [
    { title: "Champion Network Toolkit", description: "Tooling to identify, enable, and measure internal champions. The Marcus Webb problem — one influential skeptic can tank adoption for an entire firm. Need to equip champions with data to counter resistance.", source: "Meridian Change Management: 'Marcus Webb is actively telling other advisors this will fail'", effort: "M", impact: "High" },
    { title: "Adoption Analytics Dashboard", description: "Real-time visibility into which advisors are using the platform, which features, and where drop-off happens. CEO Laura Chen wants visible metrics within 60 days — give her a dashboard that shows progress.", source: "Meridian Change Management: 'CEO wants visible metrics within 60 days of launch'", effort: "M", impact: "Medium" },
    { title: "Branch-Level Configuration", description: "Support per-branch workflow variations without fragmenting the core platform. Meridian's Texas and Florida offices operate differently than HQ — forcing uniformity causes resistance.", source: "Meridian Change Management: 'Branch offices have different workflows than HQ'", effort: "L", impact: "Medium" },
  ]},
  principles: [
    "Integration flexibility is table stakes — every enterprise client has a customized tech stack. Build for configuration, not convention.",
    "Change management is a product problem, not a services problem. If adoption requires a consultant, the product isn't done.",
    "Every feature should trace to a specific client friction point. If you can't name the client who needs it, don't build it."
  ]
};

const SAMPLE_FRICTION = [
  { phase: "Discovery & Scoping", client: "Meridian Wealth Partners",
    frictionPoints: ["Salesforce instance is heavily customized with 340+ custom fields — standard connector won't work", "Black Diamond reporting workflows have undocumented manual steps that ops team doesn't want to lose", "CTO insists on keeping Riskalyze integration even though Arcline has native risk profiling"],
    productGaps: ["No bulk data migration tool for custom Salesforce objects", "Black Diamond connector doesn't support custom report templates"],
    riskFlags: ["CTO has veto power and hasn't bought in yet", "3 previous vendor implementations failed in last 4 years"] },
  { phase: "Solution Design", client: "Meridian Wealth Partners",
    frictionPoints: ["Knowledge graph schema can't represent their multi-custodian household structure cleanly", "Advisors use 3 different onboarding workflows depending on account type — need conditional logic not currently supported", "Compliance team needs per-state regulatory rule sets that don't exist in the platform"],
    productGaps: ["No conditional branching in onboarding journey builder", "Knowledge graph doesn't support multi-custodian relationships natively", "Missing state-level compliance rule engine"],
    riskFlags: ["Scope creep: Head of Ops keeps adding 'nice to have' integrations", "Senior advisor Marcus Webb is actively telling other advisors this will fail"] },
  { phase: "Data & System Integration", client: "Meridian Wealth Partners",
    frictionPoints: ["Pershing API has rate limits that make real-time sync impossible for 240 advisors", "DocuSign integration requires enterprise tier the client doesn't have", "Black Diamond data export format changed in their last update — connector is broken"],
    productGaps: ["No batch/queue system for custodian API rate limits", "DocuSign integration assumes enterprise tier features"],
    riskFlags: ["Pod engineer says the Pershing batch sync is a 4-sprint effort minimum", "Client IT team has a 3-week change management process for any new API connection"] },
  { phase: "Change Management & Adoption", client: "Meridian Wealth Partners",
    frictionPoints: ["Senior advisors (15+ years) refuse to attend training sessions", "Branch offices in Texas and Florida have different workflows than HQ", "Middle managers are positioning this as 'corporate pushing another tool on us'"],
    productGaps: ["No in-app guided onboarding or contextual help system", "No role-based training paths — one-size-fits-all approach"],
    riskFlags: ["If Marcus Webb's team (largest book of business) doesn't adopt, other advisors won't either", "CEO Laura Chen is losing patience — wants visible metrics within 60 days of launch"] },
];

// ═══════════════════════════════════════════
// TAB 5 — WHY CHRISTIAN SPETZ
// ═══════════════════════════════════════════

function WhyMeTab() {
  const matches = [
    { req: "7-12 years tech consulting / digital transformation",
      proof: "10 years at EY Strategy & Business Transformation. 20+ engagements for Fortune 500 across financial services, insurance, and consumer." },
    { req: "Complex, multi-stakeholder implementations",
      proof: "KYC/AML platform rollout across 16 markets. Transformation Management Office for a Fortune 50 insurer deploying LLM-powered risk monitoring." },
    { req: "Cross-functional with product and engineering",
      proof: "Pod Lead, EY Americas Innovation — helped business lines turn ideas into tools. Operate Lead for Global M&A — post-close value realization across 14 acquisitions." },
    { req: "Fluent in technical architectures, data, integrations",
      proof: "Built predictive models (neural networks) at Barclays/Swedbank JV. Built humaninthelead.ai end-to-end: React, Express, PostgreSQL, Claude API. This workspace is a working product." },
    { req: "Translate technical concepts for executive audiences",
      proof: "Co-owned ~$5M annual sales targets. Defined agentic-AI use cases for a $90B enterprise and sized $25M–$30M in cost reduction for a board-level business case." },
  ];

  return (
    <div style={{ padding: "36px 40px", maxWidth: 780, margin: "0 auto" }}>
      <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>
        Background
      </div>
      <h1 style={{ fontSize: 28, fontFamily: SERIF, color: CREAM, fontWeight: 400, letterSpacing: "-0.5px", margin: "0 0 8px", lineHeight: 1.2 }}>
        Christian Spetz
      </h1>
      <p style={{ fontSize: 14, color: "#888", margin: "0 0 28px", lineHeight: 1.65 }}>
        10 years in enterprise consulting. Financial services focus. Builds with AI, not just about it.
      </p>

      {/* JD Match */}
      <div style={{ marginBottom: 28 }}>
        {matches.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, padding: "16px 20px", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: "#777", marginBottom: 6 }}>{m.req}</div>
            <div style={{ fontSize: 14, color: "#C8C4B8", lineHeight: 1.6 }}>{m.proof}</div>
          </div>
        ))}
      </div>

      {/* The ask */}
      <div style={{ padding: "20px 24px", background: `${GOLD}08`, border: `1px solid ${GOLD}20`, borderRadius: 10 }}>
        <div style={{ fontSize: 14, color: "#C8C4B8", lineHeight: 1.7 }}>
          I'd welcome 30 minutes to present how I'd approach this role — and to hear directly from you where Avantos is headed next.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════

const MAIN_TABS = [
  { id: "concept", label: "Product Concept", icon: "◈", num: "1" },
  { id: "simulator", label: "Implementation Simulator", icon: "◆", num: "2" },
  { id: "roadmap", label: "Product Roadmap", icon: "◉", num: "3" },
  { id: "colophon", label: "How This Was Built", icon: "▲", num: "4" },
  { id: "whyme", label: "Why Christian Spetz", icon: "●", num: "5" },
];

export default function ArclineWorkspace() {
  const [entered, setEntered] = useState(false);
  const [activeTab, setActiveTab] = useState("concept");
  const [frictionLog, setFrictionLog] = useState([]);

  const loadSampleFriction = () => {
    setFrictionLog(SAMPLE_FRICTION);
  };

  if (!entered) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 42, fontFamily: SERIF, color: CREAM, fontWeight: 400, letterSpacing: "-0.5px", marginBottom: 8 }}>◈ Arcline</div>
        <div style={{ fontSize: 12, color: "#555", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 48 }}>Principal Workspace</div>
        <div style={{ fontSize: 15, color: "#777", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 40px" }}>
          A product concept, implementation simulator, and roadmap generator for Avantos AI — built by Christian Spetz.
        </div>
        <button onClick={() => setEntered(true)}
          style={{ background: GOLD, color: "#111", border: "none", borderRadius: 10, padding: "14px 36px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: FONT, letterSpacing: "0.5px" }}>
          Enter Workspace
        </button>
        <div style={{ marginTop: 48, fontSize: 11, color: "#333" }}>humaninthelead.ai</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: "#D4D0C8", fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", borderBottom: "1px solid #1E1E1C", background: "#131312" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 600, fontFamily: SERIF, color: CREAM }}>◈ Arcline</div>
          <div style={{ height: 14, width: 1, background: "#2A2A28" }} />
          <span style={{ fontSize: 9, color: "#555", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>Principal Workspace</span>
        </div>
        {frictionLog.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "#666" }}>FRICTION LOG</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: RED, background: `${RED}18`, padding: "2px 10px", borderRadius: 10 }}>
              {frictionLog.reduce((a, f) => a + f.frictionPoints.length + f.productGaps.length + f.riskFlags.length, 0)}
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid #1E1E1C", background: "#141413", padding: "0 28px" }}>
        {MAIN_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ background: "none", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${GOLD}` : "2px solid transparent",
              padding: "14px 22px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s" }}>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: activeTab === tab.id ? GOLD : "#555",
              background: activeTab === tab.id ? `${GOLD}15` : "transparent", padding: "2px 7px", borderRadius: 4 }}>{tab.num}</span>
            <span style={{ fontSize: 15, color: activeTab === tab.id ? "#E8E4DC" : "#666", fontWeight: 500 }}>{tab.label}</span>
            {tab.id === "roadmap" && frictionLog.length > 0 && (
              <span style={{ fontSize: 11, background: `${GREEN}22`, color: GREEN, padding: "3px 8px", borderRadius: 6, fontWeight: 700 }}>
                {frictionLog.reduce((a, f) => a + f.frictionPoints.length + f.productGaps.length + f.riskFlags.length, 0)} items
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "concept" && <ConceptTab />}
      {activeTab === "simulator" && <SimulatorTab frictionLog={frictionLog} setFrictionLog={setFrictionLog} />}
      {activeTab === "roadmap" && <RoadmapTab frictionLog={frictionLog} onLoadSample={loadSampleFriction} sampleRoadmap={SAMPLE_ROADMAP} />}
      {activeTab === "colophon" && <ColophonTab />}
      {activeTab === "whyme" && <WhyMeTab />}
    </div>
  );
}
