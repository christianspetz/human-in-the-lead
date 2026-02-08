import React, { useState } from 'react';
import { INDUSTRIES, DEPARTMENTS } from '../data/simulatorData';

export default function SimulatorSetup({ onComplete, onBack }) {
  const [industry, setIndustry] = useState('');
  const [selectedDepts, setSelectedDepts] = useState([]);

  const toggleDept = (dept) => {
    setSelectedDepts(prev => {
      if (prev.find(d => d.id === dept.id)) return prev.filter(d => d.id !== dept.id);
      if (prev.length >= 3) return prev;
      return [...prev, dept];
    });
  };

  const canContinue = industry && selectedDepts.length >= 2 && selectedDepts.length <= 3;

  return (
    <>
      <div className="progress-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '10%' }} />
        </div>
      </div>
      <div className="page-wrapper" style={{ maxWidth: '800px' }}>
        <div className="simulator-setup animate-in">
          <button className="back-btn" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>

          <span className="landing-badge" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>Workforce Simulator</span>
          <h2 className="question-text" style={{ marginBottom: '0.5rem' }}>Configure Your Simulation</h2>
          <p style={{ color: 'var(--slate-light)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Select your industry and the departments you want to simulate. You'll assign AI automation levels to key tasks in each department.
          </p>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--slate-light)', marginBottom: '0.4rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Industry</label>
            <div className="select-wrapper">
              <select value={industry} onChange={e => setIndustry(e.target.value)}>
                <option value="">Select your industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--slate-light)', marginBottom: '0.4rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Departments <span style={{ color: 'var(--teal)', fontWeight: 400, textTransform: 'none' }}>— select {selectedDepts.length < 2 ? `${2 - selectedDepts.length} more` : selectedDepts.length === 2 ? '1 more or continue' : 'up to 3'}</span>
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate)', marginBottom: '1rem' }}>
              {selectedDepts.length} of 3 selected
            </p>
            <div className="simulator-dept-grid">
              {DEPARTMENTS.map(dept => {
                const isSelected = selectedDepts.find(d => d.id === dept.id);
                const isDisabled = !isSelected && selectedDepts.length >= 3;
                return (
                  <button
                    key={dept.id}
                    className={`simulator-dept-card${isSelected ? ' selected' : ''}${isDisabled ? ' disabled' : ''}`}
                    onClick={() => !isDisabled && toggleDept(dept)}
                    disabled={isDisabled}
                  >
                    <span className="simulator-dept-check">{isSelected ? '✓' : ''}</span>
                    {dept.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn-primary"
              style={{ padding: '0.8rem 2rem', fontSize: '0.95rem' }}
              disabled={!canContinue}
              onClick={() => onComplete({ industry, departments: selectedDepts })}
            >
              Continue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
