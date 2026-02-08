import React, { useState, useEffect } from 'react';

const STAGES = [
  { text: 'Analyzing organizational readiness...', sub: 'Processing diagnostic inputs across 6 dimensions' },
  { text: 'Evaluating leadership alignment...', sub: 'Mapping executive sponsorship and middle management patterns' },
  { text: 'Assessing data and process maturity...', sub: 'Benchmarking against industry transformation profiles' },
  { text: 'Identifying human factor risks...', sub: 'Analyzing culture, talent, and adoption barriers' },
  { text: 'Generating process-specific recommendations...', sub: 'Building your tailored transformation roadmap' },
];

export default function Analysis() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage(s => s < STAGES.length - 1 ? s + 1 : s);
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
