import { useState, useEffect } from "react";

const SECTIONS = ["THE QUESTION", "AUTONOMY MAP", "THE PLAYBOOK", "THE BARRIERS", "THE LINE"];

const autonomyData = [
  { fn: "Customer Support", score: 80, high: "Ticket routing, FAQ, chatbots", low: "Complex escalations, empathy-heavy disputes", verdict: "autonomous" },
  { fn: "Finance & Bookkeeping", score: 75, high: "AP/AR, reconciliation, reporting", low: "Treasury management, capital allocation, audit response", verdict: "autonomous" },
  { fn: "Marketing & Ad Buying", score: 70, high: "Programmatic ads, A/B testing, SEO", low: "Brand narrative, cultural relevance, taste", verdict: "split" },
  { fn: "Operations & Logistics", score: 70, high: "Routing, inventory, scheduling", low: "Supplier relationships, crisis logistics", verdict: "autonomous" },
  { fn: "Sales (Transactional)", score: 65, high: "Self-serve, PLG funnels, lead scoring", low: "Enterprise deals, relationship timing, politics", verdict: "split" },
  { fn: "Product Development", score: 60, high: "Feature prioritization from data, bug triage", low: "Vision, taste, knowing what NOT to build", verdict: "human" },
  { fn: "Compliance Monitoring", score: 55, high: "Rule-based scanning, anomaly detection", low: "Regulatory interpretation, gray areas", verdict: "split" },
  { fn: "HR & People", score: 40, high: "Payroll, benefits admin, scheduling", low: "Culture, conflict resolution, judgment calls", verdict: "human" },
  { fn: "Legal", score: 25, high: "Contract drafting, research, NDA review", low: "Risk appetite, relationship dynamics, regulatory intent", verdict: "human" },
  { fn: "Brand & Creative Direction", score: 15, high: "Asset generation, layout variations", low: "Identity, meaning, what the brand stands for", verdict: "human" },
];

const playbook = [
  { step: 1, title: "Form the Entity", desc: "Wyoming LLC. $100. Anonymous filing \u2014 no member or manager names on public record.", status: "Legal today" },
  { step: 2, title: "Get the EIN", desc: "Human founder applies with their SSN. IRS issues the federal tax ID. This is the last mandatory human touchpoint.", status: "Requires human" },
  { step: 3, title: "Write the Operating Agreement", desc: "Name an AI system as sole manager with full operational authority over finances, contracts, and strategy.", status: "Legal gray zone" },
  { step: 4, title: "Establish Crypto Treasury", desc: "Deploy smart contracts on decentralized exchanges. No bank account needed. No KYC required for on-chain operations.", status: "Legal today" },
  { step: 5, title: "Deploy the Agent Stack", desc: "AI agents handle customer support, marketing, bookkeeping, compliance monitoring, and product operations.", status: "Possible today" },
  { step: 6, title: "Founder Exits", desc: "The human walks away. The EIN stays valid. Smart contracts execute. The IRS sends notices to a dead address for years.", status: "The gap" },
];

const barriers = [
  { barrier: "EIN / Tax ID", wall: "hard", detail: "IRS requires a natural person's SSN or ITIN. No exceptions for non-government entities.", workaround: "Founder gets EIN, then exits. EIN doesn't auto-deactivate. IRS has no mechanism to detect the human is gone." },
  { barrier: "Bank Account", wall: "hard", detail: "Every US bank requires human KYC for business accounts.", workaround: "Bypass banking entirely. Crypto wallets + DEXs + smart contracts. No bank needed for on-chain commerce." },
  { barrier: "Tax Filing", wall: "hard", detail: "IRS doesn't accept returns signed by software.", workaround: "Authorized CPA firm continues filing. AI generates financials, firm files mechanically. Human is ministerial, not strategic." },
  { barrier: "Contract Execution", wall: "soft", detail: "Most jurisdictions require a 'person' to sign.", workaround: "ESIGN Act + UETA accept digital signatures. Operating agreement grants AI authority to bind the LLC as its agent." },
  { barrier: "Litigation Response", wall: "soft", detail: "AI can't appear in court. Only licensed attorneys can.", workaround: "AI retains and instructs counsel through written communication. Attorney doesn't need to know the client is an AI." },
  { barrier: "Regulatory Licensing", wall: "none", detail: "Industry-specific licenses require natural persons.", workaround: "Operate in unregulated verticals: SaaS, digital products, content, e-commerce. No licensing required." },
];

const ScoreBar = ({ score, color }) => (
  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
    <div style={{
      width: `${score}%`, height: "100%", borderRadius: 3,
      background: color || (score >= 65 ? "#22c55e" : score >= 45 ? "#eab308" : "#ef4444"),
      transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)"
    }} />
  </div>
);

const WallBadge = ({ type }) => {
  const colors = { hard: "#ef4444", soft: "#eab308", none: "#22c55e" };
  const labels = { hard: "HARD WALL", soft: "SOFT WALL", none: "NO WALL" };
  return (
    <span style={{
      fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
      color: colors[type], border: `1px solid ${colors[type]}33`,
      padding: "2px 8px", borderRadius: 2, letterSpacing: 1
    }}>{labels[type]}</span>
  );
};

const VerdictTag = ({ verdict }) => {
  const config = {
    autonomous: { label: "AUTONOMOUS WINS", color: "#22c55e" },
    split: { label: "CONTEXT-DEPENDENT", color: "#eab308" },
    human: { label: "HUMAN IN THE LEAD", color: "#f97316" },
  };
  const c = config[verdict];
  return (
    <span style={{
      fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
      color: c.color, background: `${c.color}11`, border: `1px solid ${c.color}33`,
      padding: "2px 8px", borderRadius: 2, letterSpacing: 1
    }}>{c.label}</span>
  );
};

export default function ZeroHumanCompany({ onBack }) {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [expandedBarrier, setExpandedBarrier] = useState(null);
  const [expandedFn, setExpandedFn] = useState(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const nav = (
    <div style={{
      display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.08)",
      overflowX: "auto", WebkitOverflowScrolling: "touch"
    }}>
      {SECTIONS.map((s, i) => (
        <button key={s} onClick={() => { setActive(i); setExpandedBarrier(null); setExpandedFn(null); }} style={{
          background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
          padding: "14px 18px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700, letterSpacing: 1.5, transition: "all 0.3s",
          color: active === i ? "#f0f0f0" : "rgba(255,255,255,0.3)",
          borderBottom: active === i ? "2px solid #f0f0f0" : "2px solid transparent"
        }}>{s}</button>
      ))}
    </div>
  );

  const sectionStyle = {
    opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(12px)",
    transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
  };

  const renderQuestion = () => (
    <div style={sectionStyle}>
      <h2 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.3, color: "#f0f0f0", margin: "0 0 28px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
        Do humans need to be in the loop<br />to build a great company?
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.6)", maxWidth: 560 }}>
        <p style={{ margin: "0 0 18px" }}>
          A zero-member LLC in Wyoming. An AI appointed as manager in the operating agreement.
          A crypto treasury on decentralized exchanges. Agent stack handling every business function.
        </p>
        <p style={{ margin: "0 0 18px" }}>
          No single statute prohibits a fully autonomous company. The legal system doesn't
          ban it — it just assumes a human exists at every checkpoint.
        </p>
        <p style={{ margin: "0 0 28px", color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
          None of these systems verify the human is still there.
        </p>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
      }}>
        {[
          { num: "$100", label: "Wyoming LLC filing fee" },
          { num: "0", label: "Members required on public filing" },
          { num: "0", label: "Statutes explicitly prohibiting this" },
        ].map((d, i) => (
          <div key={i} style={{
            padding: "20px 16px", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 4, textAlign: "center"
          }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: "#f0f0f0", fontFamily: "'Instrument Serif', Georgia, serif" }}>{d.num}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5 }}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAutonomy = () => (
    <div style={sectionStyle}>
      <h2 style={{ fontSize: 22, fontWeight: 300, color: "#f0f0f0", margin: "0 0 6px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
        Autonomy Readiness by Function
      </h2>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "0 0 24px", fontFamily: "'JetBrains Mono', monospace" }}>
        How much of each function could run without a human today?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {autonomyData.map((d, i) => (
          <div key={i}>
            <div
              onClick={() => setExpandedFn(expandedFn === i ? null : i)}
              style={{
                padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4, cursor: "pointer", transition: "all 0.2s",
                background: expandedFn === i ? "rgba(255,255,255,0.03)" : "transparent"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, color: "#f0f0f0", fontWeight: 500 }}>{d.fn}</span>
                  <VerdictTag verdict={d.verdict} />
                </div>
                <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{d.score}%</span>
              </div>
              <ScoreBar score={d.score} />
            </div>
            {expandedFn === i && (
              <div style={{
                padding: "12px 16px", margin: "2px 0 4px",
                borderLeft: "2px solid rgba(255,255,255,0.1)", marginLeft: 16,
                fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.5)"
              }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: "#22c55e", fontWeight: 600, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>AI HANDLES: </span>
                  {d.high}
                </div>
                <div>
                  <span style={{ color: "#f97316", fontWeight: 600, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>NEEDS HUMAN: </span>
                  {d.low}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlaybook = () => (
    <div style={sectionStyle}>
      <h2 style={{ fontSize: 22, fontWeight: 300, color: "#f0f0f0", margin: "0 0 6px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
        The Playbook
      </h2>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "0 0 24px", fontFamily: "'JetBrains Mono', monospace" }}>
        Six steps to a company that outlives its founder.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {playbook.map((p) => (
          <div key={p.step} style={{
            padding: "16px 18px", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 4, display: "flex", gap: 16, alignItems: "flex-start"
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.15)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
              color: "rgba(255,255,255,0.5)", fontWeight: 600
            }}>{p.step}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f0" }}>{p.title}</span>
                <span style={{
                  fontSize: 9, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                  color: p.status === "The gap" ? "#ef4444" : p.status.includes("human") || p.status.includes("gray") ? "#eab308" : "#22c55e",
                  letterSpacing: 1, textTransform: "uppercase"
                }}>{p.status}</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBarriers = () => (
    <div style={sectionStyle}>
      <h2 style={{ fontSize: 22, fontWeight: 300, color: "#f0f0f0", margin: "0 0 6px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
        The Barriers
      </h2>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "0 0 24px", fontFamily: "'JetBrains Mono', monospace" }}>
        What actually stops this — and what doesn't. Tap to see the workaround.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {barriers.map((b, i) => (
          <div key={i}>
            <div
              onClick={() => setExpandedBarrier(expandedBarrier === i ? null : i)}
              style={{
                padding: "14px 18px", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4, cursor: "pointer", transition: "all 0.2s",
                background: expandedBarrier === i ? "rgba(255,255,255,0.03)" : "transparent"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#f0f0f0" }}>{b.barrier}</span>
                <WallBadge type={b.wall} />
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "6px 0 0", lineHeight: 1.5 }}>{b.detail}</p>
            </div>
            {expandedBarrier === i && (
              <div style={{
                padding: "12px 18px", margin: "2px 0 4px",
                borderLeft: "2px solid rgba(255,255,255,0.1)", marginLeft: 16,
                fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)"
              }}>
                <span style={{ color: "#eab308", fontWeight: 600, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>WORKAROUND: </span>
                {b.workaround}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderLine = () => {
    const autonomous = [
      "Customer support triage",
      "Bookkeeping & reconciliation",
      "Logistics routing",
      "Compliance monitoring",
      "Data pipelines",
      "Programmatic ad buying",
      "Invoice processing",
      "Inventory management",
    ];
    const human = [
      "Brand identity & meaning",
      "Crisis response",
      "Ethical judgment",
      "Stakeholder trust",
      "Creative direction",
      "Product taste & vision",
      "Knowing what to walk away from",
      "Deciding what the company stands for",
    ];
    return (
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 22, fontWeight: 300, color: "#f0f0f0", margin: "0 0 6px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Where's the Line?
        </h2>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "0 0 28px", fontFamily: "'JetBrains Mono', monospace" }}>
          The experiment isn't whether we can remove all the humans. It's knowing where to stop.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              color: "#22c55e", letterSpacing: 1.5, marginBottom: 14
            }}>AUTONOMOUS WINS</div>
            {autonomous.map((item, i) => (
              <div key={i} style={{
                fontSize: 13, color: "rgba(255,255,255,0.5)", padding: "7px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)"
              }}>{item}</div>
            ))}
          </div>
          <div>
            <div style={{
              fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
              color: "#f97316", letterSpacing: 1.5, marginBottom: 14
            }}>HUMAN IN THE LEAD</div>
            {human.map((item, i) => (
              <div key={i} style={{
                fontSize: 13, color: "rgba(255,255,255,0.5)", padding: "7px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)"
              }}>{item}</div>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 32, padding: "20px 24px", borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)"
        }}>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6, fontStyle: "italic", fontFamily: "'Instrument Serif', Georgia, serif", letterSpacing: 0.2 }}>
            Nobody needs a human standing at a traffic light. But Anduril needs a Palmer Luckey.
            Perplexity needs an Aravind Srinivas. Even AI companies need a human deciding what
            to build and what to walk away from.
          </p>
        </div>
      </div>
    );
  };

  const panels = [renderQuestion, renderAutonomy, renderPlaybook, renderBarriers, renderLine];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", color: "#f0f0f0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "fixed", inset: 0, overflowY: "auto", zIndex: 10
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>
        {/* Back navigation */}
        <button
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.3)", fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
            padding: "0 0 24px", transition: "color 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          BACK TO TOOLS
        </button>

        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            color: "rgba(255,255,255,0.25)", letterSpacing: 2, marginBottom: 12
          }}>HUMANINTHELEAD.AI</div>
          <h1 style={{
            fontSize: 36, fontWeight: 300, lineHeight: 1.15, margin: "0 0 10px",
            fontFamily: "'Instrument Serif', Georgia, serif", color: "#f0f0f0"
          }}>
            Can You Build a Company<br />With Zero Humans?
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: 1.5 }}>
            An interactive exploration of autonomous companies — what's possible,
            what's legal, and where humans still matter.
          </p>
        </div>
        {nav}
        <div style={{ padding: "28px 0" }}>
          {panels[active]()}
        </div>
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 20, marginTop: 12, textAlign: "center"
        }}>
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.2)", letterSpacing: 0.5 }}>
            &copy; 2026 Human in the Lead — AI Transformation Advisory
          </span>
        </div>
      </div>
    </div>
  );
}
