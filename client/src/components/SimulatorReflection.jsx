import React, { useState } from 'react';

const REFLECTION_QUESTIONS = [
  {
    id: 'surprised',
    question: 'What surprised you about the trade-offs?',
    placeholder: 'e.g., I didn\'t expect cost savings to come at such a morale hit...',
  },
  {
    id: 'hardest',
    question: 'Which decisions felt hardest?',
    placeholder: 'e.g., Deciding how much automation to put on compliance tasks...',
  },
  {
    id: 'board',
    question: 'What would your board prioritize differently?',
    placeholder: 'e.g., They\'d probably push harder on cost, even at the expense of morale...',
  },
];

export default function SimulatorReflection({ onComplete, onBack }) {
  const [answers, setAnswers] = useState({});

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value.slice(0, 300) }));
  };

  return (
    <>
      <div className="progress-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: '80%' }} />
        </div>
      </div>
      <div className="page-wrapper" style={{ maxWidth: '700px' }}>
        <div className="animate-in">
          <button className="back-btn" onClick={onBack} style={{ marginBottom: '1rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>

          <div style={{ marginBottom: '1.5rem' }}>
            <span className="landing-badge" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Almost There</span>
            <h2 className="question-text" style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Before We Generate Your Blueprint...</h2>
            <p style={{ color: 'var(--slate-light)', fontSize: '0.85rem', lineHeight: '1.6' }}>
              Your reflections make the blueprint sharper. Answer as many or as few as you'd like.
            </p>
          </div>

          <div className="reflection-questions">
            {REFLECTION_QUESTIONS.map(q => (
              <div key={q.id} className="reflection-question">
                <label className="reflection-label">{q.question}</label>
                <textarea
                  className="reflection-textarea"
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  maxLength={300}
                  rows={3}
                />
                <span className="reflection-charcount">
                  {(answers[q.id] || '').length}/300
                </span>
              </div>
            ))}
          </div>

          <div className="simulator-bottom-bar">
            <button className="btn-ghost" onClick={() => onComplete({})}>
              Skip & Generate
            </button>
            <button
              className="btn-primary"
              style={{ padding: '0.8rem 2rem', fontSize: '0.95rem' }}
              onClick={() => onComplete(answers)}
            >
              Generate Blueprint
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
