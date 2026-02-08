import React, { useState, useEffect } from 'react';

const STAGES = [
  { text: 'Analyzing your automation strategy...', sub: 'Reviewing task assignments across departments' },
  { text: 'Evaluating risk exposure...', sub: 'Assessing compliance and accountability gaps' },
  { text: 'Modeling workforce impact...', sub: 'Calculating morale, cost, and throughput effects' },
  { text: 'Identifying hidden complexity...', sub: 'Checking for underestimated implementation challenges' },
  { text: 'Generating your Workforce Blueprint...', sub: 'Building strategic recommendations' },
];

export default function SimulatorAnalysis() {
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
