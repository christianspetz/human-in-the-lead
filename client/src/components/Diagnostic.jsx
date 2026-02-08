import React, { useState } from 'react';

const INDUSTRIES = [
  'Pharma/Biotech/Life Sciences', 'Financial Services', 'Manufacturing/Industrial',
  'Technology/Telecom', 'Energy/Utilities', 'Retail/Consumer Goods',
  'Healthcare/Public Sector', 'Professional Services', 'Other'
];
const ORG_SIZES = ['<500 employees', '500–2,000', '2,000–10,000', '10,000–50,000', '50,000+'];
const ROLES = [
  'C-Suite (CEO, COO, CTO, CDO, CIO)', 'SVP / VP', 'Director',
  'Head of Transformation / Change', 'Head of AI / Data / Analytics',
  'Strategy / Innovation Lead', 'Other'
];

const QUESTIONS = [
  {
    id: 'q1',
    text: "How would you describe your organization's recent experience with large-scale change?",
    options: [
      'Growing rapidly and successfully executing strategic initiatives',
      'Growing steadily with mixed results on past transformation programs',
      'Stable, but previous change efforts have largely struggled to land',
      'Navigating disruption with no major transformation track record',
      'Multiple recent change programs — significant fatigue across the organization'
    ]
  },
  {
    id: 'q2', text: 'Where does your AI initiative stand today?',
    options: [
      'Exploring — no concrete plans yet',
      'Pilot stage — testing in 1–2 areas',
      'Scaling — expanding from pilots to broader deployment',
      'Stalled — started but lost momentum',
      'Not started — but there is executive intent to move'
    ]
  },
  {
    id: 'q3', text: 'What does executive sponsorship for AI transformation look like?',
    options: [
      'CEO or C-suite is personally driving it with clear accountability',
      'One executive champions it, but peers are not yet aligned',
      'Delegated to a VP or director without C-suite ownership',
      'No clear sponsor — interest exists but no formal commitment',
      'Competing priorities — AI is one of many items on the executive agenda'
    ]
  },
  {
    id: 'q4', text: 'Do you have middle management champions who can drive adoption?',
    options: [
      'Yes — identified and engaged champions across functions',
      'Some — a few enthusiastic managers, but not systematic',
      'No — middle management is largely skeptical or uninvolved',
      'Middle management is actively resistant to AI-driven change',
      "We haven't engaged this layer yet"
    ]
  },
  {
    id: 'q5', text: "How would you characterize your organization's culture around change?",
    options: [
      'Innovative and adaptive — we embrace change and move quickly',
      "Cautious but open — we'll commit if the business case is strong",
      'Siloed — each function operates independently with limited cross-functional collaboration',
      'Bureaucratic — slow to decide, slower to execute',
      'Change-fatigued — people are exhausted from recent initiatives'
    ]
  },
  {
    id: 'q6', text: 'How is your organization approaching AI investment?',
    options: [
      'Committed multi-year funding tied to strategic outcomes',
      'Significant budget allocated for this fiscal year',
      'Moderate investment — funding specific pilots and proofs of concept',
      'Exploratory — limited budget, testing the waters',
      'No dedicated AI budget — funding is ad hoc or not yet defined'
    ]
  },
  {
    id: 'q7', text: 'Which core business processes are you targeting for AI transformation?',
    subtitle: 'Select up to 3 priority areas. Successful transformations start focused.',
    type: 'multi', maxSelect: 3,
    options: [
      'Order-to-Cash (sales, billing, collections, revenue)',
      'Hire-to-Retire (HR, talent, workforce planning)',
      'Procure-to-Pay (procurement, supplier management, AP)',
      'Record-to-Report (finance, accounting, close, compliance)',
      'Plan-to-Produce (supply chain, manufacturing, demand planning)',
      'Customer/Patient journey (CX, service, engagement)',
      'R&D and product development',
      'IT operations and infrastructure'
    ]
  },
  {
    id: 'q8', text: "How would you describe your organization's data landscape?",
    options: [
      'Unified data platform with strong governance and quality standards',
      'Mostly integrated — some silos remain but data is generally accessible',
      'Fragmented — data lives in silos with limited integration across systems',
      'Legacy-heavy — critical data is locked in outdated systems',
      "Unknown — we don't have a clear picture of our data maturity"
    ]
  },
  {
    id: 'q9', text: 'Where does your organization stand on AI and data talent?',
    options: [
      'Established AI/ML team with cross-functional data literacy programs',
      'Small dedicated AI team — but limited data literacy across the business',
      'Relying primarily on external vendors and system integrators',
      'Individual pockets of expertise — no coordinated AI capability',
      'No dedicated AI talent — starting from scratch'
    ]
  },
  {
    id: 'q10', text: 'What is the primary strategic objective for AI transformation?',
    options: [
      'Reduce operational costs and improve efficiency at scale',
      'Accelerate R&D, product development, or time-to-market',
      'Transform decision-making with better data and real-time insights',
      'Reimagine the customer or patient experience',
      'Build new AI-native products, services, or business models',
      'Maintain competitive position — peers are moving and we cannot afford to wait'
    ]
  },
  {
    id: 'q11', text: "What's driving the timeline for your AI transformation?",
    options: [
      'Board mandate with specific milestones and accountability',
      'Competitive pressure — peers and disruptors are moving fast',
      'Regulatory or compliance driver requiring new capabilities',
      'New leadership with a transformation mandate',
      'Exploratory — no hard deadline, building the case internally'
    ]
  }
];

export default function Diagnostic({ onComplete, onBack }) {
  const [phase, setPhase] = useState('intro');
  const [intro, setIntro] = useState({ industry: '', orgSize: '', role: '' });
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [multiSelect, setMultiSelect] = useState([]);
  const [animDir, setAnimDir] = useState('right');
  const [animKey, setAnimKey] = useState(0);

  const question = QUESTIONS[currentQ];
  const totalSteps = QUESTIONS.length + 1;
  const currentStep = phase === 'intro' ? 1 : currentQ + 2;
  const progress = ((currentStep - 1) / totalSteps) * 100;

  const handleIntroSubmit = () => {
    if (!intro.industry || !intro.orgSize || !intro.role) return;
    setAnimDir('right');
    setAnimKey(k => k + 1);
    setPhase('questions');
  };

  const handleSelect = (option) => {
    const newAnswers = { ...answers, [question.id]: option };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setAnimDir('right'); setAnimKey(k => k + 1);
      setTimeout(() => setCurrentQ(currentQ + 1), 50);
    } else {
      onComplete({ ...newAnswers, intro });
    }
  };

  const handleMultiToggle = (option) => {
    setMultiSelect(prev => {
      if (prev.includes(option)) return prev.filter(o => o !== option);
      if (prev.length >= question.maxSelect) return prev;
      return [...prev, option];
    });
  };

  const handleMultiSubmit = () => {
    if (multiSelect.length === 0) return;
    const newAnswers = { ...answers, [question.id]: multiSelect };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setAnimDir('right'); setAnimKey(k => k + 1); setMultiSelect([]);
      setTimeout(() => setCurrentQ(currentQ + 1), 50);
    } else {
      onComplete({ ...newAnswers, intro });
    }
  };

  const handleBack = () => {
    if (phase === 'intro') return onBack();
    if (currentQ === 0) { setAnimDir('left'); setAnimKey(k => k + 1); return setPhase('intro'); }
    setAnimDir('left'); setAnimKey(k => k + 1);
    if (QUESTIONS[currentQ - 1].type === 'multi') setMultiSelect(answers[QUESTIONS[currentQ - 1].id] || []);
    setTimeout(() => setCurrentQ(currentQ - 1), 50);
  };

  if (phase === 'intro') {
    return (
      <>
        <div className="progress-container"><div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: '0%' }} /></div></div>
        <div className="page-wrapper">
          <div className="question-container animate-in">
            <div className="question-number">About your organization</div>
            <h2 className="question-text">Tell us about your organization</h2>
            <p style={{ color: 'var(--slate-light)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              This helps us tailor the diagnostic and benchmark your results against similar organizations.
            </p>
            <div className="intro-field">
              <label className="intro-label">Industry</label>
              <div className="intro-select-wrap">
                <select className="intro-select" value={intro.industry} onChange={(e) => setIntro({...intro, industry: e.target.value})}>
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="intro-field">
              <label className="intro-label">Organization size</label>
              <div className="intro-select-wrap">
                <select className="intro-select" value={intro.orgSize} onChange={(e) => setIntro({...intro, orgSize: e.target.value})}>
                  <option value="">Select organization size</option>
                  {ORG_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="intro-field">
              <label className="intro-label">Your role</label>
              <div className="intro-select-wrap">
                <select className="intro-select" value={intro.role} onChange={(e) => setIntro({...intro, role: e.target.value})}>
                  <option value="">Select your role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="question-nav">
              <button className="back-btn" onClick={onBack}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back
              </button>
              <button className="btn-primary" style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }} onClick={handleIntroSubmit} disabled={!intro.industry || !intro.orgSize || !intro.role}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="progress-container"><div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div></div>
      <div className="page-wrapper">
        <div className="question-container" key={animKey} style={{ animation: `${animDir === 'right' ? 'slideInRight' : 'slideInLeft'} 0.35s ease-out both` }}>
          <div className="question-number">Question {currentQ + 1} of {QUESTIONS.length}</div>
          <h2 className="question-text">{question.text}</h2>
          {question.subtitle && <p style={{ color: 'var(--teal)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>{question.subtitle}</p>}

          {question.type === 'multi' ? (
            <>
              <div className="options-list">
                {question.options.map(opt => (
                  <button key={opt} className={`option-btn ${multiSelect.includes(opt) ? 'selected' : ''} ${multiSelect.length >= question.maxSelect && !multiSelect.includes(opt) ? 'disabled' : ''}`} onClick={() => handleMultiToggle(opt)}>
                    <span className="multi-check">{multiSelect.includes(opt) ? '✓' : ''}</span>{opt}
                  </button>
                ))}
              </div>
              <div className="question-nav">
                <button className="back-btn" onClick={handleBack}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>{multiSelect.length} / {question.maxSelect}</span>
                  <button className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }} onClick={handleMultiSubmit} disabled={multiSelect.length === 0}>Continue →</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="options-list">
                {question.options.map(opt => (
                  <button key={opt} className={`option-btn ${answers[question.id] === opt ? 'selected' : ''}`} onClick={() => handleSelect(opt)}>{opt}</button>
                ))}
              </div>
              <div className="question-nav">
                <button className="back-btn" onClick={handleBack}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Back</button>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>{currentQ + 1} / {QUESTIONS.length}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
