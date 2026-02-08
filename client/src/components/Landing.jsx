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
          AI transformation isn't a technology challenge — it's a human one. The organizations that fail don't lack tools or data. They lack alignment, change readiness, and a plan for the hardest part: getting people to actually adopt new ways of working. This diagnostic evaluates your organization's readiness across six dimensions critical to AI transformation success.
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
          Built on transformation best practices from McKinsey, Kotter, Prosci ADKAR, and leading practitioners. Powered by AI. Brutally honest.
        </p>
        <div className="animate-in animate-in-delay-5">
          <button className="btn-primary" onClick={() => onStart(name, email)}>
            Start Diagnostic
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
        {!showCapture ? (
          <div className="animate-in animate-in-delay-5" style={{ marginTop: '1.5rem' }}>
            <button className="btn-ghost" onClick={() => setShowCapture(true)}>Want a detailed PDF report emailed? (Optional)</button>
          </div>
        ) : (
          <div className="lead-capture animate-in">
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-light)', marginBottom: '1rem' }}>
              Enter your details to receive a detailed PDF report with industry benchmarks and a 90-day action plan. Completely optional.
            </p>
            <label htmlFor="lead-name">Name</label>
            <input id="lead-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor="lead-email">Email</label>
            <input id="lead-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
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
