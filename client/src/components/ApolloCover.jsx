import React, { useState, useEffect } from 'react';

export default function ApolloCover({ onEnter }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [fading, setFading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'OneGiantLeap') {
      setError(false);
      setFading(true);
    } else {
      setError(true);
      setPassword('');
    }
  };

  useEffect(() => {
    if (fading) {
      const timer = setTimeout(() => onEnter(), 600);
      return () => clearTimeout(timer);
    }
  }, [fading, onEnter]);

  return (
    <div className={`apollo-cover${fading ? ' apollo-cover-fade' : ''}`}>
      <div className="apollo-cover-content">
        <div className="apollo-cover-badge">Confidential</div>
        <div className="apollo-cover-divider" />
        <h1 className="apollo-cover-title">Apollo Transformation Engine</h1>
        <p className="apollo-cover-subtitle">
          Operating model diagnostic for a firm moving from $938B to $1.5T
        </p>
        <div className="apollo-cover-meta">
          <div className="apollo-cover-meta-row">
            <span className="apollo-cover-meta-label">Prepared for</span>
            <span className="apollo-cover-meta-value">Mike Mayes, Head of Transformation</span>
          </div>
          <div className="apollo-cover-meta-row">
            <span className="apollo-cover-meta-label">Prepared by</span>
            <span className="apollo-cover-meta-value">Christian Spetz</span>
          </div>
        </div>
        <form className="apollo-cover-form" onSubmit={handleSubmit}>
          <input
            type="password"
            className={`apollo-cover-input${error ? ' apollo-cover-input-error' : ''}`}
            placeholder="Enter access code"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            autoFocus
          />
          <button type="submit" className="apollo-cover-btn" disabled={!password}>
            Enter
          </button>
          {error && <p className="apollo-cover-error">Invalid access code</p>}
        </form>
        <p className="apollo-cover-disclaimer">
          This document contains analysis based on publicly available information.
          All views are the author's own and do not represent any employer.
        </p>
      </div>
      <div className="apollo-cover-footer">
        Sources: HBS Case 126-009 / J.D. Power 2024-2025 / Apollo 2024 10-K / NAIC filings
      </div>
    </div>
  );
}
