import React, { useState, useEffect } from 'react';

const STAGES = [
  { text: 'Analyzing your transformation readiness...', sub: 'Processing diagnostic inputs' },
  { text: 'Evaluating leadership alignment...', sub: 'Mapping executive sponsorship patterns' },
  { text: 'Assessing change readiness...', sub: 'Comparing against transformation benchmarks' },
  { text: 'Identifying human factor risks...', sub: 'Analyzing culture and adoption barriers' },
  { text: 'Building your roadmap...', sub: 'Generating tailored recommendations' },
];

export default function Analysis() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage(s => {
        if (s < STAGES.length - 1) return s + 1;
        return s;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-wrapper">
      <div className="analysis-screen">
        <div className="analysis-spinner" />
        <div className="analysis-stage" key={stage} style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {STAGES[stage].text}
        </div>
        <div className="analysis-substage" key={`sub-${stage}`} style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
          {STAGES[stage].sub}
        </div>
      </div>
    </div>
  );
}
