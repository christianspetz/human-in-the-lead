import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const SAMPLE_RESULTS = {
  role_summary: "Marketing Managers orchestrate brand strategy, campaign execution, team coordination, and performance analytics. AI transforms this role from execution-heavy to strategy-heavy — freeing you to focus on creative vision, leadership, and the work that actually moves the needle.",
  augmentation_score: 72,
  personal_insight: "You mentioned people compliment your storytelling and stakeholder management — those are exactly the skills AI can't replicate. Your 90-day plan leans into those strengths while using AI to cover the areas you want to improve.",
  task_breakdown: [
    { task: "Content Creation & Copywriting", ai_level: "high", description: "AI drafts copy, generates variations, and A/B tests messaging — you refine voice, approve tone, and add the strategic nuance only you can.", current_hours: 10, future_hours: 3 },
    { task: "Campaign Performance Analysis", ai_level: "full", description: "AI dashboards auto-surface insights, anomalies, and optimization recommendations in real-time. You shift from pulling reports to acting on them.", current_hours: 8, future_hours: 1 },
    { task: "Audience Segmentation & Targeting", ai_level: "high", description: "AI models identify micro-segments and predict conversion likelihood. You focus on understanding why audiences behave the way they do.", current_hours: 6, future_hours: 1 },
    { task: "Competitive & Market Research", ai_level: "high", description: "AI continuously monitors competitor activity and market trends — surfacing only what matters so you can think bigger.", current_hours: 6, future_hours: 1 },
    { task: "Brand Strategy & Positioning", ai_level: "moderate", description: "AI provides data-driven inputs on brand perception, but creative vision and brand soul? That's all you.", current_hours: 6, future_hours: 4 },
    { task: "Budget Allocation & Media Planning", ai_level: "moderate", description: "AI optimizes spend across channels based on real-time performance. You make the big strategic bets on where to invest.", current_hours: 5, future_hours: 2 },
    { task: "Team Leadership & Development", ai_level: "low", description: "Coaching, mentoring, and motivating your team remains deeply human. This is where your reclaimed hours go — investing in people.", current_hours: 8, future_hours: 7 },
    { task: "Stakeholder Communication", ai_level: "low", description: "Presenting strategy to executives and building cross-functional alignment requires your judgment, persuasion, and relationships.", current_hours: 5, future_hours: 4 },
  ],
  new_skills: [
    { skill: "Prompt Engineering & AI Direction", priority: "critical", description: "Learn to instruct AI tools effectively. The better your prompts, the better the output — and the less time you spend editing. Start by experimenting with one tool daily." },
    { skill: "AI Output Evaluation", priority: "critical", description: "Build the judgment to quickly assess whether AI-generated content, data, and recommendations are accurate and on-brand. This becomes your superpower." },
    { skill: "Data Literacy & AI Analytics", priority: "high", description: "Get comfortable reading AI-driven dashboards and translating predictive models into compelling strategic narratives your team and leadership can act on." },
    { skill: "AI-Augmented Workflow Design", priority: "high", description: "Learn to redesign your team's processes to plug AI in at the right moments. This makes you the person who scales the whole team's output." },
    { skill: "Ethical AI & Brand Safety", priority: "moderate", description: "Understand the risks of AI-generated content — bias, hallucination, brand misalignment — so you can be the trusted guardrail." },
    { skill: "Strategic Thinking & Synthesis", priority: "critical", description: "As AI handles execution, the premium on connecting dots, seeing patterns, and making bold strategic bets goes way up. Lean into this." },
  ],
  transition_plan: [
    { phase: "Explore & Experiment", period: "Days 1-30", actions: ["Map every recurring task you do and estimate time spent weekly", "Pick the 3 most repetitive, lowest-judgment tasks as your first AI experiments", "Try 2-3 AI tools for your top use case (content drafting or data analysis are great starts)", "Document your baseline: how long things take now, so you can measure improvement"] },
    { phase: "Build Your AI Workflow", period: "Days 31-60", actions: ["Integrate AI tools into your daily workflow for your pilot tasks", "Create a simple review checklist for AI outputs (accuracy, tone, brand fit)", "Use your reclaimed hours intentionally: more 1:1s, more strategic thinking, more creative work", "Share what's working with your team — become the person who helps others adapt"] },
    { phase: "Level Up & Lead", period: "Days 61-90", actions: ["Measure your impact: time saved, output quality, how it feels to work this way", "Expand AI into 2 more task areas based on what you've learned", "Update your personal development plan to reflect your new AI-augmented skillset", "Create a simple playbook so your team can follow your lead"] },
  ],
  time_impact: { current_weekly: 54, future_weekly: 23, hours_reclaimed: 31, strategic_uplift: "57%" }
};

const AI_LEVELS = {
  full:     { label: "AI Handles It",        color: "var(--teal-light)", bg: "var(--teal-dim)" },
  high:     { label: "AI + Your Review",     color: "var(--teal)",       bg: "var(--teal-dim)" },
  moderate: { label: "You Lead, AI Assists", color: "var(--slate-light)", bg: "rgba(148,163,184,0.1)" },
  low:      { label: "Uniquely You",         color: "#A855F7",           bg: "rgba(168,85,247,0.1)" },
};
const PRIORITY_MAP = {
  critical: { color: "var(--red)",          bg: "var(--red-dim)",          label: "Start Now" },
  high:     { color: "var(--teal)",         bg: "var(--teal-dim)",         label: "Build Next" },
  moderate: { color: "var(--slate-light)",  bg: "rgba(148,163,184,0.1)",   label: "Good to Know" },
};

const INDUSTRIES = [
  "Technology", "Financial Services", "Healthcare", "Consulting",
  "Retail & E-commerce", "Manufacturing", "Media & Entertainment",
  "Education", "Government", "Nonprofit", "Other",
];

const ROLE_CATEGORIES = [
  { label: "Tech & Data", roles: ["Software Engineer", "Data Scientist", "UX Designer", "Product Manager", "Business Analyst"] },
  { label: "Finance & Ops", roles: ["Financial Analyst", "Accountant", "Operations Manager", "Supply Chain Analyst"] },
  { label: "People & Growth", roles: ["HR Director", "Recruiter", "Customer Success Manager", "Executive Assistant"] },
  { label: "Marketing & Sales", roles: ["Marketing Manager", "Sales Rep", "Content Strategist", "Project Manager", "Legal Counsel"] },
];

const CONCERN_LEVELS = [
  { value: "high", label: "High", emoji: "\ud83d\udea8", description: "I think about it a lot \u2014 it keeps me up at night", color: "var(--red)", bg: "var(--red-dim)" },
  { value: "medium", label: "Medium", emoji: "\ud83e\udd14", description: "I know it's coming but I'm not sure what to do", color: "var(--amber)", bg: "var(--amber-dim)" },
  { value: "low", label: "Low", emoji: "\ud83d\ude0e", description: "I'm curious and excited, not worried", color: "var(--green)", bg: "var(--green-dim)" },
];

const TOTAL_STEPS = 5;

const STEPS = [
  { id: "role",       title: "Your Role",        subtitle: "Let's start with what you do." },
  { id: "concern",    title: "AI Concern Level",  subtitle: "How much is AI on your mind?" },
  { id: "compliments", title: "Your Superpower",   subtitle: "What do people compliment you on at work?" },
  { id: "growth",     title: "Your Growth Edge",  subtitle: "What do you wish you were better at?" },
  { id: "goals",      title: "Your Ambition",     subtitle: "Where do you want to be in 1\u20132 years?" },
];

/* ═══════════════════════════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function AnimatedNumber({ value, suffix = "", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(interval); }
      else { setDisplay(Math.round(start)); }
    }, 16);
    return () => clearInterval(interval);
  }, [value, duration]);
  return <span>{display}{suffix}</span>;
}

function CircularGauge({ score, size = 150 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  useEffect(() => { const t = setTimeout(() => setAnimatedScore(score), 300); return () => clearTimeout(t); }, [score]);
  const offset = circumference - (animatedScore / 100) * circumference;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--navy-mid)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--teal)" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "2.2rem", fontWeight: 700, color: "var(--teal-light)", fontVariantNumeric: "tabular-nums" }}><AnimatedNumber value={score} suffix="%" /></span>
        <span style={{ fontSize: "0.65rem", color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>AI-Assistable</span>
      </div>
    </div>
  );
}

function TaskBar({ task, index }) {
  const level = AI_LEVELS[task.ai_level];
  const savedPct = ((task.current_hours - task.future_hours) / task.current_hours) * 100;
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 120 * index); return () => clearTimeout(t); }, [index]);
  return (
    <div className="reimaginer-task-card" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 600, color: "var(--pure-white)", fontSize: "0.92rem", marginBottom: 4 }}>{task.task}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--slate-light)", lineHeight: 1.55 }}>{task.description}</div>
        </div>
        <span style={{ fontSize: "0.65rem", padding: "4px 12px", borderRadius: 20, background: level.bg, color: level.color, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{level.label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
        <div style={{ flex: 1, height: 5, background: "var(--navy-mid)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: visible ? `${savedPct}%` : "0%", height: "100%", borderRadius: 3, background: "linear-gradient(90deg, var(--teal-dim), var(--teal))", transition: "width 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s" }} />
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--slate-light)", whiteSpace: "nowrap", minWidth: 115, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          <span style={{ color: "var(--teal)", fontWeight: 700 }}>{task.current_hours - task.future_hours}h</span> back / week
          <span style={{ opacity: 0.5, marginLeft: 4 }}>({task.current_hours}{"\u2192"}{task.future_hours}h)</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function RoleReimaginer({ onBack }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [concernLevel, setConcernLevel] = useState("");
  const [compliments, setCompliments] = useState("");
  const [growthArea, setGrowthArea] = useState("");
  const [proGoals, setProGoals] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === 0) setTimeout(() => inputRef.current?.focus(), 200);
    if (step === 2 || step === 3 || step === 4) setTimeout(() => textareaRef.current?.focus(), 200);
  }, [step]);

  const canAdvance = () => {
    if (step === 0) return role.trim().length > 0;
    if (step === 1) return concernLevel !== "";
    if (step === 2) return compliments.trim().length > 5;
    if (step === 3) return growthArea.trim().length > 5;
    if (step === 4) return proGoals.trim().length > 5;
    return false;
  };

  const advance = () => {
    if (step < 4) setStep(step + 1);
    else if (step === 4) runAnalysis();
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
    else onBack();
  };

  const runAnalysis = async () => {
    setStep(5); // loading
    try {
      const res = await fetch('/api/reimagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role.trim(),
          industry: industry || "Not specified",
          concern_level: concernLevel,
          compliments: compliments.trim(),
          growth_area: growthArea.trim(),
          professional_goals: proGoals.trim(),
        }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const parsed = await res.json();
      if (parsed.error) throw new Error(parsed.error);
      setResults(parsed);
      setStep(6);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      console.error(err);
      setResults(SAMPLE_RESULTS);
      setStep(6);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    }
  };

  const handleCompareAnother = () => {
    setResults(null); setRole(""); setIndustry(""); setConcernLevel("");
    setCompliments(""); setGrowthArea(""); setProGoals("");
    setActiveTab("tasks"); setStep(0); setShowEmailCapture(false); setEmailSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = () => {
    const text = `I just used the AI Role Reimaginer to see how AI will transform my role as ${role}.\n\n${results.augmentation_score}% of my tasks can be AI-assisted \u2014 freeing up ${results.time_impact.hours_reclaimed}h/week for higher-impact work.\n\nTry it yourself \ud83d\udc47\nhttps://humaninthelead.ai`;
    if (navigator.share) { navigator.share({ title: "AI Role Reimaginer", text }).catch(() => {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard! Paste it on LinkedIn.")).catch(() => {}); }
  };

  const tabs = [
    { id: "tasks", label: "What Changes", icon: "\u25D0" },
    { id: "skills", label: "How to Upskill", icon: "\u25C8" },
    { id: "plan", label: "Your 90-Day Plan", icon: "\u25B7" },
  ];
  const phaseColors = ["var(--teal)", "var(--teal-light)", "#A855F7"];
  const phaseBgs = ["var(--teal-dim)", "rgba(34,211,238,0.12)", "rgba(168,85,247,0.1)"];
  const progress = step <= 4 ? ((step + 1) / TOTAL_STEPS) * 100 : 100;

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="reimaginer-wrapper">

      {/* Progress bar */}
      {step <= 4 && (
        <div className="progress-container">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Back */}
      <button className="back-btn" onClick={goBack} style={{ marginBottom: 16, marginTop: step <= 4 ? 12 : 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        {step === 0 ? "Back to Tools" : "Back"}
      </button>

      {/* Step header */}
      {step <= 4 && (
        <div style={{ textAlign: "center", marginBottom: 36 }} className="animate-in">
          <span className="landing-badge" style={{ marginBottom: 16, display: "inline-block" }}>Step {step + 1} of {TOTAL_STEPS}</span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 8 }}>{STEPS[step].title}</h1>
          <p style={{ fontSize: "1rem", color: "var(--slate-light)", maxWidth: 480, margin: "0 auto" }}>{STEPS[step].subtitle}</p>
        </div>
      )}

      {/* ─── STEP 0: Role ─── */}
      {step === 0 && (
        <div className="animate-in animate-in-delay-1">
          <div className="reimaginer-input-card">
            <label>Job Title</label>
            <input ref={inputRef} type="text" value={role} onChange={(e) => setRole(e.target.value)} onKeyDown={(e) => e.key === "Enter" && canAdvance() && advance()} placeholder="e.g. Marketing Manager, Data Scientist, HR Director..." />
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {ROLE_CATEGORIES.map((cat) => (
                  <button key={cat.label} className={`reimaginer-category-btn ${expandedCategory === cat.label ? 'active' : ''}`} onClick={() => setExpandedCategory(expandedCategory === cat.label ? null : cat.label)}>{cat.label}</button>
                ))}
              </div>
              {expandedCategory && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", animation: "slideUp 0.3s ease" }}>
                  {ROLE_CATEGORIES.find(c => c.label === expandedCategory)?.roles.map((r) => (
                    <button key={r} className="reimaginer-role-btn" onClick={() => { setRole(r); setExpandedCategory(null); }}>{r}</button>
                  ))}
                </div>
              )}
              {!expandedCategory && <p style={{ fontSize: "0.72rem", color: "var(--slate)", margin: 0 }}>Pick a category or type any role.</p>}
            </div>
            <div style={{ marginTop: 20 }}>
              <label>Industry <span style={{ fontWeight: 400, color: "var(--slate)", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <div className="select-wrapper">
                <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 1: Concern Level ─── */}
      {step === 1 && (
        <div className="animate-in animate-in-delay-1">
          <div className="options-list" style={{ maxWidth: 520, margin: "0 auto" }}>
            {CONCERN_LEVELS.map((level) => (
              <button
                key={level.value}
                className={`option-btn ${concernLevel === level.value ? 'selected' : ''}`}
                onClick={() => setConcernLevel(level.value)}
                style={{ padding: "1.1rem 1.25rem" }}
              >
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{level.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 2 }}>{level.label}</div>
                  <div style={{ fontSize: "0.82rem", color: "var(--slate-light)", fontWeight: 400 }}>{level.description}</div>
                </div>
              </button>
            ))}
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--slate)", textAlign: "center", marginTop: 20 }}>
            No wrong answer \u2014 this calibrates how we frame your results.
          </p>
        </div>
      )}

      {/* ─── STEP 2: Compliments ─── */}
      {step === 2 && (
        <div className="animate-in animate-in-delay-1">
          <div className="reimaginer-input-card">
            <label>What do people usually compliment you on at work?</label>
            <p style={{ fontSize: "0.8rem", color: "var(--slate)", marginBottom: 12, marginTop: -4 }}>
              Think about feedback from managers, peers, or clients. What do they say you're great at?
            </p>
            <textarea
              ref={textareaRef}
              value={compliments}
              onChange={(e) => setCompliments(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && canAdvance()) { e.preventDefault(); advance(); }}}
              placeholder="e.g. I always know how to explain complex things simply, or I'm the person everyone comes to when things go sideways"
              rows={4}
              style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 10, background: "var(--navy)", border: "1px solid var(--navy-mid)", color: "var(--white)", fontSize: "0.92rem", outline: "none", fontFamily: "var(--font-body)", resize: "vertical", lineHeight: 1.6 }}
            />
            <p style={{ fontSize: "0.72rem", color: "var(--slate)", marginTop: 8 }}>
              These strengths are where you'll shine even more with AI. We'll make sure your plan protects and amplifies them.
            </p>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Growth Area ─── */}
      {step === 3 && (
        <div className="animate-in animate-in-delay-1">
          <div className="reimaginer-input-card">
            <label>What's something you wish you were better at?</label>
            <p style={{ fontSize: "0.8rem", color: "var(--slate)", marginBottom: 12, marginTop: -4 }}>
              Be honest \u2014 this is where AI might help the most. No one sees this but you and the AI.
            </p>
            <textarea
              ref={textareaRef}
              value={growthArea}
              onChange={(e) => setGrowthArea(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && canAdvance()) { e.preventDefault(); advance(); }}}
              placeholder='e.g. "I struggle with data analysis and making charts" or "I wish I could write faster and more clearly" or "Time management is killing me"'
              rows={4}
              style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 10, background: "var(--navy)", border: "1px solid var(--navy-mid)", color: "var(--white)", fontSize: "0.92rem", outline: "none", fontFamily: "var(--font-body)", resize: "vertical", lineHeight: 1.6 }}
            />
            <p style={{ fontSize: "0.72rem", color: "var(--slate)", marginTop: 8 }}>
              The best part? AI is often strongest exactly where people feel weakest. Your plan will show you how.
            </p>
          </div>
        </div>
      )}

      {/* ─── STEP 4: Professional Goals ─── */}
      {step === 4 && (
        <div className="animate-in animate-in-delay-1">
          <div className="reimaginer-input-card">
            <label>What are your professional goals for the next 1\u20132 years?</label>
            <p style={{ fontSize: "0.8rem", color: "var(--slate)", marginBottom: 12, marginTop: -4 }}>
              Promotion? Career pivot? Starting something new? Your 90-day plan will be built around getting you there.
            </p>
            <textarea
              ref={textareaRef}
              value={proGoals}
              onChange={(e) => setProGoals(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && canAdvance()) { e.preventDefault(); advance(); }}}
              placeholder='e.g. "Get promoted to Director" or "Move into product management" or "Build a reputation as the go-to AI person in my org"'
              rows={4}
              style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: 10, background: "var(--navy)", border: "1px solid var(--navy-mid)", color: "var(--white)", fontSize: "0.92rem", outline: "none", fontFamily: "var(--font-body)", resize: "vertical", lineHeight: 1.6 }}
            />
            <p style={{ fontSize: "0.72rem", color: "var(--slate)", marginTop: 8 }}>
              Last step \u2014 hit the button and we'll build your personalized AI game plan.
            </p>
          </div>
        </div>
      )}

      {/* Step Nav */}
      {step <= 4 && (
        <div className="question-nav">
          <div />
          <button className="btn-primary" onClick={advance} disabled={!canAdvance()} style={{ padding: "0.85rem 2.5rem" }}>
            {step === 4 ? "Reimagine My Role \u2192" : "Continue \u2192"}
          </button>
        </div>
      )}

      {/* ─── STEP 5: Loading ─── */}
      {step === 5 && (
        <div className="analysis-screen" style={{ minHeight: "40vh" }}>
          <div className="analysis-spinner" />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--pure-white)", marginBottom: 8 }}>Building your personalized plan...</h2>
          <p style={{ color: "var(--slate-light)", fontSize: "0.9rem", maxWidth: 440, lineHeight: 1.6 }}>
            Analyzing the <strong style={{ color: "var(--teal)" }}>{role}</strong> role through the lens of your strengths, growth areas, and career goals.
          </p>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8, maxWidth: 360, width: "100%" }}>
            {[
              { label: "Mapping your tasks", delay: "0s" },
              { label: "Matching AI to your growth areas", delay: "0.3s" },
              { label: "Building your 90-day plan", delay: "0.6s" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 1rem", borderRadius: 8, background: "var(--navy-light)", border: "1px solid var(--navy-mid)", animation: "fadeInUp 0.5s ease both", animationDelay: item.delay }}>
                <span style={{ color: "var(--teal)", animation: "pulse 1.5s infinite", animationDelay: item.delay }}>{"\u25CF"}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--slate-lighter)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── STEP 6: Results ─── */}
      {step === 6 && results && (
        <div ref={resultsRef}>
          <div style={{ textAlign: "center", marginBottom: 32 }} className="animate-in">
            <span className="landing-badge" style={{ marginBottom: 16, display: "inline-block" }}>Your Results</span>
            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 4 }}>{role}</h1>
            {industry && industry !== "Not specified" && <p style={{ fontSize: "0.85rem", color: "var(--slate-light)" }}>{industry}</p>}
          </div>

          {/* Score Cards */}
          <div className="animate-in animate-in-delay-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
            <div className="reimaginer-summary-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gridRow: "span 2", padding: "2rem 1.5rem" }}>
              <CircularGauge score={results.augmentation_score} />
              <p style={{ fontSize: "0.78rem", color: "var(--slate-light)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>of your tasks can be enhanced with AI</p>
            </div>
            <div className="reimaginer-summary-card">
              <div style={{ fontSize: "0.7rem", color: "var(--slate-lighter)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>Hours You Get Back / Week</div>
              <div style={{ fontSize: "2.6rem", fontWeight: 700, color: "var(--teal-light)", fontVariantNumeric: "tabular-nums" }}><AnimatedNumber value={results.time_impact.hours_reclaimed} suffix="h" /></div>
              <div style={{ fontSize: "0.82rem", color: "var(--slate-lighter)", marginTop: 6 }}>{results.time_impact.current_weekly}h {"\u2192"} {results.time_impact.future_weekly}h weekly</div>
            </div>
            <div className="reimaginer-summary-card">
              <div style={{ fontSize: "0.7rem", color: "var(--slate-lighter)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>More Time for What Matters</div>
              <div style={{ fontSize: "2.6rem", fontWeight: 700, color: "#A855F7", fontVariantNumeric: "tabular-nums" }}>{results.time_impact.strategic_uplift}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--slate-lighter)", marginTop: 6 }}>Shift toward strategy & leadership</div>
            </div>
          </div>

          {/* Personal Insight */}
          {results.personal_insight && (
            <div className="animate-in animate-in-delay-2" style={{ padding: "1.25rem 1.5rem", borderRadius: 12, marginBottom: 20, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", borderLeft: "3px solid #A855F7" }}>
              <div style={{ fontSize: "0.68rem", color: "#A855F7", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>Personalized for You</div>
              <p style={{ fontSize: "0.9rem", color: "var(--slate-lighter)", lineHeight: 1.7 }}>{results.personal_insight}</p>
            </div>
          )}

          {/* Share + Email */}
          <div className="animate-in animate-in-delay-3" style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <button className="btn-secondary" onClick={handleShare} style={{ flex: 1, minWidth: 170, justifyContent: "center" }}>{"\u2197"} Share Results</button>
            {!showEmailCapture && !emailSubmitted && (
              <button className="btn-secondary" onClick={() => setShowEmailCapture(true)} style={{ flex: 1, minWidth: 170, justifyContent: "center", borderColor: "rgba(168,85,247,0.3)", color: "#A855F7" }}>{"\u2709"} Email My Report</button>
            )}
            {emailSubmitted && (
              <div style={{ flex: 1, minWidth: 170, padding: "0.75rem 1.5rem", borderRadius: 8, background: "var(--teal-dim)", border: "1px solid rgba(6,182,212,0.2)", color: "var(--teal)", fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{"\u2713"} Report on its way!</div>
            )}
          </div>

          {showEmailCapture && !emailSubmitted && (
            <div style={{ padding: "1.25rem 1.5rem", borderRadius: 12, marginBottom: 20, background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", animation: "slideUp 0.3s ease" }}>
              <p style={{ fontSize: "0.82rem", color: "var(--slate-lighter)", marginBottom: 12 }}>Get your full breakdown + 90-day plan as a PDF. No spam {"\u2014"} just your report.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" onKeyDown={(e) => { if (e.key === "Enter" && email.includes("@")) { setEmailSubmitted(true); setShowEmailCapture(false); }}} style={{ flex: 1, minWidth: 200, padding: "0.65rem 1rem", borderRadius: 8, background: "var(--navy)", border: "1px solid var(--navy-mid)", color: "var(--white)", fontSize: "0.88rem", outline: "none", fontFamily: "var(--font-body)" }} />
                <button onClick={() => { if (email.includes("@")) { setEmailSubmitted(true); setShowEmailCapture(false); }}} className="btn-primary" style={{ padding: "0.65rem 1.5rem", fontSize: "0.85rem", opacity: email.includes("@") ? 1 : 0.4 }}>Send Report</button>
              </div>
            </div>
          )}

          {/* Role Summary */}
          <div className="reimaginer-insight-box teal" style={{ marginBottom: 28, fontSize: "0.92rem", lineHeight: 1.7 }}>{results.role_summary}</div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--navy-light)", borderRadius: 12, padding: 4, border: "1px solid var(--navy-mid)" }}>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`reimaginer-tab ${activeTab === tab.id ? 'active' : ''}`}>
                <span className="tab-icon" style={{ fontSize: "1.1rem" }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === "tasks" && (
            <div>
              <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                {Object.entries(AI_LEVELS).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: val.color }} />
                    <span style={{ fontSize: "0.7rem", color: "var(--slate-light)" }}>{val.label}</span>
                  </div>
                ))}
              </div>
              {results.task_breakdown.map((task, i) => <TaskBar key={i} task={task} index={i} />)}
              <div className="reimaginer-insight-box purple">
                <strong style={{ color: "#A855F7" }}>The takeaway:</strong> The tasks marked "Uniquely You" are where your real value lives. AI handles the rest so you can do more of what actually matters.
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div>
              <p style={{ fontSize: "0.85rem", color: "var(--slate-light)", marginBottom: 16, lineHeight: 1.6 }}>Prioritized based on your goals and growth areas. Start with "Start Now" for the biggest impact.</p>
              <div style={{ display: "grid", gap: 10 }}>
                {results.new_skills.map((skill, i) => {
                  const p = PRIORITY_MAP[skill.priority];
                  return (
                    <div key={i} className="reimaginer-skill-card" style={{ borderLeft: `3px solid ${p.color}`, animationDelay: `${i * 100}ms` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                        <span style={{ fontWeight: 600, color: "var(--pure-white)", fontSize: "0.92rem" }}>{skill.skill}</span>
                        <span style={{ fontSize: "0.62rem", padding: "3px 10px", borderRadius: 12, background: p.bg, color: p.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.label}</span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--slate-light)", lineHeight: 1.6 }}>{skill.description}</p>
                    </div>
                  );
                })}
              </div>
              <div className="reimaginer-insight-box teal">
                <strong style={{ color: "var(--teal)" }}>You don't need to learn everything at once.</strong> Pick one "Start Now" skill and spend 30 minutes this week experimenting.
              </div>
            </div>
          )}

          {activeTab === "plan" && (
            <div style={{ position: "relative" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--slate-light)", marginBottom: 24, lineHeight: 1.6 }}>Built around your goals. Start small, build confidence, then lead the way.</p>
              <div style={{ position: "absolute", left: 19, top: 68, bottom: 20, width: 2, background: "linear-gradient(180deg, var(--teal), var(--teal-light), #A855F7)", borderRadius: 1 }} />
              {results.transition_plan.map((phase, i) => (
                <div key={i} style={{ display: "flex", gap: 20, marginBottom: 28, position: "relative", animation: "slideUp 0.5s cubic-bezier(0.4,0,0.2,1)", animationDelay: `${i * 200}ms`, animationFillMode: "both" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: phaseBgs[i], border: `2px solid ${phaseColors[i]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, color: phaseColors[i], fontVariantNumeric: "tabular-nums" }}>{i + 1}</div>
                  <div className="reimaginer-phase-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontWeight: 700, color: "var(--pure-white)", fontSize: "1rem" }}>{phase.phase}</span>
                      <span className="dimension-tag" style={{ margin: 0 }}>{phase.period}</span>
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {phase.actions.map((action, j) => (
                        <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.85rem", color: "var(--slate-lighter)", lineHeight: 1.5 }}>
                          <span style={{ color: phaseColors[i], fontSize: "0.55rem", marginTop: 6, flexShrink: 0 }}>{"\u2022"}</span>
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="reimaginer-insight-box purple" style={{ marginLeft: 60 }}>
                <strong style={{ color: "#A855F7" }}>By day 90</strong>, you won't just be keeping up with AI {"\u2014"} you'll be the person others come to for guidance.
              </div>
            </div>
          )}

          <div style={{ marginTop: 40, display: "grid", gap: 14 }}>
            <button onClick={handleCompareAnother} className="btn-secondary" style={{ width: "100%", padding: "1.1rem 1.5rem", fontSize: "0.95rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {"\u21BB"} Compare Another Role
              <span style={{ fontSize: "0.78rem", color: "var(--slate-light)", fontWeight: 400 }}>{"\u2014"} try your manager's, your team's, or your dream job</span>
            </button>
            <div style={{ textAlign: "center", padding: "1.25rem", background: "var(--navy-light)", borderRadius: 12, border: "1px solid var(--navy-mid)" }}>
              <p style={{ fontSize: "0.82rem", color: "var(--slate)" }}>
                Want to assess your whole organization? Try the{' '}
                <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--teal)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", padding: 0 }}>AI Readiness Diagnostic</button> or the{' '}
                <button onClick={onBack} style={{ background: "none", border: "none", color: "#A855F7", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", padding: 0 }}>Workforce Simulator</button>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
