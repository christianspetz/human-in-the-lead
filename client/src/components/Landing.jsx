import React, { useState } from 'react';

export default function Landing({ onStart }) {
  const [showCapture, setShowCapture] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="page-wrapper">
      <div className="landing">
        <div className="animate-in">
          <span className="landing-badge">AI Transformation Readiness Diagnostic · 3 Minutes</span>
        </div>
        <h1 className="animate-in animate-in-delay-1">Human-in-the-Lead</h1>
        <p className="subtitle animate-in animate-in-delay-2">Why Most AI Transformations Fail (And Will Yours?)</p>
        <p className="description animate-in animate-in-delay-3">
          Most AI transformations stall — not because the technology wasn't good enough, but because the organization wasn't ready. Misaligned leadership, fragmented data, change-fatigued teams, and no clear plan for adoption. The human side is almost always the hardest part to get right. This diagnostic evaluates where your organization actually stands across six dimensions that determine whether AI initiatives land or fail.
        </p>
        <div className="dimension-list animate-in animate-in-delay-4">
          <span className="dimension-tag">Strategic Alignment</span>
          <span className="dimension-tag">Organizational Capacity</span>
          <span className="dimension-tag">Data Maturity</span>
          <span className="dimension-tag">Talent Readiness</span>
          <span className="dimension-tag">Process Readiness</span>
          <span className="dimension-tag">Investment Posture</span>
        </div>
        <p className="description secondary animate-in animate-in-delay-4">
          11 questions. 3 minutes. Powered by AI. Brutally honest.
        </p>
        <div className="animate-in animate-in-delay-5">
          <button className="btn-primary" onClick={() => onStart(name, email)}>
            Start Diagnostic
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
        {!showCapture ? (
          <div className="animate-in animate-in-delay-5" style={{ marginTop: '1.5rem' }}>
            <button className="btn-ghost" onClick={() => setShowCapture(true)}>Want a personalized report? (Optional)</button>
          </div>
        ) : (
          <div className="lead-capture animate-in">
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-light)', marginBottom: '1rem' }}>
              Add your name to personalize your readiness report and PDF download.
            </p>
            <label htmlFor="lead-name">Name</label>
            <input id="lead-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="lead-capture-actions">
              <button className="btn-ghost" onClick={() => { setShowCapture(false); setName(''); setEmail(''); }}>Skip</button>
              <button className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }} onClick={() => onStart(name, email)}>Continue →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
