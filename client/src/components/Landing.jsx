import React, { useState } from 'react';

export default function Landing({ onStart, onStartSimulator }) {
  const [showCapture, setShowCapture] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="page-wrapper" style={{ maxWidth: '860px' }}>
      <div className="landing">
        <div className="animate-in">
          <span className="landing-badge">AI Transformation Tools</span>
        </div>
        <h1 className="animate-in animate-in-delay-1">Human-in-the-Lead</h1>
        <p className="subtitle animate-in animate-in-delay-2">Why Most AI Transformations Fail (And Will Yours?)</p>
        <p className="description animate-in animate-in-delay-3">
          There's a lot of excitement around AI right now, and rightly so. But the organizations that stall tend to overindex on the technology and underindex on everything else: leadership alignment, data readiness, change capacity, and getting people to actually adopt new ways of working.
        </p>

        <div className="landing-tools-grid animate-in animate-in-delay-4">
          {/* Diagnostic Card */}
          <div className="landing-tool-card" onClick={() => onStart(name, email)}>
            <div className="landing-tool-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" stroke="var(--teal)" strokeWidth="2" opacity="0.3"/>
                <path d="M24 8v16l12 8" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="24" cy="24" r="3" fill="var(--teal)"/>
              </svg>
            </div>
            <h3>AI Readiness Diagnostic</h3>
            <p className="landing-tool-desc">
              Answer 11 questions to assess your organization's AI transformation readiness across six key dimensions.
            </p>
            <div className="dimension-list" style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>
              <span className="dimension-tag">Strategy</span>
              <span className="dimension-tag">Capacity</span>
              <span className="dimension-tag">Data</span>
              <span className="dimension-tag">Talent</span>
              <span className="dimension-tag">Process</span>
              <span className="dimension-tag">Investment</span>
            </div>
            <span className="landing-tool-time">~5 minutes</span>
            <button className="btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
              Start Diagnostic
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Simulator Card */}
          <div className="landing-tool-card" onClick={onStartSimulator}>
            <div className="landing-tool-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="12" width="32" height="24" rx="3" stroke="#A855F7" strokeWidth="2" opacity="0.3"/>
                <rect x="12" y="20" width="4" height="12" rx="1" fill="#A855F7" opacity="0.6"/>
                <rect x="18" y="16" width="4" height="16" rx="1" fill="#A855F7" opacity="0.8"/>
                <rect x="24" y="22" width="4" height="10" rx="1" fill="#A855F7" opacity="0.5"/>
                <rect x="30" y="18" width="4" height="14" rx="1" fill="#A855F7" opacity="0.7"/>
              </svg>
            </div>
            <h3>Workforce Simulator</h3>
            <p className="landing-tool-desc">
              Configure AI automation levels across your departments and get a strategic Workforce Blueprint powered by AI analysis.
            </p>
            <div className="dimension-list" style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>
              <span className="dimension-tag">Cost</span>
              <span className="dimension-tag">Risk</span>
              <span className="dimension-tag">Speed</span>
              <span className="dimension-tag">Morale</span>
              <span className="dimension-tag">Quality</span>
            </div>
            <span className="landing-tool-time">~10 minutes</span>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '0.75rem' }}>
              Launch Simulator
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* AI Infusion Lab Card */}
          <div className="landing-tool-card" onClick={() => window.location.href = '/ai-infusion-lab.html'}>
            <div className="landing-tool-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M18 8v14l-6 10a3 3 0 002.6 4.5h18.8A3 3 0 0036 32l-6-10V8" stroke="#4F8CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                <path d="M16 8h16" stroke="#4F8CFF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="22" cy="30" r="2" fill="#4F8CFF" opacity="0.6"/>
                <circle cx="28" cy="28" r="1.5" fill="#4F8CFF" opacity="0.8"/>
                <circle cx="25" cy="33" r="1" fill="#4F8CFF" opacity="0.5"/>
                <path d="M22 18h4" stroke="#4F8CFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M21 22h6" stroke="#4F8CFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              </svg>
            </div>
            <h3>AI Infusion Lab</h3>
            <p className="landing-tool-desc">
              Lead an 18-month AI adoption campaign. Make 21 strategic decisions infusing CoPilot, OpenAI & M365 into business services for operational excellence.
            </p>
            <div className="dimension-list" style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>
              <span className="dimension-tag">Adoption</span>
              <span className="dimension-tag">Buy-In</span>
              <span className="dimension-tag">Efficiency</span>
              <span className="dimension-tag">Risk</span>
              <span className="dimension-tag">Budget</span>
            </div>
            <span className="landing-tool-time">~30 minutes</span>
            <button className="btn-infusion" style={{ width: '100%', marginTop: '0.75rem' }}>
              Enter the Lab
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        {/* Optional lead capture for diagnostic */}
        {!showCapture ? (
          <div className="animate-in animate-in-delay-5" style={{ marginTop: '2rem' }}>
            <button className="btn-ghost" onClick={() => setShowCapture(true)}>Want a personalized diagnostic report? (Optional)</button>
          </div>
        ) : (
          <div className="lead-capture animate-in" style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-light)', marginBottom: '1rem' }}>
              Add your name to personalize your readiness report and PDF download.
            </p>
            <label htmlFor="lead-name">Name</label>
            <input id="lead-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="lead-capture-actions">
              <button className="btn-ghost" onClick={() => { setShowCapture(false); setName(''); setEmail(''); }}>Skip</button>
              <button className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }} onClick={() => onStart(name, email)}>Start Diagnostic →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
