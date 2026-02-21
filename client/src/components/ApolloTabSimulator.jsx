import React, { useState, useCallback, useEffect } from 'react';
import {
  SCENARIO_TYPES,
  SIMULATOR_CHOICES,
  TRADEOFF_METERS,
} from '../data/apolloData';

const ANALYZING_MESSAGES = [
  'Modeling transformation trajectory...',
  'Analyzing governance decisions...',
  'Simulating 18-month arc...',
  'Identifying crisis points...',
];

function parseResultSections(markdown) {
  if (!markdown) return [];
  const sections = [];
  const parts = markdown.split(/^### /gm).filter(Boolean);
  for (const part of parts) {
    const newlineIdx = part.indexOf('\n');
    if (newlineIdx === -1) continue;
    const heading = part.substring(0, newlineIdx).trim();
    const content = part.substring(newlineIdx + 1).trim();
    sections.push({ heading, content });
  }
  return sections;
}

function getMeterColorClass(value) {
  if (value >= 60) return 'green';
  if (value >= 35) return 'yellow';
  return 'red';
}

function clamp(val) {
  return Math.max(0, Math.min(100, val));
}

function recalcMeters(choices) {
  const base = { buyin: 50, velocity: 50, political: 50, clientRisk: 50 };
  for (const choice of SIMULATOR_CHOICES) {
    const selectedIdx = choices[choice.id];
    if (selectedIdx !== undefined && choice.options[selectedIdx]) {
      const deltas = choice.options[selectedIdx].deltas;
      base.buyin += deltas.buyin;
      base.velocity += deltas.velocity;
      base.political += deltas.political;
      base.clientRisk += deltas.clientRisk;
    }
  }
  return {
    buyin: clamp(base.buyin),
    velocity: clamp(base.velocity),
    political: clamp(base.political),
    clientRisk: clamp(base.clientRisk),
  };
}

export default function ApolloTabSimulator() {
  const [phase, setPhase] = useState('setup');
  const [scenario, setScenario] = useState(null);
  const [choices, setChoices] = useState({});
  const [currentChoice, setCurrentChoice] = useState(0);
  const [meters, setMeters] = useState({ buyin: 50, velocity: 50, political: 50, clientRisk: 50 });
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState(null);
  const [analyzingMsgIdx, setAnalyzingMsgIdx] = useState(0);

  // Cycle analyzing messages
  useEffect(() => {
    if (phase !== 'analyzing') return;
    setAnalyzingMsgIdx(0);
    const interval = setInterval(() => {
      setAnalyzingMsgIdx((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [phase]);

  const handleSelectOption = useCallback((choiceId, optionIndex) => {
    const updated = { ...choices, [choiceId]: optionIndex };
    setChoices(updated);
    setMeters(recalcMeters(updated));
  }, [choices]);

  const runSimulation = useCallback(async () => {
    setPhase('analyzing');
    setError(null);
    try {
      const choicesSummary = {};
      SIMULATOR_CHOICES.forEach((choice) => {
        if (choices[choice.id] !== undefined) {
          choicesSummary[choice.id] = choices[choice.id];
        }
      });
      const res = await fetch('/api/apollo-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          choices: choicesSummary,
          meterReadings: meters,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Simulation failed');
      }
      const data = await res.json();
      setSimulationResult(data.analysis);
      setPhase('results');
    } catch (err) {
      setError(err.message);
      setPhase('choices');
      setCurrentChoice(SIMULATOR_CHOICES.length - 1);
    }
  }, [scenario, choices, meters]);

  const handleReset = useCallback(() => {
    setPhase('setup');
    setScenario(null);
    setChoices({});
    setCurrentChoice(0);
    setMeters({ buyin: 50, velocity: 50, political: 50, clientRisk: 50 });
    setSimulationResult(null);
    setError(null);
  }, []);

  const handleRunAgain = useCallback(() => {
    setChoices({});
    setCurrentChoice(0);
    setMeters({ buyin: 50, velocity: 50, political: 50, clientRisk: 50 });
    setSimulationResult(null);
    setError(null);
    setPhase('choices');
  }, []);

  // ─── Setup Phase ─────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div>
        <div className="apollo-section-spacing">
          <h2 className="apollo-section-title">Transformation Simulator</h2>
          <p className="apollo-section-subtitle">
            Make 10 strategic choices. Watch the consequences unfold across 18 months.
          </p>
        </div>

        <div className="apollo-sim-scenarios">
          {SCENARIO_TYPES.map((s) => (
            <div
              key={s.id}
              className={`apollo-sim-scenario-card${scenario === s.id ? ' selected' : ''}`}
              onClick={() => setScenario(s.id)}
            >
              <div className="apollo-sim-scenario-label">{s.label}</div>
              <div className="apollo-sim-scenario-desc">{s.description}</div>
            </div>
          ))}
        </div>

        <div className="apollo-nav">
          <div />
          <button
            className="apollo-btn-primary"
            disabled={!scenario}
            onClick={() => setPhase('choices')}
          >
            Begin Simulation {'\u2192'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Analyzing Phase ─────────────────────────────────────────────
  if (phase === 'analyzing') {
    return (
      <div className="apollo-analyzing">
        <div className="apollo-spinner" />
        <div className="apollo-analyzing-text">
          {ANALYZING_MESSAGES[analyzingMsgIdx]}
        </div>
      </div>
    );
  }

  // ─── Results Phase ───────────────────────────────────────────────
  if (phase === 'results') {
    const scenarioLabel = SCENARIO_TYPES.find((s) => s.id === scenario)?.label || scenario;
    const sections = parseResultSections(simulationResult);

    return (
      <div>
        <div className="apollo-section-spacing">
          <h2 className="apollo-section-title">{scenarioLabel} — Simulation Results</h2>
        </div>

        {/* Meter summary row */}
        <div className="apollo-card" style={{ marginBottom: '1.5rem' }}>
          <div className="apollo-metrics-row">
            {TRADEOFF_METERS.map((m) => {
              const val = meters[m.id];
              const colorClass = getMeterColorClass(val);
              return (
                <div className="apollo-metric" key={m.id}>
                  <div className={`apollo-metric-value ${colorClass}`}>{val}</div>
                  <div className="apollo-metric-sub">{m.label}</div>
                  <div className="apollo-metric-bar-track">
                    <div
                      className={`apollo-metric-bar-fill ${colorClass}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Result sections */}
        {sections.map((section, idx) => {
          let extraClass = '';
          if (/crisis|breaks/i.test(section.heading)) extraClass = ' crisis';
          if (/verdict/i.test(section.heading)) extraClass = ' verdict';

          return (
            <div key={idx} className={`apollo-sim-result-section${extraClass}`}>
              <h3>{section.heading}</h3>
              <div className="apollo-sim-result-content">
                {section.content.split('\n').map((line, li) => (
                  <p key={li}>{line}</p>
                ))}
              </div>
            </div>
          );
        })}

        <div className="apollo-nav">
          <button className="apollo-btn-secondary" onClick={handleRunAgain}>
            {'\u21BB'} Run Again
          </button>
          <button className="apollo-btn-primary" onClick={handleReset}>
            Try Different Scenario
          </button>
        </div>
      </div>
    );
  }

  // ─── Choices Phase ───────────────────────────────────────────────
  const currentQ = SIMULATOR_CHOICES[currentChoice];
  const isLast = currentChoice === SIMULATOR_CHOICES.length - 1;
  const hasSelection = choices[currentQ.id] !== undefined;

  return (
    <div>
      {error && (
        <div className="apollo-callout apollo-callout-red">
          <span className="apollo-callout-icon">{'\u26A0'}</span>
          <span className="apollo-callout-text">{error}</span>
        </div>
      )}

      <div className="apollo-sim-layout">
        {/* Left column — question + options */}
        <div>
          <span className="apollo-badge">
            Question {currentChoice + 1} of {SIMULATOR_CHOICES.length}
          </span>

          <div className="apollo-sim-question">{currentQ.question}</div>
          <div className="apollo-sim-question-sub">{currentQ.context}</div>

          <div className="apollo-sim-options">
            {currentQ.options.map((opt, oi) => (
              <button
                key={oi}
                className={`apollo-sim-option${choices[currentQ.id] === oi ? ' selected' : ''}`}
                onClick={() => handleSelectOption(currentQ.id, oi)}
              >
                <span className="apollo-sim-option-radio" />
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right column — meters */}
        <div className="apollo-sim-meters">
          <div className="apollo-sim-meters-title">Tradeoff Profile</div>
          {TRADEOFF_METERS.map((m) => {
            const val = meters[m.id];
            const colorClass = getMeterColorClass(val);
            return (
              <div className="apollo-sim-meter" key={m.id}>
                <div className="apollo-sim-meter-header">
                  <span className="apollo-sim-meter-label">{m.label}</span>
                  <span className={`apollo-sim-meter-value ${colorClass}`}>{val}</span>
                </div>
                <div className="apollo-sim-meter-track">
                  <div
                    className={`apollo-sim-meter-fill ${colorClass}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="apollo-nav">
        <button
          className="apollo-btn-secondary"
          onClick={() => {
            if (currentChoice === 0) {
              setPhase('setup');
            } else {
              setCurrentChoice(currentChoice - 1);
            }
          }}
        >
          {'\u2190'} Back
        </button>

        {isLast ? (
          <button
            className="apollo-btn-primary"
            disabled={!hasSelection}
            onClick={runSimulation}
          >
            Run Simulation {'\u2192'}
          </button>
        ) : (
          <button
            className="apollo-btn-primary"
            disabled={!hasSelection}
            onClick={() => setCurrentChoice(currentChoice + 1)}
          >
            Next {'\u2192'}
          </button>
        )}
      </div>
    </div>
  );
}
