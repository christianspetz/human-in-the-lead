import React, { useState, useEffect } from 'react';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'What industry are you in?',
    options: [
      'Pharma/Biotech/Life Sciences',
      'Financial Services',
      'Manufacturing/Industrial',
      'Technology/Telecom',
      'Energy/Utilities',
      'Retail/Consumer',
      'Healthcare/Public Sector',
      'Professional Services',
      'Other'
    ]
  },
  {
    id: 'q2',
    text: 'How large is your organization?',
    options: [
      '<500 employees',
      '500–2,000',
      '2,000–10,000',
      '10,000–50,000',
      '50,000+'
    ]
  },
  {
    id: 'q3',
    text: "What is your company's current trajectory?",
    options: [
      'Growing rapidly (>15% YoY)',
      'Growing steadily (5–15%)',
      'Flat/stagnant',
      'Contracting/restructuring',
      'In turnaround/crisis mode'
    ]
  },
  {
    id: 'q4',
    text: 'How have previous large-scale change initiatives gone?',
    options: [
      'Mostly successful — we execute well',
      'Mixed results — some wins, some failures',
      'Mostly struggled — hard to land change',
      "We haven't attempted major transformations before",
      'Multiple failed attempts — significant change fatigue'
    ]
  },
  {
    id: 'q5',
    text: 'Where does your AI initiative stand today?',
    options: [
      'Exploring/researching — no concrete plans yet',
      'Pilot stage — testing in 1–2 areas',
      'Scaling — expanding from pilots to broader use',
      'Stalled — started but lost momentum',
      "Haven't started — but leadership wants to"
    ]
  },
  {
    id: 'q6',
    text: 'Is there active executive sponsorship for AI transformation?',
    options: [
      'Yes — CEO/C-suite is personally driving it',
      'Partial — one exec champions it but others are lukewarm',
      'Delegated — assigned to a VP or director',
      'No clear sponsor',
      "There's interest but no formal commitment"
    ]
  },
  {
    id: 'q7',
    text: 'Do you have middle management champions who can drive adoption?',
    options: [
      'Yes — identified and engaged champions across functions',
      'Some — a few enthusiastic managers but not systematic',
      'No — middle management is largely skeptical or uninvolved',
      'Middle management is actively resistant',
      "We haven't thought about this layer yet"
    ]
  },
  {
    id: 'q8',
    text: "How would you describe your organization's culture around change?",
    options: [
      'Innovative and adaptive — we embrace change',
      "Cautious but open — we'll try if the case is strong",
      'Siloed — each function does its own thing',
      'Bureaucratic — slow to decide, slower to act',
      'Change-fatigued — people are exhausted from recent initiatives'
    ]
  },
  {
    id: 'q9',
    text: 'What is your approximate budget for AI transformation (next 12 months)?',
    options: [
      '<$100K',
      '$100K–$500K',
      '$500K–$2M',
      '$2M–$10M',
      '$10M+',
      'Not yet defined'
    ]
  },
  {
    id: 'q10',
    text: 'What is your primary goal for AI transformation?',
    options: [
      'Reduce operational costs and improve efficiency',
      'Accelerate R&D or product development',
      'Improve decision-making with better data/insights',
      'Transform customer experience',
      'Keep up with competitors who are adopting AI',
      'Build entirely new AI-powered products or services'
    ]
  }
];

export default function Diagnostic({ onComplete, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [animDir, setAnimDir] = useState('right');
  const [animKey, setAnimKey] = useState(0);

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ) / QUESTIONS.length) * 100;

  const handleSelect = (option) => {
    const newAnswers = { ...answers, [question.id]: option };
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setAnimDir('right');
      setAnimKey(k => k + 1);
      setTimeout(() => setCurrentQ(currentQ + 1), 50);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentQ === 0) {
      onBack();
    } else {
      setAnimDir('left');
      setAnimKey(k => k + 1);
      setTimeout(() => setCurrentQ(currentQ - 1), 50);
    }
  };

  return (
    <>
      <div className="progress-container">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="page-wrapper">
        <div
          className="question-container"
          key={animKey}
          style={{
            animation: `${animDir === 'right' ? 'slideInRight' : 'slideInLeft'} 0.35s ease-out both`
          }}
        >
          <div className="question-number">
            Question {currentQ + 1} of {QUESTIONS.length}
          </div>

          <h2 className="question-text">{question.text}</h2>

          <div className="options-list">
            {question.options.map((opt) => (
              <button
                key={opt}
                className={`option-btn ${answers[question.id] === opt ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="question-nav">
            <button className="back-btn" onClick={handleBack}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
              {currentQ + 1} / {QUESTIONS.length}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
